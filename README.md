# Blip

[![Build Status](https://jenkins.ci.diabeloop.eu/job/mdblp/job/blip/job/dblp/badge/icon)](https://jenkins.ci.diabeloop.eu/job/mdblp/job/blip/job/dblp/)

Blip is a web app for type 1 diabetes (T1D) built on top of the [Tidepool](http://tidepool.org/) platform. It allows patients and their "care team" (family, doctors) to visualize their diabetes device data (from insulin pumps, BGMs, and/or CGMs) and message each other.

This README is focused on just the details of getting blip running locally. For more detailed information aimed at those working on the development of blip, please see the [developer guide](docs/StartHere.md).

* * * * *

### Table of contents

- [Before you start](#before-you-start)
- [Install](#install)
- [Build and deployment](#build-and-deployment)
- [Configuration](#configuration)
- [Run a production server locally](#run-a-production-server-locally)
- [Debugging](#debugging)
- [Linting](#Linting)
- [Running the tests](#running-the-tests)
- [Independent server for production or docker](#independent-server-for-production-or-docker)
- [Documentation for developers](#documentation-for-developers)

## Before you start

If this is the first time you're looking at Yoorloops (blip) locally, start with the [mdblp/dblp](https://github.com/mdblp/yourloops/tree/next/k8s) repository to setup the backend before continuing here.

## Install

Requirements:
- [NVM](https://github.com/nvm-sh/nvm) for managing your nodejs
- [Node.js](http://nodejs.org/ 'Node.js') version 14.x or higher
- [npm](https://www.npmjs.com/ 'npm') version 7.x or higher
- [Lerna](https://lerna.js.org/) version 2.x


Clone this repo [from GitHub](https://github.com/mdblp/blip 'GitHub: blip'), then install the dependencies:

After cloning this repository to your local machine, first make sure that you have node >= `14.x` and npm >= `7.x` installed. If you have a different major version of node installed, consider using [nvm](https://github.com/creationix/nvm 'GitHub: Node Version Manager') to manage and switch between multiple node (& npm) installations.
You can install the latest npm version with: `npm install -g npm@latest`.

Once your environment is setup with node, lerna and npm, install the dependencies:

```bash
$ npm install
```

## Build and deployment

### Artifact: Fetch branding images & translations

Simplest method, will do everything needed in one command.
To be able to retreive theses files, a github personal token is mandatory (env GIT_TOKEN)
See https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token

```bash
$ source artifact-lang.sh
retrieveLanguageParameters
```

This script is used by the continuous build system, but it can be use standalone.

### Configuration
To configure blip to the desired environment source one config in the `config` directory.
Example for a dev build:
```bash
$ source config/.env.sh
```

### Simple dev build

The app is built as a static site in the `dist/` directory.

- Will load the env var for a dev environment (docker)
- Do a development build of the application
```bash
$ npm run build-dev
```

### Watch dev build
This will build the application and launch a dev server, with "watch" option.
Everytime a file is changed in the source, the application will be re-build automatically,
and the changes will be available in the browser

```bash
$ npm run start-dev
```

The application will be available at: http://app-frontend:3001/
Hit `CTRL+C` to stop the server.

### Production build

```bash
$ bash build.sh
```

## Run a production server locally

After that, the app is ready to be served using the static web server included in this repo:

```bash
$ npm run server
```

You can specify the HTTP port using the `PORT` env var:
```bash
$ PORT=3001 npm run server
```

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

## Linting

The app is ruled by [eslint](https://eslint.org/) to keep code style consistent. It has an [editorconfig](https://editorconfig.org/) file which defines some common rules to correctly configure IDE formatting.  
How to enable it :
- VS code : download and install the [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) plugin
- Webstorm : enable the EditorConfig support into Settings / Code style

## Running the tests

We use [Mocha](https://mochajs.org/) with [Chai](http://chaijs.com/) for our test framework inside [Karma](https://karma-runner.github.io/) as our test runner, as well as [Sinon.JS](http://sinonjs.org/) and [Sinon-Chai](https://github.com/domenic/sinon-chai) for spies and stubs. Our tests currently run on Google Chrome or Firefox (if not using WSL).

To run the unit tests, use:

```bash
// run all test
$ npm run test
// run a specific package, either sundiaal, viz, tideline, blip or yourloops
$ npm run test-<the targeted package>
```

To run the unit tests in watch mode, use:

```bash
$ npm run test-watch
```

## Independent server for production or docker

For a production ready archive, or an independent docker image, the `server` directory is used.
To do it automatically, see the `artifact.sh` & `.travis.yml` usage.

To do it manually, fist be sure to set the environment variables needed (see the [Configuration](#configuration) part).

```bash
# Build the application
:blip$ npm run build
# Move the created app (static web files) to the server directory:
:blip$ mv -v dist server/dist
# Update blip the version in the package.json on the server side:
:blip$ bash server/update-version.sh
# Go to the server directory
:blip$ cd server
# Install the node dependencies
:blip/server$ npm install
# Run the server
:blip/server$ bash start.sh
# Or build the docker image:
:blip/server$ docker build -t blip:latest .
# Start the docker server:
:blip/server$ docker run -p 3000:3000 blip:dev
```

## Integration with CloudFront
Blip is designed to be published on AWS Cloudfront. The "static" js and html content (result of webpack) is published on an s3 bucket and the configuration and security stuff is handled by a lambda edge function.

### Local testing
To test blip locally as if it was running on CloudFront with a lambda@edge middleware you can execute the following command (from root dir):
* launch a docker container docker lambci/lambda:nodejs10.x in "watch mode": `docker run --rm -e DOCKER_LAMBDA_WATCH=1 -e DOCKER_LAMBDA_STAY_OPEN=1 -p 9001:9001 -v $PWD/dist/lambda:/var/task:ro,delegated -d --name blip-middleware lambci/lambda:nodejs10.x cloudfront-test-blip-request-viewer.handler` assuming you compile the lambda script with $TARGET_ENVIRONMENT=test.
* the docker container will pickup any changes you apply to the lambda script
* source the relevant env file: `. ./config/.env.sh`
* then start blip server to serve static js files: `npm run server`

### Deploy and test on a k8s cluster
To run blip on k8s (or even on a simple docker compose) you can re-use the deployment image.
Create a deployment with 2 pods:
* lambci/lambda:nodejs10.x to execute the lambda
* node:10-alpine to execute the server
Attach these 2 pods to a volume and use an init container to copy the app files (lambda script + static dist) on the volume.
`docker run -v blip:/www --env-file .docker.env blip-deployment "-c" "cd server && npm run gen-lambda && cp -R /dist/static /www && cp -R /dist/lambda /static"`

### Deploy to aws cloud front
To publish blip to CloudFront the simplest solution is to build the docker image provided under ./cloudfront-dist and use it.
1. From the root folder execute: `docker build -t blip-deploy .`
1. Prepare an environment file that contains the configuration for the environment you want to deploy to. You can use the template provided in ./cloudfront-dist/docker.template.env.
1. Execute the docker image built just above: `docker run --env-file ./cloudfront-dist/deployment/cf-blip.env blip-deploy`
Et voila, the deployment starts. Of course you need credentials for the aws account you target ;)

## Documentation for developers

:warning: this part below contains deprecated contents, inhereted from tidepool

+ [Blip developer guide](docs/StartHere.md)
    + [overview of features](docs/FeatureOverview.md)
    + [app & directory structure](docs/DirectoryStructure.md)
    + [architecture](docs/Architecture.md)
    + [code style](docs/CodeStyle.md)
+ [usage of dependencies](docs/Dependencies.md)
    + [React](docs/React.md)
    + [React Router](docs/ReactRouter.md)
    + [Redux](docs/Redux.md)
        + [Glossary of state tree terms](docs/StateTreeGlossary.md)
    + [webpack](docs/Webpack.md)
+ misc
    + ["fake child accounts"](docs/FakeChildAccounts.md)
