import _ from 'lodash';
import sundial from 'sundial';

import config from '../config';
import utils from './utils';
import i18next from './language';

const t = i18next.t.bind(i18next);

// date masks we use
const FORM_DATE_FORMAT = t('MM/DD/YYYY');
const SERVER_DATE_FORMAT = 'YYYY-MM-DD';

import { MGDL_UNITS, MMOLL_UNITS } from './constants';

let personUtils = {};

personUtils.INVALID_DATE_TEXT = t('Please enter dates using MM/DD/YYYY format');
personUtils.OUT_OF_ORDER_TEXT = t('Please enter a diagnosis date that comes after the birthday');

personUtils.fullName = (person) => {
  return utils.getIn(person, ['profile', 'fullName']);
};

personUtils.patientInfo = (person) => {
  return utils.getIn(person, ['profile', 'patient']);
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

personUtils.isClinicianAccount = (user) => {
  const userRoles = _.get(user, 'roles', []);
  return _.intersection(userRoles, ['clinic', 'migrated_clinic']).length > 0 || user?.isClinicMember;
};

personUtils.isDataDonationAccount = (account) => {
  const username = account.username || account.email || '';
  return /^bigdata(.+)?@tidepool\.org$/.test(username);
};

personUtils.patientFullName = (person) => {
  const profile = utils.getIn(person, ['profile'], {});
  const patientInfo = profile.patient || {};

  if (patientInfo.isOtherPerson) {
    return patientInfo.fullName;
  }

  return profile.fullName;
};

personUtils.patientIsOtherPerson = (person) => {
  return Boolean(utils.getIn(person, ['profile', 'patient', 'isOtherPerson']));
};

personUtils.isOnlyCareGiver = (person) => {
  return Boolean(utils.getIn(person, ['profile', 'isOnlyCareGiver']));
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
 * Toggle a patient's BG settings between mgd/L and mmol/L
 *
 * @param {Object} settings
 *
 * @return {Object} translated settings object if successful
 * @return {Boolean} false if unsuccessful
 */
personUtils.togglePatientBgUnits = (settings) => {
  const bgTargetHigh = _.get(settings, 'bgTarget.high');
  const bgTargetLow = _.get(settings, 'bgTarget.low');
  const bgUnits = _.get(settings, 'units.bg');

  if (!bgTargetHigh || !bgTargetLow || !bgUnits) {
    return false;
  }

  const targetUnits = bgUnits === MGDL_UNITS ? MMOLL_UNITS : MGDL_UNITS;

  return {
    bgTarget: {
      high: utils.translateBg(bgTargetHigh, targetUnits),
      low: utils.translateBg(bgTargetLow, targetUnits),
    },
    units: {
      bg: targetUnits,
    },
  };
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
  let validationErrors = {};

  // Legacy: revisit when proper "child accounts" are implemented
  if (isNameRequired && !formValues.fullName) {
    validationErrors.fullName = t('Full name is required');
  }

  const birthday = formValues.birthday;
  if (!(birthday && sundial.isValidDateForMask(birthday, dateFormat))) {
    validationErrors.birthday = personUtils.INVALID_DATE_TEXT;
  }

  // moving to make diagnosisDate optional so we can use this to verify custodial accounts
  const diagnosisDate = formValues.diagnosisDate;
  if (diagnosisDate && !(diagnosisDate && sundial.isValidDateForMask(diagnosisDate, dateFormat))) {
    validationErrors.diagnosisDate = personUtils.INVALID_DATE_TEXT;
  }

  const now = new Date();
  currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var birthdayDateObj = birthday && sundial.parseFromFormat(birthday, dateFormat);
  var diagnosisDateObj = diagnosisDate && sundial.parseFromFormat(diagnosisDate, dateFormat);

  if (!validationErrors.birthday && birthdayDateObj > currentDateObj) {
    validationErrors.birthday = personUtils.INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && diagnosisDateObj > currentDateObj) {
    validationErrors.diagnosisDate = personUtils.INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && birthdayDateObj > diagnosisDateObj) {
    validationErrors.diagnosisDate = personUtils.OUT_OF_ORDER_TEXT;
  }

  const maxLength = 256;
  const about = formValues.about;
  if (about && about.length > maxLength) {
    validationErrors.about = t('Please keep "about" text under {{maxLength}} characters', {maxLength});
  }

  const email = formValues.email;
  if (email && !utils.validateEmail(email)) {
    validationErrors.email = t('Email address is invalid');
  }

  return validationErrors;
};

personUtils.accountInfoFromClinicPatient = clinicPatient => ({
  permissions: clinicPatient.permissions,
  profile: {
    emails: [clinicPatient.email],
    fullName: clinicPatient.fullName,
    patient: {
      birthday: clinicPatient.birthDate,
      mrn: clinicPatient.mrn,
    },
  },
  userid: clinicPatient.id,
  username: clinicPatient.email,
});

personUtils.clinicPatientFromAccountInfo = patient => ({
  permissions: patient.permissions,
  id: patient.userid,
  email: patient.username,
  fullName: personUtils.patientFullName(patient),
  birthDate: _.get(patient, 'profile.patient.birthday'),
  mrn: _.get(patient, 'profile.patient.mrn'),
});

personUtils.combinedAccountAndClinicPatient = (
  patient = {},
  clinicPatient = {}
) => _.defaultsDeep(personUtils.accountInfoFromClinicPatient(clinicPatient), patient);

module.exports = personUtils;
