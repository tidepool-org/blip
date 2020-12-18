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
 */
/* eslint-disable lodash/prefer-lodash-typecheck */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const handlebars = require('handlebars');
const blipConfig = require('./config.app');

const _ = require('lodash');

const reTitle = /<title>([^<]*)<\/title>/;
const reZendesk = /(^\s+<!-- Start of support Zendesk Widget script -->\n)(.*\n)?(^\s+<!-- End of support Zendesk Widget script -->)/m;
const reTrackerUrl = /const u = '(.*)';/;
const reTrackerSiteId = /const id = ([0-9]);/;
const reMatomoJs = /(^\s+<!-- Start of Tracker Code -->\n)(.*\n)*(^\s+<!-- End of Tracker Code -->)/m;
const reCrowdin = /(^\s+<!-- Start of Crowdin -->\n)(.*\n)*(^\s+<!-- End of Crowdin -->)/m;
const reCrowdinBranding = /BRANDING/;

const reUrl = /(^https?:\/\/[^/]+).*/;
const reDashCase = /[A-Z](?:(?=[^A-Z])|[A-Z]*(?=[A-Z][^A-Z]|$))/g;
const scriptConfigJs = '<script defer type="text/javascript" src="config.js" integrity="{{CONFIG_HASH}}" crossorigin="anonymous"></script>';
const outputFilenameTemplate = 'cloudfront-{{ TARGET_ENVIRONMENT }}-blip-request-viewer.js';

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

let distDir = null;
let templateDir = null;
let zendeskEnabled = false;
const templateFilename = path.resolve(`${__dirname}/../templates/lambda-request-viewer.js`);

function getHash(str) {
	const hash = crypto.createHash('md5');
	hash.update(str);
	return hash.digest('hex').substr(0, 20);
}

function getIntegrity(str, algorithm = 'sha512') {
	const hash = crypto.createHash(algorithm);
	hash.update(str);
	return hash.digest('base64');
}

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
  if (zendeskEnabled) {
    // Assume Zendesk
    console.log('Zendesk is enabled');
    const helpUrl = blipConfig.HELP_SCRIPT_URL.replace(reUrl, '$1');
    contentSecurityPolicy.scriptSrc.push(helpUrl);
    contentSecurityPolicy.connectSrc.push(helpUrl);
    contentSecurityPolicy.imgSrc.push(helpUrl);
    contentSecurityPolicy.connectSrc.push('https://ekr.zdassets.com');
    contentSecurityPolicy.connectSrc.push(blipConfig.HELP_PAGE_URL);
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

  let configJs = `window.config = ${JSON.stringify(blipConfig, null, 2)};`;
  console.log('Using config:', configJs);
  const hash = crypto.createHash('sha512');
  hash.update(configJs);
  const configHash = `sha512-${hash.digest('base64')}`;

  const templateParameters = {
    ...blipConfig,
    DISTRIB_FILES: distribFiles,
    INDEX_HTML: '',
    CONFIG_JS: configJs,
    CONFIG_HASH: configHash,
    TARGET_ENVIRONMENT: process.env.TARGET_ENVIRONMENT.toLowerCase(),
    FEATURE_POLICY: featurePolicy.join(';'),
    GEN_DATE: new Date().toISOString(),
    CSP: ''
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
  const outputFilename = `${distDir}/lambda/${template(templateParameters)}`;
  console.log(`Saving to ${outputFilename}`);
  fs.mkdir(`${distDir}/lambda`, { recursive: true }, (err) => {
    if (err) {
      throw err;
    } else {
      fs.writeFile(outputFilename, lambdaFile, { encoding: 'utf-8' }, afterGenOutputFile);
    }
  });
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
    if (filename === 'index.html') {
      // Exclude the index.html file, send in the lambda
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

function getDistDir(defaultDir) {
  let dir = null;
  if (process.argv.length === 3) {
    dir = path.resolve(process.argv[2]);
  } else if(process.env.DIST_DIR !== undefined && process.env.DIST_DIR !== '') {
    dir = path.resolve(process.env.DIST_DIR);
  } else {
    dir = path.resolve(defaultDir);
  }
  return dir;
}


/*** Main ***/

// Check required ENV variables
if (typeof process.env.TARGET_ENVIRONMENT !== 'string' || process.env.TARGET_ENVIRONMENT.length < 1) {
  console.error('Missing environnement variable TARGET_ENVIRONMENT');
  process.exit(1);
}

if (typeof process.env.API_HOST !== 'string' || !reUrl.test(process.env.API_HOST)) {
  console.error('Missing or invalid environnement variable API_HOST');
  process.exit(1);
}

// Determined dist dir location ${__dirname}/../static-dist
distDir = getDistDir(`${__dirname}/../dist`);
console.info(`Using dist directory: ${distDir}`);

// Determined template dir location:
templateDir = path.resolve(`${__dirname}/../templates`);
console.info(`Using template directory: ${templateDir}`);

// Display configuration used
console.info('Using configuration:', blipConfig);

const indexHtmlPath = path.resolve(`${distDir}/static/index.html`);
indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
if (typeof process.env.BRANDING === 'string') {
  const title = process.env.BRANDING.replace(/^\w/, (c) => { return c.toUpperCase(); });
  console.info(`- Setup title to ${title}`);
  indexHtml = indexHtml.replace(reTitle, `<title>${title}</title>`);
}

// *** ZenDesk ***
zendeskEnabled = typeof blipConfig.HELP_SCRIPT_URL === 'string' && reUrl.test(blipConfig.HELP_SCRIPT_URL);
zendeskEnabled = zendeskEnabled && typeof blipConfig.HELP_PAGE_URL === 'string' && reUrl.test(blipConfig.HELP_PAGE_URL);

let helpLink = '<!-- Zendesk disabled -->';
if (!reZendesk.test(indexHtml)) {
  console.error(`/!\\ Can't find help pattern in index.html: ${reZendesk.source} /!\\`);
  process.exit(1);
}
if (zendeskEnabled) {
  console.info('- Using HELP_SCRIPT_URL:', process.env.HELP_SCRIPT_URL);
  console.info('- Using HELP_PAGE_URL:', process.env.HELP_PAGE_URL);
  let zdkJs = fs.readFileSync(`${templateDir}/zendesk.js`, 'utf8');

  let fileHash = getHash(zdkJs);
  let integrity = getIntegrity(zdkJs);
  let fileName = `zdk.${fileHash}.js`;
  fs.writeFileSync(`${distDir}/static/${fileName}`, zdkJs);

  helpLink = `\
  <script type="text/javascript" defer src="${fileName}" integrity="sha512-${integrity}" crossorigin="anonymous"></script>\n\
  <script id="ze-snippet" type="text/javascript" defer src="${process.env.HELP_SCRIPT_URL}"></script>`;

} else {
  console.info('- Help link is disabled');
}
indexHtml = indexHtml.replace(reZendesk, `$1  ${helpLink}\n$3`);

// *** Matomo ***
if (!reMatomoJs.test(indexHtml)) {
  console.error(`/!\\ Can't find tracker pattern in index.html: ${reMatomoJs.source} /!\\`);
  process.exit(1);
}
switch (_.get(process, 'env.METRICS_SERVICE', 'disabled')) {
case 'matomo':
  console.info('- Using matomo tracker code');
  if (!_.isEmpty(process.env.MATOMO_TRACKER_URL) && process.env.MATOMO_TRACKER_URL.startsWith('http')) {
    // Replace tracker Javascript

    let matomoTrackerUrl = process.env.MATOMO_TRACKER_URL;
    if (!matomoTrackerUrl.endsWith('/')) {
      matomoTrackerUrl = `${matomoTrackerUrl}/`;
    }

    let matomoJs = fs.readFileSync(`${templateDir}/matomo.js`, 'utf8');
    console.info(`  => Setting up matomo tracker code: ${matomoTrackerUrl}`);
    const updatedSrc = matomoJs.replace(reTrackerUrl, (m, u) => {
      return m.replace(u, matomoTrackerUrl);
    });
    const siteId = _.get(process, 'env.MATOMO_TRACKER_SITEID', 1);
    matomoJs = updatedSrc.replace(reTrackerSiteId, (m, u) => {
      return m.replace(u, siteId);
    });

    let fileHash = getHash(matomoJs);
    const integrity = `integrity="sha512-${getIntegrity(matomoJs)}" crossorigin="anonymous"`;
    const fileName = `matomo.${fileHash}.js`;

    let matomoConfigScript = null;
    let matomoScript = null;

    // Public path declared (for CloudFront)
    if (typeof process.env.PUBLIC_PATH === 'string' && process.env.PUBLIC_PATH.startsWith('https')) {
      console.info(`  => Using public path: ${process.env.PUBLIC_PATH}`);
      if (process.env.PUBLIC_PATH.endsWith('/')) {
        matomoConfigScript = `<script defer type="text/javascript" src="${process.env.PUBLIC_PATH}${fileName}" ${integrity}></script>`;
      } else {
        matomoConfigScript = `<script defer type="text/javascript" src="${process.env.PUBLIC_PATH}/${fileName}" ${integrity}></script>`;
      }
    } else {
      matomoConfigScript = `<script defer type="text/javascript" src="${fileName}" ${integrity}></script>`;
    }

    // Matomo main script
    matomoScript = `<script defer type="text/javascript" src="${matomoTrackerUrl}matomo.js"></script>`;

    const matomoConfigScripts = `  ${matomoConfigScript}\n  ${matomoScript}\n`;
    indexHtml = indexHtml.replace(reMatomoJs, `$1${matomoConfigScripts}$3`);

    fs.writeFileSync(`${distDir}/static/${fileName}`, matomoJs);
  } else {
    console.error('  /!\\ Invalid matomo config url, please verify your MATOMO_TRACKER_URL env variable /!\\');
  }
  break;
case 'disabled':
  console.info('- Tracker code is disabled');
  indexHtml = indexHtml.replace(reMatomoJs, '$1  <!-- Tracker disabled -->\n$3');
  break;
default:
  console.error(`/!\\ Unknown tracker ${process.env.METRICS_SERVICE} /!\\`);
  indexHtml = indexHtml.replace(reMatomoJs, '$1  <!-- Tracker disabled -->\n$3');
  break;
}

// *** Crowdin ***
if (process.env.CROWDIN === 'enabled') {
  console.info('- Enable crowdin...');
  let crowdinJs = fs.readFileSync(`${templateDir}/crowdin.js`, 'utf8');
  let crowdinProject = blipConfig.BRANDING;
  switch (blipConfig.BRANDING) {
  case 'diabeloop':
    crowdinProject = 'yourloops';
    break;
  }
  console.info(`  => Setting up crowdin project: ${crowdinProject}`);
  crowdinJs = crowdinJs.replace(reCrowdinBranding, crowdinProject);
  const fileHash = getHash(crowdinJs);
  const integrity = getIntegrity(crowdinJs);
  const fileName = `crowdin.${fileHash}.js`;
  fs.writeFileSync(`${distDir}/static/${fileName}`, crowdinJs);

  const crowdinScripts = `\
  <script type="text/javascript" defer src="${fileName}" integrity="sha512-${integrity}" crossorigin="anonymous"></script>\n\
  <script type="text/javascript" defer src="https://cdn.crowdin.com/jipt/jipt.js"></script>`;
  if (!reCrowdin.test(indexHtml)) {
    console.error(`/!\\ Can't find crowdin pattern in index.html: ${reCrowdin.source} /!\\`);
    process.exit(1);
  }
  indexHtml = indexHtml.replace(reCrowdin, `$1${crowdinScripts}\n$3`);
} else {
  console.info('- Crowdin is disabled');
  indexHtml = indexHtml.replace(reCrowdin, '$1  <!-- disabled -->\n$3');
}

fs.readdir(`${distDir}/static`, withFilesList);
fs.readFile(templateFilename, { encoding: 'utf-8' }, withTemplate);
indexHtml = indexHtml.replace(/(<!-- config -->)/, scriptConfigJs);
indexHtml = indexHtml.replace(/<(script)/g, '<$1 nonce="${nonce}"');
genOutputFile();
