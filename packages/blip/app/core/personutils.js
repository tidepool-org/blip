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

import _ from 'lodash';
import i18next from 'i18next';
import sundial from 'sundial';

import config from '../config';

const personUtils = {
  /** @returns {string} */
  fullName: (person) => {
    const firstName = personUtils.firstName(person);
    const lastName = personUtils.lastName(person);
    if (firstName.length > 0) {
      return `${firstName} ${lastName}`;
    }
    return lastName;
  },
  /** @returns {string} */
  firstName: (person) => {
    return person?.profile?.firstName ?? "";
  },
  /** @returns {string} */
  lastName: (person) => {
    return person?.profile?.lastName ?? person?.profile?.fullName ?? person?.username ?? "";
  },
};

personUtils.patientInfo = (person) => {
  return _.get(person, 'profile.patient');
};

personUtils.hasAcceptedTerms = (person) => {
  let latestTermsDate = new Date(config.LATEST_TERMS);
  if (isNaN(latestTermsDate.getTime())) {
    // Set an invalid latestTermsDate to be Epoch 0
    latestTermsDate = new Date(0);
  }
  // A `null` is fine here, because `new Date(null).valueOf() === 0`
  let acceptDate = new Date(_.get(person, 'termsAccepted', null));
  if (isNaN(acceptDate.getTime())) {
    // if acceptDate is not a valid formatted date string, get user to re-accept terms
    acceptDate = new Date(0);
  }
  return (acceptDate.valueOf() > 0 && acceptDate >= latestTermsDate);
};

personUtils.isPatient = (person) => {
  return Boolean(personUtils.patientInfo(person));
};

personUtils.isClinic = (user) => {
  return _.indexOf(_.get(user, 'roles', []), 'clinic') !== -1;
};

personUtils.haveClinicProfile = (user) => _.get(user, 'profile.clinic', false) !== false;

personUtils.isDataDonationAccount = (account) => {
  const username = account.username || account.email || '';
  return /^bigdata(.+)?@tidepool\.org$/.test(username);
};

personUtils.patientFullName = (person) => {
  return personUtils.fullName(person);
};

personUtils.patientFirstName = (person) => {
  if (personUtils.patientIsOtherPerson(person)) {
    return _.get(person, 'profile.patient.firstName', personUtils.firstName(person));
  }
  return personUtils.firstName(person);
};

personUtils.patientLastName = (person) => {
  if (personUtils.patientIsOtherPerson(person)) {
    return _.get(person, 'profile.patient.lastName', personUtils.lastName(person));
  }
  return personUtils.lastName(person);
};

personUtils.patientIsOtherPerson = (person) => {
  return Boolean(_.get(person, 'profile.patient.isOtherPerson'));
};

personUtils.isOnlyCareGiver = (person) => {
  return Boolean(_.get(person, 'profile.isOnlyCareGiver'));
};

personUtils.isSame = (first, second) => {
  first = first || {};
  second = second || {};

  if (!(first.userid && second.userid)) {
    return false;
  }

  return (first.userid === second.userid);
};

personUtils.hasEditPermissions = (person) => {
  return (person && !_.isEmpty(person.permissions) && person.permissions.root);
};

personUtils.isRemoveable = (person) => {
  return (person && !_.isEmpty(person.permissions) && !person.permissions.root);
};

/**
   * Validate the form data
   *  - name has to be present (can only not be present if user is not patient)
   *  - date of birth needs to be a valid date, and not in the future
   *  - diagnosis date need to be a valid date, and not in the future, and not before date of birth
   *
   * @param  {Object} formValues
   * @param  {Boolean} isNameRequired
   * @param  {String} dateFormat of input
   * @param  {Date|null} currentDate mainly for testing purposes
   *
   * @return {String|undefined} returns a string if there is an error
   */
personUtils.validateFormValues = (formValues, isNameRequired, dateFormat, currentDateObj) => {
  const t = i18next.t.bind(i18next);
  let validationErrors = {};

  const INVALID_DATE_TEXT = t('Hmm, this date doesn’t look right');
  const OUT_OF_ORDER_TEXT = t('Hmm, diagnosis date usually comes after birthday');

  if (isNameRequired) {
    if (!formValues.firstName) {
      validationErrors.firstName = t('First name is required');
    }
    if (!formValues.lastName) {
      validationErrors.lastName = t('Last name is required');
    }
  }

  const birthday = formValues.birthday;
  if (!(birthday && sundial.isValidDateForMask(birthday, dateFormat))) {
    validationErrors.birthday = INVALID_DATE_TEXT;
  }

  // moving to make diagnosisDate optional so we can use this to verify custodial accounts
  const diagnosisDate = formValues.diagnosisDate;
  if (diagnosisDate && !(diagnosisDate && sundial.isValidDateForMask(diagnosisDate, dateFormat))) {
    validationErrors.diagnosisDate = INVALID_DATE_TEXT;
  }

  const now = new Date();
  currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var birthdayDateObj = birthday && sundial.parseFromFormat(birthday, dateFormat);
  var diagnosisDateObj = diagnosisDate && sundial.parseFromFormat(diagnosisDate, dateFormat);

  if (!validationErrors.birthday && birthdayDateObj > currentDateObj) {
    validationErrors.birthday = INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && diagnosisDateObj > currentDateObj) {
    validationErrors.diagnosisDate = INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && birthdayDateObj > diagnosisDateObj) {
    validationErrors.diagnosisDate = OUT_OF_ORDER_TEXT;
  }

  const maxLength = 256;
  const about = formValues.about;
  if (about && about.length > maxLength) {
    validationErrors.about = t('Please keep "about" text under {{maxLength}} characters', {maxLength});
  }

  return validationErrors;
};

export default personUtils;
