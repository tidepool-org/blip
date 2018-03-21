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
  return (translations[currentLanguage] || {})[text] || text;
}

__.load = function(_translations) {
  translations = _translations;
}

__.lang = function(language) {
  currentLanguage = language;
}

module.exports = __;
