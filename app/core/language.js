// Load languages
__.load({
  'fr': require('../../translations/json/fr.json'),
  'en': require('../../translations/json/en.json'),
});

// Set default language
const browserLanguage = require('browser-locale')();
__.lang(browserLanguage);
