// Some files used by different tasks (development, build, test)
// Add/remove files in one place (here) to avoid repetition

var files = {
  js: {
    vendor: [
      'bower_components/react/react.js',
      'bower_components/director/build/director.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/bows/dist/bows.js',
      'bower_components/superagent/superagent.js'
    ]
  },

  images: [
    {dir: 'app/components/navbar/images', endpoint: 'navbar'},
    {dir: 'app/components/loginnav/images', endpoint: 'loginnav'},
    {dir: 'app/components/loginlogo/images', endpoint: 'loginlogo'}
  ]
};

module.exports = files;