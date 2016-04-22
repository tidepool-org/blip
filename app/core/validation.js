/**
 * Copyright (c) 2016, Tidepool Project
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

import _ from 'lodash';

import sundial from 'sundial';

import { capitalize, validateEmail } from './utils';

import config from '../config';

// make sure these are in config and come from config
export const ABOUT_MAX_LENGTH = config.ABOUT_MAX_LENGTH || 256;
export const PASSWORD_MIN_LENGTH = config.PASSWORD_MIN_LENGTH || 8;
export const PASSWORD_MAX_LENGTH = config.PASSWORD_MAX_LENGTH  || 72;

export const valid = () => ({
  valid: true,
  message: null
});

export const invalid = (message) => ({
  valid: false,
  message: message
});

const dateValidator = (fieldLabel, fieldValue, currentDateObj) => {
  let now = new Date();
  let dateMask = 'M-D-YYYY';
  let dateString;

  currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  if (!fieldValue) {
    return invalid(capitalize(`${fieldLabel} is required.`));
  }

  if (!fieldValue.day || !fieldValue.month || !fieldValue.year) {
    return invalid(capitalize(`${fieldLabel} is not a complete date.`));
  }

  dateString = `${fieldValue.month}-${fieldValue.day}-${fieldValue.year}`;
  if (!sundial.isValidDateForMask(dateString, dateMask)) {
    return invalid('Hmm, this date doesn’t look right');
  }

  if (currentDateObj < sundial.parseFromFormat(dateString, dateMask)) {
    return invalid(capitalize(`${fieldLabel} cannot be in the future!`));
  }

  return valid();
};

const passwordValidator = (fieldLabel, fieldValue) => {
  if (!fieldValue || fieldValue.length === 0) {
    return invalid(capitalize(`${fieldLabel} is required.`));
  }

  if (/\s/g.test(fieldValue)) { //check for white-space (spaces, tabs)
    return invalid(capitalize(`${fieldLabel} must not contain white spaces.`));
  }

  if (fieldValue.length < PASSWORD_MIN_LENGTH) {
    return invalid(capitalize(`${fieldLabel} must be at least ${PASSWORD_MIN_LENGTH} characters long.`));
  }

  if (fieldValue.length > PASSWORD_MAX_LENGTH) {
    return invalid(capitalize(`${fieldLabel} must be at most ${PASSWORD_MAX_LENGTH} characters long.`));
  }

  return valid();
};

export const typeValidators = {
  name: (fieldLabel, fieldValue) => {
    if (!fieldValue || fieldValue.length === 0) {
      return invalid(capitalize(`${fieldLabel} is required.`));
    }
    return valid();
  },
  about: (fieldLabel, fieldValue) => {    
    if (fieldValue && fieldValue.length > ABOUT_MAX_LENGTH) {
      return invalid(`Please keep ${fieldLabel} text under ${ABOUT_MAX_LENGTH} characters.`);
    }

    return valid();
  },
  email: (fieldLabel, fieldValue) => {
    if (!fieldValue || fieldValue.length === 0) {
      return invalid(capitalize(`${fieldLabel} is required.`));
    }

    if (!validateEmail(fieldValue)) {
      return invalid(`Invalid ${fieldLabel}.`);
    }

    return valid();
  },
  password: passwordValidator,
  confirmPassword: (fieldLabel, fieldValue, prerequisites) => {
    if (!prerequisites.password || prerequisites.password.length === 0) {
      return invalid('You have not entered a password.');
    }

    if (prerequisites.password !== fieldValue) {
      return invalid('Passwords don\'t match.');
    }

    return valid();
  },
  date: dateValidator,
  diagnosisDate: (fieldLabel, fieldValue, prerequisites) => {
    let dateMask = 'M-D-YYYY';
    let validDateCheck = dateValidator(fieldLabel, fieldValue);
    let birthdayObj, birthdayDateString;
    let diagnosisDateObj, diagnosisDateString;
    if (!validDateCheck.valid) {
      return validDateCheck;
    }

    if (!prerequisites.birthday) {
      return invalid('You have not specified your birthday!');
    }

    if (!dateValidator('', prerequisites.birthday).valid) {
      return invalid('You have not specified a valid birthday!');
    }

    birthdayDateString = `${prerequisites.birthday.month}-${prerequisites.birthday.day}-${prerequisites.birthday.year}`
    birthdayObj = sundial.parseFromFormat(birthdayDateString, dateMask);

    diagnosisDateString = `${fieldValue.month}-${fieldValue.day}-${fieldValue.year}`
    diagnosisDateObj = sundial.parseFromFormat(diagnosisDateString, dateMask);

    if (birthdayObj > diagnosisDateObj) {
      return invalid(`Hmm, ${fieldLabel} usually comes after birthday.`)
    }

    return valid();
  }
};

export const validateField = (type, fieldLabel, fieldValue, prerequisites) => {
  if(!typeValidators[type]) { // Gordon Dent: at present we do not have generic validation, we may way to add this
    return valid();
  }
  return typeValidators[type](fieldLabel, fieldValue, prerequisites);
};

export const validateForm = (form) => {
  if (!form) { // Gordon Dent: may want to check if not object too
    return {};
  }

  return form
    .map((field) => {
      let result = validateField(field.type, field.label, field.value, field.prerequisites);
      result.name = field.name;

      return result;
    })
    .filter((result) => !result.valid)
    // add comment here about component expectation
    .reduce((reduction, result) => {
      reduction[result.name] = result.message;
      return reduction;
    }, {});
};