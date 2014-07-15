tideline
========

This repository is a self-contained module library for [Tidepool](http://tidepool.org/ 'Tidepool')'s timeline-style diabetes data visualization(s).

This module is currently under construction; check back often for updates!

More information is also available in [the wiki](https://github.com/tidepool-org/tideline/wiki).

## Install

### Front-end dependencies

- [Crossfilter](http://square.github.io/crossfilter/ 'Crossfilter')
- [D3.js](http://d3js.org/ 'D3')
- [Duration.js](https://github.com/icholy/Duration.js 'Duration.js')
- [Lo-Dash](http://lodash.com/ 'Lo-Dash') or [Underscore](http://underscorejs.org/ 'Underscore')

Development-only dependencies:

- [jQuery](http://jquery.com/ 'jQuery')
- [jquery-simulate](https://github.com/jquery/jquery-simulate 'jquery-simulate')
- [Less.js](http://lesscss.org/ 'Less')
- [React](http://facebook.github.io/react/ 'React')
- [Moment](http://momentjs.com/ 'Moment')

Optional dependencies:

- [Bows](https://github.com/latentflip/bows 'Bows') (for console logs used in debugging)

Optional Python dependencies:

- [BeautifulSoup](http://www.crummy.com/software/BeautifulSoup/) (for adding an item to the tideline gallery)
- [jsonschema](https://pypi.python.org/pypi/jsonschema) (for running the validation script in `dev/schema/`)

These dependencies can be installed using `pip install -r requirements.txt`. It is best to install them in a Python 3.*-based `virtualenv` (e.g., using [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/): `mkvirtualenv --python=/usr/local/bin/python3 tideline`, substituting equivalent path resulting from running `which python3` if necessary) if you're planning to use the JSON Schema validation tool; its output is easier to read in Python 3.

Install using [Bower](http://bower.io/ 'Bower'):

```bash
$ bower install --save https://github.com/tidepool-org/tideline
```

## Usage

You can use the library directly with [browserify](http://browserify.org/ 'browserify') and [Less](http://lesscss.org/ 'Less'):

```javascript
// app.js
var tideline = require('<path-to-tideline>/js');
```

```less
// app.less
@import "<path-to-tideline>/css/tideline.less";
```

To build a standalone version to include with `<script>` and `<link>` tags, see [Build](#build).

You will also need to copy the `img/` and `fonts/` directories to paths served by your server.

For information on building charts using tideline components, see [Using Tideline](https://github.com/tidepool-org/tideline/wiki#using-tideline).

## Development

To run the example, build the standalone bundle, and run the tests you will need to have a couple of tools installed. Everything you need can be installed via `npm` and `bower`:

```bash
$ npm install
$ bower install
```

### Running the example

To build and serve up the assets in the `example/` directory, run:

```bash
$ npm start
```

You can then view the example at `http://localhost:8081/`.

#### Running the example with real data

If you want to run the example with real data to view instead of the demo data generated from the Python script in `dev/demodata/`, you'll need the following:

 1. A file of real data exported from blip by entering `window.downloadJSON()` in the console after data successfully loads and saving the resulting file named `blip-output.json` in `example/data/`.
 1. Set your `$DATA` environment variable to the filename with `export DATA='blip-output.json'`.
 1. Start the tideline example with `npm start` as usual.

### Build

To build standalone `tideline.js` and `tideline.css` files, as well as the standalone 'plugins' bundles for Tidepool's first application [blip](https://github.com/tidepool-org/blip 'Tidepool GitHub: blip'), run:

```bash
$ gulp
```

The files will be created in the `dist/` directory.

The script file will expose a global `window.tideline` object. 

### Test

To run the tests in Chrome using [Mocha](http://visionmedia.github.io/mocha/ 'Mocha') and the [testem](https://github.com/airportyh/testem 'Test'em') test runner:

```bash
$ npm test
```

## Code Philosophy and Organization

Tideline is designed to be highly modular and framework-independent. It is currently being used in conjunction with [React](http://facebook.github.io/react/ 'React') in Tidepool's first application [blip](https://github.com/tidepool-org/blip 'blip').

The main functionality tideline provides is modules for building out various visualizations of multi-typed data sets aligned on various timescales. At present, there is a module (`oneday.js`) for creating a horizontal scrolling timeline that shows twenty-four hours of data at a time, a module (`twoweek.js`) for creating a vertical scrolling timeline that shows two weeks of data at a time, and a modeul (`settings.js`) for creating an HTML table view of insulin pump settings.

**Jargon:** The horizontal sections comprising sub-units of visualization plotted against the same x-axis are referred to in this repository as *pools*.

### Philosophy

Almost all of the main tideline components (found in `js/`) hew to at least some (but rarely all) of the suggestions in Mike Bostock's [Towards Reusable Charts](http://bost.ocks.org/mike/chart/ 'Mike Bostock: Towards Reusable Charts'). The data-type specific plotting functions (found in `js/plot/`) hew most closely to the suggested pattern, while the higher-level components (i.e., `oneday.js`, `twoweek.js`, `settings.js`) do not, as their tasks are not quite the same.

The plotting functions in `js/plot/` critically depend on D3's [enter](https://github.com/mbostock/d3/wiki/Selections#wiki-enter) and [exit](https://github.com/mbostock/d3/wiki/Selections#wiki-exit) selections. If you need it, [this tutorial by Mike Bostock](http://mbostock.github.io/d3/tutorial/circle.html) includes a good introduction to these.

While tideline is quite specific to diabetes at the moment, it is designed to be as flexible and modular as possible. We plan to integrate data types not specific to diabetes (e.g., activity tracker data, calendar events, etc.), and it should be possible to create a visualization of any multi-typed dataset using a combination of the higher-level components and additional plotting modules. We welcome any and all contributions of new plotting modules, as well as contributions to the core library modules.

### SVG Philosophy

Tideline uses [D3.js](http://d3js.org/ 'D3') to create an [SVG](http://www.w3.org/Graphics/SVG/ 'SVG') data visualization. SVG is an extremely powerful graphics format, and there are often many, many ways to accomplish the same visualization task. For the purposes of the code in this repository, two related points of philosophy should be noted upfront:

- Tideline *loves* SVG group `<g>` elements. **_Loves._**
- Relatedly, Tideline likes to use the `transform` attribute (usually just with a `translate(x,y)` definition) for positioning.

### Code Conventions

Tideline makes every attempt to adhere to standard coding conventions. In development, we use the same `.jshintrc` file as tideline's parent application [blip](https://github.com/tidepool-org/blip 'blip').

The only coding conventions unique to tideline are conventions of HTML and CSS ID and class names. All of the SVG elements comprising tideline use `camelCase` for IDs, with different parts of the ID separated by an underscore `_`. Class names, in contrast, are all lowercase, prefixed with `d3` and employ hyphen `-` as a separator. These conventions help tideline developers to keep IDs and classes distinct.

### Repository Organization

- `css/` contains the Less files that compile to tideline's CSS. `tideline.less` provides the styles and depends on `tideline-colors.less` for color variables. This makes it possible to customize tideline's color scheme by defining a different `tideline-colors.less` file.
- `dev/` contains a few tools that are (occasionally) useful for development.
    + `demodata/` contains a Python script for generating fake data for testing tideline during development. For usage information, run `python demo_data.py --help`.
    + `schema/` contains tideline's data requirements documented in a [JSON Schema](http://json-schema.org/ 'JSON Schema') along with a Python shell script to validate a given JSON file against the schema. (Run `./validate.py --help` for usage instructions; more information also available on [the schema wiki page](https://github.com/tidepool-org/tideline/wiki/Schema 'Tideline Wiki: Schema').
    + `templates/` contains two module templates: `plottemplate.js` for a [plot module](https://github.com/tidepool-org/tideline/wiki/CreatingOneDay#plot-modules 'Tideline Wiki: Plot Modules') and `datautil.js` for a data utility analogous to those found in `js/data/`.
    + `testpage/` is a miniature JavaScript library for generating test data used in the tideline visualization integration tests. In contrast to the demo data generator, the test page data is extremely regular, with no randomization.
- `example/` contains files that define a minimal implementation of tideline, useful for development.
    + **NB:** The JSON data file provided in the `data/` sub-directory constitutes fake diabetes data generated with the Python script `demo_data.py` found in `dev/demodata/`.
- `img/` contains the images used to plot certain types of data (i.e., notes) or form tooltips.
- `js/` contains the tideline library. At the top level, `oneday.js`, `twoweek.js`, `settings.js`, and `pool.js` are the main components. `tidelinedata.js` defines the data object that the other core components expect to be passed; however, it is usually called from a preprocessing plugin (see `plugins/data/preprocess/`), not from the other core modules. `index.js` exports the entire library, useful for creating a standalone tideline bundle with [browserify](http://browserify.org/).
   + `data/` contains a set of mini-modules for munging and calculating statistics around various types of diabetes data.
     - `util/` contains some common utilities that are used mainly in the `data/` modules, but `datetime.js`, `format.js` (for formatting the output of numerical calculations - that is, rounding and displaying numbers to the proper number of significant digits), and `tidelinecrossfilter.js`, which wraps the most common uses of [Crossfilter](http://square.github.io/crossfilter/ 'Crossfilter') in tideline, are also used outside of `data/`.
   + `lib/` contains an importer for tideline's client-side dependencies, both optional and required.
   + `plot/` contains mini-modules for plotting various types of data, mostly diabetes-specific. These mini-modules are called by `pool.js` when rendering data. Most of the data types are self-explanatory (at least to those who have some knowledge of type 1 diabetes), but 'cbg' and 'smbg' may require explanation. 'cbg' stands for **C**ontinuous **B**lood **G**lucose and refers to the readings generated by a [Dexcom](http://www.dexcom.com/ 'Dexcom') or [Medtronic](http://www.medtronicdiabetes.com/treatment-and-products/enlite-sensor 'Medtronic Enlite Continuous Glucose Monitoring') continuous glucose sensor. 'smbg' stands for **S**elf-**M**onitored **B**lood **G**lucose and refers to the readings generated by a traditional home fingerstick blood glucose meter.
      - `stats/` contains a special mini-module for creating a "stats widget" that updates on the fly as the user navigates along the tideline. This is essentially a special type of pool that is hierarchical itself, containing component "puddles," where the relationship between `puddle.js` and `stats.js` is roughly equivalent to the relationship between `pool.js` and the `one-week.js` and `twoweek.js` main components.
     - `util/` contains a couple of small utility modules:
     	- `annotation.js` and `annotationdefinitions.js` generate data annotations.
     	- `bgBoundaryClass.js` provides a utility for determining the class (very-low, low, target, high, very-high) of a blood glucose value given the user's (or the default) target range.
        - `fill.js` generates the background fill for each data pool.
        - `legend.js` defines legend generators for all the pools that require a legend.
        - `scales.js` generates D3 scales for various diabetes data types. The functions in this utility module are at the moment specific to the plotting functions in `plot/`, not generally useful.
        - `shapes.js` generates SVG shapes for use in other modules such as `annotation.js`.
        - `tooltip.js` is required by many of the plotting functions to generate tooltips upon hover over the plotted datapoint.
- `plugins/` contains modules that do not properly belong in tideline's core functionality. These fall into two categories: application-specific modules and data(-specific) preprocessing modules.
     - `blip/` contains 'factories' for generating tideline data visualizations in Tidepool's first application [blip](https://github.com/tidepool-org/blip 'blip'). See this repository's [wiki](https://github.com/tidepool-org/tideline/wiki#using-tideline 'Tideline Wiki') for information on writing tideline chart factories.
     - `data/` contains two independent utilities for data preprocessing that are specific to the data generated by the Tidepool platform.
- `test/` contains the tideline test suite. See [Test](#test) for instructions on running the test suite.
- `web/` contains the [GitHub Pages](http://pages.github.com/ 'GitHub Pages') branch for this repository, which sometimes hosts a gallery for proposed additions or enhancements to the tideline example being developed in `example/`. If you would like to add something to this gallery, feel free to submit your modifications to the files in `example/` (and elsewhere in tideline, if relevant) and open a pull request against `master` (although this is not where your changes will be merged). Please comment in the pull request that your changes are intended as an addition to the gallery. If you are also proposing changes to the tideline library (i.e., outside of `example/`), a separate pull request containing those changes alone is appreciated.

## Using Tideline

### The Core

#### Common Assumptions

`js/tidelinedata.js/` makes certain assumptions about the data that is passed to it:

- The data are valid JSON - specifically, an array of objects.
- Each object has a key `normalTime` which is an [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601 'Wikipedia: ISO 8601') representation of the date and time at which the datapoint occurred, *formatted as UTC time*.
- The data are sorted by `normalTime`, in ascending order.

Both one-day and two-week charts also expect a [Node.js EventEmitter](http://nodejs.org/api/events.html 'Node.js API: Events') passed as an argument.

Much, much more about the data that tideline requires can be found in the JSON Schema in `dev/schema/tidelineschema.json` and discussed in [the corresponding wiki page](https://github.com/tidepool-org/tideline/wiki/Schema).

#### SVG Structure

As noted above, tideline *loves* SVG group `<g>` elements. The basic structure of the one-day tideline chart is as follows:

```XML
|--<svg id='tidelineSVGOneDayContainer'>
| |-<g id='tidelineMain'>
| | |-<g id='tidelineXAxis'>
| | |-<g id='tidelinePools'>
| | | |-<g id='pool[Datatype]'>
| | | | |-<g id='pool[Datatype]_fill'>
| | | | |-<g id='pool[Datatype]_[datatype]'>
| | |-<g id='tidelineLabels'>
| | | |-<text id='pool_pool[Datatype]_label'>
| | | |-<g id='pool_pool[Datatype]_legend_[datatype]'>
| | |-<g id='tidelineYAxes'>
| | |-<g id='tidelineScrollNav'>
| | |-<g id='tidelineAnnotations'>
| | |-<g id='tidelineTooltips'>
```

And the two-week chart differs only minimally:

```XML
|--<svg id='tidelineSVGTwoWeekContainer'>
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
| | |-<g id='tidelineWeeklyLabels'>
| | |-<g id='tidelineTooltips'>
| | |-<g id='tidelineAnnotations'>
```

Because SVG has no concept of a [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index 'CSS z-index'), elements are layered according to the order in which they appear in the SVG XML. One of the reasons tideline makes such liberal use of group elements is to control the layering through the order of the group elements. Thus, the ordering of the groups in the two outlines above is often significant.