import type { components } from '@/types/api-schema';

export type Station = components['schemas']['LibraryShoutcastStationDto'];
export type Track = components['schemas']['LibraryTrackDto'];
export type QueueEntry = Station | Track;

export const isStation = (entry: QueueEntry): entry is Station => 'url' in entry;

// `order` is a permutation of item indexes used for shuffle playback and `orderPosition` is where
// `currentIndex` sits within it, so toggling shuffle never needs to recompute anything.
export type QueueState = {
  items: QueueEntry[];
  currentIndex: number;
  order: number[];
  orderPosition: number;
};

export type QueueAction =
  | { type: 'replace'; items: QueueEntry[]; currentIndex: number }
  | { type: 'add'; tracks: Track[]; atStart: boolean }
  | { type: 'jump'; index: number }
  | { type: 'step'; direction: 1 | -1; shuffling: boolean; repeating: boolean }
  | { type: 'clear' };

export const initialQueueState: QueueState = {
  items: [],
  currentIndex: -1,
  order: [],
  orderPosition: -1,
};

function shuffled(values: number[]): number[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

function buildState(items: QueueEntry[], currentIndex: number): QueueState {
  const rest = shuffled(range(0, items.length).filter((index) => index !== currentIndex));
  return { items, currentIndex, order: [currentIndex, ...rest], orderPosition: 0 };
}

function moveTo(state: QueueState, index: number): QueueState {
  return { ...state, currentIndex: index, orderPosition: state.order.indexOf(index) };
}

// Index of the item adjacent to the current one, or null when playback would run off either end.
export function adjacentIndex(
  state: QueueState,
  direction: 1 | -1,
  shuffling: boolean,
  repeating: boolean,
): number | null {
  const { length } = state.items;
  if (length === 0) {
    return null;
  }
  const position = (shuffling ? state.orderPosition : state.currentIndex) + direction;
  const resolved = position >= 0 && position < length ? position : (position + length) % length;
  if (resolved !== position && !repeating) {
    return null;
  }
  return shuffling ? state.order[resolved] : resolved;
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'replace':
      return action.items.length === 0 ? initialQueueState : buildState(action.items, action.currentIndex);
    case 'add': {
      if (action.tracks.length === 0) {
        return state;
      }
      if (state.items.length === 0 || action.atStart) {
        const items = action.atStart ? [...action.tracks, ...state.items] : action.tracks;
        return buildState(items, 0);
      }
      const start = state.items.length;
      return {
        ...state,
        items: [...state.items, ...action.tracks],
        order: [...state.order, ...shuffled(range(start, start + action.tracks.length))],
      };
    }
    case 'jump':
      return action.index >= 0 && action.index < state.items.length ? moveTo(state, action.index) : state;
    case 'step': {
      const index = adjacentIndex(state, action.direction, action.shuffling, action.repeating);
      return index === null ? state : moveTo(state, index);
    }
    case 'clear':
      return initialQueueState;
    default:
      return state;
  }
}
