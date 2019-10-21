/* global rm, mkdir, exec, ls, mv*/
require('shelljs/global');
var fs = require('fs');
var crypto = require('crypto');
var ms = require('ms');

var reTitle = /<title>([^<]*)<\/title>/;
var reConfig = /(<!-- config -->)|(<script [^>]*src="config(\.[\w]*)*\.js"[^>]*><\/script>)/m;
var reZendesk = /(<!-- Zendesk disabled -->)|(<script id="ze-snippet" type="text\/javascript" src="[^"]+">\s*<\/script>)/m;
var zendeskDisable = '<!-- Zendesk disabled -->';
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
exec('webpack --devtool source-map --config config.webpack.js');

var hash = getHash(fs.readFileSync('dist/config.js'));
var filename = 'config.' + hash + '.js';
console.log('Renaming to ' + filename + '...');
mv('-f', 'dist/config.js', 'dist/' + filename);

console.log('Updating "dist/index.html"...');
var indexHtml = fs.readFileSync('dist/index.html', 'utf8');

// Replace the title
if (typeof process.env.BRANDING === 'string') {
  indexHtml = indexHtml.replace(reTitle, `<title>${process.env.BRANDING}</title>`);
}

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
  console.log("Using HELP_LINK: ", process.env.HELP_LINK);

  if (process.env.HELP_LINK === 'disable') {
    indexHtml = indexHtml.replace(reZendesk, zendeskDisable);

  } else {
    indexHtml = indexHtml.replace(reZendesk, `<script id="ze-snippet" type="text/javascript" src="${process.env.HELP_LINK}"></script>`);
  }
}

// Saving
indexHtml.to('dist/index.html');

var end = new Date();
console.log('Config built in ' + ms(end - start));
