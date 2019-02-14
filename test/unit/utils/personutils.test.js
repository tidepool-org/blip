/* global chai */
/* global describe */
/* global it */

import _ from 'lodash';
import personUtils from '../../../app/core/personutils';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../app/core/constants';
import config from '../../../app/config';

const FORM_DATE_FORMAT = 'MM/DD/YYYY';
const expect = chai.expect;


describe('personutils', () => {

  describe('fullName', () => {
    it('should return full name if exists', () => {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.fullName(person);

      expect(result).to.equal('Mary Smith');
    });
  });

  describe('patientInfo', () => {
    it('should return patient info if exists', () => {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = personUtils.patientInfo(person);

      expect(result.diagnosisDate).to.equal('1990-01-31');
    });
  });

  describe('hasAcceptedTerms', () => {
    it('should return true if the user has a valid date string in the `termsAccepted` field more recent than LATEST_TERMS', () => {
      var person = {termsAccepted: '2017-04-22T23:30:00+10:00'};

      config.LATEST_TERMS = '2017-04-22T23:00:00+10:00';
      expect(personUtils.hasAcceptedTerms(person)).to.be.true;
    });

    it('should return false if the user has a valid date string in the `termsAccepted` field less recent than LATEST_TERMS', () => {
      var person = {termsAccepted: '2017-04-22T23:00:00+10:00'};

      config.LATEST_TERMS = '2017-04-22T23:30:00+10:00';
      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });

    it('should return true if the user has a valid date string in the `termsAccepted` field and LATEST_TERMS is null', () => {
      var person = {termsAccepted: '2015-01-01'};

      config.LATEST_TERMS = null;
      expect(personUtils.hasAcceptedTerms(person)).to.be.true;
    });

    it('should return true if the user has a valid date string in the `termsAccepted` field and LATEST_TERMS is invalid', () => {
      var person = {termsAccepted: '2015-01-01'};

      config.LATEST_TERMS = 'WHARRRRGARBLLL';
      expect(personUtils.hasAcceptedTerms(person)).to.be.true;
    });

    it('should return false if `termsAccepted` is an empty string and LATEST_TERMS is unset', () => {
      var person = {termsAccepted: ''};

      config.LATEST_TERMS = null;
      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });

    it('should return false if `termsAccepted` does not exist and LATEST_TERMS is unset', () => {
      var person = {};

      config.LATEST_TERMS = null;
      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });

    it('should return false if `termsAccepted` is an empty string and LATEST_TERMS is invalid', () => {
      var person = {termsAccepted: ''};

      config.LATEST_TERMS = 'WHARRRRGARBLLL';
      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });

    it('should return false if `termsAccepted` does not exist and LATEST_TERMS is invalid', () => {
      var person = {};

      config.LATEST_TERMS = 'WHARRRRGARBLLL';
      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });
  });

  describe('isPatient', () => {
    it('should return true if person has patient info', () => {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = personUtils.isPatient(person);

      expect(result).to.be.ok;
    });

    it('should return false if person does not have patient info', () => {
      var person = {
        profile: {}
      };

      var result = personUtils.isPatient(person);

      expect(result).to.not.be.ok;
    });
  });

  describe('isClinic', () => {
    it('should return true if person has clinic role', () => {
      var person = {
        profile: {
          fullName: 'Mary Smith'
        },
        roles: ['clinic']
      };

      var result = personUtils.isClinic(person);

      expect(result).to.be.ok;
    });

    it('should return false if person has no clinic role', () => {
      var person = {
        profile: {}
      };

      var result = personUtils.isClinic(person);

      expect(result).to.not.be.ok;
    });
  });

  describe('isDataDonationAccount', () => {
    it('should return true if the account username or email matches the donation account format', function () {
      var account1 = { email: 'bigdata+CARBDM@tidepool.org' };
      var account2 = { email: 'bigdata+NSF@tidepool.org' };
      var account3 = { username: 'bigdata@tidepool.org' };

      var result1 = personUtils.isDataDonationAccount(account1);
      var result2 = personUtils.isDataDonationAccount(account2);
      var result3 = personUtils.isDataDonationAccount(account3);

      expect(result1).to.be.true;
      expect(result2).to.be.true;
      expect(result3).to.be.true;
    });

    it('should return false if the account username or email does not match the donation account format', function () {
      var account1 = { email: 'user@tidepool.org' };
      var account2 = { username: 'user@gmail.com' };

      var result1 = personUtils.isDataDonationAccount(account1);
      var result2 = personUtils.isDataDonationAccount(account2);

      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });
  });

  describe('patientFullName', () => {
    it('should return profile name if same person', () => {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = personUtils.patientFullName(person);

      expect(result).to.equal('Mary Smith');
    });

    it('should return patient info name if different person', () => {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {isOtherPerson: true, fullName: 'Jessica Carter'}
        }
      };

      var result = personUtils.patientFullName(person);

      expect(result).to.equal('Jessica Carter');
    });
  });

  describe('patientIsOtherPerson', () => {
    it('should return false if same person', () => {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = personUtils.patientIsOtherPerson(person);

      expect(result).to.not.be.ok;
    });

    it('should return patient info name if different person', () => {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {isOtherPerson: true, fullName: 'Jessica Carter'}
        }
      };

      var result = personUtils.patientIsOtherPerson(person);

      expect(result).to.be.ok;
    });
  });

  describe('isOnlyCareGiver', () => {
    it('should return false if not flagged as care giver only', () => {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.isOnlyCareGiver(person);

      expect(result).to.not.be.ok;
    });

    it('should return true if flagged as care giver only', () => {
      var person = {
        profile: {isOnlyCareGiver: true, fullName: 'Mary Smith'}
      };

      var result = personUtils.isOnlyCareGiver(person);

      expect(result).to.be.ok;
    });
  });

  describe('isSame', () => {
    it('should return true if people have same ids', () => {
      var person1 = {userid: '1'};
      var person2 = {userid: '1'};

      var result = personUtils.isSame(person1, person2);

      expect(result).to.be.ok;
    });

    it('should return false if people have different ids', () => {
      var person1 = {userid: '1'};
      var person2 = {userid: '2'};

      var result = personUtils.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });

    it('should return false if passed empty person', () => {
      var person1 = {userid: '1'};
      var person2 = null;

      var result = personUtils.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });
  });

  describe('togglePatientBgUnits', () => {
    it('should toggle from mg/dL to mmol/L', () => {
      const settings = {
        bgTarget: {
          high: 180,
          low: 70,
        },
        units: {
          bg: MGDL_UNITS,
        },
      };

      const toggled = personUtils.togglePatientBgUnits(settings);
      expect(toggled.units.bg).to.equal(MMOLL_UNITS);
      expect(toggled.bgTarget.high).to.equal(10);
      expect(toggled.bgTarget.low).to.equal(3.9);
    });

    it('should toggle from mmol/L to mg/dL', () => {
      const settings = {
        bgTarget: {
          high: 10,
          low: 3.9,
        },
        units: {
          bg: MMOLL_UNITS,
        },
      };

      const toggled = personUtils.togglePatientBgUnits(settings);
      expect(toggled.units.bg).to.equal(MGDL_UNITS);
      expect(toggled.bgTarget.high).to.equal(180);
      expect(toggled.bgTarget.low).to.equal(70);
    });

    it('should return false if the high or low targets, or the bg units are missing from the settings arg', () => {
      const settings = {
        bgTarget: {
          high: 10,
          low: 3.9,
        },
        units: {
          bg: MMOLL_UNITS,
        },
      };

      const withoutHighTarget = _.assign({ bgTarget: { low: 3.9 } }, _.omit(settings, 'bgTarget'));
      const withoutLowTarget = _.assign({ bgTarget: { high: 10 } }, _.omit(settings, 'bgTarget'));
      const withoutUnits =  _.assign({ units: {} }, _.omit(settings, 'units'));

      expect(personUtils.togglePatientBgUnits(withoutHighTarget)).to.be.false;
      expect(personUtils.togglePatientBgUnits(withoutLowTarget)).to.be.false;
      expect(personUtils.togglePatientBgUnits(withoutUnits)).to.be.false;
    });
  });

  describe('validateFormValues', () => {
    var INVALID_DATE_TEXT = 'Hmm, this date doesn’t look right';
    var OUT_OF_ORDER_TEXT = 'Hmm, diagnosis date usually comes after birthday';

    it('should return error message when name is required but is null', () => {
      var formValues = {
        fullName: null,
        birthday: null,
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.fullName).to.equal('Full name is required');
    });

    it('should not return error message when name is not required and is null', () => {
      var formValues = {
        fullName: null,
        birthday: null,
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, false, FORM_DATE_FORMAT);

      expect(error.fullName).to.be.undefined;
    });

    it('should return error message when birthday is null', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: null,
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.fullName).to.be.undefined;
      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when birthday is invalid string', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: 'randomstring',
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when birthday is wrong date format', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '2014-05-01',
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is invalid', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '1234',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is in wrong format', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '02/02/1988',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, 'MM-DD-YYYY');

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return no error message when diagnosisDate and birthday are valid and about is empty', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(Object.keys(error).length).to.equal(0);
    });

    it('should return error message when birthday is in the future', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/2016',
        diagnosisDate: '01/05/1984',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is in the future', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/05/1984',
        diagnosisDate: '01/01/2016',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is before birthday', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/05/1984',
        diagnosisDate: '01/01/1983',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.diagnosisDate).to.equal(OUT_OF_ORDER_TEXT);
    });

    it('should return no error message when diagnosisDate and birthday and about is valid', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'This is a valid length about section'
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(Object.keys(error).length).to.equal(0);
    });

    it('should return error message when about is over max length', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Enim in consectetur ultricies netus torquent nisi gravida pulvinar' +
        ' - curae congue tellus sodales nec proin?Risus in nostra montes rhoncus' +
        ' vestibulum tempus per ut: curae maecenas nibh arcu eget. Dolby'
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.about).to.equal('Please keep "about" text under 256 characters');
    });

    it('should return no error message when diagnosisDate and birthday and about is at max length', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Enim in consectetur ultricies netus torquent nisi gravida pulvinar' +
        ' - curae congue tellus sodales nec proin?Risus in nostra montes rhoncus' +
        ' vestibulum tempus per ut: curae maecenas nibh arcu eget. Dolb'
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(Object.keys(error).length).to.equal(0);
    });

    it('should return multiple error messages when multiple validation problems', () => {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '05/19/2015',
        diagnosisDate: '01/01/2015',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(Object.keys(error).length).to.equal(2);
    });
  });
});
