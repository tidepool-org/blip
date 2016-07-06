/* global chai */
/* global describe */
/* global it */

var personUtils = require('../../../app/core/personutils');
var expect = chai.expect;
var FORM_DATE_FORMAT = 'MM/DD/YYYY';

describe('personutils', function() {

  describe('fullName', function() {
    it('should return full name if exists', function() {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.fullName(person);

      expect(result).to.equal('Mary Smith');
    });
  });

  describe('patientInfo', function() {
    it('should return patient info if exists', function() {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = personUtils.patientInfo(person);

      expect(result.diagnosisDate).to.equal('1990-01-31');
    });
  });

  describe('hasAcceptedTerms', function() {
    it('should return true if the user has a string in the `termsAccepted` field', function() {
      var person = {termsAccepted: 'foo'};

      expect(personUtils.hasAcceptedTerms(person)).to.be.true;
    });

    it('should return true if the user has a date in the `termsAccepted` field', function() {
      var person = {termsAccepted: '2015-01-01'};

      expect(personUtils.hasAcceptedTerms(person)).to.be.true;
    });

    it('should return false if `termsAccepted` is an empty string', function() {
      var person = {termsAccepted: ''};

      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });

    it('should return false if `termsAccepted` does not exist', function() {
      var person = {};

      expect(personUtils.hasAcceptedTerms(person)).to.be.false;
    });
  });

  describe('isPatient', function() {
    it('should return true if person has patient info', function() {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = personUtils.isPatient(person);

      expect(result).to.be.ok;
    });

    it('should return false if person does not have patient info', function() {
      var person = {
        profile: {}
      };

      var result = personUtils.isPatient(person);

      expect(result).to.not.be.ok;
    });
  });

  describe('patientFullName', function() {
    it('should return profile name if same person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = personUtils.patientFullName(person);

      expect(result).to.equal('Mary Smith');
    });

    it('should return patient info name if different person', function() {
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

  describe('patientIsOtherPerson', function() {
    it('should return false if same person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = personUtils.patientIsOtherPerson(person);

      expect(result).to.not.be.ok;
    });

    it('should return patient info name if different person', function() {
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

  describe('isOnlyCareGiver', function() {
    it('should return false if not flagged as care giver only', function() {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.isOnlyCareGiver(person);

      expect(result).to.not.be.ok;
    });

    it('should return true if flagged as care giver only', function() {
      var person = {
        profile: {isOnlyCareGiver: true, fullName: 'Mary Smith'}
      };

      var result = personUtils.isOnlyCareGiver(person);

      expect(result).to.be.ok;
    });
  });

  describe('isSame', function() {
    it('should return true if people have same ids', function() {
      var person1 = {userid: '1'};
      var person2 = {userid: '1'};

      var result = personUtils.isSame(person1, person2);

      expect(result).to.be.ok;
    });

    it('should return false if people have different ids', function() {
      var person1 = {userid: '1'};
      var person2 = {userid: '2'};

      var result = personUtils.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });

    it('should return false if passed empty person', function() {
      var person1 = {userid: '1'};
      var person2 = null;

      var result = personUtils.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });
  });

  describe('validateFormValues', function() {
    var INVALID_DATE_TEXT = 'Hmm, this date doesn’t look right';
    var OUT_OF_ORDER_TEXT = 'Hmm, diagnosis date usually comes after birthday';

    it('should return error message when name is required but is null', function() {
      var formValues = {
        fullName: null,
        birthday: null,
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.fullName).to.equal('Full name is required');
    });

    it('should not return error message when name is not required and is null', function() {
      var formValues = {
        fullName: null,
        birthday: null,
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, false, FORM_DATE_FORMAT);

      expect(error.fullName).to.be.undefined;
    });

    it('should return error message when birthday is null', function() {
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

    it('should return error message when birthday is invalid string', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: 'randomstring',
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when birthday is wrong date format', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '2014-05-01',
        diagnosisDate: null,
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is invalid', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '1234',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is in wrong format', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '02/02/1988',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, 'MM-DD-YYYY');

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return no error message when diagnosisDate and birthday are valid and about is empty', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(Object.keys(error).length).to.equal(0);
    });

    it('should return error message when birthday is in the future', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/2016',
        diagnosisDate: '01/05/1984',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.birthday).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is in the future', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/05/1984',
        diagnosisDate: '01/01/2016',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.diagnosisDate).to.equal(INVALID_DATE_TEXT);
    });

    it('should return error message when diagnosisDate is before birthday', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/05/1984',
        diagnosisDate: '01/01/1983',
        about: null
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT, Date.UTC(2015, 4, 18));

      expect(error.diagnosisDate).to.equal(OUT_OF_ORDER_TEXT);
    });

    it('should return no error message when diagnosisDate and birthday and about is valid', function() {
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'This is a valid length about section'
      };
      var error = personUtils.validateFormValues(formValues, true, FORM_DATE_FORMAT);

      expect(Object.keys(error).length).to.equal(0);
    });

    it('should return error message when about is over max length', function() {
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

    it('should return no error message when diagnosisDate and birthday and about is at max length', function() {
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

    it('should return multiple error messages when multiple validation problems', function() {
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
