/* global rm, mkdir, exec, ls*/
require('shelljs/global');
var fs = require('fs');
var ms = require('ms');

var start = new Date();

console.log('Cleaning output directory "dist/"...');
rm('-rf', 'dist');
mkdir('-p', 'dist');

var entry = './app/main.prod.js';

console.log('Building app from "' + entry + '"...');
exec('webpack --entry \'' + entry + '\' --output-filename \'bundle.[hash].js\' --devtool source-map --colors --progress');

function getBundleFilename() {
  var matches = ls('dist/bundle.*.js');
  if (!(matches && matches.length)) {
    throw new Error('Expected to find "dist/bundle.[hash].js"');
  }
  return matches[0].replace('dist/', '/');
}

function getStyleFilename() {
  var matches = ls('dist/style.*.css');
  if (!(matches && matches.length)) {
    throw new Error('Expected to find "dist/style.[hash].css"');
  }
  return matches[0].replace('dist/', '/');
}

console.log('Copying "index.html"...');
var indexHtml = fs.readFileSync('index.html', 'utf8');

/**
 * Replace bundle.js with hashed filename for cache-busting
 */
indexHtml = indexHtml.replace('/bundle.js', getBundleFilename());

/**
 * Replace style place holder with css include with hashed filename for cache-busting
 */
indexHtml = indexHtml.replace('<!-- style -->',
  '<link rel="stylesheet" href="' + getStyleFilename() + '" />'
);

indexHtml.to('dist/index.html');

var end = new Date();
console.log('App built in ' + ms(end - start));
