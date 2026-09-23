export const SHORT_WORD_PATTERN_SOURCE = String.raw`(^|[ \t\r\n])((?:а|и|в|во|не|но|да|к|ко|с|со|у|о|об|от|до|из|за|на|по|под|над|при|без|для|про|через|между|как|так|что|это|же|ли|бы|то))([ \t\r\n]+)(?=\S)`

export const GROUPED_NUMBER_PATTERN_SOURCE = String.raw`(\d)[ \t]+(?=\d{3}(?:[ \t]|[^\d]|$))`
export const NUMBER_PATTERN_SOURCE = String.raw`(\d)[ \t\r\n]+(?=[\p{L}%₽])`

const shortWordPattern = new RegExp(SHORT_WORD_PATTERN_SOURCE, 'giu')
const groupedNumberPattern = new RegExp(GROUPED_NUMBER_PATTERN_SOURCE, 'gu')
const numberPattern = new RegExp(NUMBER_PATTERN_SOURCE, 'giu')

export function typographTextValue(value: string): string {
  return value
    .replace(groupedNumberPattern, '$1\u00a0')
    .replace(shortWordPattern, '$1$2\u00a0')
    .replace(numberPattern, '$1\u00a0')
}
