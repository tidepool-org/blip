/* global rm, mkdir, exec, ls, cp */
require('shelljs/global');
var ms = require('ms');

var start = new Date();

console.log('Cleaning output directory "dist/"...');
rm('-rf', 'dist');
mkdir('-p', 'dist');

var entry = './app/main.prod.js';

console.log('Building app from "' + entry + '"...');
exec('webpack --devtool source-map --progress --optimize-minimize');

var end = new Date();
console.log('App built in ' + ms(end - start));
