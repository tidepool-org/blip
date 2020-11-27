## tidepool-viz's usage of Moment.js

We use [moment](http://momentjs.com/ 'Moment.js') and [moment-timezone](http://momentjs.com/timezone/ 'Moment Timezone') to handle datetime computations with arbitrary timezone support. (JavaScript's built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date 'MDN: JavaScript Date')) only handles UTC or browser-local time natively and *does not* support datetimes in an arbitrary timezone (i.e., that may be different from the current browser timezone).

Moment's APIs are rather complex and the differences between nearly identical methods can be subtle (but important!). This document is to record the biggest "gotchas" we've run into with moment, or, in other words, to record what we've derived as our moment best practices over our years of hard lessons using the library.

More to come!
