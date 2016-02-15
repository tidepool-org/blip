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

var utils = {};

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
  return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
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
  return (oldProps.location.pathname === newProps.location.pathname);
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

/**
 * Because testing users who have email addresses with +skip do not have emailVerified set,
 * we need to create a function that validates whether a user either has a verified email, 
 * or uses this type of email in order to not show the verify message to users all the time!
 * 
 * @param  {Object}  user
 * @return {Boolean}
 */
utils.hasVerifiedEmail = function(user) {
  return (user.emailVerified || user.username.indexOf('+skip@') !== -1);
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
    if (!_.isEmpty(signupEmail) && utils.validateEmail(signupEmail)){
      return signupEmail;
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

utils.processPatientData = (data, queryParams, timePrefs, bgPrefs) => {
  if (!(data && data.length >= 0)) {
    return null;
  }

  var mostRecentUpload = _.sortBy(_.where(data, {type: 'upload'}), (d) => Date.parse(d.time) ).reverse()[0];
  var timePrefsForTideline;
  if (!_.isEmpty(mostRecentUpload) && !_.isEmpty(mostRecentUpload.timezone)) {
    try {
      sundial.checkTimezoneName(mostRecentUpload.timezone);
      timePrefsForTideline = {
        timezoneAware: true,
        timezoneName: mostRecentUpload.timezone
      };
    }
    catch(err) {
      console.log(err);
      console.log('Upload metadata lacking a valid timezone!', mostRecentUpload);
    }
  }

  // if the user has put a timezone in the query params
  // it'll be stored already in the state, and we just keep using it
  if (!_.isEmpty(queryParams.timezone) || _.isEmpty(timePrefsForTideline)) {
    timePrefsForTideline = timePrefs;
  }
  // but otherwise we use the timezone from the most recent upload metadata obj
  else {
    // @todo: need to figure out a way to refactor this bit of shenanigans
    // comp.setState({
    //   timePrefs: timePrefsForTideline
    // });
    console.log('Defaulting to display in timezone of most recent upload at', mostRecentUpload.time, mostRecentUpload.timezone);
  }

  console.time('Nurseshark Total');
  var res = nurseShark.processData(data, bgPrefs.bgUnits);
  console.timeEnd('Nurseshark Total');
  console.time('TidelineData Total');
  var tidelineData = new TidelineData(res.processedData, {
    timePrefs: timePrefs,
    bgUnits: bgPrefs.bgUnits
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

    var blob = new Blob([data], {type: 'text/json'}),
      e    = document.createEvent('MouseEvents'),
      a    = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  };
})(console);

module.exports = utils;
