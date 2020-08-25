/**
 * Generate the AWS Lambda Edge function using the template cloudfront-lambda-blip-request-viewer.js
 * Copyright (c) 2020, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */
/* eslint-disable lodash/prefer-lodash-typecheck */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const handlebars = require('handlebars');
const blipConfig = require('./config.app');

const reUrl = /(^https?:\/\/[^/]+).*/;
const reDashCase = /[A-Z](?:(?=[^A-Z])|[A-Z]*(?=[A-Z][^A-Z]|$))/g;
const scriptConfigJs = '<script defer type="text/javascript" src="config.js" integrity="{{CONFIG_HASH}}" crossorigin="anonymous"></script>';
const templateFilename = 'templates/cloudfront-lambda-blip-request-viewer.js';
const indexHtmlFilename = 'dist/index.html';
const outputFilenameTemplate = 'dist/cloudfront-{{ TARGET_ENVIRONNEMENT }}-blip-request-viewer.js';

const featurePolicy = [
  "accelerometer 'none'",
  "geolocation 'none'",
  "autoplay 'none'",
  "camera 'none'",
  "document-domain 'none'",
  "fullscreen 'none'",
  "microphone 'none'"
];

const contentSecurityPolicy = {
  // TODO: report-uri /event/csp-report/violation;
  // Need react >= v16 for theses directives?
  // "require-trusted-types-for": "'script'",
  // "trusted-types": "default TrustedHTML TrustedScriptURL",
  blockAllMixedContent: [''],
  frameAncestors: ["'none'"],
  baseUri: ["'none'"],
  formAction: ["'none'"],
  defaultSrc: ["'none'"],
  scriptSrc: ["'self'", "'strict-dynamic'", "'nonce-${nonce}'", "'unsafe-eval'"],
  scriptSrcElem: ["'strict-dynamic'", "'nonce-${nonce}'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:'], // 'strict-dynamic' is problematic on google
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'", '{{ API_HOST }}'],
  frameSrc: [],
  objectSrc: [],
};

/** @type {string} */
let lambdaTemplate = null;
/** @type {string} */
let indexHtml = null;
/** @type {string} */
let distribFiles = null;

/**
 * Transform a camelCase string to dash-case
 * @param {string} str
 * @returns {string}
 */
function dashCase(str) {
  // Original source code:
  // https://github.com/shahata/dasherize/blob/1e2ac6357066356e746b91862d3479c0a12c5115/index.js#L26
  return str.replace(reDashCase, (s, i) => (i > 0 ? '-' : '') + s.toLowerCase());
}

function afterGenOutputFile(err) {
  if (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

/**
 * Generate the Content Security Policy
 *
 * This code is similar to the one found in server.js,
 * both of them need to be in sync
 *
 * @returns {string} The CSP for the template.
 */
function genContentSecurityPolicy() {
  if (typeof blipConfig.HELP_LINK === 'string' && reUrl.test(blipConfig.HELP_LINK)) {
    // Assume Zendesk
    console.log('Zendesk is enabled');
    const helpUrl = blipConfig.HELP_LINK.replace(reUrl, '$1');
    contentSecurityPolicy.scriptSrc.push(helpUrl);
    contentSecurityPolicy.connectSrc.push(helpUrl);
    contentSecurityPolicy.imgSrc.push(helpUrl);
    contentSecurityPolicy.connectSrc.push('https://ekr.zdassets.com');
    contentSecurityPolicy.connectSrc.push('https://diabeloop.zendesk.com');
  }

  const metricsUrl = process.env.MATOMO_TRACKER_URL;
  if (blipConfig.METRICS_SERVICE === 'matomo' && reUrl.test(metricsUrl)) {
    console.log('Matomo enabled');
    const matomoUrl = metricsUrl.replace(reUrl, '$1');
    contentSecurityPolicy.scriptSrc.push(matomoUrl);
    contentSecurityPolicy.imgSrc.push(matomoUrl);
    contentSecurityPolicy.connectSrc.push(matomoUrl);
  }

  if (process.env.CROWDIN === 'enabled') {
    console.log('Crowdin enabled');
    const crowdinURL = 'https://crowdin.com';
    const crowdinCDN = 'https://cdn.crowdin.com/';
    contentSecurityPolicy.scriptSrc.push("'unsafe-inline'", crowdinCDN, crowdinURL);
    contentSecurityPolicy.imgSrc.push(crowdinCDN, 'https://crowdin-static.downloads.crowdin.com', 'https://www.gravatar.com', 'https://*.wp.com');
    contentSecurityPolicy.styleSrc.push(crowdinCDN, 'https://fonts.googleapis.com');
    contentSecurityPolicy.connectSrc.push(crowdinCDN);
    contentSecurityPolicy.fontSrc.push(crowdinCDN, 'https://fonts.gstatic.com');
    contentSecurityPolicy.objectSrc.push("'self'");
    contentSecurityPolicy.frameSrc.push(crowdinCDN, crowdinURL, 'https://accounts.crowdin.com');
  }

  let csp = '';
  for (const cspName in contentSecurityPolicy) {
    if (Object.prototype.hasOwnProperty.call(contentSecurityPolicy, cspName)) {
      /** @type {string[]} */
      const value = contentSecurityPolicy[cspName];
      if (value.length > 0) {
        csp += `${dashCase(cspName)} ${value.join(' ')};`;
      }
    }
  }

  return csp;
}

function genOutputFile() {
  if (lambdaTemplate === null || indexHtml === null || distribFiles === null) {
    return;
  }

  const hash = crypto.createHash('sha512');
  let configJs = `window.config = ${JSON.stringify(blipConfig, null, 2)};`;
  console.log('Using config:', configJs);
  hash.update(configJs);
  const configHash = `sha512-${hash.digest('base64')}`;
  console.log('Configuration hash:', configHash);

  const templateParameters = {
    ...blipConfig,
    DISTRIB_FILES: distribFiles,
    INDEX_HTML: '',
    CONFIG_JS: configJs,
    CONFIG_HASH: configHash,
    TARGET_ENVIRONNEMENT: process.env.TARGET_ENVIRONNEMENT.toLowerCase(),
    FEATURE_POLICY: featurePolicy.join(';'),
    GEN_DATE: new Date().toISOString(),
    CSP: '',
  };

  const csp = genContentSecurityPolicy();
  let template = handlebars.compile(csp, { noEscape: true });
  templateParameters.CSP = template(templateParameters);

  template = handlebars.compile(indexHtml, { noEscape: true });
  indexHtml = template(templateParameters);
  templateParameters.INDEX_HTML = indexHtml;

  template = handlebars.compile(lambdaTemplate, { noEscape: true });
  const lambdaFile = template(templateParameters);

  template = handlebars.compile(outputFilenameTemplate, { noEscape: true });
  const outputFilename = template(templateParameters);
  console.log(`Saving to ${outputFilename}`);
  fs.writeFile(outputFilename, lambdaFile, { encoding: 'utf-8' }, afterGenOutputFile);
}

/**
 * Generate blip distribution files
 * @param {NodeJS.ErrnoException | null} err
 * @param {string[]} files
 */
function withFilesList(err, files) {
  if (err) {
    console.error(err);
    process.exitCode = 1;
    return;
  }
  const selectedFiles = ["'config.js'"];
  for (const file of files) {
    const filename = path.basename(file);
    if (/^config(\.[0-9a-z])?.js$/.test(filename)) {
      // Exclude the config.[contenthash].js file
      continue;
    }
    selectedFiles.push(`'${filename}'`);
  }
  distribFiles = selectedFiles.join(',');
  genOutputFile();
}

/**
 * @param {NodeJS.ErrnoException | null} err
 * @param {string} data
 */
function withIndexHtml(err, data) {
  if (err) {
    console.error(err);
    process.exitCode = 1;
    return;
  }
  console.log('Using', indexHtmlFilename);

  indexHtml = data.replace(/<script[^>]+src="config(\.[0-9a-z]+)?.js"[^>]*><\/script>/, scriptConfigJs);
  indexHtml = indexHtml.replace(/<(script)/g, '<$1 nonce="${nonce}"');
  genOutputFile();
}

/**
 * @param {NodeJS.ErrnoException | null} err
 * @param {string} data
 */
function withTemplate(err, data) {
  if (err) {
    console.error(err);
    process.exitCode = 1;
    return;
  }
  console.log('Using', templateFilename);
  lambdaTemplate = data;
  genOutputFile();
}

if (typeof process.env.TARGET_ENVIRONNEMENT !== 'string' || process.env.TARGET_ENVIRONNEMENT.length < 1) {
  console.error('Missing environnement variable TARGET_ENVIRONNEMENT');
  process.exitCode = 1;
} else if (typeof process.env.API_HOST !== 'string' || !reUrl.test(process.env.API_HOST)) {
  console.error('Missing or invalid environnement variable API_HOST');
  process.exitCode = 1;
} else {
  fs.readdir('dist', withFilesList);
  fs.readFile(templateFilename, { encoding: 'utf-8' }, withTemplate);
  fs.readFile(indexHtmlFilename, { encoding: 'utf-8' }, withIndexHtml);
}
