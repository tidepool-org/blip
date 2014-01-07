# Blip

Blip is a web app for Type-1 Diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their device data and message each other.

Tech stack:

- [React](http://facebook.github.io/react)
- [LESS](http://lesscss.org/)
- [D3.js](http://d3js.org/)

Table of contents:

- [Install](#install)
- [Quick start](#quick-start)
- [Config](#config)
- [Development](#development)
    - [Code organization](#code-organization)
    - [React components](#react-components)
    - [Development server](#development-server)
    - [Browserify](#browserify)
    - [Entry point](#entry-point)
    - [Config object](#config-object)
    - [Vendor packages](#vendor-packages)
    - [Debugging](#debugging)
    - [CSS](#css)
    - [JSHint](#jshint)
    - [Demo mode](#demo-mode)
- [Testing](#testing)
- [Deployment](#deployment)
    - [Build](#build)
    - [Deploy](#deploy)

## Install

Requirements:

- [Node.js](http://nodejs.org/)
- [Bower](http://bower.io/) (`npm install -g bower`)
- [Gulp](https://github.com/wearefractal/gulp) (`npm install -g gulp`)

Clone this repo then install dependencies:

```bash
$ npm install
$ bower install
```

## Quick start

Start the development server (in "demo mode") with:

```bash
$ export DEMO=true
$ node develop
```

Open your web browser and navigate to `http://localhost:3000/`.

## Config

Configuration values (such as API keys) are set with environment variables (see `config/sample.sh`).

You can set environment variables manually, or use a bash script. For example:

```bash
source config/dev.sh
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
- **Services** (`app/core/<service>.js`): Singletons used to interface with external services or to provide some common utility; they are attached to the global `app` object (for example, `app.auth` which handles user authentication)

### React components

When writing [React](http://facebook.github.io/react) components, try to follow the following guidelines:

- Keep components small. If a component gets too big, it might be worth splitting it out into smaller pieces.
- Keep state to a minimum. A component without anything in `state` and only `props` would be best. When state is needed, make sure nothing is reduntant and can be derived from other state values. Move state upstream (to parent components) as much as it makes sense.
- Use the `propTypes` attribute to document what props the component expects

See ["Writing good React components"](http://blog.whn.se/post/69621609605/writing-good-react-components).

More on state:
- The main `AppComponent` holds all of the state global to the app (like if the user is logged in or not)
- Each page (`app/pages`) can hold some state specific to that page
- Reusable components (`app/components`) typically hold no state (with rare exceptions)

### Development server

For development, we use [Connect](http://www.senchalabs.org/connect/) and custom middlewares to compile and serve the app's files (see `develop.js`). You can start the development server by running `$ node develop`.

### Browserify

The web app uses [Browserify](http://browserify.org/) to manage its code base. The main file used to create the Browserify bundle is `app/app.js`.

### Entry point

A single "entry point" fires up the app: `app.start()`. It is the only method that gets called when the code runs. This method also calls `app.init(callback)` and waits for it to finish (authentication, fetching initial data, etc.) before starting the router.

This entry point is called from `app/start.js`, which is not included in the Browserify app bundle.

### Config object

A global `window.config` object is created to hold all the config values set by the environment variables.

This is done in the `app/config.js` file, which is actually a Lodash template (and is not included in the Browserify app bundle).

### Vendor packages

Third-party dependencies are managed with [Bower](http://bower.io/). If a particular repository is not in the Bower registry, you can still install it by providing the URL to a tag or commit hash, for example:

```bash
bower install --save https://github.com/user/repo.git#1.1.0
```

Be sure to update `app/index.html`, `gulpfile.js`, and `testem.json` when installing a new package.

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

### CSS

Prefix all CSS classes with the component name. For example, if I'm working on the `PatientList` component, I'll prefix CSS classes with `patient-list-`.

Keep styles in the same folder as the component, and import them in the main `app/style.less` stylesheet.

### JSHint

In a separate terminal, you can watch and lint JS files with:

```bash
$ gulp jshint-watch
```

### Demo mode

For local development or demoing, you can run the app in "demo" mode by setting the environment variable `DEMO=true`. In this mode, the app will not make any calls to external services, and use local `.json` files for data. The app will use the demo data files in the `demo/sample` folder, or the one specified by the `DEMO_DIR` environment variable.

All app objects (mostly app services) that make external calls should override these in their `init()` method:

```javascript
foo.init = function() {
  if (config.DEMO) {
    addDemoOverrides(this);
  }
}
```

There are additional "demo" settings you can use to help in development:

- `DEMO_DELAY`: Set this to a value in milliseconds, and all "fake" demo external calls (to an API for example), will be delayed by that amount. This is useful to test how the app feels like on a slow internet connection for example.
- `DEMO_VARIANT`: Use this to trigger some "special" events to test how the interface responds. For instance, setting `DEMO_VARIANT='auth.login.error'` will trigger an error when logging in.


## Testing

We use [Mocha](http://visionmedia.github.io/mocha/) with [Chai](http://chaijs.com/) for the test framework, and [Testem](https://github.com/airportyh/testem) as the test runner.

To run the tests, first install Testem:

```bash
$ npm install -g testem
```

Then run:

```
$ testem
```

This will open and run the tests in Chrome by default. You can also open other browsers and point them to the specified URL.

## Deployment

### Build

First load the config for the environment you wish to deploy to:

```bash
$ source config/dev.sh
```

Then build the static site to the `dist/` directory with [Gulp](https://github.com/wearefractal/gulp):

```bash
$ gulp
```

**Note**: The `version` number in `package.json` is used as a browser cache buster by building assets to `dist/build/<version>/`.

If you want, you can test your build by running:

```
$ node server
```

### Deploy

After building, the `dist/` directory contains files ready to be deployed to any static file server.

To deploy to [Amazon S3](http://aws.amazon.com/s3/), we recommend the Ruby gem [s3_website](https://github.com/laurilehmijoki/s3_website). Install it with:

```bash
$ gem install s3_website --no-document
```

The tool reads configuration from environment variables through `s3_website.yml`. Load the config for the environment you wish to deploy to:

```bash
$ source config/dev.sh
```

If the target Amazon S3 bucket is not created and configured yet, you can run:

```bash
$ s3_website cfg apply
```

Finally, deploy using:

```bash
$ s3_website push --site dist
```

**Note**: If asked to delete files that exist in the Amazon S3 bucket but not locally, you might want to say no. Indeed, since all app assets are self-contained in a `build/<version>/` folder, only `index.html` gets overwritten, and you should keep older builds around for visitors that haven't gotten the new `index.html` yet.

