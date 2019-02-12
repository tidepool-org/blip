# Blip

[![Build Status](https://img.shields.io/travis/com/tidepool-org/blip.svg)](https://travis-ci.com/tidepool-org/blip)

Blip is a web app for type 1 diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their diabetes device data (from insulin pumps, BGMs, and/or CGMs) and message each other.

This README is focused on just the details of getting blip running locally. For more detailed information aimed at those working on the development of blip, please see the [developer guide](docs/StartHere.md).

* * * * *

### Table of contents

- [Before you start](#beforeyoustart)
- [Install](#install)
- [Running locally](#running-locally)
   - ["Verifying" the e-mail of a new account locally](#getting-past-e-mail-verification-for-a-user-created-locally)
   - [Creating a special account to bypass e-mail verification](#creating-a-user-without-email-verification)
- [Running against `dev`](#running-against-dev)
- [Config](#config)
- [Debugging](#debugging)
- [Running the tests](#running-the-tests)
- [Build and deployment](#build-and-deployment)

* * * * *

## Before you start

If this is the first time you're looking at Tidepool locally start with the [tidepool-org/development](https://github.com/tidepool-org/development) repository to setup before continuing here.

## Install

Requirements:

- [Node.js](http://nodejs.org/ 'Node.js') version 6.x
- [npm](https://www.npmjs.com/ 'npm') version 4.x or higher

Clone this repo [from GitHub](https://github.com/tidepool-org/blip 'GitHub: blip'), then install the dependencies:

After cloning this repository to your local machine, first make sure that you have node `6.x` and npm `4.x` installed. If you have a different major version of node installed, consider using [nvm](https://github.com/creationix/nvm 'GitHub: Node Version Manager') to manage and switch between multiple node (& npm) installations. If you have npm `3.x` installed (as it is by default with node `6.x`), then you can update to the latest npm `4.x` with `npm install -g npm@4`.

It's not an absolute requirement, but it is preferable to have [Yarn](https://yarnpkg.com 'Yarn') installed, as it provides dependency management features above and beyond what npm provides. Just follow [Yarn's installation instructions](https://yarnpkg.com/en/docs/install 'Yarn installation instructions') (hint: for Mac users with Homebrew installed, it's just `brew install yarn`).

Once your environment is setup with node `6.x` and npm `4.x` install the dependencies with Yarn:

```bash
$ yarn install
```

Or with npm if you're choosing not to use Yarn:

```bash
$ npm install
```

## Running locally

If you're running the entire Tidepool platform locally with docker as per [tidepool-org/development](https://github.com/tidepool-org/development/#starting), you can start blip using your local platform with:

```bash
$ docker-compose up -d
```

If you're running the entire Tidepool platform locally without docker, you can start blip using your local platform with:

```bash
$ source config/local.sh
$ npm start
```

Open your web browser and navigate to `http://localhost:3000/`.

(See also: [recipe for running blip locally with hot module replacement](http://developer.tidepool.io/docs/front-end/recipes.html#a-running-the-platform-locally-with-runservers-but-blip-with-hot-module-replacement-hmr-via-webpack 'Tidepool developer portal: front end recipes').)

The `npm start` command runs the Webpack dev server which includes hot module reloading (HMR) capabilities. Essentially changes within React components should be updated "hot" in your browser *without* a page refresh. Sometimes this doesn't work, but in such cases the dev console will include a message from the Webpack dev server indicating that you need to do a full refresh to see your changes.

### Redux dev tools

Blip includes several Redux developer tools: the original time-travel dev tools UI, a console action logger, and a mutation tracker for catching mutations to the state tree (which should be immutable). The last of these in particular is a performance killer (though *none* of them could even be said to have a *negligible* effect on performance). By default when running for local development with `npm start` (which means `NODE_ENV` is `development`), the `DEV_TOOLS` flag will be `true`, and all of these dev tools will be active. Because they affect performance profoundly, this may not always be desirable. To turn *off* the dev tools in development, kill the Webpack dev server (i.e, the `npm start` process), run `export DEV_TOOLS=false`, then start up blip again with `npm start`.

**NB:** Due to differences in the `development` versus `production` builds of React itself (most notably PropTypes validation), performance of the app whenever `NODE_ENV` is `development` will *never* be as good as it is in the production build under a `NODE_ENV` of `production`. If you're concerned about the performance of a particular feature, the only way to test with good fidelity is with the production build, which you can do locally according to [these instructions below](#testing-the-production-build-locally).

### Getting past e-mail verification for a user created locally

When running locally with `runservers` or with the [docker-based setup](https://github.com/tidepool-org/development), no e-mail will be sent to a sign-up e-mail address, and so a workaround is needed to get past the e-mail verification step for a newly created local account being used for development. What you need to do is construct the login URL that is provided in a link in the verification e-mail *manually* by finding the correct key for the e-mail confirmation.

If you're developing locally, you can find the key by looking in the local `server.log` (located at the root level of where you've cloned all the Tidepool repositories).

If you're developing with the docker setup, you can find the key in the logs of the `hydrophone` container. It will look something like
```
2018/06/07 16:17:17 Sending email confirmation to foo@bar.com with key aSuzGcwq4kPRyb6pwQnTcSKVTt_V6CtL
```
[Kitematic](https://kitematic.com/) is an easy-to-use tool for inspecting the logs of your docker containers. You can find the link to it's installer in Docker's menu.

You can also find the key in your Mongo database. The steps for the latter are:

- start a Mongo shell in a fresh Terminal window with `mongo`
- switch to the `confirm` database with `use confirm`
- find the pending account with `db.confirmations.find({status: 'pending'});`
- copy the `_id` from the pending confirmation record with an `email` matching the account you've just created

After you've found the key, you can provide it as a `signupKey` parameter in the login URL: `http://localhost:3000/login?signupKey=<key>`

### Creating a user without e-mail verification

When running locally, there is also workaround so you don't have to verify the e-mail address of a new user: if you create a new user and add the localhost secret +skip to the e-mail address - e.g. `me+skip@something.org` - this will then allow you to login straightaway, skipping the e-mail verification step.

**NB: The UI is *not* guaranteed to display correctly for +skip-created users on all pages, and so 💣 *THIS WORKFLOW IS NOT CURRENTLY RECOMMENDED* 💣. For now, you must create a normal account (without +skip) if you want to work on the sign-up flow, although we have plans to fix the way the +skip workaround operates on the platform to address this.**

## Running against `dev`

By default—that is, if you don't `source` a different configuration, such as the `local.sh` configuration for local development with runservers referenced above—if you simply run `npm start` in this repository after installing the dependencies, blip will start up running against Tidepool's "dev" server environment.

## Config

Configuration values are set with environment variables (see `config/local.sh`).

You can set environment variables manually using `export VAR=value`, or use a bash script. For example:

```bash
$ source config/local.sh
```

Ask the project owners to provide you with config scripts for different environments, or you can create one of your own if you have a custom environment. It is recommended to put all config scripts in the `config/` directory, where they will be ignored by Git.

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

We use [Mocha](https://mochajs.org/) with [Chai](http://chaijs.com/) for our test framework inside [Karma](https://karma-runner.github.io/) as our test runner, as well as [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spies and stubs. Our tests currently run on [PhantomJS](http://phantomjs.org/), a headless WebKit browser, or Chrome (locally only).

To run the unit tests, use:

```bash
$ npm test
```

To run the unit tests in Chrome, use:

```bash
$ npm run browser-tests
```

To run the unit tests in watch mode, use:

```bash
$ npm run test-watch
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

After that, the app is ready to be served using the static web server included in this repo:

```bash
$ npm run server
```

### Testing the production build locally

You can also build everything at once locally to test the production build by simply running:

```bash
$ source config/local.sh
$ npm run build
$ npm run server
```
