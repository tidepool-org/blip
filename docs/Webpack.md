## Blip's webpack build

Our usage of the [webpack](https://webpack.github.io/ 'webpack module bundler') module bundler at Tidepool is pretty standard, but there are a few things worth noting:

1. We separate out our CSS bundle as a separate asset instead of inlining it into the JavaScript bundle, which is more the norm in the React app developer community. We do this because historically we had problem with items shifting in the UI because the page was rendering before the fonts were loaded. When the fonts were loaded, this would change the dimensions of some rendered text, which we were checking in order to position other elements. (Positioning `<text>` in SVG is not as fun or easy as it is in HTML.) We found that we could avoid this UI "jump" of elements by simply splitting off the CSS (including the `@import` statements for our fonts) into a separate file. The browser doesn't paint until the CSS is fully loaded, and we no longer have UI "jump".

1. Mess with the `resolve` and `resolveLoader` configuration options at your own peril! These are *essential* to being able to `npm link` blip's "child" repositories (currently [tideline](https://github.com/tidepool-org/tideline 'Tidepool on GitHub: tideline') and [viz](https://github.com/tidepool-org/viz 'Tidepool on GitHub: viz')) when working locally.

1. [💣 tech debt 💣] Our production webpack build could be optimized quite easily to make our bundled assets smaller and faster to load. We're **not** doing many of the things common in production builds such as uglification and minification.

1. [💣 tech debt 💣] The [webpack.config.js](https://github.com/tidepool-org/blip/blob/master/webpack.config.js 'blip: webpack.config.js') file is long and hard to follow. It would serve us a lot better if we divided the dev build and the production build into separate webpack configurations in separate files.