## Integration testing with Nightwatch

**NB: Due to difficulties with running the Nightwatch tests on [TravisCI](https://travis-ci.org/ 'TravisCI'), we have *disabled* them. The information here should be relevant to anyone trying to fix the setup and add more tests later, but at the moment (mid-November 2016) we are neither running nor adding to the integration tests.**

### Prerequisites:

1. [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) (for Selenium)
1. [Docker](https://www.docker.com/products/docker-toolbox 'Docker Toolbox')

### Setup:

**NB:** If you're running the platform locally with `runservers`, you can skip directly to (3).

(1) Launch the default docker machine: [Mac](https://docs.docker.com/engine/installation/mac/#from-your-shell) (`docker-machine start default`) or [Win](https://docs.docker.com/engine/installation/windows/#using-docker-from-windows-command-prompt-cmd-exe)

(2) Launch test containers with:
```bash
$ docker-compose up -d
```

(3) Run Nightwatch with:
```bash
$ npm run nightwatch
```

By default this will run all the tests in the `integration/` directory.

If you're working on Nightwatch tests and you've already built blip, you can just run the tests without the build with:
```bash
$ npm run nightwatch-single
```

### Teardown

(1) Exit test containers with:
```bash
$ docker-compose down
```