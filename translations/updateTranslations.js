/* This code is outside of the webpack build process, as such the import syntax is not used */

const path = require ('path');
const {extractFromFiles, mergeMessagesWithPO} = require('i18n-extract');

const appDir = path.join(__dirname, '..', 'app');
const translationDir = __dirname;
const poDir = path.join(translationDir, 'po');

// i18next.t is our translation function, and we only translate what's inside app
const keys = extractFromFiles(`${appDir}/**/*.js`, {marker: 't'});

const languages = require('./languages.json');

// We overwrite .po files with the updated information from the code, removing unused translations and adding
// new keys for new items to translate
for (let language of Object.keys(languages)) {
  mergeMessagesWithPO(keys, path.join(poDir, `${language}.po`), path.join(poDir, `${language}.po`));
}

