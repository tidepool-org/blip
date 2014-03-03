# Blip

[![Build Status](https://travis-ci.org/tidepool-org/blip.png?branch=master)](https://travis-ci.org/tidepool-org/blip)

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
    - [Images](#images)
    - [Fonts](#fonts)
    - [Icons](#icons)
    - [JSHint](#jshint)
    - [Mock mode](#mock-mode)
    - [Perceived speed](#perceived-speed)
- [Testing](#testing)
    - [Unit tests](#unit-tests)
    - [End-to-end tests](#end-to-end-tests)
    - [Travis CI and Sauce Labs](#travis-ci-and-sauce-labs)
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

Start the development server (in "mock mode") with:

```bash
$ export MOCK=true
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
- Reusable components (`app/components`) typically hold no state (with rare exceptions, like forms)

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

Be sure to update `files.js` when installing a new package.

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

### JSHint

In a separate terminal, you can watch and lint JS files with:

```bash
$ gulp jshint-watch
```

### Images

Images should be placed directly inside each component's directory, under an `images/` subfolder. For example, the component located in the `navbar/` folder, might have an image `logo.png` that would be saved in `navbar/images/logo.png`.

The app is then passed an `IMAGES_ENDPOINT` value in the `config` object, that you can use to generate the image `src` attribute by just appending the component's name and the name of the image file. In our example:

```javascript
var componentImageEndpoint = config.IMAGES_ENDPOINT + '/navbar';
var imageSource = componentImageEndpoint + '/logo.png';
```

Reusable components (`app/components/`) shouldn't access the `config` object directly, so you should generate the `componentImageEndpoint` value above from a "page" component (`app/pages`), and pass it to the reusable component through a `props` value.

At build-time, images all get bundled into `build/<version>/images/<component>/` directories. When adding images, don't forget to update `files.js` with the correct paths.

### Fonts

Font files are added to the `app/core/fonts` folder. The CSS rules to import the fonts are put in the Lodash template `app/index.html`, because we use a configuration variable to change the URL to the font files, according to whether we are working in development or building for production.

### Icons

We use an icon font for app icons (in `app/core/fonts/`). To use an icon, simply add the correct class to an element (convention is to use the `<i>` element), for example:

```html
<i class="icon-logout"></i>
```

Take a look at the `app/core/less/icons.less` file for available icons.

### Mock mode

For local development, demoing, or testing, you can run the app in "mock" mode by setting the environment variable `MOCK=true` (or anything other than an empty string, to turn it off use `MOCK=''`). In this mode, the app will not make any calls to external services, and use dummy data contained in `.json` files.

All app objects (mostly app services) that make any external call should have their methods making these external calls patched by a mock. These are located in the `mock/` directory. To create one, export a `patch(service, options)` function (see existing mocks for examples).

Mock data is generated from `.json` files, which are combined into a JavaScript object that mirrors the directory structure of the data files (for example `patients/11.json` will be available at `data.patients['11']`). Set the data file directory to use with the `MOCK_DATA_DIR` environment variable.

There are additional "mock" settings you can use to help in development:

- `MOCK_DELAY`: Set this to a value in milliseconds, and all mock external calls (to an API for example), will be delayed by that amount. This is useful to test how the app feels like on a slow internet connection for example.
- `MOCK_VARIANT`: Use this to trigger some "special" events to test how the interface responds. For instance, setting `MOCK_VARIANT='auth.login.error'` will trigger an error when logging in.

### Perceived speed

Fetching data from the server and rendering the UI to display that data is a classic pattern. The approach we try to follow (see [The Need for Speed](https://cloudup.com/blog/the-need-for-speed)) is to "render as soon as possible" and "save optimistically".

In short, say a component `<Items />` needs to display a `data` object passed through the props by the parent, we will also give the component a `fetchingData` prop, so it can render accordingly. There are 4 possible situations (the component may choose to render more than one situation in the same way):

- `data` is **falsy** and `fetchingData` is **truthy**: first data load, or reset, we can render for example an empty "skeleton" while we wait for data
- `data` and `fetchingData` are both **falsy**: data load returned an empty set, we can display a message for example
- `data` is **truthy** and `fetchingData` is **falsy**: display the data "normally"
- `data` and `fetchingData` are both **truthy**: a data refresh, either don't do anything and wait for data to come back, or display some kind of loading indicator

For forms, we try as much as possible to "save optimistically", meaning when the user "saves" the form, we immediately update the app state (and thus the UI), and then send the new data to the server to be saved. If the server returns an error, we should be able to rollback the app state and display some kind of error message.

## Testing

Rules for what to cover with unit or end-to-end tests are more or less:

- **Unit** tests: All the small pieces, i.e. reusable UI **Components** and core **Services**
- **End-to-end** tests: Higher-level app behavior, which will test the main **App** object, the **Router**, and **Pages**

### Unit tests

We use [Mocha](http://visionmedia.github.io/mocha/) with [Chai](http://chaijs.com/) for the test framework, [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spy, stubs, and mocks, and [Testem](https://github.com/airportyh/testem) as the test runner.

To run the tests locally, first install Testem:

```bash
$ npm install -g testem
```

Then run:

```
$ testem
```

This will open and run the tests in Chrome by default. You can also open other browsers and point them to the specified URL.

### End-to-end tests

End-to-end (E2E) tests use [Selenium](https://code.google.com/p/selenium/) for browser automation with the [WebDriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs) Node.js bindings. They also use the Mocha with Chai framework.

To run E2E tests locally on Chrome, first insall the Selenium [ChromeDriver](https://code.google.com/p/selenium/wiki/ChromeDriver):

```bash
$ make install-selenium
```

This will download and unzip the `chromedriver` executable in the `test/bin` directory.

**Note**: If not on Mac OSX, change the `CHROMEDRIVER_ZIP` environment variable to the correct one for your OS (see the [ChromeDriver downloads](http://chromedriver.storage.googleapis.com/index.html)), and `test/scripts/install_selenium.sh`).

Before running the tests, build the app (in mock mode) and start a local server in a separate terminal:

```bash
$ export MOCK=true; gulp
$ node server
```

(You can also run the tests in development with `export MOCK=true; node develop`.)

Finally, run the tests with:

```bash
$ make test-e2e
```

Since E2E tests can be a little slow, you can run only a particular test by setting the `E2E_TESTS` variable, for example:

```bash
$ make test-e2e E2E_TESTS=test/e2e/login_scenarios.js
```

### Travis CI and Sauce Labs

We automate our builds and testing using [Travis CI](https://travis-ci.org/), and run both unit and end-to-end tests in different browsers and platforms thanks to [Sauce Labs](https://saucelabs.com).

If you have the username and access key to our Sauce Labs account, you can also run the tests in different browsers from your local machine. Follow the instructions below, for each type of tests.

In both cases, you will need to export the Sauce Labs credentials as environment variables:

- `$ export SAUCE_USERNAME='...'`
- `$ export SAUCE_ACCESS_KEY='...'`

**Running Sauce Labs unit tests from local machine:**

- Build the unit tests with `$ gulp before-tests`.

- (Optional) You can verify the unit tests pass in your local browser first by running `$ grunt test-server` and pointing your browser to `http://localhost:9999/`. Hit `Ctrl/Cmd + C` when done.

- Run the unit tests in Sauce Labs with `$ grunt test-saucelabs-local` (will spin up the test server on `localhost:9999` and send commands to Sauce Labs).

**Running Sauce Labs end-to-end tests from local machine:**

- Download [Sauce Connect](https://saucelabs.com/docs/connect) for your system. Unzip the archive, and copy `bin/sc` from the Sauce Connect directory to this project's `test/bin` folder.

- In a separate terminal, start Sauce Connect with `$ make sc`.

- Tell the end-to-end tests to use Sauce Labs by setting the environment variable `$ export SAUCE=true`.

- (Optional) You can specify a browser and platform to use in Sauce Labs by setting an environment variable with the pattern: `$ export BROWSER='<browserName>:<version>:<platform>'` (ex: `$ export BROWSER='chrome:32:Windows 8.1`).

- Build the app and run the end-to-end tests just like you would locally ([instructions above](#end-to-end-tests)). 

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

