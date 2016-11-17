## App & directory structure

#### Table of contents

- [The core](#the-core)
- [Redux directories](#redux-directories)
- [React component directories](#react-component-directories)
    - [components](#components)
    - [containers](#containers)
    - [views](#views)
- [Misc](#misc)
    - [styles](#styles)
    - [utils](#utils)
- [React Storybook code](#react-storybook-code)
- [The test directory](#the-test-directory)

* * * * *

As of November, 2016, the directory structure is as follows (although this may change as we continue to develop new code in this repository):

<!-- to generate the directory structure below use `tree -d --matchdirs -I '_book|coverage|dist|node_modules|web'` -->
```
├── data
│   └── pumpSettings
│       ├── animas
│       ├── medtronic
│       ├── omnipod
│       └── tandem
├── docs
├── src
│   ├── components
│   │   ├── common
│   │   │   └── controls
│   │   ├── settings
│   │   │   └── common
│   │   └── trends
│   │       ├── cbg
│   │       └── common
│   ├── containers
│   │   ├── settings
│   │   └── trends
│   ├── redux
│   │   ├── actions
│   │   ├── constants
│   │   └── reducers
│   ├── styles
│   └── utils
│       ├── settings
│       └── trends
├── stories
│   ├── components
│   │   ├── common
│   │   │   └── controls
│   │   ├── settings
│   │   └── trends
│   │       └── common
│   └── containers
│       └── trends
├── storybook
└── test
    ├── components
    │   ├── common
    │   │   └── controls
    │   ├── settings
    │   │   └── common
    │   └── trends
    │       ├── cbg
    │       └── common
    ├── containers
    │   ├── settings
    │   └── trends
    ├── helpers
    ├── redux
    │   ├── actions
    │   └── reducers
    └── utils
        ├── settings
        └── trends
```

### The core

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

### React Storybook code

`stories/` contains the [React Storybook](https://github.com/kadirahq/react-storybook) "stories" for ease of design-in-browser work where possible/relevant with some of our React components. The internal structure of the `stories/` directory mirrors the internal structure of the `src/` directory, in particular the React component directories.

`storybook/` contains configuration files for React Storybook. This directory **cannot** be moved or renamed without changing React Storybook configuration options!

### The test directory

The `test/` directory mirrors the structure of `src/`. Our convention for naming test files is to use the same names but insert `.test` before the `.js` suffix. For example, the tests for a component `BGSlice.js` should be in a file named `BGSlice.test.js`. The tests for a `datetime.js` utility file should be in a file named `datetime.test.js`.
