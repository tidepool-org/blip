/**
 * Copy this file to `config/local.js` and update as needed
 */

/**
 * Uncomment any linkedPackages as desired to link them for local development.
 *
 * These will be resolved as aliases in the webpack config. Note that you will need to ensure that
 * the packages are installed (via `yarn install`) in each respective folder
 *
 * It's recommended to use the `yarn startLocal` script to run the app, as it will automatically
 * start the webpack development server for the `viz` repo when needed.
 *
 * You may add as other modules to this list as well.
 */
const linkedPackages = {
  // '@tidepool/viz': process.env.TIDEPOOL_DOCKER_VIZ_DIR || '../viz',
  // 'tideline': process.env.TIDEPOOL_DOCKER_TIDELINE_DIR || '../tideline',
  // 'tidepool-platform-client': process.env.TIDEPOOL_DOCKER_PLATFORM_CLIENT_DIR || '../platform-client',
};

const featureFlags = {
  i18nEnabled: false,
  rxEnabled: false,
  clinicsEnabled: false,
};

const environments = {
  local: 'http://localhost:3000',
  dev: 'https://dev1.dev.tidepool.org',
  qa1: 'https://qa1.development.tidepool.org',
  qa2: 'https://qa2.development.tidepool.org',
  int: 'https://int-app.tidepool.org',
  prd: 'https://app.tidepool.org',
};

const apiHost = environments.dev;

module.exports = {
  listLinkedPackages: () => console.log(Object.keys(linkedPackages).join(',')),
  linkedPackages,
  featureFlags,
  apiHost,
}
