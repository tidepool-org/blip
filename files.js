// Some files used by different tasks (development, build, test)
// Add/remove files in one place (here) to avoid repetition

var files = {
  js: {
    vendor: [
      'bower_components/react/react.js',
      'bower_components/director/build/director.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/bows/dist/bows.js',
      'bower_components/superagent/superagent.js',
      'bower_components/moment/moment.js',
      'bower_components/d3/d3.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/Duration.js/duration.js',
      'bower_components/rxjs/rx.lite.js',
      'bower_components/query-string/query-string.js'
    ]
  },

  images: [
    {dir: 'app/components/navbar/images', endpoint: 'navbar'},
    {dir: 'app/components/loginnav/images', endpoint: 'loginnav'},
    {dir: 'app/components/loginlogo/images', endpoint: 'loginlogo'}
  ],

  svg: [
    {dir: 'bower_components/tideline/img', endpoint: 'tideline'}
  ]
};

module.exports = files;