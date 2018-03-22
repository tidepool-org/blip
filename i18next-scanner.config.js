const languages = require('./locales/languages.json');

module.export = {
  keySeparator: false,
  namespaceSeparator: false,
  lexers: {
    js: ['JavascriptLexer', 'JsxLexer']
  },
  sort: true,
  locales: Object.keys(languages)
}
