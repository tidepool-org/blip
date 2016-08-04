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

Coming soon!

## Development

### Running locally with blip

To work on code in this repository within [blip](https://github.com/tidepool-org/blip 'Tidepool on GitHub: blip'), first do the following from your local blip repository (assuming blip/ and viz/ are sister directories):

```bash
$ rm -rf node_modules/viz/
$ npm link ../viz/
```

And start the build in watch mode:

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

Coming soon!
