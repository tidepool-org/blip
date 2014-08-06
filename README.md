# tidepool-platform-client

Client-side library to interact with the [Tidepool](http://tidepool.org/) platform.

Dependencies:

- [Lo-Dash](http://lodash.com/)
- [Async](https://github.com/caolan/async)
- [Superagent](http://visionmedia.github.io/superagent/)

## Usage

Install with:

```javascript
npm install --save tidepool-platform-client
```

Use with [Webpack](webpack.github.io/) or [Browserify](browserify.org):

```javascript
var createTidepoolClient = require('tidepool-platform-client');

var tidepool = createTidepoolClient({
  host: 'https://api.tidepool.io',
  uploadApi: 'https://uploads.tidepool.io',
  log: {
    warn: function() {},
    info: function() {},
    debug: function() {}
  },
  localStore: window.localStorage,
  metricsSource: 'myApp',
  metricsVersion: '0.1.0'
});
```

## Test

### Integration tests

```bash
$ npm test
```

To run the integration tests you need to be running platform components locally, see the [runservers script](https://github.com/tidepool-org/tools).

- [Gatekeeper](https://github.com/tidepool-org/gatekeeper)
- [User-api](https://github.com/tidepool-org/user-api)
- [Message-api](https://github.com/tidepool-org/message-api)
- [Seagull](https://github.com/tidepool-org/seagull)
- [Hakken](https://github.com/tidepool-org/hakken)
- [Styx](https://github.com/tidepool-org/styx)
