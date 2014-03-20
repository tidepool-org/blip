// Some files used by different tasks (development, build, test)
// Add/remove files in one place (here) to avoid repetition

var files = {
  js: {
    // Provide path to vendor directory ("dir"),
    // then relative path to unminified vendor bundle ("dist")
    // and if it exists minified version ("distMin")
    vendor: [
      {dir: 'bower_components/react', dist: 'react.js', distMin: 'react.min.js'},
      {dir: 'bower_components/director', dist: 'build/director.js', distMin: 'build/director.min.js'},
      {dir: 'bower_components/lodash', dist: 'dist/lodash.js', distMin: 'dist/lodash.min.js'},
      {dir: 'bower_components/bows', dist: 'dist/bows.js', distMin: 'dist/bows.min.js'},
      {dir: 'bower_components/superagent', dist: 'superagent.js'},
      {dir: 'bower_components/moment', dist: 'moment.js', distMin: 'min/moment.min.js'},
      {dir: 'bower_components/d3', dist: 'd3.js', distMin: 'd3.min.js'},
      {dir: 'bower_components/jquery', dist: 'dist/jquery.js', distMin: 'dist/jquery.min.js'},
      {dir: 'bower_components/Duration.js', dist: 'duration.js'},
      {dir: 'bower_components/rxjs', dist: 'rx.lite.js'},
      {dir: 'bower_components/query-string', dist: 'query-string.js'}
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