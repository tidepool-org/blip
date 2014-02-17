tideline
========

This repository contains a self-contained module for [Tidepool](http://tidepool.org/ 'Tidepool')'s timeline-style diabetes data visualization(s).

This module is currently under construction; check back often for updates!

## Install

Dependencies:

- [D3.js](http://d3js.org/)
- [Underscore](http://underscorejs.org/) or [Lo-Dash](http://lodash.com/)
- [jQuery](http://jquery.com/)

Optional dependencies:

- [Bows](https://github.com/latentflip/bows) (for console logs used in debugging)

Install using [Bower](http://bower.io/):

```bash
$ bower install --save https://github.com/tidepool-org/tideline
```

## Usage

You can use the library directly with [browserify](http://browserify.org/) and [LESS](http://lesscss.org/):

```javascript
// app.js
var tideline = require('<path-to-tideline>/js');
```

```less
// app.less
@import "<path-to-tideline>/css/tideline.less";
```

To build a standalone version to include with `<script>` and `<link>` tags, see [Build](#build).

You will also need to copy the `img/` directory to a path served by your server.

## Development

Tu run the example, build the standalone bundle, and run the tests you will need to have a couple of tools installed.

Make sure you have [Bower](http://bower.io/), [browserify](http://browserify.org/), and [LESS](http://lesscss.org/) installed:

```bash
$ npm install -g bower
$ npm install -g browserify
$ npm install -g less
```

Install the repository's dependencies:

```bash
$ bower install
$ npm install
```

## Running the example

To build the assets in the `example/` directory, run:

```bash
$ make example
```

If you have Python installed, you can run a server with:

```bash
$ make server
```

And point your browser to `http://localhost:8000/example/`.

## Build

To build standalone `tideline.js` and `tideline.css` files, run:

```bash
$ make dist
```

The files will be created in the `dist/` directory.

The script file will expose a global `window.tideline` object. 

## Test

To run the Node tests using [Mocha](http://visionmedia.github.io/mocha/):

```bash
$ make test
```

## Code Philosophy and Organization

The tideline module is designed to be highly modular. To this end, its component parts (thus far, [container.js](https://github.com/tidepool-org/tideline/blob/master/js/container.js 'Tideline: container.js') and [pool.js](https://github.com/tidepool-org/tideline/blob/master/js/pool.js 'Tideline: pool.js')) are organized roughly according to the principles laid out in Mike Bostock's ["Towards Reusable Charts"](http://bost.ocks.org/mike/chart/ 'Mike Bostock: Towards Reusable Charts').

The main unit of each tideline is the container, which creates:

 - an SVG element for visualization (ID `#tidelineSVG`)
	
 - a main group element to contain the sub-units of visualization (ID `#tidelineMain`)
 
 - a group to contain the horizontal axis (classes `x` and `axis`, ID `#tidelineXAxis`)
 
 - a group to contain other horizontal navigation elements (class `x`, ID `#tidelineNav`)
 
The horizontal sections comprising sub-units of visualization plotted against the same x-axis are referred to in this repository as *pools*. Each pool is an SVG group element with an ID formed from the prefix `pool_` plus an integer identifying the pool uniquely. Each pool is embedded within `g#tidelineMain` and may contain one or more of the following:
 
 - a 'fill' group (ID ending in `_fill`) containing elements that form the background for the pool
 
 - a 'data' group (ID ending in `_data`) containing elements representing the data of interest
 
 - a 'random' group (ID ending in `_random`) containing elements representing random data (for development purposes)
