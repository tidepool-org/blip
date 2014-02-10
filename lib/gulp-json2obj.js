var es = require('event-stream');
var gulp = require('gulp');

// Recursively load a directory of JSON files into a JavaScript object
// Quick and dirty, take inspiration from this to make actual plugin:
// https://github.com/wearefractal/gulp-concat/blob/master/index.js

// Example usage:
// 
// var util = require('util');
// var data = {};
// 
// gulp.src('data/**/*.json')
//   .pipe(jsonToObject(data))
//   .on('end', function() {
//     var contents = 'var data = ';
//     contents = contents + util.inspect(data, {depth: null});
//     contents = contents + ';';
//     console.log(contents);
//   });

jsonToObject = function(data) {

  function loadJsonFile(file, cb) {
    var filePathTokens = file.path
      .replace(file.base, '')
      .replace('.json', '')
      .split('/');

    var dataObject = data;
    filePathTokens.forEach(function(token, index) {
      if (index === filePathTokens.length - 1) {
        dataObject[token] = JSON.parse(file.contents);
        return;
      }

      if (typeof dataObject[token] === 'undefined') {
        dataObject[token] = {};
      }
      dataObject = dataObject[token];
    });

    cb(null, file);
  }

  return es.map(loadJsonFile);
};

module.exports = jsonToObject;