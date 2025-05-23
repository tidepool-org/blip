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

const path = require('path');

const linkedPackages = {
  // '@tidepool/viz': process.env.TIDEPOOL_DOCKER_VIZ_DIR || path.resolve(__dirname, '../../viz'),
  // 'tideline': process.env.TIDEPOOL_DOCKER_TIDELINE_DIR || path.resolve(__dirname, '../../tideline'),
  // 'tidepool-platform-client': process.env.TIDEPOOL_DOCKER_PLATFORM_CLIENT_DIR || path.resolve(__dirname, '../../platform-client'),
};

const featureFlags = {
  i18nEnabled: false,
  pendoEnabled: true,
};

const environments = {
  local: 'http://localhost:31500',
  dev: 'https://dev1.dev.tidepool.org',
  qa1: 'https://qa1.development.tidepool.org',
  qa2: 'https://qa2.development.tidepool.org',
  qa3: 'https://qa3.development.tidepool.org',
  qa4: 'https://qa4.development.tidepool.org',
  qa5: 'https://qa5.development.tidepool.org',
  int: 'https://int-app.tidepool.org',
  prd: 'https://app.tidepool.org',
};

const apiHost = environments.dev;
const launchDarklyClientToken = '';
const uploadApi = apiHost;

module.exports = {
  listLinkedPackages: () => console.log(Object.keys(linkedPackages).join(',')),
  linkedPackages,
  featureFlags,
  apiHost,
  launchDarklyClientToken,
  uploadApi,
};
