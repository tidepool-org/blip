const buildConfig = require('../../server/config.app');

function localesLoader(source) {
  if (buildConfig.TEST) {
    return source;
  }

  const localesParams = JSON.parse(source);
  for (const locale in localesParams.resources) {
    if (Object.prototype.hasOwnProperty.call(localesParams.resources, locale)) {
      const main = require(`../../locales/${locale}/translation.json`);
      const params = require(`../../locales/${locale}/parameter.json`);
      localesParams.resources[locale].main = main;
      localesParams.resources[locale].params = params;
    }
  }

  // FIXME: Crowdin translations should only be available
  // when crowdin is active
  const crowdinLang = localesParams.crowdin.fallback;
  localesParams.crowdin.resources.main = require(`../../locales/${crowdinLang}/translation.json`);
  localesParams.crowdin.resources.params = require(`../../locales/${crowdinLang}/translation.json`);

  return JSON.stringify(localesParams);
}

module.exports = localesLoader;
