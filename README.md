# Blip

[![Build Status](https://img.shields.io/travis/tidepool-org/blip/master.svg)](https://travis-ci.org/tidepool-org/blip)

Blip is a web app for type 1 diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their diabetes device data (from insulin pumps, BGMs, and/or CGMs) and message each other.

This README is focused on just the details of getting blip running locally. For more detailed information aimed at those working on the development of blip, please see the [developer guide](docs/StartHere.md).

* * * * *

### Table of contents

- [Install](#install)
- [Running locally](#running-locally)
   - ["Verifying" the e-mail of a new account locally](#getting-past-email-verification-for-a-user-created-locally)
   - [Creating a special account to bypass e-mail verification](#creating-a-user-without-email-verification)
- [Running against `dev`](#running-against-dev)
- [Config](#config)
- [Debugging](#debugging)
- [Running the tests](#running-the-tests)
- [Build and deployment](#build-and-deployment)

* * * * *

## Install

Requirements:

- [Node.js](http://nodejs.org/ 'Node.js')
- [npm](https://www.npmjs.com/ 'npm') version 3.x or higher

Clone this repo [from GitHub](https://github.com/tidepool-org/blip 'GitHub: blip'), then install the dependencies:

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

(See also: [recipe for running blip locally with hot module replacement](http://developer.tidepool.io/docs/recipes/index.html#a-running-the-platform-locally-with-runservers-but-blip-with-hot-module-replacement-hmr-via-webpack 'Tidepool developer portal: front end recipes').)

### Getting past e-mail verification for a user created locally

When running locally with runservers, no e-mail will be sent to a sign-up e-mail address, and so a workaround is needed to get past the e-mail verification step for a newly created local account being used for development. What you need to do is construct the login URL that is provided in a link in the verification e-mail *manually* by finding the correct ID for the e-mail confirmation. There are two ways to do this: by looking in the local `server.log` (located at the root level of where you've cloned all the Tidepool repositories) or by finding it in your local Mongo database. The steps for the latter are:

- start a Mongo shell in a fresh Terminal window with `mongo`
- switch to the `confirm` database with `use confirm`
- find the pending account with `db.confirmations.find({status: 'pending'});`
- copy the `_id` from the pending confirmation record with an `email` matching the account you've just created and provide it as a `signupKey` parameter in the login URL: `http://localhost:3000/login?signUpKey=<_id>`

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

We use [Mocha](http://visionmedia.github.io/mocha/) with [Chai](http://chaijs.com/) for our test framework inside [Karma](https://karma-runner.github.io/) as our test runner, as well as [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spies and stubs. Our tests currently run on [PhantomJS](http://phantomjs.org/), a headless WebKit browser, or Chrome (locally only).

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

You can also build everything at once locally to test the production build by simply running:

```bash
$ source config/local.sh
$ npm run build
$ npm run server
```
