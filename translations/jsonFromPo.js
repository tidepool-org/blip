const path = require('path');
const fs = require('fs');
const gettextParser = require('gettext-parser');
const languages = require('./languages.json');

const translationDir = __dirname;
const poDir = path.join(translationDir, 'po');
const jsonDir = path.join(translationDir, 'json');

for (let language of Object.keys(languages)) {
  const poPath = path.join(poDir, `${language}.po`);
  const jsonPath = path.join(jsonDir, `${language}.json`);

  const translationData = gettextParser.po.parse(fs.readFileSync(poPath, {encoding:'utf-8'}), 'utf-8');

  const json = {};
  const translations = translationData.translations[''];
  for (let key of Object.keys(translations)) {
    if (key && translations[key].msgstr[0]) {
      json[key] = translations[key].msgstr[0];
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: 'utf-8'});
}
