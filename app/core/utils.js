/**
 * Copyright (c) 2014, Tidepool Project
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

// Various helper functions

import _  from 'lodash';
import sundial from 'sundial';
import TidelineData from 'tideline/js/tidelinedata';
import nurseShark from 'tideline/plugins/nurseshark';
import { MGDL_UNITS, MMOLL_UNITS, MGDL_PER_MMOLL } from './constants';

var utils = {};

/**
 * Convenience function for capitalizing a string
 *
 * @param  {String} str
 * @return {String}
 */
utils.capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Returns the value in a nested object,
// where `props` is the sequence of properties to follow.
// Returns `undefined` if the key is not present,
// or the `notFound` value if supplied
utils.getIn = (obj, props, notFound) => {
  var start = {
    child: obj,
    isNotFound: false
  };

  var result = _.reduce(props, (state, prop) => {
    if (state.isNotFound) {
      return state;
    }

    var child = state.child;
    if (!_.has(child, prop)) {
      return {
        child: notFound,
        isNotFound: true
      };
    }

    return {
      child: child[prop],
      isNotFound: false
    };
  }, start);

  return result.child;
};

// concat([1, 2], 3, [4, 5]) -> [1, 2, 3, 4, 5]
utils.concat = () => {
  var args = Array.prototype.slice.call(arguments, 0);
  return Array.prototype.concat.apply([], args);
};

utils.isChrome = () => {
  var userAgent = navigator.userAgent.toLowerCase();
  return (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1);
};

utils.isMobile = () => {
  var userAgent = navigator.userAgent.toLowerCase();
  return (userAgent.indexOf('mobi') > -1);
};

utils.validateEmail = email => {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};


// Shallow difference of two objects
// Returns all attributes and their values in `destination`
// that have different values from `source`
utils.objectDifference = (destination, source) => {
  var result = {};

  _.forEach(source, (sourceValue, key) => {
    var destinationValue = destination[key];
    if (!_.isEqual(sourceValue, destinationValue)) {
      result[key] = destinationValue;
    }
  });

  return result;
};

/**
 * Utility function to get whether page has changed or not
 *
 * @param  {Object} oldProps
 * @param  {[type]} newProps
 *
 * @return {Boolean}
 */
utils.isOnSamePage = (oldProps, newProps) => {
  return oldProps.location === newProps.location;
}

/**
 * Utility function to strip trailing slashes from a string
 *
 * @param  {str} string
 *
 * @return {String}
 */
utils.stripTrailingSlash = (str) => {
  return str.replace(/\/$/, '');
}

utils.buildExceptionDetails = () =>{
  return {
    href: window.location.href,
    stack: console.trace()
  };
};

utils.stringifyErrorData = data => {
  if(_.isEmpty(data)){
    return '';
  }

  if (_.isPlainObject(data)) {
    return JSON.stringify(data);
  }
  else {
    return data.toString();
  }
};

utils.getInviteEmail = function(location) {
  if (location && location.query) {

    let { inviteEmail } = location.query;

    if (!_.isEmpty(inviteEmail)) {
      // all standard query string parsers transform + to a space
      // so we reverse and swap spaces for +
      // in order to allow e-mails with mutators (e.g., +skip) to pass waitlist
      inviteEmail = inviteEmail.replace(/\s/, '+');

      if (utils.validateEmail(inviteEmail)) {
        return inviteEmail;
      }
    }
  }
  return null;
}

utils.getDonationAccountCodeFromEmail = function(email) {
  let matches = email.match(/\+(.*)@/) || [];
  return matches[1] || null;
}

utils.hasVerifiedEmail = function(user) {
  return (user.emailVerified);
}

utils.getSignupKey = function(location) {
  if (location && location.query) {
    let { signupKey } = location.query;

    if(!_.isEmpty(signupKey)){
      return signupKey;
    }
  }
  return false;
}

utils.getSignupEmail = function (location) {
  if (location && location.query) {
    let { signupEmail } = location.query;
    if (!_.isEmpty(signupEmail)) {
      // all standard query string parsers transform + to a space
      // so we reverse and swap spaces for +
      // in order to allow e-mails with mutators (e.g., +skip) to pass waitlist
      signupEmail = signupEmail.replace(/\s/, '+');

      if (utils.validateEmail(signupEmail)) {
        return signupEmail;
      }
    }
  }
  return null;
};

utils.getInviteKey = function(location) {
  if (location && location.query) {
    let { inviteKey } = location.query;

    if(!_.isEmpty(inviteKey)){
      return inviteKey;
    }
  }
  return '';
}

utils.getRoles = function(location) {
  if (location && location.query) {
    let { roles } = location.query;

    if(!_.isEmpty(roles)){
      let rolesFiltered = _.reject(_.map(roles.split(','), _.trim), _.isEmpty);

      if(!_.isEmpty(rolesFiltered)){
        return rolesFiltered;
      }
    }
  }
  return [];
}

utils.getCarelink = function(location) {
  if (location && location.query) {
    let { carelink } = location.query;

    if (!_.isUndefined(carelink)) {
      return carelink;
    }
  }
  return null;
}

utils.getDexcom = function(location) {
  if (location && location.query) {
    let { dexcom } = location.query;

    if (!_.isUndefined(dexcom)) {
      return dexcom;
    }
  }
  return null;
}

/**
 * Translate a BG value to the desired target unit
 *
 * @param {Number} a bg value
 * @param {String} one of [mg/dL, mmol/L] the units to convert to
 *
 * @return {Number} the converted value
 */
utils.translateBg = (value, targetUnits) => {
  if (targetUnits === MGDL_UNITS) {
    return parseInt(Math.round(value * MGDL_PER_MMOLL), 10);
  }
  return parseFloat((value / MGDL_PER_MMOLL).toFixed(1));
}

/**
 * Round a target BG value as appropriate
 * mg/dL - to the nearest 5
 * mmol/L - to the nearest .1
 *
 * @param {Number} a bg value
 * @param {String} one of [mg/dL, mmol/L] the units to convert to
 *
 * @return {Number} the converted value
 */
utils.roundBgTarget = (value, units) => {
  const nearest = units === MGDL_UNITS ? 5 : 0.1;
  const precision = units === MGDL_UNITS ? 0 : 1;
  return parseFloat((nearest * Math.round(value / nearest)).toFixed(precision));
}

utils.processPatientData = (comp, data, queryParams, settings) => {
  if (!(data && data.length >= 0)) {
    return null;
  }

  var timePrefsForTideline;
  function setNewTimePrefs(timezoneName) {
    try {
      sundial.checkTimezoneName(timezoneName);
      timePrefsForTideline = {
        timezoneAware: true,
        timezoneName: timezoneName
      };
    }
    catch(err) {
      console.log(err);
      console.log('Not a valid timezone! Defaulting to timezone-naive display.');
      timePrefsForTideline = {};
    }
  }

  var mostRecentUpload = _.sortBy(_.filter(data, {type: 'upload'}), (d) => Date.parse(d.time)).reverse()[0];
  if (!_.isEmpty(mostRecentUpload) && !_.isEmpty(mostRecentUpload.timezone)) {
    setNewTimePrefs(mostRecentUpload.timezone);
  } else {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // eslint-disable-line new-cap
    if (!_.isEmpty(timezone)) {
      setNewTimePrefs(timezone);
    }
  }

  // a timezone in the queryParams always overrides any other timePrefs
  if (!_.isEmpty(queryParams.timezone)) {
    setNewTimePrefs(queryParams.timezone);
    console.log('Displaying in timezone from query params:', queryParams.timezone);
  }
  else if (!_.isEmpty(mostRecentUpload) && !_.isEmpty(mostRecentUpload.timezone)) {
    console.log('Defaulting to display in timezone of most recent upload at', mostRecentUpload.time, mostRecentUpload.timezone);
  }
  else {
    console.log('Falling back to display in browser timezone.');
  }
  if (!_.isEmpty(timePrefsForTideline)) {
    comp.setState({
      timePrefs: timePrefsForTideline
    });
  }

  console.time('Nurseshark Total');
  var bgUnits = settings.units.bg || MGDL_UNITS;
  var bgClasses = {
    low: { boundary: utils.roundBgTarget(settings.bgTarget.low, bgUnits) },
    target: { boundary: utils.roundBgTarget(settings.bgTarget.high, bgUnits) },
  };

  // Allow overriding stored BG Unit preferences via query param
  const bgUnitsFormatted = bgUnits.replace('/', '').toLowerCase();
  if (!_.isEmpty(queryParams.units) && queryParams.units !== bgUnitsFormatted && _.includes([ 'mgdl', 'mmoll' ], queryParams.units)) {
    bgUnits = queryParams.units === 'mmoll' ? MMOLL_UNITS : MGDL_UNITS;
    bgClasses.low.boundary = utils.roundBgTarget(utils.translateBg(settings.bgTarget.low, bgUnits), bgUnits);
    bgClasses.target.boundary = utils.roundBgTarget(utils.translateBg(settings.bgTarget.high, bgUnits), bgUnits);
    console.log(`Displaying BG in ${bgUnits} from query params`);
  }


  var res = nurseShark.processData(data, bgUnits);
  console.timeEnd('Nurseshark Total');
  console.time('TidelineData Total');
  var tidelineData = new TidelineData(res.processedData, {
    timePrefs: timePrefsForTideline,
    bgUnits,
    bgClasses,
  });
  console.timeEnd('TidelineData Total');

  window.tidelineData = tidelineData;
  window.downloadProcessedData = () => {
    console.save(res.processedData, 'nurseshark-output.json');
  };
  window.downloadErroredData = () => {
    console.save(res.erroredData, 'errored.json');
  };

  return tidelineData;
};


// from http://bgrins.github.io/devtools-snippets/#console-save
// MIT license
(function(console) {

  console.save = function(data, filename){

    if(!data) {
      console.error('Console.save: No data');
      return;
    }

    if(!filename) filename = 'blip-output.json';

    if(typeof data === 'object'){
      data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], {type: 'text/json'});
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  };
})(console);

utils.getLatestGithubRelease = (releases) => {
  const latestRelease = _.filter(releases, {prerelease: false})[0];
  let latestTag = latestRelease.tag_name;
  const urlBase = `https://github.com/tidepool-org/chrome-uploader/releases/download/${latestTag}`;
  latestTag = latestTag.substr(1);
  const latestWinRelease = `${urlBase}/tidepool-uploader-setup-${latestTag}.exe`;
  const latestMacRelease = `${urlBase}/tidepool-uploader-${latestTag}.dmg`;
  return {
    latestWinRelease: latestWinRelease,
    latestMacRelease: latestMacRelease,
  };
}

module.exports = utils;
