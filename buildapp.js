/* global rm, mkdir, exec, ls, cp */
require('shelljs/global');
var fs = require('fs');
var ms = require('ms');

var start = new Date();

console.log('Cleaning output directory "dist/"...');
rm('-rf', 'dist');
mkdir('-p', 'dist');

var entry = './app/main.prod.js';

console.log('Building app from "' + entry + '"...');
exec('webpack --entry \'' + entry + '\' --output-filename \'bundle.[hash].js\' --devtool source-map --colors --progress --optimize-minimize');

var end = new Date();
console.log('App built in ' + ms(end - start));
