## tidepool-viz's usage of webpack

Our use of [webpack](https://webpack.github.io/ 'webpack module bundler') in this repository is a bit different from our use of it in blip or the Tidepool uploader, where we're using it to build applications. Here we're using webpack to bundle our JavaScript, CSS, and JSON[^a] into a bundle that can be published to the [node package manager](http://npmjs.com/ 'npm') and then included as a dependency in other projects like blip.

While [the development webpack configuration](https://github.com/tidepool-org/viz/blob/master/webpack.config.js 'GitHub: viz webpack.config.js') is pretty similar to the configurations we used in blip and the uploader, [the production packaging configuration](https://github.com/tidepool-org/viz/blob/master/package.config.js 'GitHub: viz package.config.js') is different in that it specifies a `libraryTarget` and defines many of the dependencies as `externals` so that they don't get bundled twice (in both the viz JavaScript bundle and the blip bundle).

[^a]: The timezone database that comes with [moment-timezone](http://momentjs.com/timezone/ 'Moment Timezone') is JSON.
