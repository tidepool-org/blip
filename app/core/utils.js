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
import moment from 'moment';
import { format } from 'd3-format';

import { MGDL_UNITS, MMOLL_UNITS, MGDL_PER_MMOLL } from './constants';
import { utils as vizUtils } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;
import personUtils from '../core/personutils';

// TODO: Move
import { TARGET_RANGE_PRESET } from '../components/clinic/PatientForm/SelectTargetRangePreset';

const {
  DEFAULT_BG_BOUNDS,
  ADA_STANDARD_BG_BOUNDS,
  HIGH_RISK_BG_BOUNDS,
  PREGNANCY_T1_BG_BOUNDS,
  GESTATIONAL_T2_BG_BOUNDS,
 } = vizUtils.constants;

const utils = {};

utils.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

utils.isSupportedBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  const isOpera = userAgent.indexOf('opr') > -1;
  const isBrave = userAgent.indexOf('brave') > -1;
  const isFirefox = userAgent.indexOf('firefox') > -1;
  const isFirefoxIOS = userAgent.indexOf('fxios') > -1;

  if (isOpera || isBrave || isFirefox || isFirefoxIOS) return false;

  const isEdgeIOS = userAgent.indexOf('edgios') > -1;
  const isChrome = userAgent.indexOf('chrome') > -1;
  const isChromeIOS = userAgent.indexOf('crios') > -1;
  const isSafariIOS = userAgent.indexOf('safari') > -1 && /iphone|ipad/.test(userAgent);

  if (isChrome || isChromeIOS || isEdgeIOS || isSafariIOS) return true;

  return false;
};

utils.isMobile = () => {
  var userAgent = navigator.userAgent.toLowerCase();

  const isIOSDevice = /iphone|ipad/.test(userAgent);

  if (isIOSDevice) return true;

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
  return null;
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

utils.getMedtronic = function(location) {
  if (location && location.query) {
    let { medtronic } = location.query;

    if (!_.isUndefined(medtronic)) {
      return medtronic;
    }
  }
  return null;
}

utils.getCBGFilter = function(location) {
  if (location && location.query) {
    let { cbgFilter } = location.query;

    if (!_.isUndefined(cbgFilter)) {
      return cbgFilter;
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
 * Round to the nearest increment
 *
 * @param {Number} value a numerical value to round
 * @param {String} nearest increment to round to
 */
utils.roundToNearest = (value, nearest) => {
  const [units, decimals = ''] = nearest.toString().split('.');
  return parseFloat((nearest * Math.round(value / nearest)).toFixed(decimals.length));
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
  return utils.roundToNearest(value, nearest);
}

utils.getTimePrefsForDataProcessing = (latestTimeZone, queryParams) => {
  var timePrefsForTideline;
  var browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    sundial.checkTimezoneName(browserTimezone);
  } catch (err) {
    browserTimezone = false;
  }

  function setNewTimePrefs(timezoneName, fallbackToBrowserTimeZone = true) {
    try {
      sundial.checkTimezoneName(timezoneName);
      timePrefsForTideline = {
        timezoneAware: true,
        timezoneName: timezoneName
      };
    } catch(err) {
      if (fallbackToBrowserTimeZone && browserTimezone) {
        console.log('Not a valid timezone! Defaulting to browser timezone display:', browserTimezone);
        timePrefsForTideline = {
          timezoneAware: true,
          timezoneName: browserTimezone
        };
      }
      else {
        console.log('Not a valid timezone! Defaulting to timezone-naive display.');
        timePrefsForTideline = {
          timezoneAware: false,
        };
      }
    }
  }

  // a timezone in the queryParams always overrides any other timePrefs
  if (!_.isEmpty(queryParams.timezone)) {
    setNewTimePrefs(queryParams.timezone, false);
    console.log('Displaying in timezone from query params:', queryParams.timezone);
  }
  else if (latestTimeZone?.name) {
    setNewTimePrefs(latestTimeZone.name);
    console.log(`${latestTimeZone.message}:`, latestTimeZone.name);
  }
  else if (browserTimezone) {
    setNewTimePrefs(browserTimezone);
    console.log('Falling back to browser timezone:', browserTimezone);
  }
  else {
    console.log('Falling back to timezone-naive display.');
  }
  return timePrefsForTideline;
};

utils.getBgPrefs = (
  patientSettings,
  clinicPatient,
  bgUnitsOverride = {}, // { units: 'mmoll' | 'mgdl', source: String }
) => {
  let bgUnits = null;
  let targetRange = 'ADA_STANDARD';
  let bgClasses = {
    'very-low': { boundary: null },
    'low': { boundary: null },
    'target': { boundary: null },
    'high': { boundary: null },
    'very-high': { boundary: null },
  };

  // If bgUnits overriden, use those. Otherwise, check if patient has preferred bgUnits.
  if (!!bgUnitsOverride.units) {
    bgUnits = bgUnitsOverride.units?.replace('/', '').toLowerCase() === 'mmoll' ? MMOLL_UNITS : MGDL_UNITS;
  } else {
    bgUnits = patientSettings?.units?.bg || MGDL_UNITS;
  }

  const bounds = (() => {
    // If user is a PwD and they have self-specified targets, use them.
    if (!!patientSettings?.bgTarget) {
      let low = patientSettings?.bgTarget?.low;
      let high = patientSettings?.bgTarget?.high;
      let isUnitDifferent = patientSettings?.units?.bg !== bgUnits;

      // If differing units btwn clinic & patient, translate the bg first
      if (!!low && isUnitDifferent) low = utils.translateBg(low, bgUnits);
      if (!!high && isUnitDifferent) high = utils.translateBg(high, bgUnits);

      // If a value is missing, fall back to defaults
      low ||= DEFAULT_BG_BOUNDS[bgUnits].targetLowerBound;
      high ||= DEFAULT_BG_BOUNDS[bgUnits].targetUpperBound;

      // Round in case translation produces units that have too many decimals
      low = utils.roundBgTarget(low, bgUnits);
      high = utils.roundBgTarget(high, bgUnits);

      return ({
        veryLowThreshold: DEFAULT_BG_BOUNDS[bgUnits].veryLowThreshold,
        targetLowerBound: low,
        targetUpperBound: high,
        veryHighThreshold: DEFAULT_BG_BOUNDS[bgUnits].veryHighThreshold,
      });
    }

    // Use clinic-designated range for patient or fall back to default.
    const targetRange = clinicPatient?.glycemicRanges || TARGET_RANGE_PRESET.STANDARD;

    switch(targetRange) {
      case TARGET_RANGE_PRESET.HIGH_RISK:   return HIGH_RISK_BG_BOUNDS[bgUnits];
      case TARGET_RANGE_PRESET.PREGNANCY:   return PREGNANCY_T1_BG_BOUNDS[bgUnits];
      case TARGET_RANGE_PRESET.GESTATIONAL: return GESTATIONAL_T2_BG_BOUNDS[bgUnits];
      case TARGET_RANGE_PRESET.STANDARD:    return DEFAULT_BG_BOUNDS[bgUnits];
      default:                              return DEFAULT_BG_BOUNDS[bgUnits];
    }
  })();

  bgClasses['very-low'].boundary = bounds.veryLowThreshold;
  bgClasses['low'].boundary      = bounds.targetLowerBound;
  bgClasses['target'].boundary   = bounds.targetUpperBound;
  bgClasses['high'].boundary     = bounds.veryHighThreshold;

  return {
    bgClasses,
    bgUnits,
  };
};

utils.getBGPrefsForDataProcessing = (patientSettings, { units: overrideUnits, source: overrideSource }) => {
  // Allow overriding stored BG Unit preferences via query param or preferred clinic BG units
  // If no override is specified, use patient settings units if availiable, otherwise 'mg/dL'
  const patientSettingsBgUnits = patientSettings?.units?.bg || MGDL_UNITS;

  const bgUnits = overrideUnits
    ? (overrideUnits?.replace('/', '').toLowerCase() === 'mmoll' ? MMOLL_UNITS : MGDL_UNITS)
    : patientSettingsBgUnits;

  const settingsOverrideActive = patientSettingsBgUnits !== bgUnits;
  const low = _.get(patientSettings, 'bgTarget.low', DEFAULT_BG_BOUNDS[bgUnits].targetLowerBound);
  const high = _.get(patientSettings, 'bgTarget.high', DEFAULT_BG_BOUNDS[bgUnits].targetUpperBound);

  var bgClasses = {
    low: {
      boundary: utils.roundBgTarget(
        settingsOverrideActive && patientSettings?.bgTarget?.low ? utils.translateBg(patientSettings.bgTarget.low, bgUnits) : low,
        bgUnits
      )
    },
    target: {
      boundary: utils.roundBgTarget(
        settingsOverrideActive && patientSettings?.bgTarget?.high ? utils.translateBg(patientSettings.bgTarget.high, bgUnits) : high,
        bgUnits
      )
    },
  };

  if (settingsOverrideActive) console.log(`Displaying BG in ${bgUnits} from ${overrideSource}`);

  return {
    bgUnits,
    bgClasses,
  };
}

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

utils.getUploaderDownloadURL = (releases) => {
  const latestRelease = _.filter(releases, {prerelease: false})[0];
  let latestTag = latestRelease.tag_name;
  const urlBase = 'https://github.com/tidepool-org/uploader/releases/latest/download';
  latestTag = latestTag.substr(1);
  const latestWinRelease = `${urlBase}/tidepool-uploader-setup-${latestTag}.exe`;
  const latestMacRelease = `${urlBase}/tidepool-uploader-${latestTag}.dmg`;
  return {
    latestWinRelease: latestWinRelease,
    latestMacRelease: latestMacRelease,
  };
}

utils.readableStatName = statId => ({
  readingsInRange: 'Readings in range',
  timeInAuto: 'Time in automation',
  timeInOverride: 'Time in activity',
  timeInRange: 'Time in range',
  totalInsulin: 'Insulin ratio',
}[statId] || statId);

utils.readableChartName = chartType => ({
  basics: 'Basics',
  bgLog: 'BG log',
  daily: 'Daily',
  trends: 'Trends',
}[chartType] || chartType);

utils.formatDecimal = (val, precision) => {
  if (precision === null || precision === undefined) {
    return bankersRound(val).toString();
  }
  return bankersRound(val, precision).toFixed(precision);
};

utils.roundToPrecision = (value, precision = 0) => {
  const shift = precision > 0 ? 10 ** precision : 1;
  return Math.round(value * shift) / shift;
};

utils.roundUp = (value, precision = 0) => {
  const shift = precision > 0 ? 10 ** precision : 1;
  return Math.ceil(value * shift) / shift;
};

utils.roundDown = (value, precision = 0) => {
  const shift = precision > 0 ? 10 ** precision : 1;
  return Math.floor(value * shift) / shift;
};

utils.parseDatetimeParamToInteger = (queryParam) => {
  if (!queryParam) return null;

  if (_.isInteger(queryParam)) return queryParam;

  // arg can be a string representation of an integer, e.g. '1690135500000'
  if (_.toInteger(queryParam)) {
    return _.toInteger(queryParam);
  }

  // arg can be an ISO string, e.g. '2023-07-20T16:00:00.000Z'
  if (_.isString(queryParam)) {
    return Date.parse(queryParam) || null;
  }

  return null;
};

utils.compareLabels = (string1, string2) => {
  if (!string1 && !string2) return 0;
  if (!string1 && string2) return -1;
  if (string1 && !string2) return 1;

  return string1.localeCompare(string2, undefined, { caseFirst: 'upper', numeric: true });
};

export default utils;
