# Blip

[![Build Status](https://travis-ci.org/tidepool-org/blip.png?branch=master)](https://travis-ci.org/tidepool-org/blip) [![Circle CI](https://circleci.com/gh/tidepool-org/blip.svg?style=svg)](https://circleci.com/gh/tidepool-org/blip)

Blip is a web app for Type-1 Diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their device data and message each other.

Tech stack:

- [React](http://facebook.github.io/react)
- [LESS](http://lesscss.org/)
- [D3.js](http://d3js.org/)

Table of contents:

- [Install](#install)
- [Quick start](#quick-start)
  - [Running locally](#running-local)
- [Config](#config)
- [Development](#development)
    - [Code organization](#code-organization)
    - [React components](#react-components)
    - [Webpack](#webpack)
    - [Config object](#config-object)
    - [Dependencies](#dependencies)
    - [Debugging](#debugging)
    - [Less](#less)
    - [Icons](#icons)
    - [JSHint](#jshint)
    - [Mock mode](#mock-mode)
    - [Perceived speed](#perceived-speed)
- [Testing](#testing)
- [Build and deployment](#build-and-deployment)


## Install

Requirements:

- [Node.js](http://nodejs.org/)

Clone this repo then install dependencies:

```bash
$ npm install
```

## Quick start

Start the development server (in "mock mode") with:

```bash
$ source config/mock.sh
$ npm start
```

Open your web browser and navigate to `http://localhost:3000/`. You can see the
mock data by logging in with email "**demo**" and password "**demo**".

### Running local

If you are running Blip and all services locally as per [Run Servers](https://github.com/tidepool-org/tools#runservers) then there is a workaround so you don't have to verify your new user.

If you create a new user then add the localhost secret +skip to the email address. e.g. ```me+skip@something.org```. This will then allow you to login straight away.

## Config

Configuration values are set with environment variables (see `config/sample.sh`).

You can set environment variables manually, or use a bash script. For example:

```bash
source config/devel.sh
```

Ask the project owners to provide you with config scripts for different environments, or you can create one of your own. It is recommended to put them in the `config/` directory, where they will be ignored by Git.

## Development

The following snippets of documentation should help you find your way around and contribute to the app's code.

### Code organization

- **App** (`app/app.js`): Expose a global `window.app` object where everything else is attached; create the main React component `app.component`
- **Router** (`app/router.js`): Handle client-side URI routing (using [director](https://github.com/flatiron/director)); attached to the global `app` object
- **Core** (`app/core`): Scripts and styles shared by all app components
- **Components** (`app/components`): Reusable React components, the building-blocks of the application
- **Pages** (`app/pages`): Higher-level React components that combine reusable components together; switch from page to page on route change
- **Services** (`app/core/<service>.js`): Singletons used to interface with external services or to provide some common utility; they are attached to the global `app` object (for example, `app.api` which handles communicating with the backend)

### React components

When writing [React](http://facebook.github.io/react) components, try to follow the following guidelines:

- Keep components small. If a component gets too big, it might be worth splitting it out into smaller pieces.
- Keep state to a minimum. A component without anything in `state` and only `props` would be best. When state is needed, make sure nothing is reduntant and can be derived from other state values. Move state upstream (to parent components) as much as it makes sense.
- Use the `propTypes` attribute to document what props the component expects

See ["Writing good React components"](http://blog.whn.se/post/69621609605/writing-good-react-components).

More on state:
- The main `AppComponent` holds all of the state global to the app (like if the user is logged in or not)
- Each page (`app/pages`) can hold some state specific to that page
- Reusable components (`app/components`) typically hold no state (with rare exceptions, like forms)

### Webpack

We use [Webpack](http://webpack.github.io/) to package all source files into a bundle that can be distributed to the user's browser. We also use CommonJS to import any module or asset.

Require a JavaScript file, npm package, or JSON file like you would normally in Node:

```javascript
// app.js
var foo = require('./foo');
var React = require('react');
var pkg = require('../package.json');
```

You can also require a Less file, which will be added to the page as a `<style>` tag:

```javascript
// app.js
require('./style.less');
```

To use an image, the require statement will either return the URL to the image, or encode it directly as a string (depending on its size). Both are suitable for `src` or `href` attributes.

```javascript
// avatar.js
var imgSrc = require('./default-avatar.png');

var html = '<img src="' + imgSrc + '" />';
```

Assets, like fonts, can also be required in Less files (Webpack will apply the same logic described above for images in JS files):

```less
@font-face {
  font-family: 'Blip Icons';
  src: url('../fonts/blip-icons.eot');
}
```

### Config object

The `config.app.js` file will have some magic constants that look like ```__FOO__``` statements replaced by the value of the corresponding environment variable when the build or development server is run. If you need to add new environment variables, you should also update `webpack.config.js` with definitions for them, as well as .jshintrc.

### Dependencies

All third-party dependencies are installed through npm, and need to be `require`able through the CommonJS format.

If a dependency is needed directly in the app, by the build step, or by the production server, it should go in `dependencies` in the `package.json`. This is because we use `npm install --production` when deploying.

All other dependencies used in development (testing, development server, etc.), can go in the `devDependencies`.

### Debugging

The app uses the [bows](http://latentflip.com/bows/) library to log debugging messages to the browser's console. It is disabled by default (which makes it production-friendly). To see the messages type `localStorage.debug = true` in the browser console and refresh the page. Create a logger for a particular app module by giving it a name, such as:

```javascript
app.foo = {
  log: bows('Foo'),
  bar: function() {
    this.log('Walked into bar');
  }
};
```

### Less

Prefix all CSS classes with the component name. For example, if I'm working on the `PatientList` component, I'll prefix CSS classes with `patient-list-`.

Keep styles in the same folder as the component, and import them in the main `app/style.less` stylesheet. If working on a "core" style, don't forget to import the files in `app/core/core.less`.

In organizing the core styles in different `.less` files, as well as naming core style classes, we more or less take inspiration from Twitter Bootstrap (see [https://github.com/twbs/bootstrap/tree/master/less](https://github.com/twbs/bootstrap/tree/master/less)).

Some styles we'd rather not use on touch screens (for example hover effects which can be annoying while scrolling on touch screens). For that purpose, a small snippet (`app/core/notouch.js`) will add the `.no-touch` class to the root document element, so you can use:

```less
.no-touch .list-item:hover {
  // This will not be used on touch screens
  background-color: #ccc;
}
```

Keep all elements and styles **responsive**, i.e. make sure they look good on any screen size. For media queries, we like to use the mobile-first approach, i.e. define styles for all screen sizes first, then override for bigger screen sizes. For example:

```less
.container {
  // On mobile and up, fill whole screen
  width: 100%;

  @media(min-width: 1024px) {
    // When screen gets big enough, switch to fixed-width
    width: 1024px;
    margin-right: auto;
    margin-left: auto;
  }
}
```

If using class names to select elements from JavaScript (for tests, or using jQuery), prefix them with `js-`. That way style changes and script changes can be done more independently.

### Icons

We use an icon font for app icons (in `app/core/fonts/`). To use an icon, simply add the correct class to an element (convention is to use the `<i>` element), for example:

```html
<i class="icon-logout"></i>
```

Take a look at the `app/core/less/icons.less` file for available icons.

### JSHint

In a separate terminal, you can lint JS files with:

```bash
$ npm run jshint
```

You can also watch files and re-run JSHint on changes with:

```bash
$ npm run jshint-watch
```

### Mock mode

For local development, demoing, or testing, you can run the app in "mock" mode by setting the environment variable `MOCK=true` (to turn it off use `MOCK=''`). In this mode, the app will not make any calls to external services, and use dummy data contained in `.json` files.

All app objects (mostly app services) that make any external call should have their methods making these external calls patched by a mock. These are located in the `mock/` directory. To create one, return a `patchService(service)` function (see existing mocks for examples).

Mock data is generated from `.json` files, which are combined into a JavaScript object that mirrors the directory structure of the data files (for example `patients/11.json` will be available at `data.patients['11']`). See the [blip-mock-data](https://github.com/tidepool-org/blip-mock-data) repository for more details.

You can configure the behavior of mock services using **mock parameters**. These are passed through the URL query string.

Note that because of the way URLs work, the query parameters MUST be before the '#'.

For example:

```
http://localhost:3000/?auth.skip=11&api.patient.getall.delay=2000#/patients
```

With the URL above, mock services will receive the parameters:

```javascript
{
  'auth.skip': 11,
  'api.patient.getall.delay': 2000
}
```

Mock parameters are very useful in development (for example, you don't necessarily want to sign in every time you refresh). They are helpful when testing (manually or automatically) different behaviors: What happens if this API call returns an empty list? What is displayed while we are waiting for data to come back from the server? Etc.

To find out which mock parameters are available, please see the corresponding service and method in the `mock/` folder (look for calls to `getParam()`).

The naming convention for these parameters is **all lower-case**, and **name-spaced with periods**. For example, to have the call to `api.patient.getAll()` return an empty list, I would use the name `api.patient.getall.empty`.

If you would like to build the app with mock parameters "baked-in", you can also use the `MOCK_PARAMS` environement variable, which works like a query string (ex: `$ export MOCK_PARAMS='auth.skip=11&api.delay=1000'`). If the same parameter is set in the URL and the environment variable, the URL's value will be used.

### Perceived speed

Fetching data from the server and rendering the UI to display that data is a classic pattern. The approach we try to follow (see [The Need for Speed](https://cloudup.com/blog/the-need-for-speed)) is to "render as soon as possible" and "save optimistically".

In short, say a component `<Items />` needs to display a `data` object passed through the props by the parent, we will also give the component a `fetchingData` prop, so it can render accordingly. There are 4 possible situations (the component may choose to render more than one situation in the same way):

- `data` is **falsy** and `fetchingData` is **truthy**: first data load, or reset, we can render for example an empty "skeleton" while we wait for data
- `data` and `fetchingData` are both **falsy**: data load returned an empty set, we can display a message for example
- `data` is **truthy** and `fetchingData` is **falsy**: display the data "normally"
- `data` and `fetchingData` are both **truthy**: a data refresh, either don't do anything and wait for data to come back, or display some kind of loading indicator

For forms, we try as much as possible to "save optimistically", meaning when the user "saves" the form, we immediately update the app state (and thus the UI), and then send the new data to the server to be saved. If the server returns an error, we should be able to rollback the app state and display some kind of error message.

## Testing

We use [Mocha](http://visionmedia.github.io/mocha/) with [Chai](http://chaijs.com/) for the test framework, [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spy, stubs. [Karma](http://karma-runner.github.io/0.12/index.html) is our test runner, running currently just on [PhantomJS](http://phantomjs.org/) (headless WebKit browser).

To run the unit tests, use:

```bash
$ npm test
```

## Build and deployment

The app is built as a static site in the `dist/` directory.

We use [Shio](https://github.com/tidepool-org/shio) to deploy, so we separate the build in two.

Shio's `build.sh` script will take care of building the app itself with:

```bash
$ npm run build-app
```

Shio's `start.sh` script then builds the config from environment variables as a separate file with:

```bash
$ source config/env.sh
$ npm run build-config
```

After that, the app is ready to be served using the static web included in this repo:

```bash
$ npm run server
```

You can also build everything at once locally by simply running:

```bash
$ source config/mock.sh
$ npm run build
$ npm run server
```
