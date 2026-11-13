/**
 * Ukrainian licence plates — normalization for provider lookups.
 *
 * Standard plates use 12 letters that look the same in Cyrillic and Latin:
 * А В С Е Н І К М О Р Т Х  ↔  A B C E H I K M O P T X.
 * People type them in either alphabet, often mixed («АА1234ВВ» with a Latin
 * «B»), with spaces or dashes. Providers expect one spelling, so we normalize
 * first and only then decide whether the plate is a standard one.
 */

const CYRILLIC_TO_LATIN = Object.freeze({
  А: 'A', В: 'B', С: 'C', Е: 'E', Н: 'H', І: 'I', К: 'K', М: 'M', О: 'O', Р: 'P', Т: 'T', Х: 'X',
});
const LATIN_TO_CYRILLIC = Object.freeze(
  Object.fromEntries(Object.entries(CYRILLIC_TO_LATIN).map(([cyr, lat]) => [lat, cyr])),
);

const STANDARD = /^[ABCEHIKMOPTX]{2}\d{4}[ABCEHIKMOPTX]{2}$/;

/** Upper case, no spaces, dashes or dots. Letters are left in the alphabet they were typed in. */
export function compactPlate(input) {
  return String(input ?? '')
    .normalize('NFKC')
    .toLocaleUpperCase('uk-UA')
    .replace(/[\s\-‐-―−._]/gu, '');
}

/** One spelling: Latin look-alikes. Letters outside the 12 stay as typed. */
export function toLatinPlate(input) {
  return [...compactPlate(input)].map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch).join('');
}

/** The same plate in Cyrillic — some providers search their registry only in Cyrillic. */
export function toCyrillicPlate(input) {
  return [...toLatinPlate(input)].map((ch) => LATIN_TO_CYRILLIC[ch] ?? ch).join('');
}

/**
 * Normalize and classify. `standard` — the common AA1234BB format; anything
 * else is `other` (transit, diplomatic, custom and foreign plates have their
 * own rules and are not guessed here).
 */
export function parsePlate(input) {
  const latin = toLatinPlate(input);
  if (!latin) return { ok: false, reason: 'empty' };
  if (STANDARD.test(latin)) {
    return { ok: true, kind: 'standard', latin, cyrillic: toCyrillicPlate(latin), region: latin.slice(0, 2) };
  }
  return { ok: true, kind: 'other', latin };
}
