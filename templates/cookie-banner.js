// @ts-nocheck
window.axeptioSettings = {
  clientId: "__AXEPTIO_CLIENT_ID__",
  cookiesVersion: "__AXEPTIO_SITE_NAME__",
};

(function() {
  const availableLanguages = ["en", "de", "es", "fr", "it", "nl"];
  function browserLocale() {
    let lang;

    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      // latest versions of Chrome and Firefox set this correctly
      lang = navigator.languages[0];
    } else if (navigator.userLanguage) {
      // IE only
      lang = navigator.userLanguage;
    } else {
      // latest versions of Chrome, Firefox, and Safari set this correctly
      lang = navigator.language;
    }

    // Keep only the language, not the country information:
    if (lang.indexOf("-") > 0) {
      lang = lang.split("-")[0];
    }

    if (!availableLanguages.includes(lang)) {
      lang = "en";
    }

    return lang;
  }

  window.axeptioSettings.cookiesVersion = `${window.axeptioSettings.cookiesVersion}-${browserLocale()}`;
})();
