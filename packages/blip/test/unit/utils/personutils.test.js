

import { expect } from 'chai';

import personUtils from '../../../app/core/personutils';
import config from '../../../app/config';

describe('personutils', () => {

  describe('fullName', () => {
    it('should return full name if firstName/lastName exists', () => {
      var person = {
        profile: { firstName: 'Mary', lastName: 'Smith' },
      };

      var result = personUtils.fullName(person);

      expect(result).to.equal('Mary Smith');
    });
    it('should return full name if firstName/lastName is missing', () => {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.fullName(person);

      expect(result).to.equal('Mary Smith');
    });
  });

  describe('firstName', () => {
    it('should return first name if exists', () => {
      var person = {
        profile: {fullName: 'Mary Smith', firstName: 'Mary'}
      };

      var result = personUtils.firstName(person);

      expect(result).to.equal(person.profile.firstName);
    });
    it('should return an empty string if it doesn\'t exist', () => {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.firstName(person);

      expect(result).to.equal('');
    });
  });

  describe('lastName', () => {
    it('should return last name if exists', () => {
      var person = {
        profile: {fullName: 'Mary Smith', lastName: 'Smith'}
      };

      var result = personUtils.lastName(person);

      expect(result).to.equal(person.profile.lastName);
    });
    it('should return fullName if it doesn\'t exist', () => {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = personUtils.lastName(person);

      expect(result).to.equal(person.profile.fullName);
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

  describe('patientFullName', () => {
    it('should return profile name if same person', () => {
      var person = {
        profile: {
          firstName: 'Mary',
          lastName: 'Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = personUtils.patientFullName(person);

      expect(result).to.equal('Mary Smith');
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
});
