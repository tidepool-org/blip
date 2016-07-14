/* global rm, mkdir, exec, ls, mv*/
require('shelljs/global');
var fs = require('fs');
var crypto = require('crypto');
var ms = require('ms');

var start = new Date();

// NOTE: Webpack's hash also uses the absolute path on the filesystem
// Since config is built in `start.sh` and apps can be on different
// servers and directory, we implement our own hashing using the file's content

function getHash(str) {
	var hash = crypto.createHash('md5');
	hash.update(str);
	return hash.digest('hex').substr(0, 20);
}

console.log('Building config...');
exec('webpack --config \'./config.webpack.js\' --colors --progress');

var hash = getHash(fs.readFileSync('dist/config.js'));
var filename = 'config.' + hash + '.js';
console.log('Renaming to ' + filename + '...');
mv('-f', 'dist/config.js', 'dist/' + filename);

console.log('Updating "dist/index.html"...');
var indexHtml = fs.readFileSync('dist/index.html', 'utf8');
indexHtml = indexHtml.replace('<!-- config -->',
  '<script type="text/javascript" src="/' + filename + '"></script>'
);
indexHtml.to('dist/index.html');

var end = new Date();
console.log('Config built in ' + ms(end - start));
