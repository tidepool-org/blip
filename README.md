[![Build Status](https://img.shields.io/travis/tidepool-org/viz/master.svg)](https://travis-ci.org/tidepool-org/viz)

# @tidepool/viz

Tidepool data visualization for diabetes device data.

## Getting started

After cloning this repository to your local machine, first make sure that you have a version of `npm` that is recent enough - at least `3.x`. We are still using node `0.12.x` for our engine, and a `3.x` version of `npm` does **not** get installed by default if you are installing node `0.12.x` through a mechanism like [`nvm`](https://github.com/creationix/nvm 'nvm'). In this case, you will need to manually update with:

```bash
$ npm install -g npm
```

Then, install the dependencies:

```bash
$ npm install
```

## Directory structure

As of September, 2016, the directory structure is as follows (although this may change as we continue to develop new code in this repository):

<!-- to generate the directory structure below use `tree -d --matchdirs -I 'coverage|dist|node_modules'` -->
```
├── data
│   └── pumpSettings
│       └── tandem
├── src
│   ├── components
│   │   ├── common
│   │   │   └── controls
│   │   └── trends
│   │       ├── cbg
│   │       ├── common
│   │       └── smbg
│   ├── containers
│   │   └── trends
│   ├── redux
│   │   ├── actions
│   │   └── reducers
│   ├── styles
│   └── utils
│       └── trends
├── stories
│   ├── components
│   │   ├── common
│   │   │   └── controls
│   │   └── trends
│   │       └── common
│   └── containers
│       └── trends
├── storybook
└── test
    ├── components
    │   ├── common
    │   │   └── controls
    │   └── trends
    │       ├── cbg
    │       └── common
    ├── containers
    │   └── trends
    ├── helpers
    ├── redux
    │   ├── actions
    │   └── reducers
    └── utils
        └── trends
```

All active, non-tooling code in the repository is contained in `src/`, and `src/` has the following structure:

```
└── src
    ├── components
    ├── containers
    ├── redux
    ├── styles
    └── utils
```

### Redux directories

```
└── redux
    ├── actions
    └── reducers
```

Within `src/redux/`, the `actions/` and `reducers/` contain the actions and reducers specific to the components in this component library. An `index.js` file in each of these directories exports the set of actions and a root reducer for a consuming application to import and consume via `connect()`ed components (in the case of actions) and by adding the reducer as a branch of the consuming application's state tree.

In both `actions/` and `reducers/`, files should be grouped into sub-directories by ["view"](#views) or located in a directory called `common/` if the action(s) or reducer(s) is relevant to more than one view.

### React component directories

Within `src/`, the `components/`, `containers/`, and (eventually) `views/` directories all contain the source for React components of various types and purposes.

Note that our convention for naming React component files is [PascalCase](https://en.wikipedia.org/wiki/PascalCase): `BGSlice`, `DailyContainer`, &c.

#### components

`components/` contains the lowest level of component. For the most part, these components should be stateless and (albeit with some rare exceptions) coded as [stateless functional components](https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components) rather than ES6 classes extending `React.Component`.

Files should be grouped into sub-directories by ["view"](#views) and where necessary (because of a large number of components) into further sub-directories by datatype.

Components used in more than one view should be located in `common/`. Examples of common components are controls like the BGM <-> CGM toggle used in both the basics and trends views and, potentially, animation containers like the header + child component (proposed for new device settings and potentially useful as well for sections in the basics view) that will slide the child component in and out on click of the header.

CSS particular to a component should be written using [CSS modules](https://github.com/css-modules/css-modules) and contained in a file in the same directory and with the same name as the component, substituting the `.css` suffix for `.js`.

#### containers

`containers/` contains the mid-tier type of component. The distinction between a "container" and a "component" is a bit fuzzy, but generally the purpose of a container is to perform logic to *prepare* for rendering and then pass the resulting state to one or more stateless functional components for pure rendering. For example, for the trends view, the `TrendsContainer` determines the blood glucose and time domains on mount and on every update, preserving the current time domain in view and arrays of `cbg` and `smbg` currently in view (given the time domain) in its state. At the next level down, the `CBGTrendsContainer` sets up the rendering "canvas" (actually an SVG element) and scales for rendering (given the dimensions of the "canvas"). Another hallmark of "container" components is that they often do *not* have any associated styles since their purpose is computation and set up, not rendering.

Files should be grouped into sub-directories by ["view"](#views) or located in a directory called `common/` if applicable to more than one view.

#### views

`views/` is a proposal for the eventual location of a top-level container component for each of blip's major data visualizations: (currently) basics, daily, weekly, trends, and device settings. A "view" will encompass more than just the rendered visualization; the navigation sub-header (currently containing links for navigating between views and arrows for navigating along the time dimension) and footer (containing options for some views like grouping for the `smbg` version of the trends view) will also be part of a top-level view component since some header and footer controls are specific to certain views or have specific behavior on certain views.

### Misc

#### styles

`styles/` contains a few `.css` files with common styles to be used in CSS modules `composes` statements in the style files for individual components.

#### utils

Complex logic should be factored out into utilities for ease of testing as much as possible. Our file naming convention for these is `lowercase.js` or camelCase `lowercaseUtil.js` if necessary.

In general, utilities should export individual constants, functions, &c, **not** use the ES6 `export default`.

### React storybook code

`stories/` contains the [React storybook](https://github.com/kadirahq/react-storybook) "stories" for ease of design-in-browser work where possible/relevant with some of our React components. The internal structure of the `stories/` directory mirrors the internal structure of the `src/` directory, in particular the React component directories.

`storybook/` contains configuration files for React storybook. This directory **cannot** be moved or renamed without changing React storybook configuration options!

### The test directory

The `test/` directory mirrors the structure of `src/`. Our convention for naming test files is to use the same names but insert `.test` before the `.js` suffix. For example, the tests for a component `BGSlice.js` should be in a file named `BGSlice.test.js`. The tests for a `datetime.js` utility file should be in a file named `datetime.test.js`.

## Development

### Running locally with blip

To work on code in this repository within [blip](https://github.com/tidepool-org/blip 'Tidepool on GitHub: blip'), first do the following from your local blip repository (assuming blip/ and viz/ are sister directories):

```bash
$ npm link ../viz/
```

Then in this viz/ directory, remove your copy of React (because it expects to be a singleton and configuring webpack to dedupe multiple locations from which React is `require`ed or `import`ed thus far has eluded us):

```bash
$ rm -rf node_modules/react/
```

NB: If you're also making changes in tideline and thus also `npm link`-ing tideline into blip locally, you'll need to do the same deletion of React from *tideline's* node modules. @jebeck now does both deletions from the blip repo like so, in order not to forget to do both:

```bash
$ rm -rf ../viz/node_modules/react/
$ rm -rf ../tideline/node_modules/react/
```

And finally, start the build in watch mode:

```bash
$ npm start
```

### Running locally with React Storybook

If you're working at the component or view level outside of blip, you can work on component and view rendering code with [React Storybook](https://github.com/kadirahq/react-storybook 'GitHub: react-storybook'). Just start up the storybook with:

```bash
$ npm run storybook
```

### Running the tests

To run the unit tests in [PhantomJS](http://phantomjs.org/ 'PhantomJS') (as they run on [Travis CI](https://travis-ci.org/ 'Travis CI')):

```bash
$ npm test
```

To have the tests run continuously with source and test code changes rebundled as you work:

```bash
$ npm run karma-watch
```

To run the unit tests in your local Chrome browser (recommended for Tidepool developers before merging or publishing a release):

```bash
$ npm run browser-tests
```

### Running the linter

To run the code linter from the command line:

```bash
$ npm run lint
```

## Production

### Publishing examples to GitHub Pages with React Storybook

Coming soon!

### Building and publishing to `npm`

When a new feature(s) is/are complete (i.e., reviewed with a sign-off from another developer), it's time to publish the package to npm! Since this is one of our most recently created repositories, any member of the "developers" team in the `@tidepool` npm organization will be able to publish the package using his or her npm login. Steps to publishing are as follows:

1. merge the relevant pull request to master
1. create a tag on master using the `mversion` tool with the `-m` option to auto-commit the version bump and tag (e.g., `$ mversion patch -m` for a patch version bump)
1. push the new commit and tag to the GitHub remote with `$ git push origin master` and `$ git push origin --tags`
1. check that the tag build has passed on [TravisCI](https://travis-ci.org/tidepool-org/viz)
1. `$ npm whoami` to check if you are logged in as yourself; if you are, skip to 8.
1. if you are logged in as `tidepool-robot`, log out with `$ npm logout`
1. then log in as yourself with `$ npm login`
1. publish the new version with `$ npm publish`; before the *actual* publish happens, the linter, tests, and packaging webpack build will run since we have set those up through the `prepublish` npm hook in the package.json
1. remember to bump the version appropriately in the package.json for the app (e.g., blip) requiring `@tidepool/viz` as a dependency!
