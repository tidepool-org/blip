tideline
========

[![Browser Support](https://ci.testling.com/tidepool-org/tideline.png)
](https://ci.testling.com/tidepool-org/tideline)

(Test suite not yet complete.)

This repository is a self-contained module library for [Tidepool](http://tidepool.org/ 'Tidepool')'s timeline-style diabetes data visualization(s).

This module is currently under construction; check back often for updates!

## Install

Front-end dependencies:

- [D3.js](http://d3js.org/ 'D3')
- [Lo-Dash](http://lodash.com/ 'Lo-Dash') or [Underscore](http://underscorejs.org/ 'Underscore')
- [Duration.js](https://github.com/icholy/Duration.js 'Duration.js')

Development-only dependencies:

- [jQuery](http://jquery.com/ 'jQuery')

Optional dependencies:

- [Bows](https://github.com/latentflip/bows 'Bows') (for console logs used in debugging)

Install using [Bower](http://bower.io/ 'Bower'):

```bash
$ bower install --save https://github.com/tidepool-org/tideline
```

## Usage

You can use the library directly with [browserify](http://browserify.org/ 'browserify') and [LESS](http://lesscss.org/ 'LESS'):

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

To run the example, build the standalone bundle, and run the tests you will need to have a couple of tools installed.

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

### Running the example

To build the assets in the `example/` directory, run:

```bash
$ make example
```

If you have Python installed, you can run a server with:

```bash
$ make server
```

And point your browser to `http://localhost:8081/example/`.

### Build

To build standalone `tideline.js` and `tideline.css` files, run:

```bash
$ make dist
```

The files will be created in the `dist/` directory.

The script file will expose a global `window.tideline` object. 

### Test

To run the Node tests using [Mocha](http://visionmedia.github.io/mocha/ 'Mocha'):

```bash
$ make test
```

### Running everything for development

To run a minimal reporter version of the test suite, build the example, and serve it to yourself (again at `http://localhost:8081/example/`) for testing during development, run:

```bash
$ make develop
```

In circumstances when the test suite is currently failing, the above make target will error out before the server starts. If you are consciously working with broken tests, use the `no-test` target to build the example and serve it to yourself for development:

```bash
$ make no-test
```

(There is also an alternate version of `example.less` called `responsive.less` that uses viewport units for tideline's container sizing for *pseudo*-responsive (i.e., requires page refresh) dynamic sizing. If you're experiment with sizing variation and would like to develop against this version, use `make resp`.)

## Code Philosophy and Organization

Tideline is designed to be highly modular and framework-independent. It is currently being used in conjuction with [React](http://facebook.github.io/react/ 'React') in Tidepool's first application [blip](https://github.com/tidepool-org/blip 'blip').

The main functionality tideline provides is modules for building out various visualizations of multi-typed data sets aligned on various timescales. At present, there is a module (`one-day.js`) for creating a horizontal scrolling timeline that shows twenty-four hours of data at a time and a module (`two-week.js`) for creating a vertical scrolling timeline that shows two weeks of data at a time.

**Jargon:** The horizontal sections comprising sub-units of visualization plotted against the same x-axis are referred to in this repository as *pools*.

### Philosophy

Almost all of the main tideline components (found in `js/`) hew to at least some (but rarely all) of the suggestions in Mike Bostock's [Towards Reusable Charts](http://bost.ocks.org/mike/chart/ 'Mike Bostock: Towards Reusable Charts'). The data-type specific plotting functions (found in `js/plot/`) hew most closely to the suggested pattern, while the higher-level components (i.e., `one-day.js`, `two-week.js`) do not, as their tasks are not quite the same.

The plotting functions in `js/plot/` critically depend on D3's [enter](https://github.com/mbostock/d3/wiki/Selections#wiki-enter) and [exit](https://github.com/mbostock/d3/wiki/Selections#wiki-exit) selections. If you need it, [this tutorial by Mike Bostock](http://mbostock.github.io/d3/tutorial/circle.html) includes a good introduction to these.

While tideline is quite specific to diabetes at the moment, it is designed to be as flexible and modular as possible. We plan to integrate data types not specific to diabetes (e.g., activity tracker data, calendar events, etc.), and it should be possible to create a visualization of any multi-typed dataset using a combination of the higher-level components and additional plotting modules. We welcome any and all contributions of new plotting modules, as well as contributions to the core library modules.

### SVG Philosophy

Tideline uses [D3.js](http://d3js.org/ 'D3') to create an [SVG](http://www.w3.org/Graphics/SVG/ 'SVG') data visualization. SVG is an extremely powerful graphics format, and there are often many, many ways to accomplish the same visualization task. For the purposes of the code in this repository, two related points of philosophy should be noted upfront:

- Tideline *loves* SVG group `<g>` elements. **_Loves._**
- Relatedly, Tideline likes to use the `transform` attribute (usually just with a `translate(x,y)` definition) for positioning.

### Code Conventions

Tideline makes every attempt to adhere to standard coding conventions. In development, we use the same `.jshintrc` file as tideline's parent application [blip](https://github.com/tidepool-org/blip 'blip').

The only coding conventions unique to tideline are conventions of HTML and CSS ID and class names. All of the SVG elements comprising tideline use `camelCase` for IDs, with different parts of the ID separated by an underscore `_`. Class names, in contrast, are all lowercase, prefixed with `d3` and employ hypen `-` as a separator. These conventions help tideline developers to keep IDs and classes distinct.

### Repository Organization

- `css/` contains the LESS files that compile to tideline's CSS. `tideline.less` provides the styles and depends on `tideline-colors.less` for color variables. This makes it possible to customize tideline's color scheme by defining a different `tideline-colors.less` file.
- `dev/` contains a few scripts that are useful for development. Namely: command-line scripts for running the data-munging utilities in `js/data/` and a simple Python server which is called by various targets in `Makefile`.
- `example/` contains files that define a minimal implementation of tideline, useful mainly for development but also as a rough model of how integrating tideline into an application could work. In particular the `chartdailyfactory.js` and `chartweeklyfactory.js` can stand as examples of how to create useful high level wrapper functions around tideline components.
   + **NB:** The JSON data files provided in the `data/` sub-directory constitute fake diabetes data generated with [a Python script](https://github.com/tidepool-org/data-model/tree/master/demo-data) provided in Tidepool's [data-model](https://github.com/tidepool-org/data-model) repository. This Python tool does not yet have a README doc, but it is a fairly simple command-line tool with a `--help` command to get you started.
- `img/` contains the images used to plot certain types of diabetes data and is only necessary if you're using tideline for this purpose.
- `js/` contains the tideline library. At the top level, `one-day.js`, `two-week.js`, and `pool.js` are the main components. `index.js` exports the entire library, useful for creating a standalone tideline bundle with [browserify](http://browserify.org/).
   + `data/` contains a set of mini-modules for munging and calculating statistics around various types of diabetes data.
   + `lib/` contains importers for tideline's client-side dependencies, both optional and required.
   + `plot/` contains mini-modules for plotting various types of data, mostly diabetes-specific. These mini-modules are called by `pool.js` when rendering data. Most of the data types are self-explanatory (at least to those who have some knowledge of type 1 diabetes), but 'cbg' and 'smbg' may require explanation. 'cbg' stands for **C**ontinuous **B**lood **G**lucose and refers to the readings generated by a [Dexcom](http://www.dexcom.com/ 'Dexcom') or [Medtronic](http://www.medtronicdiabetes.com/treatment-and-products/enlite-sensor 'Medtronic Enlite Continuous Glucose Monitoring') continuous glucose sensor. 'smbg' stands for **S**elf-**M**onitored **B**lood **G**lucose and refers to the readings generated by a traditional home fingerstick blood glucose meter.
      - `stats/` contains a special mini-module for creating a "stats widget" that updates on the fly as the user navigates along the tideline. This is essentially a special type of pool that is hierarchical itself, containing component "puddles," where the relationship beween `puddle.js` and `stats.js` is roughly equivalent to the relationship between `pool.js` and the `one-week.js` and `two-week.js` main components.
   + `util/` contains a couple of small utility modules:
      - `fill.js` generates the background fill for each data pool.
      - `scales.js` generates D3 scales for various diabetes data types. The functions in this utility module are at the moment specific to the plotting functions in `plot/`, not generally useful.
      - `tooltip.js` is required by many of the plotting functions to generate tooltips upon hover over the plotted datapoint.
- `test/` contains the tideline test suite. See [Test](#test) for instructions on running the test suite.
- `web/` contains the [GitHub Pages](http://pages.github.com/ 'GitHub Pages') branch for this repository, which sometimes hosts a gallery for proposed additions or enhancements to the tideline example being developed in `example/`. If you would like to add something to this gallery, feel free to submit your modifications to the files in `example/` (and elsewhere in tideline, if relevant) and open a pull request against `master` (although this is not where your changes will be merged). Please comment in the pull request that your changes are intended as an addition to the gallery. If you are also proposing changes to the tideline library (i.e., outside of `example/`), a separate pull request containing those changes alone is appreciated.

## Using Tideline

### The Core

#### Common Assumptions

Both the one-day and two-week chart creation utilities make the same assumptions about the data that is passed to them:

- The data are valid JSON - specifically, an array of objects.
- Each object has a key `normalTime` which is an [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601 'Wikipedia: ISO 8601') representation of the date and time at which the datapoint occurred, *formatted as UTC time*.
- The data are sorted by `normalTime`, in ascending order.

Both one-day and two-week charts also expect a [Node.js EventEmitter](http://nodejs.org/api/events.html 'Node.js API: Events') passed as an argument.

#### SVG Structure

As noted above, tideline *loves* SVG group `<g>` elements. The basic structure of the one-day tideline chart is as follows:

```XML
|--<svg id='tidelineSVGOneDay'>
| |-<g id='tidelineMain'>
| | |-<g id='tidelineXAxis'>
| | |-<g id='tidelinePools'>
| | | |-<g id='pool[Datatype]'>
| | | | |-<g id='pool[Datatype]_fill'>
| | | | |-<g id='pool[Datatype]_[datatype]'>
| | |-<g id='tidelineLabels'>
| | | |-<text id='pool_pool[Datatype]_label'>
| | |-<g id='tidelineYAxes'>
| | |-<g id='tidelineScrollNav'>
| | |-<g id='tidelineTooltips'>
```

And the two-week chart differs only minimally:

```XML
|--<svg id='tidelineSVGTwoWeek'>
| |-<g id='tidelineMain'>
| | |-<g id='tidelinePools'>
| | | |-<g id='daysGroup'>
| | | | |-<g id='poolBG_[date]'>
| | | | | |-<g id='poolBG_[date]_fill'>
| | | | | |-<g id='poolBG_[date]_smbg'>
| | | |-<g id='poolStats'>
| | | | |-<g id='poolStats_stats'>
| | |-<g id='tidelineXAxisGroup'>
| | |-<g id='tidelineYAxisGroup'>
| | |-<g id='tidelineScrollNav'>
```

Because SVG has no concept of a [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index 'CSS z-index'), elements are layered according to the order in which they appear in the SVG XML. One of the reasons tideline makes such liberal use of group elements is to control the layering through the order of the group elements. Thus, the ordering of the groups in the two outlines above is often significant.

#### Creating a One-Day View

`one-day.js` provides the higher-level functions for constructing a view of a multi-typed data set where twenty-four hours of the data is visible at a time, plotted against hours of the day on the x-axis. The twenty-four hour window of visible data can be adjusted by clicking and dragging the visible data. A scrollbar can also (optionally) be rendered, and functions are available for programmatically scrolling the data forward or backward by twenty-four hours at a time; these can be attached to click handlers on extra-tideline application components (forward and backward arrow buttons in a navigation bar, for example).

`chartdailyfactory.js` in the `example/` folder in this repository provides a concrete example of creating a one-day view using the functions in `one-day.js` and may be a good companion to reference while reading this section.

Create a new `chart` by passing an EventEmitter `emitter` to `tideline.oneDay`:

```JavaScript
var chart = tideline.oneDay(emitter);
```

To set up the chart, you'll want to pass a width and a height to `chart` using the `width()` and `height()` functions. You can pass these functions the width and height of the HTML `<div>` element that is intended to contain `chart` for an easy way to ensure the right fit. Next, set the base URL for your server's `img/` directory for tideline's use with `imagesBaseUrl()`. Finally, pass the container HTML element `el` to `chart` and set up the chart's basic SVG structure with `d3.select(el).call(chart);`.

The next step is setting up each of the data pools that you would like to have in the one-day view. `tideline.oneDay` has a `newPool()` method for creating pools. This function returns the pool and can then be chained with other methods from `tideline.pool` to continue setting up the pool. Generally, the setup of a new pool will look something like the following:

```JavaScript
thisPool = chart.newPool()
  .id('thisPool', chart.poolGroup())
  .label('This is a pool')
  .index(chart.pools().indexOf(thisPool))
  .weight(0.5);
```

Calling `id()` with an ID for the newly created pool and the D3 selection of the element to which the pool is to be appended (yielded in this case by the getter function `tideline.oneDay.poolGroup()`) is required.

The label is optional; it controls the text that may appear (stickily; that is, it doesn't move when the user scrolls along the time axis) above the data pool on the left.

The weight of a pool controls how much vertical space will be allotted to it given the total height available and the weights of the other pools. The recommended default is 1.0 as a baseline; smaller or larger pools can be given different weights relative to that baseline - 0.5 for a half-height pool or 2.0 for a double-height pool.

The index controls the order of the pool with respect to the other pools. The code snippet above just uses the index at which the pool was created as its permanent index, but the `index()` function exists so that pool creation and ordering in the display can be decoupled, if so desired.

After creating all the pools in the view, a call to `tideline.oneDay.arrangePools()` will set the dimensions of each pool group and apply the appropriate `transform` attribute to each pool's SVG group `<g>` element to position it.

Finally, if any of the pools you've added will require tooltips, use `tideline.oneDay.setTooltip()` to set up the master tooltip group, then add as many tooltip sets to `chart` as necessary (keeping in mind each pool can be associated with more than one tooltip set, as for example the carbohydrate intake and bolus insulin pool is in the tideline example):

```JavaScript
chart.tooltips().addGroup(d3.select('#' + thisPool.id()), 'poolDataType');
```

Setting up the tooltips marks the end of the chart setup that can be accomplished without the data that's to be visualized in the chart. All of the above setup steps can be usefully grouped together into a wrapper function that only needs to be called once per visualization. (See the `chart.setupPools()` function in `chartdailyfactory.js` for an example.)

The next logical grouping of steps is all of the steps that are dependent on the data to be visualized and need to be called every time new data is passed to the visualization. (These have been grouped in the `chart.load(data, datetime)` function in `chartdailyfactory.js`.)

The first steps are to load the data, set the axes, and set up the desired navigation components:

```JavaScript
chart.data(data).setAxes().setNav().setScrollNav();
```

Setting scrollbar navigation is completely optional; all of the other navigation components (click-and-drag to pan; attaching button clicks to the programmatic `tideline.oneDay.panForward()` and `tideline.oneDay.panBack()` functions) will work as intended without adding the scrollbar.

The next step is to set the data-dependent attributes in each of the pools. The most complex of these attributes is the pool's y-axis (or axes, as can also occur). For diabetes data, scales can be generated using the datatype-appropriate functions in `tideline.plot.util.scales`. The scale(s) is then used to generate a D3 axis that is passed to the pool using the `yAxis()` function, which *will* accept multiple axes. In the tideline example, the setup for the axes of the pool that displays carbohydrate intake and bolus insulin data is the following:

```JavaScript
var scaleBolus = tideline.plot.util.scales.bolus(_.where(data, {'type': 'bolus'}), poolBolus);
var scaleCarbs = tideline.plot.util.scales.carbs(_.where(data, {'type': 'carbs'}), poolBolus);
// set up y-axis for bolus
poolBolus.yAxis(d3.svg.axis()
  .scale(scaleBolus)
  .orient('left')
  .outerTickSize(0)
  .ticks(3));
// set up y-axis for carbs
poolBolus.yAxis(d3.svg.axis()
  .scale(scaleCarbs)
  .orient('left')
  .outerTickSize(0)
  .ticks(3));
```

After the axes are added to the pool, the final step is to set up the plot functions that will be called whenever new data needs to be rendered - that is, at the chart's initial rendering, and whenever the user navigates past the point (a certain distance from the end of rendered data) that triggers the rendering of more data. `pool.addPlotType()` takes three arguments:

1. the datatype
2. the plot function - see [plot modules](#plot-modules) below for further details
3. a Boolean indicating whether the plot function renders data
4. a Boolean indicating whether what the plot function renders is rendered on the main x-axis and thus should move upon navigation

In the tideline example, three plot types are added to the pool that displays carbohydrate intake and bolus insulin information:

```JavaScript
// add background fill rectangles to bolus pool
poolBolus.addPlotType('fill', tideline.plot.util.fill(poolBolus, {endpoints: chart.endpoints}), false, true);

// add carbs data to bolus pool
poolBolus.addPlotType('carbs', tideline.plot.carbs(poolBolus, {
  yScale: scaleCarbs,
  emitter: emitter,
  data: _.where(data, {'type': 'carbs'})
}), true, true);

// add bolus data to bolus pool
poolBolus.addPlotType('bolus', tideline.plot.bolus(poolBolus, {
  yScale: scaleBolus,
  emitter: emitter,
  data: _.where(data, {'type': 'bolus'})
}), true, true);
```

The first plot type is the background fill over which the data in the pool will be plotted - in this case variably colored rectangles at three-hour intervals. Fill is an example of a plot type that does not render data, but it does get rendered on the main x-axis and is expected to move upon navigation.

The carbs and bolus plot types, in contrast, both render data and are expected to move on navigation.

The only plot type that does not get rendered on the x-axis is the stats widget; passing `false` for the final Boolean argument when adding stats as a plot type is what allows this component to remain in the same place while the rest of the rendered pools move on navigation.

##### Plot Modules

The plot modules are found in `js/plot/`. Each plot module provides a function for plotting a particular view of one type of data. (Sometimes there will be multiple plot modules for a single data type, if more than one way of plotting this data type is desirable. So far in this repository, there are two plot modules for smbg values, `smbg.js` and `smbg-time.js`.)

> Creating new plot modules for data types not currently visualized in tideline is one of the easiest ways to contribute this repository. Whether a new plot module visualizes additional diabetes data (e.g., a more detailed food log), contextual data (e.g., calendar data or activity data from a Fitbit or similar) to be displayed alongside the data types already in tideline, or data that's unrelated to type 1 diabetes and represents a new use for this visualization library (e.g., GitHub activity data!), we'd welcome any and all contributions.

All of the plot modules share a common structure. Where they have different requirements, an `opts` object is passed to the module to set the additional needed parameters. For example, from the code above demonstrating how plot types are added to the carbohydrate intake and bolus insulin pool in the tideline example, there is variation in the object passed to the fill plot module:

```JavaScript
tideline.plot.util.fill(poolBolus, {endpoints: chart.endpoints})
```

versus the bolus plot module:

```JavaScript
tideline.plot.bolus(poolBolus, {
  yScale: scaleBolus,
  emitter: emitter,
  data: _.where(data, {'type': 'bolus'})
})
```

Both take the pool (`poolBolus`) where the plot module is to be rendered as their first argument, but the second `opts` object argument contains the specific attribute-value pairs needed for that module.

The inner function of each plot module is saved as a `plotType.plot` attribute by `pool.js` and called whenever new data needs to be rendered. Each inner function takes a D3 selection as an argument; this selection is the SVG group element within which the rendered data will live. The inner function is also where we make use of D3's `enter` and `exit` selections to render new data (`enter`) and remove stale (i.e., far out of view after the user has navigated) rendered data from the DOM (`exit`).

The simplest plot module may contain nothing but an inner function, but other functions are added as needed. Plot types that have a tooltip interaction on hover will have a `plotType.addTooltip()` function.

Once all the axes and plot types for each pool for have been set, the data-dependent setup for a one-day chart is complete.

The final step is rendering the one-day view. In `chartdailyfactory.js` we group the rendering steps together in a `chart.locate([datetime])` function since rendering the one-day view also means choosing which particular day of the data to initialize the view at. Failing to pass a `datetime` argument to `chart.locate()` results in rendering the most recent twenty-four hours of data. In other cases, the assumption is that the `datetime` passed represents the point in time that should appear in the *center* of the one-day view. Since tideline speaks more naturally in terms of domain endpoints - the edges of the view, rather than the center - some computation is performed to translate the `datetime` into an edgepoint that is passed into `tideline.oneDay.setAtDate()`.

As can be seen in `chartdailyfactory.js`, there are a couple of steps before `tideline.oneDay.setAtDate()` can be called. The navigation functions in tideline require that several variables are constantly tracked, including the beginning and end of the rendered data. These are initialized with `tideline.oneDay.beginningOfData()` and `tideline.oneDay.endOfData()`, respectively. `tideline.oneDay.allData()` takes as arguments the entire data array and the start and end of the desired data viewing window to filter out all but the data that is necessary for rendering the initial view. The call to `tideline.oneDay.setAtDate()` follows. A call to `tideline.oneDay.navString()` is optional; this function emits several events that can be used by extra-tideline components, among them an ISO 8601 string representing the current date of the data in view.

In absolute final position is the code to render data in each pool:

```JavaScript
chart.pools().forEach(function(pool) {
  pool.render(chart.poolGroup(), localData);
});
```

#### Creating a Two-Week View

Coming soon!
