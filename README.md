# Blip

[![Build Status](https://travis-ci.org/tidepool-org/blip.png?branch=master)](https://travis-ci.org/tidepool-org/blip) [![Circle CI](https://circleci.com/gh/tidepool-org/blip.svg?style=svg)](https://circleci.com/gh/tidepool-org/blip)

Blip is a web app for Type-1 Diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their device data and message each other.

Tech stack:

- [React](http://facebook.github.io/react)
- [redux](http://redux.js.org/)
- [less](http://lesscss.org/)
- [d3.js](http://d3js.org/)

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

## Running locally

If you're running the entire Tidepool platform locally as per [starting services](http://developer.tidepool.io/starting-up-services/ 'Tidepool developer portal: starting services'), you can start blip using your local platform with:

```bash
$ source config/local.sh
$ npm start
```

Open your web browser and navigate to `http://localhost:3000/`.

### Creating a user without e-mail verification

When running locally, there is a workaround so you don't have to verify the e-mail address of a new user: if you create a new user and add the localhost secret +skip to the e-mail address - e.g. `me+skip@something.org` - this will then allow you to login straightaway, skipping the e-mail verification step.

**NB: The UI is *not* guaranteed to display correctly for +skip-created users on all pages. For now, you must create a normal account (without +skip) if you want to work on the sign-up flow, although we have plans to fix the way the +skip workaround operates on the platform to address this.**

## Config

Configuration values are set with environment variables (see `config/local.sh`).

You can set environment variables manually, or use a bash script. For example:

```bash
source config/local.sh
```

Ask the project owners to provide you with config scripts for different environments, or you can create one of your own. It is recommended to put them in the `config/` directory, where they will be ignored by Git.

## Development

The following snippets of documentation should help you find your way around and contribute to the app's code.

### Code organization

- **Bootstrap** (`app/bootstrap.js`): Where our application is "bootstrapped" into the HTML served. We initialize the API and then render the React application here.
- **Redux** (`app/redux`): Where our redux implementation lives. This code is responsible for state management of the application.
- **Root** (`app/redux/containers/Root.js`): The Root component for our React application.
- **Routes** (`app/routes.js`): Our route definitions for the application.
- **Core** (`app/core`): Scripts and styles shared by all app components. This is where the API and various utilities lives.
- **Components** (`app/components`): Reusable React components, the building-blocks of the application
- **Pages** (`app/pages`): Higher-level React components that combine reusable components together; switch from page to page on route change
- **Services** (`app/core/<service>.js`): Singletons used to interface with external services or to provide some common utility; they are attached to the global `app` object (for example, `app.api` which handles communicating with the platform).

### React components

When writing [React](http://facebook.github.io/react) components, try to follow the following guidelines:

- Keep components small. If a component gets too big, it might be worth splitting it out into smaller pieces.
- Keep state to a minimum. A component without anything in `state` and only `props` would be best. When state is needed, make sure nothing is redundant and can be derived from other state values. Move state upstream (to parent components) as much as it makes sense.
- Use the `propTypes` attribute to document what props the component requires.

See ["Writing good React components"](https://blog.whn.se/writing-good-react-components-9923f6682d85#.nd83fi33l).

More on state:
- Each page (`app/pages` is a connected "smart" component (in redux's terminology) that is connected to our redux store, which holds and manages all global app state.
- Each page (`app/pages`) can hold some state specific to that page.
- Reusable components (`app/components`) typically hold no state (with rare exceptions, like forms).

### Config object

The `config.app.js` file will have some magic constants that look like `__FOO__` statements replaced by the value of the corresponding environment variable when the build or development server is run. If you need to add new environment variables, you should also update `webpack.config.js` with definitions for them, as well as `.eslintrc`.

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

### Icons

We use an icon font for app icons (in `app/core/fonts/`). To use an icon, simply add the correct class to an element (convention is to use the `<i>` element), for example:

```html
<i class="icon-logout"></i>
```

Take a look at the `app/core/less/icons.less` file for available icons.

### ESLint

In a separate terminal, you can lint JS files with:

```bash
$ npm run lint
```

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

To run the unit tests in Chrome, use:

```bash
$ npm run browser-tests
```

To run the unit tests in watch, use:

```bash
$ npm run karma-watch
```

### Integration testing with Nightwatch

#### Prerequisites:

1. [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) (for Selenium)
1. [Docker](https://www.docker.com/products/docker-toolbox 'Docker Toolbox')

#### Setup:

1. Launch the default docker machine: [Mac](https://docs.docker.com/engine/installation/mac/#from-your-shell) or
   [Win](https://docs.docker.com/engine/installation/windows/#using-docker-from-windows-command-prompt-cmd-exe)
1. Launch test containers with:
 ```bash
 $ docker-compose up -d
 ```
1. run Nightwatch with:
```bash
$ npm run nightwatch
```
by default this will run all the tests in the `integration` directory

#### Teardown:
1. Exit test containers with:
```bash
$ docker-compose down
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
$ source config/local.sh
$ npm run build
$ npm run server
```
