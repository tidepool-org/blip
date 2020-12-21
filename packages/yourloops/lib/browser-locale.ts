/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * browser-locale
 *
 * - author: max ogden
 * - license: BSD-2-Clause
 * - repository: https://github.com/maxogden/browser-locale
 */

function browserLocale(): string {
  let lang: string;

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    // latest versions of Chrome and Firefox set this correctly
    lang = navigator.languages[0];
    // @ts-ignore
  } else if (navigator.userLanguage) {
    // IE only
    // @ts-ignore
    lang = navigator.userLanguage;
  } else {
    // latest versions of Chrome, Firefox, and Safari set this correctly
    lang = navigator.language;
  }

  return lang;
}

export default browserLocale;
