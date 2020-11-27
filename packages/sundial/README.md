Sundial datetime wrapper
========================

[![Build Status](https://travis-ci.org/tidepool-org/sundial.png)](https://travis-ci.org/tidepool-org/sundial)

The tidepool platform stores timestamps as ISO8601 timestamp with a timezone.

The purposes of this library are:

1. Wrap the management of dates and times to insulate us from the specific mechanism
1. Provide consistency for date operations
1. Provide consistency for date and time formats

**NB:** In order to ensure the first goal above, no methods in the wrapper return anything but 'pure' JavaScript data types. Strings, numbers, and JavaScript Date objects are expected; 'moment' objects (via [Moment.js](http://momentjs.com/)) are not allowed.

## Usage

Install with:

```bash
$ npm install --save sundial
```

Use in Node.js, or client-side with [Webpack](webpack.github.io/) or [Browserify](browserify.org):

```javascript
var sundial = require('sundial');
```

## Test

Run unit tests with:

```bash
$ npm test
```

Run the tests in-browser locally with:

```bash
$ npm run browser-tests
```
