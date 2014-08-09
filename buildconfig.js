/* global rm, mkdir, exec, ls*/
require('shelljs/global');
var fs = require('fs');
var ms = require('ms');

var start = new Date();

console.log('Building config...');
exec('webpack --entry \'./config.app.js\' --output-library \'config\' --output-file \'config.[hash].js\' --colors --progress');

function getBundleFilename() {
  var matches = ls('dist/config.*.js');
  if (!(matches && matches.length)) {
    throw new Error('Expected to find "dist/config.[hash].js"');
  }
  return matches[0].replace('dist/', '');
}

console.log('Updating "dist/index.html"...');
var indexHtml = fs.readFileSync('dist/index.html', 'utf8');
indexHtml = indexHtml.replace('<!-- config -->',
  '<script type="text/javascript" src="' + getBundleFilename() + '"></script>'
);
indexHtml.to('dist/index.html');

var end = new Date();
console.log('Config built in ' + ms(end - start));
