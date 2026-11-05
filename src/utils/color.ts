export function hexToRgb(hex: string, alpha?: number): string {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((char) => char + char).join('') : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (alpha !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export function colorDistance(a: string, b: string) {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) {
    return Infinity;
  }
  const match = rgbA.match(/rgba?\((\d+), (\d+), (\d+)/);
  const matchB = rgbB.match(/rgba?\((\d+), (\d+), (\d+)/);
  if (!match || !matchB) {
    return Infinity;
  }
  const [rA, gA, bA] = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  const [rB, gB, bB] = [parseInt(matchB[1], 10), parseInt(matchB[2], 10), parseInt(matchB[3], 10)];
  return Math.sqrt((rA - rB) ** 2 + (gA - gB) ** 2 + (bA - bB) ** 2);
}

export function getContrastingTextColor(hexValue: string) {
  let hex = hexValue.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error('Invalid hex color');
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const linearize = (channel: number) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithWhite >= contrastWithBlack ? '#fff' : '#000';
}

function normalizeHex(hexValue: string) {
  let hex = hexValue.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error('Invalid hex color');
  }
  return hex.toLowerCase();
}

function toRgb(hexValue: string): [number, number, number] {
  const hex = normalizeHex(hexValue);
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function relativeLuminance(hexValue: string) {
  const [r, g, b] = toRgb(hexValue).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(colorA: string, colorB: string) {
  const a = relativeLuminance(colorA);
  const b = relativeLuminance(colorB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, l];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return [h / 6, s, l];
}

function hslToHex(h: number, s: number, l: number) {
  const hueToChannel = (p: number, q: number, t: number) => {
    const tt = (t + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channels =
    s === 0 ? [l, l, l] : [hueToChannel(p, q, h + 1 / 3), hueToChannel(p, q, h), hueToChannel(p, q, h - 1 / 3)];
  return `#${channels
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function minContrast(color: string, backgrounds: string[]) {
  return Math.min(...backgrounds.map((background) => getContrastRatio(color, background)));
}

/**
 * Returns the foreground color, nudged in lightness only as far as needed, so it
 * meets the minimum contrast ratio against every background it may be drawn over.
 * Falls back to black or white, which always reaches at least 4.5:1.
 */
export function ensureContrast(foreground: string, backgrounds: string | string[], minRatio = 4.5) {
  const bgs = Array.isArray(backgrounds) ? backgrounds : [backgrounds];
  let fg = foreground;
  try {
    fg = `#${normalizeHex(foreground)}`;
    if (minContrast(fg, bgs) >= minRatio) {
      return fg;
    }
    const [h, s, l] = rgbToHsl(...toRgb(fg));
    const avgBackgroundLuminance = bgs.reduce((sum, bg) => sum + relativeLuminance(bg), 0) / bgs.length;
    const lighter = avgBackgroundLuminance < 0.18;
    for (let step = 1; step <= 100; step += 1) {
      const nextL = lighter ? Math.min(1, l + step / 100) : Math.max(0, l - step / 100);
      const candidate = hslToHex(h, s, nextL);
      if (minContrast(candidate, bgs) >= minRatio) {
        return candidate;
      }
    }
  } catch {
    // invalid color, use fallback below
  }
  const white = minContrast('#ffffff', bgs);
  const black = minContrast('#000000', bgs);
  return white >= black ? '#ffffff' : '#000000';
}

export type AlbumColors = {
  coverImageMuted?: string | null;
  coverImageDarkMuted?: string | null;
  coverImageLightMuted?: string | null;
  coverImageLightVibrant?: string | null;
  coverImageDarkVibrant?: string | null;
  coverImageVibrant?: string | null;
};

export function getAlbumPalette(album?: AlbumColors | null) {
  const background = album?.coverImageMuted || '#000000';
  const overlay = album?.coverImageDarkMuted || '#000000';
  // Derived from the background only: same hue, lightness pushed to 7:1 if a tint can reach it, else 4.5:1.
  const strong = ensureContrast(background, background, 7);
  const foreground = strong === '#ffffff' || strong === '#000000' ? ensureContrast(background, background) : strong;
  return { background, overlay, foreground };
}

export function getTrackPalette(track: {
  albumCoverImageMuted?: string | null;
  albumCoverImageDarkMuted?: string | null;
  albumCoverImageLightMuted?: string | null;
  albumCoverImageLightVibrant?: string | null;
  albumCoverImageDarkVibrant?: string | null;
  albumCoverImageVibrant?: string | null;
}) {
  return getAlbumPalette({
    coverImageMuted: track.albumCoverImageMuted,
    coverImageDarkMuted: track.albumCoverImageDarkMuted,
    coverImageLightMuted: track.albumCoverImageLightMuted,
    coverImageLightVibrant: track.albumCoverImageLightVibrant,
    coverImageDarkVibrant: track.albumCoverImageDarkVibrant,
    coverImageVibrant: track.albumCoverImageVibrant,
  });
}
