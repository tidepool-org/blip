# Blip

[![Build Status](https://img.shields.io/travis/com/tidepool-org/blip.svg)](https://travis-ci.com/tidepool-org/blip)

Blip is a web app for type 1 diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their diabetes device data (from insulin pumps, BGMs, and/or CGMs) and message each other.

This README is focused on just the details of getting blip running locally. For more detailed information aimed at those working on the development of blip, please see the [developer guide](docs/StartHere.md).

* * * * *

### Table of contents

- [Install](#install)
- [Running locally](#running-locally)
- [Debugging](#debugging)
- [Running the tests](#running-the-tests)
- [Build and deployment](#build-and-deployment)
- [Using Storybook](#storybook)

* * * * *
## Install

Requirements:

- [Node.js](http://nodejs.org/ 'Node.js') version 20.x
- [Yarn](https://yarnpkg.com/ 'Yarn') version 3.6.4 or higher

*Note for Mac users:* we suggest first uninstalling any old version of Yarn installed via Homebrew.

Clone this repo [from GitHub](https://github.com/tidepool-org/blip 'GitHub: blip'), then install the dependencies:

After cloning this repository to your local machine, first make sure that you have node `20.x` and yarn `3.6.4` or higher installed. If you have a different major version of node installed, consider using [nvm](https://github.com/creationix/nvm 'GitHub: Node Version Manager') to manage and switch between multiple node (& npm/yarn) installations.

Once your environment is setup with node `20.x` and yarn `3.6.4` or higher, install the dependencies with Yarn:

```bash
$ yarn install
```

## Running locally

While blip can be run locally using a local kubernetes deployment similar to our remote environments (see [tidepool-org/development](https://github.com/tidepool-org/development/)), it's recommended that you run this locally with the built-in webpack dev server, and point to one of our remote environments

To do this, copy `config/local.example.js` to `config/local.js` and update as needed:

Uncomment any `linkedPackages` as desired to link them for local development.

These will be resolved as aliases in the webpack config. Note that you will need to ensure that the packages are installed (via `yarn install`) in each respective folder

It's recommended to use the `yarn startLocal` script to run the app, as it will automatically start the webpack development server for the `viz` repo when needed.

You may add as other modules to this list as well.

```bash
$ yarn startLocal
```

Open your web browser and navigate to `http://localhost:3000/`.

### Redux dev tools

Blip includes several Redux developer tools: the original time-travel dev tools UI, a console action logger, and a mutation tracker for catching mutations to the state tree (which should be immutable). The last of these in particular is a performance killer (though *none* of them could even be said to have a *negligible* effect on performance). By default when running for local development with `npm start` (which means `NODE_ENV` is `development`), the `DEV_TOOLS` flag will be `true`, and all of these dev tools will be active. Because they affect performance profoundly, this may not always be desirable. To turn *off* the dev tools in development, kill the Webpack dev server (i.e, the `npm start` process), run `export DEV_TOOLS=false`, then start up blip again with `npm start`.

**NB:** Due to differences in the `development` versus `production` builds of React itself (most notably PropTypes validation), performance of the app whenever `NODE_ENV` is `development` will *never* be as good as it is in the production build under a `NODE_ENV` of `production`. If you're concerned about the performance of a particular feature, the only way to test with good fidelity is with the production build, which you can do locally according to [these instructions below](#testing-the-production-build-locally).

## Debugging

The app uses the [bows](http://latentflip.com/bows/) library to log debugging messages to the browser's console. It is disabled by default (which makes it production-friendly). To see the messages type `localStorage.debug = true` in the browser console and refresh the page. Create a logger for a particular app module by giving it a name, such as:

```javascript
app.foo = {
  log: bows('Foo'),
  bar: function() {
    this.log('Walked into a bar');
  }
};
```

## Running the tests

We use [Mocha](https://mochajs.org/) with [Chai](http://chaijs.com/) for our test framework inside [Karma](https://karma-runner.github.io/) as our test runner, as well as [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spies and stubs. Our tests currently run on headless Chrome.

To run the unit tests, use:

```bash
$ yarn test
```

To run the unit tests in watch mode, use:

```bash
$ yarn run test-watch
```

### Testing the production build locally

You can also build everything at once locally to test the production build by simply running:

```bash
$ yarn build
$ yarn server
```


## Storybook

To run storybook, use:

```bash
$ yarn storybook
```

## Stylelint

To run stylelint

```bash
$ npm run lint:css
```
