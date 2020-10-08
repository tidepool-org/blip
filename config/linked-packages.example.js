/**
 * Copy this file to `local/linked-packages.js` and uncomment any modules as desired to link them
 * for local development.
 *
 * These will be resolved as aliases in the webpack config. Note that you will need to ensure that
 * the packages are installed (via `yarn install`) in each respective folder
 *
 * It's recommended to use the `yarn startLocal` script to run the app, as it will automatically
 * start the webpack development server for the `viz` repo when needed.
 *
 * You may add as other modules to this list as well.
 */
module.exports = {
  // '@tidepool/viz': process.env.TIDEPOOL_DOCKER_VIZ_DIR || '../viz',
  // 'tideline': process.env.TIDEPOOL_DOCKER_TIDELINE_DIR || '../tideline',
  // 'tidepool-platform-client': process.env.TIDEPOOL_DOCKER_PLATFORM_CLIENT_DIR || '../platform-client',
};
