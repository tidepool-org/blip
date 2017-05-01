## JavaScript utilities

This directory contains pure JavaScript utilities for data munging, datetime manipulation, and data display formatting. This document describes our coding standards for these utilities.

### auto-generating API docs

We enforce the use of [JSDoc](http://usejsdoc.org/ '@use JSDoc') comments within the `src/utils/` directory with the `require-jsdoc` ESLint rule. To generate or update the Markdown file of auto-generated API documentation using [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown 'GitHub: jsdoc2md'), run the following:

```bash
npm run apidocs src/utils/utilsfile.js > src/utils/apidocs/utilsfile.md
```

For example:

```bash
npm run apidocs src/utils/datetime.js > src/utils/apidocs/datetime.md
```

### use of ES6 `import` and `export`

- `export` each function individually:
```JavaScript
export function getTimezoneFromTimePrefs() {
  ...
}
```
- unless you need to use a lot of the utilities from a module, it's also nice to import just what you need with de-structuring: `import { getTimezoneFromTimePrefs } from './datetime';`
- do **not** use the `export default`

### use of the `moment` API for datetime manipulation

We use [`moment-timezone`](http://momentjs.com/timezone/) when we need to do datetime manipulation involving an arbitrary timezone since neither JavaScript `Date` or D3 provide this functionality. We also try to *only* use `moment` where necessary, preferring JavaScript `Date` or D3 where one or the other is sufficient.

We are trying to move towards a standard in this repository of dealing with datetimes as hammertimes (milliseconds since January 1, 1970) as much as possible, rather than as ISO 8601-formatted Zulu timestamps in String format, as we've done in the past.

When you need to apply an arbitrary timezone to format a datetime for display, the initial construction of the moment object should look like this:

```JavaScript
const d = moment.utc(hammertime);
```

See [moment's documentation on 'UTC' mode](http://momentjs.com/docs/#/parsing/utc/) for further details.

In particular, try to avoid `moment(hammertime).utc()`, as this will first create a representation of the hammertime in the browser's timezone/locale, then convert it back to offset-less UTC, an unnecessary step.

Also be **sure** to avoid `moment().utc(hammertime)` as this creates a new "moment" object representing the time of execution, then ignores the `hammertime` parameter to the `utc()` method!

We are also enforcing use of `moment.utc()` and disallowing `moment().utc()` with the help of [an ESLint plugin](https://github.com/wunderflats/eslint-plugin-moment-utc).
