Sundial datetime wrapper
========================

[![Build Status](https://travis-ci.org/tidepool-org/sundial.png)](https://travis-ci.org/tidepool-org/sundial)

The tidepool platform stores timestamps as ISO8601 timestamp with a timezone.

The purposes of this library are:

* Wrap the management of dates and times to insulate us from the specific mechanism
* Provide consistency for date operations
* Provide consistency for date and time formats

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
