export const SHORT_WORD_PATTERN_SOURCE = String.raw`(^|[ \t\r\n])((?:а|и|в|во|не|но|да|к|ко|с|со|у|о|об|от|до|из|за|на|по|под|над|при|без|для|про|через|между|как|так|что|это|же|ли|бы|то))([ \t\r\n]+)(?=\S)`

export const GROUPED_NUMBER_PATTERN_SOURCE = String.raw`(\d)[ \t]+(?=\d{3}(?:[ \t]|[^\d]|$))`
export const NUMBER_PATTERN_SOURCE = String.raw`(\d)[ \t\r\n]+(?=[\p{L}%₽])`
export const BALL_BASKET_PATTERN_SOURCE = String.raw`(корзина)[ \t\r\n\u00a0]+(мячей)`
export const FINAL_WORD_PATTERN_SOURCE = String.raw`[ \t]+([^ \t\u00a0]+)([.!?…,:;]?)$`

const shortWordPattern = new RegExp(SHORT_WORD_PATTERN_SOURCE, 'giu')
const groupedNumberPattern = new RegExp(GROUPED_NUMBER_PATTERN_SOURCE, 'gu')
const numberPattern = new RegExp(NUMBER_PATTERN_SOURCE, 'giu')
const ballBasketPattern = new RegExp(BALL_BASKET_PATTERN_SOURCE, 'giu')
const finalWordPattern = new RegExp(FINAL_WORD_PATTERN_SOURCE, 'u')

export function typographTextValue(value: string): string {
  const finalWordMatch = finalWordPattern.exec(value)
  const finalWordPrefix = finalWordMatch ? value.slice(0, finalWordMatch.index) : ''
  const finalWordCount = finalWordPrefix.trim().split(/[ \t\r\n\u00a0]+/u).filter(Boolean).length
  const withFinalWord = finalWordMatch && finalWordCount >= 2 && /[\p{L}\p{M}]$/u.test(finalWordPrefix.trimEnd())
    ? `${finalWordPrefix}\u00a0${finalWordMatch[1]}${finalWordMatch[2]}`
    : value

  return withFinalWord
    .replace(groupedNumberPattern, '$1\u00a0')
    .replace(shortWordPattern, '$1$2\u00a0')
    .replace(numberPattern, '$1\u00a0')
    .replace(ballBasketPattern, '$1\u00a0$2')
}
