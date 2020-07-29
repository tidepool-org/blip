const { ShellString } = require('shelljs');
const fs = require('fs');
const crypto = require('crypto');
const _ = require('lodash');
const blipConfig = require('./config.app');

const reTitle = /<title>([^<]*)<\/title>/;
const reConfig = /(<!-- config -->)|(<script [^>]*src="config(\.[\w]*)*\.js"[^>]*><\/script>)/m;
const reZendesk = /(^\s+<!-- Start of support Zendesk Widget script -->\n)(.*\n)?(^\s+<!-- End of support Zendesk Widget script -->)/m;
const reTrackerUrl = /const u = '(.*)';/;
const reTrackerSiteId = /const id = ([0-9]);/;
const reMatomoJs = /(^\s+<!-- Start of Tracker Code -->\n)(.*\n)*(^\s+<!-- End of Tracker Code -->)/m;
const reCrowdin = /(^\s+<!-- Start of Crowdin -->\n)(.*\n)*(^\s+<!-- End of Crowdin -->)/m;
const reCrowdinBranding = /BRANDING/;

function getHash(str) {
	const hash = crypto.createHash('md5');
	hash.update(str);
	return hash.digest('hex').substr(0, 20);
}

const start = Date.now();
let distDir = null;
let srvDir = null;

// Determined dist dir location
for (const dd of ['dist', '../dist']) {
  distDir = dd;
  if (fs.existsSync(distDir)) {
    break;
  }
  distDir = null;
}
if (distDir === null) {
  console.error('dist not found in . or ..');
  process.exit(1);
} else {
  console.info(`Using dist directory: ${distDir}`);
}

// Determined server dir location:
for (const sd of ['.', 'server']) {
  srvDir = sd;
  if (fs.existsSync(`${srvDir}/config.app.js`)) {
    break;
  }
  srvDir = null;
}
if (srvDir === null) {
  console.error('config.app.js not found, can\'t determined the server dir location.');
  process.exit(1);
} else {
  console.info(`Using server directory: ${srvDir}`);
}

// Display configuration used
console.info('Using configuration:', blipConfig);

// *** Title ***
let indexHtml = fs.readFileSync(`${distDir}/index.html`, 'utf8');
if (typeof process.env.BRANDING === 'string') {
  const title = process.env.BRANDING.replace(/^\w/, (c) => { return c.toUpperCase(); });
  console.info(`- Setup title to ${title}`);
  indexHtml = indexHtml.replace(reTitle, `<title>${title}</title>`);
}

// *** Configuration ***
const configJs = `window.config=${JSON.stringify(blipConfig)};`;
let shellStr = new ShellString(configJs);
let fileHash = getHash(configJs.toString());
const configFilename = `config.${fileHash}.js`;
shellStr.to(`${distDir}/${configFilename}`);
console.info(`- Config saved to ${distDir}/${configFilename}`);

if (reConfig.test(indexHtml)) {
  let configURL = configFilename;
  // Public path declared (for CloudFront)
  console.info(`- Update config file to ${configFilename}`);
  if (typeof process.env.PUBLIC_PATH === 'string' && process.env.PUBLIC_PATH.startsWith('https')) {
    console.info(`  => Using public path: ${process.env.PUBLIC_PATH}`);
    if (process.env.PUBLIC_PATH.endsWith('/')) {
      configURL = `${process.env.PUBLIC_PATH}${configURL}`;
    } else {
      configURL = `${process.env.PUBLIC_PATH}/${configURL}`;
    }
  }
  const configStrRepl = `<script type="text/javascript" src="${configURL}"></script>`;
  indexHtml = indexHtml.replace(reConfig, configStrRepl);
} else {
  console.error('/!\\ Missing config template part /!\\');
  process.exit(1);
}

// *** ZenDesk ***
let helpLink = '<!-- Zendesk disabled -->';
if (!reZendesk.test(indexHtml)) {
  console.error(`/!\\ Can't find help pattern in index.html: ${reZendesk.source} /!\\`);
  process.exit(1);
}
if (typeof process.env.HELP_LINK === 'string' && process.env.HELP_LINK.startsWith('https://')) {
  console.info('- Using HELP_LINK:', process.env.HELP_LINK);
  helpLink = `<script id="ze-snippet" type="text/javascript" src="${process.env.HELP_LINK}"></script>`;
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

    let matomoJs = fs.readFileSync(`${srvDir}/templates/matomo.js`, 'utf8');
    console.info(`  => Setting up matomo tracker code: ${matomoTrackerUrl}`);
    const updatedSrc = matomoJs.replace(reTrackerUrl, (m, u) => {
      return m.replace(u, matomoTrackerUrl);
    });
    const siteId = _.get(process, 'env.MATOMO_TRACKER_SITEID', 1);
    matomoJs = updatedSrc.replace(reTrackerSiteId, (m, u) => {
      return m.replace(u, siteId);
    });

    fileHash = getHash(matomoJs);
    const fileName = `matomo.${fileHash}.js`;

    let matomoConfigScript = null;
    let matomoScript = null;

    // Public path declared (for CloudFront)
    if (typeof process.env.PUBLIC_PATH === 'string' && process.env.PUBLIC_PATH.startsWith('https')) {
      console.info(`  => Using public path: ${process.env.PUBLIC_PATH}`);
      if (process.env.PUBLIC_PATH.endsWith('/')) {
        matomoConfigScript = `<script type="text/javascript" src="${process.env.PUBLIC_PATH}${fileName}"></script>`;
      } else {
        matomoConfigScript = `<script type="text/javascript" src="${process.env.PUBLIC_PATH}/${fileName}"></script>`;
      }
    } else {
      matomoConfigScript = `<script type="text/javascript" src="${fileName}"></script>`;
    }

    // Matomo main script
    matomoScript = `<script type="text/javascript" src="${matomoTrackerUrl}matomo.js"></script>`;

    const matomoConfigScripts = `  ${matomoConfigScript}\n  ${matomoScript}\n`;
    indexHtml = indexHtml.replace(reMatomoJs, `$1${matomoConfigScripts}$3`);

    shellStr = new ShellString(matomoJs);
    shellStr.to(`${distDir}/${fileName}`);
  } else {
    console.error('  /!\\ Invalid matomo config url, please verify your MATOMO_TRACKER_URL env variable /!\\');
  }
  break;
case 'highwater':
  indexHtml = indexHtml.replace(reMatomoJs, '$1  <!-- Using highwater -->\n$3');
  console.info('- Using highwater tracker code');
  break;
case 'disabled':
  console.info('- Tracker code is disabled');
  indexHtml = indexHtml.replace(reMatomoJs, '$1  <!-- Tracker disabled -->\n$3');
  break;
default:
  console.error(`/!\ Unknown tracker ${process.env.METRICS_SERVICE} /!\\`);
  indexHtml = indexHtml.replace(reMatomoJs, '$1  <!-- Tracker disabled -->\n$3');
  break;
}

// *** Crowdin ***
if (process.env.CROWDIN === 'enabled') {
  console.info('- Enable crowdin...');
  let crowdinJs = fs.readFileSync(`${srvDir}/templates/crowdin.js`, 'utf8');
  let crowdinProject = blipConfig.BRANDING;
  switch (blipConfig.BRANDING) {
  case 'diabeloop':
    crowdinProject = 'yourloops';
    break;
  }
  console.info(`  => Setting up crowdin project: ${crowdinProject}`);
  crowdinJs = crowdinJs.replace(reCrowdinBranding, crowdinProject);
  fileHash = getHash(crowdinJs);
  const fileName = `crowdin.${fileHash}.js`;
  shellStr = new ShellString(crowdinJs);
  shellStr.to(`${distDir}/${fileName}`);

  const crowdinScripts = `\
  <script type="text/javascript" src="${fileName}"></script>\n\
  <script type="text/javascript" src="https://cdn.crowdin.com/jipt/jipt.js"></script>`;
  if (!reCrowdin.test(indexHtml)) {
    console.error(`/!\\ Can't find crowdin pattern in index.html: ${reCrowdin.source} /!\\`);
    process.exit(1);
  }
  indexHtml = indexHtml.replace(reCrowdin, `$1${crowdinScripts}\n$3`);
} else {
  console.info('- Crowdin is disabled');
  indexHtml = indexHtml.replace(reCrowdin, '$1  <!-- disabled -->\n$3');
}

// *** Saving ***
console.info(`- Updating "${distDir}/index.html"...`);
shellStr = new ShellString(indexHtml);
shellStr.to(`${distDir}/index.html`);

const end = Date.now();
console.info(`Config built in ${(end - start)}ms`);
