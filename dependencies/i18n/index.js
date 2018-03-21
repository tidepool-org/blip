/**
 * This file is part of the multi-language solution.
 *
 * This file is treated as an external module (in package.json) and
 * allows dynamic use of the multi-language solution, with a single .js
 * and .html for all languages.
 *
 */

const defaultLanguage = 'en';

let translations = {};

let currentLanguage = defaultLanguage;

/**
 * Translation function, returns translated form of text in
 * the current language if available.
 *
 * @param {string} text
 * @returns {string} Translated version of text, or text if no translation
 */
function __(text) {
  // If the language is en-US, first look at en-US, then en.
  if (translations[currentLanguage] && translations[currentLanguage].hasOwnProperty(text)) {
    return translations[currentLanguage][text];
  }
  const shortLanguage = currentLanguage.substr(0, 2);
  if (translations[shortLanguage] && translations[shortLanguage].hasOwnProperty(text)) {
    return translations[shortLanguage][text];
  }

  return text;
}

__.load = function(_translations) {
  translations = _translations;
}

__.lang = function(language) {
  currentLanguage = language;
}

module.exports = __;
