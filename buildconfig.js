/* global rm, mkdir, exec, ls, mv*/
require('shelljs/global');
var fs = require('fs');
var crypto = require('crypto');
var ms = require('ms');

var reConfig = /(<!-- config -->)|(<script [^>]*src="config(\.[\w]*)*\.js"[^>]*><\/script>)/m;
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
exec('webpack --config config.webpack.js');

var hash = getHash(fs.readFileSync('dist/config.js'));
var filename = 'config.' + hash + '.js';
console.log('Renaming to ' + filename + '...');
mv('-f', 'dist/config.js', 'dist/' + filename);

console.log('Updating "dist/index.html"...');
var indexHtml = fs.readFileSync('dist/index.html', 'utf8');

// Replace from config.js part
if (reConfig.test(indexHtml)) {
  var configStrOrig = reConfig.exec(indexHtml)[0];
  var configStrRepl = `<script type="text/javascript" src="${filename}"></script>`;
  console.log(`Replace ${configStrOrig} by ${configStrRepl}`);
  indexHtml = indexHtml.replace(reConfig, configStrRepl);
} else {
  console.error("Missing config template part");
  process.exit(1);
}

// Replace ZenDesk Javascript
if (typeof process.env.HELP_LINK === 'string') {
  if (process.env.HELP_LINK === 'disable') {
    indexHtml = indexHtml.replace(/(<script id="ze-snippet".*<\/script>)/, '');
  } else {
    indexHtml = indexHtml.replace(/(<script id="ze-snippet" src="([^"]+)">)/, (match, p1, p2) => {
      return p1.replace(p2, process.env.HELP_LINK);
    });
  }
}

// Saving
indexHtml.to('dist/index.html');

var end = new Date();
console.log('Config built in ' + ms(end - start));
