module.exports = function(grunt) {
  var browsers = [
    {
      browserName: 'googlechrome',
      platform: 'Windows 8.1',
      version: '32'
    }
  ];

  var buildLabel;
  var tunnelIdentifier;
  if (process.env.TRAVIS) {
    buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
  }

  grunt.initConfig({
    connect: {
      test: {
        options: {
          base: 'tmp/test',
          port: 9999
        }
      }
    },

    'saucelabs-mocha': {
      options: {
        urls: ['http://127.0.0.1:9999/'],
        tunnelTimeout: 5,
        build: buildLabel,
        concurrency: 3,
        browsers: browsers,
        testname: 'Blip'
      },
      local: {
        options: {
          testname: 'Blip (local)',
          tags: ['unit', 'local']
        }
      },
      travis: {
        options: {
          // WARNING: if `identifier` is set to null or undefined,
          // grunt task will fail
          identifier: tunnelIdentifier,
          tags: ['unit', 'ci']
        }
      }
    }
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key !== 'grunt' && key.indexOf('grunt') === 0) grunt.loadNpmTasks(key);
  }

  grunt.registerTask('test-server', ['connect:test:keepalive']);
  grunt.registerTask('test-saucelabs-local', ['connect', 'saucelabs-mocha:local']);
  grunt.registerTask('test-saucelabs-travis', ['connect', 'saucelabs-mocha:travis']);
};