/**
 *  Translations sorter
 *
 * - author: fatb38
 * - license: MIT
 * - Github profile: https://github.com/fatb38
 */

const fs = require('fs');
const locales = ['de', 'en', 'es', 'fr', 'it', 'nl'];
const files = ['yourloops.json', 'translation.json'];

/**
 * @param {string} locale The language
 * @param {string} filename The filename
 */
function sortKeysInFile(locale, filename) {
  const jsonFilename = `./${locale}/${filename}`;
  const jsonFile = require(jsonFilename);
  const sortedJson = Object.keys(jsonFile).sort().reduce((accumulator, currentValue) => {
    accumulator[currentValue] = jsonFile[currentValue];
    return accumulator;
  }, {});

  fs.writeFile(
    `./locales/${locale}/${filename}`,
    JSON.stringify(sortedJson, null, 2),
    (err) => {
      console.log(err ?? `Sort ${jsonFilename} done !`);
    });
}

locales.forEach((locale) => {
  files.forEach((filename) => sortKeysInFile(locale, filename));
});
