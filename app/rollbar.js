/* global __ROLLBAR_POST_TOKEN__, __VERSION__, __API_HOST__, __PROD__ */
import Rollbar from 'rollbar/dist/rollbar.umd';

let rollbar;

console.log('__ROLLBAR_POST_TOKEN__', __ROLLBAR_POST_TOKEN__);
console.log('__VERSION__', __VERSION__);
console.log('__PROD__', __PROD__);
console.log(__API_HOST__ || `${window.location.protocol}//${window.location.host}`);


if (__PROD__) {
  rollbar = new Rollbar({
      accessToken: __ROLLBAR_POST_TOKEN__,
      captureUncaught: true,
      payload: {
          environment: __API_HOST__ || `${window.location.protocol}//${window.location.host}`,
          client: {
            javascript: {
              /* eslint-disable camelcase */
              code_version: __VERSION__,
              guess_uncaught_frames: true
              /* eslint-enable camelcase */
            }
          },
          server: {
            root: 'webpack:///./'
          }
      },
      // to deal with URI's as local filesystem paths, we use the "many domain" transform:
      // https://rollbar.com/docs/source-maps/#using-source-maps-on-many-domains
      transform: function(payload) {
        var trace = payload.body.trace;
        if (trace && trace.frames) {
          for (var i = 0; i < trace.frames.length; i++) {
            var filename = trace.frames[i].filename;
            if (filename) {
              trace.frames[i].filename = 'http://dynamichost/dist/bundle.js';
            }
          }
        }
      }
    }
  );
}

export default rollbar;
