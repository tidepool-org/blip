/**
 * Create a different index.html and bundle.js for each language
 */

const fs = require('fs');
const path = require('path');
const languages = require('./languages.json');

const bundlePath = path.join(__dirname, '..', 'dist', 'bundle.js');
const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');

const bundleContent = fs.readFileSync(bundlePath, 'utf8');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

for (let language of languages) {
  const translations = require(`./json/${language}.json`);
  const translatedBundlePath = path.join(__dirname, '..', 'dist', `bundle.${language}.js`);
  const translatedHtmlPath = path.join(__dirname, '..', 'dist', `index.${language}.html`);

  // Generate the translated html. We replace bundle.js by bundle.[xx].js
  const translatedHtml = htmlContent.replace(/bundle\.js/, `bundle.${language}.js`);

  fs.writeFileSync(translatedHtmlPath, translatedHtml, 'utf8');

  // eslint ensures that there are no double-quoted strings, only
  // single-quoted and anti-quoted strings
  const regexAntiQuotes = /__\(`([^`\\]|\\.)`\)/g;
  const regexSingleQuotes = /__\('([^'\\]|\\.)'\)/g;

  let translatedBundle = translate({
    source: bundleContent,
    regex: regexAntiQuotes,
    quote: '`',
    translations
  });

  translatedBundle = translate({
    source: translatedBundle,
    regex: regexSingleQuotes,
    quote: '\'',
    translations
  });

  fs.writeFileSync(translatedBundlePath, translatedBundle, 'utf8');
}

function translate({source, regex, quote, translations}) {
  const chunks = [];
  let lastIndex = 0;
  let res = null;

  while (res = regex.exec(source)) {
    const [fullMatch, content] = res;

    chunks.push(source.slice(lastIndex, res.index));

    // If not translation available, return the content itself
    const translation = translations[content] || content;
    chunks.push(`${quote}${translation}${quote}`);
    lastIndex = res.index + fullMatch.length;
  }

  chunks.push(source.slice(lastIndex));

  return chunks.join('');
}
