import { SmartPlaylistFieldEnum, SmartPlaylistIntervalTagEnum, SmartPlaylistOperationEnum } from '@/types/api-schema';
import z from 'zod/v3';

export const playlistRuleFields = [
  SmartPlaylistFieldEnum.album,
  SmartPlaylistFieldEnum.album_artist,
  SmartPlaylistFieldEnum.artist,
  SmartPlaylistFieldEnum.bit_rate,
  SmartPlaylistFieldEnum.composer,
  SmartPlaylistFieldEnum.date_added,
  SmartPlaylistFieldEnum.file_path,
  SmartPlaylistFieldEnum.genre,
  SmartPlaylistFieldEnum.rating,
  SmartPlaylistFieldEnum.year,
] as const;

export const playlistRuleIntervals = [
  SmartPlaylistIntervalTagEnum.days,
  SmartPlaylistIntervalTagEnum.weeks,
  SmartPlaylistIntervalTagEnum.months,
] as const;

const dateAddedOperations: SmartPlaylistOperationEnum[] = [
  SmartPlaylistOperationEnum.after,
  SmartPlaylistOperationEnum.before,
  SmartPlaylistOperationEnum.in_the_last,
  SmartPlaylistOperationEnum.not_in_the_last,
];

const numericOperations: SmartPlaylistOperationEnum[] = [
  SmartPlaylistOperationEnum.is,
  SmartPlaylistOperationEnum.is_not,
  SmartPlaylistOperationEnum.less_than,
  SmartPlaylistOperationEnum.greater_than_or_equal_to,
];

const textOperations: SmartPlaylistOperationEnum[] = [
  SmartPlaylistOperationEnum.is,
  SmartPlaylistOperationEnum.is_not,
  SmartPlaylistOperationEnum.contains,
  SmartPlaylistOperationEnum.does_not_contain,
];

const numericFields = [SmartPlaylistFieldEnum.bit_rate, SmartPlaylistFieldEnum.rating, SmartPlaylistFieldEnum.year];

export const playlistRuleFieldLabels: Record<SmartPlaylistFieldEnum, string> = {
  [SmartPlaylistFieldEnum.album]: 'Album',
  [SmartPlaylistFieldEnum.album_artist]: 'Album artist',
  [SmartPlaylistFieldEnum.artist]: 'Artist',
  [SmartPlaylistFieldEnum.bit_rate]: 'Bit rate',
  [SmartPlaylistFieldEnum.composer]: 'Composer',
  [SmartPlaylistFieldEnum.date_added]: 'Date added',
  [SmartPlaylistFieldEnum.file_path]: 'File path',
  [SmartPlaylistFieldEnum.genre]: 'Genre',
  [SmartPlaylistFieldEnum.rating]: 'Rating',
  [SmartPlaylistFieldEnum.year]: 'Year',
};

export const playlistRuleOperationLabels: Record<SmartPlaylistOperationEnum, string> = {
  [SmartPlaylistOperationEnum.after]: 'Is after',
  [SmartPlaylistOperationEnum.before]: 'Is before',
  [SmartPlaylistOperationEnum.contains]: 'Contains',
  [SmartPlaylistOperationEnum.does_not_contain]: 'Does not contain',
  [SmartPlaylistOperationEnum.greater_than_or_equal_to]: 'Greater than or equal to',
  [SmartPlaylistOperationEnum.in_the_last]: 'In the last',
  [SmartPlaylistOperationEnum.is]: 'Is',
  [SmartPlaylistOperationEnum.is_not]: 'Is not',
  [SmartPlaylistOperationEnum.less_than]: 'Less than',
  [SmartPlaylistOperationEnum.not_in_the_last]: 'Not in the last',
};

export const getPlaylistRuleOperations = (field: SmartPlaylistFieldEnum): SmartPlaylistOperationEnum[] => {
  if (field === SmartPlaylistFieldEnum.date_added) {
    return dateAddedOperations;
  }
  return numericFields.some((numericField) => numericField === field) ? numericOperations : textOperations;
};

export const isRelativePlaylistRuleOperation = (operation: SmartPlaylistOperationEnum) =>
  operation === SmartPlaylistOperationEnum.in_the_last || operation === SmartPlaylistOperationEnum.not_in_the_last;

const isAbsoluteDateOperation = (operation: SmartPlaylistOperationEnum) =>
  operation === SmartPlaylistOperationEnum.after || operation === SmartPlaylistOperationEnum.before;

export const getPlaylistRuleValueInputType = (
  field: SmartPlaylistFieldEnum | undefined,
  operation: SmartPlaylistOperationEnum | undefined,
) => {
  const selectedOperation = operation ?? SmartPlaylistOperationEnum.is;
  if (isRelativePlaylistRuleOperation(selectedOperation)) {
    return 'number';
  }
  if (field === SmartPlaylistFieldEnum.date_added && isAbsoluteDateOperation(selectedOperation)) {
    return 'date';
  }
  return 'text';
};

export const playlistRuleSchema = z
  .object({
    field: z.nativeEnum(SmartPlaylistFieldEnum),
    operation: z.nativeEnum(SmartPlaylistOperationEnum),
    value: z.string().trim().min(1, 'Enter a value').max(255, 'Value is too long'),
    interval: z.nativeEnum(SmartPlaylistIntervalTagEnum).optional(),
  })
  .refine((rule) => getPlaylistRuleOperations(rule.field).includes(rule.operation), {
    message: 'Choose a supported operation for this field',
  })
  .refine((rule) => !isRelativePlaylistRuleOperation(rule.operation) || rule.interval !== undefined, {
    message: 'Choose a time interval',
    path: ['interval'],
  });

export const playlistRulesSchema = z.array(playlistRuleSchema).max(100, 'A smart playlist can have at most 100 rules');
