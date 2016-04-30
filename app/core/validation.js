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
import * as errors from './validation/errors';

import config from '../config';

// ensure config vars are defined
export const ABOUT_MAX_LENGTH = config.ABOUT_MAX_LENGTH || 256;
export const PASSWORD_MIN_LENGTH = config.PASSWORD_MIN_LENGTH || 8;
export const PASSWORD_MAX_LENGTH = config.PASSWORD_MAX_LENGTH  || 72;

/**
 * Validation response when a field passes the validation checks
 * 
 * @return {Object}
 */
export const valid = () => ({
  valid: true,
  message: null
});

/**
 * Validation response when a field fails the validation checks
 * 
 * @param  {String} message error message that will be displayed in the form
 * 
 * @return {Object}
 */
export const invalid = (message) => ({
  valid: false,
  message: message
});

/**
 * The date type validator. N.B It is has been extracted from inline definition in type
 * validators due to it being used inside of another.
 * 
 * @param  {String} fieldLabel
 * @param  {Object} fieldValue
 * @param  {Object} currentDateObj for testing purposes
 * @return {Object}
 */
const dateValidator = (fieldLabel, fieldValue, currentDateObj) => {
  let now = new Date();
  let dateMask = 'M-D-YYYY';
  let dateString;

  currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  if (!fieldValue) {
    return invalid(errors.isRequired(fieldLabel));
  }

  if (!fieldValue.day || !fieldValue.month || !fieldValue.year) {
    return invalid(errors.incompleteDate(fieldLabel));
  }

  let month = parseInt(fieldValue.month, 10) + 1; // month is zero indexed

  dateString = `${month}-${fieldValue.day}-${fieldValue.year}`;
  if (!sundial.isValidDateForMask(dateString, dateMask)) {
    return invalid(errors.invalidDate());
  }

  if (currentDateObj < sundial.parseFromFormat(dateString, dateMask)) {
    return invalid(errors.futureDate(fieldLabel));
  }

  return valid();
};

/**
 * Map of type validators for use in validateField()
 * 
 * @type {Object}
 */
export const typeValidators = {
  name: (fieldLabel, fieldValue) => {
    if (!fieldValue || fieldValue.length === 0) {
      return invalid(errors.isRequired(fieldLabel));
    }
    return valid();
  },
  about: (fieldLabel, fieldValue) => {
    if (fieldValue && fieldValue.length > ABOUT_MAX_LENGTH) {
      return invalid(errors.isTooLong(ABOUT_MAX_LENGTH, fieldLabel));
    }

    return valid();
  },
  email: (fieldLabel, fieldValue) => {
    if (!fieldValue || fieldValue.length === 0) {
      return invalid(errors.isRequired(fieldLabel));
    }

    if (!validateEmail(fieldValue)) {
      return invalid(errors.invalidEmail(fieldLabel));
    }

    return valid();
  },
  password: (fieldLabel, fieldValue) => {
    if (!fieldValue || fieldValue.length === 0) {
      return invalid(errors.isRequired(fieldLabel));
    }

    if (/\s/g.test(fieldValue)) { //check for white-space (spaces, tabs)
      return invalid(errors.containsWhiteSpaces(fieldLabel));
    }

    if (fieldValue.length < PASSWORD_MIN_LENGTH) {
      return invalid(errors.isTooShort(PASSWORD_MIN_LENGTH, fieldLabel));
    }

    if (fieldValue.length > PASSWORD_MAX_LENGTH) {
      return invalid(errors.isTooLong(PASSWORD_MAX_LENGTH, fieldLabel));
    }

    return valid();
  },
  confirmPassword: (fieldLabel, fieldValue, prerequisites) => {
    if (!prerequisites.password || prerequisites.password.length === 0) {
      return invalid(errors.noPassword());
    }

    if (prerequisites.password !== fieldValue) {
      return invalid(errors.passwordsDontMatch());
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
      return invalid(errors.noBirthday());
    }

    if (!dateValidator('', prerequisites.birthday).valid) {
      return invalid(errors.invalidBirthday());
    }

    birthdayDateString = `${prerequisites.birthday.month}-${prerequisites.birthday.day}-${prerequisites.birthday.year}`
    birthdayObj = sundial.parseFromFormat(birthdayDateString, dateMask);

    diagnosisDateString = `${fieldValue.month}-${fieldValue.day}-${fieldValue.year}`
    diagnosisDateObj = sundial.parseFromFormat(diagnosisDateString, dateMask);

    if (birthdayObj > diagnosisDateObj) {
      return invalid(errors.mustBeAfterBirthday(fieldLabel));
    }

    return valid();
  }
};

/**
 * Validates a single form field
 * 
 * @param  {String} type          
 * @param  {String} fieldLabel
 * @param  {String|Number|Object} fieldValue
 * @param  {Object|null} prerequisites
 * @return {Object}               either the results of invalid(message) or valid()
 */
export const validateField = (type, fieldLabel, fieldValue, prerequisites) => {
  if(!typeValidators[type]) { // @TODO: Gordon Dent: at present we do not have generic validation, we may way to add this
    return valid();
  }
  return typeValidators[type](fieldLabel, fieldValue, prerequisites);
};

/**
 * Validates an array of fields
 * 
 * @param  {Array} form 
 * 
 * @return {Object} an object which is either empty (valid form) or contains entries for field names with error messages
 */
export const validateForm = (form) => {
  if (!form) { // @TODO: Gordon Dent: may want to check if not object too
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