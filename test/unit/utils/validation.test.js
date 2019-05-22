/* global chai */
/* global describe */
/* global it */

import * as validation from '../../../app/core/validation';

var expect = chai.expect;

describe('validation', () => {

  describe('valid', () => {
    it('should be a function', () => {
      expect(validation.valid).to.be.a('function');
    });

    it('should return valid object', () => {
      var output = validation.valid();
      expect(output.valid).to.be.true;
      expect(output.message).to.be.null;
    })
  });

  describe('invalid', () => {
    it('should be a function', () => {
      expect(validation.invalid).to.be.a('function');
    });

    it('should return invalid object', () => {
      var message = 'This is the error message!';
      var output = validation.invalid(message);
      expect(output.valid).to.be.false;
      expect(output.message).to.equal(message);
    })
  });

  describe('typeValidators', () => {
    it('should be a object', () => {
      expect(validation.typeValidators).to.be.an('object');
    });

    describe('name', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.name).to.be.a('function');
      });

      it('should return invalid object when fieldValue is null', () => {
        var response = validation.typeValidators.name('full name', null);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Full name is required.');
      });

      it('should return invalid object when fieldValue is undefined', () => {
        var response = validation.typeValidators.name('full name', undefined);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Full name is required.');
      });

      it('should return invalid object when fieldValue is empty', () => {
        var response = validation.typeValidators.name('full name', '');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Full name is required.');
      });

      it('should return valid object when fieldValue equals Frank', () => {
        var response = validation.typeValidators.name('full name', 'Frank');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return valid object when fieldValue equals Jason Donovan', () => {
        var response = validation.typeValidators.name('full name', 'Jason Donovan');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });
    });

    describe('about', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.about).to.be.a('function');
      });

      it('should return a valid object when fieldValue is empty', () => {
        var response = validation.typeValidators.about('about', '');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return a valid object when fieldValue equals This is my about section', () => {
        var response = validation.typeValidators.about('about', 'This is my about section');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return invalid object when fieldValue is longer than 256', () => {
        var longAbout = Array(258).join('b');
        var response = validation.typeValidators.about('about', longAbout);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('About must be at most 256 characters long.');
      });
    });

    describe('email', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.email).to.be.a('function');
      });

      it('should return invalid object when fieldValue is null', () => {
        var response = validation.typeValidators.email('email address', null);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Email address is required.');
      });

      it('should return invalid object when fieldValue is empty', () => {
        var response = validation.typeValidators.email('email address', '');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Email address is required.');
      });

      it('should return invalid object when fieldValue is invalid email "[hello]"', () => {
        var response = validation.typeValidators.email('email address', '[hello]');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Email address is invalid.');
      });

      it('should return invalid object when fieldValue is invalid email "partial@email"', () => {
        var response = validation.typeValidators.email('email address', 'partial@email');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Email address is invalid.');
      });

      it('should return valid object when fieldValue is valid email "derek@derek.com"', () => {
        var response = validation.typeValidators.email('email address', 'derek@derek.com');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return valid object when fieldValue is valid email "phil@iron.io"', () => {
        var response = validation.typeValidators.email('email address', 'phil@iron.io');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return valid object when fieldValue is valid email "dr.zeus@minority-report.com"', () => {
        var response = validation.typeValidators.email('email address', 'dr.zeus@minority-report.com');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return valid object when fieldValue is valid email "derek_zoolander@gov.us.com"', () => {
        var response = validation.typeValidators.email('email address', 'derek_zoolander@gov.us.com');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return valid object when fieldValue is valid email "a@b.com"', () => {
        var response = validation.typeValidators.email('email address', 'a@b.com');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });
    });

    describe('password', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.password).to.be.a('function');
      });

      it('should return invalid object when fieldValue is null', () => {
        var response = validation.typeValidators.password('password', null);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password is required.');
      });

      it('should return invalid object when fieldValue is undefined', () => {
        var response = validation.typeValidators.password('password', undefined);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password is required.');
      });

      it('should return invalid object when fieldValue is empty', () => {
        var response = validation.typeValidators.password('password', '');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password is required.');
      });

      it('should return invalid object when fieldValue is too short', () => {
        var response = validation.typeValidators.password('password', 'shorter');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password must be at least 8 characters long.');
      });

      it('should return invalid object when fieldValue is too long', () => {
        var longPassword = Array(74).join('a'); //will be 73 chars long
        var response = validation.typeValidators.password('password', longPassword);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password must be at most 72 characters long.');
      });

      it('should return invalid object when fieldValue has white spaces', () => {
        var response = validation.typeValidators.password('password', 'white space    ');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Password must not contain white spaces.');
      });

      it('should return valid object when fieldValue is just long enough - 8 characters', () => {
        var response = validation.typeValidators.password('password', 'eightcha');

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });

      it('should return invalid object when fieldValue is just short enough - 72 chracters', () => {
        var longPassword = Array(73).join('a'); // will be 72 characters long
        var response = validation.typeValidators.password('password', longPassword);

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null
      });
    });

    describe('confirmPassword', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.confirmPassword).to.be.a('function');
      });

      it('should return invalid object when prerequisite password is empty', () => {
        var response = validation.typeValidators.confirmPassword('confirm password', 'test', { password: ''});

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('You have not entered a password.')
      });

      it('should return invalid object when confirm password does not match prerequisite password', () => {
        var response = validation.typeValidators.confirmPassword('confirm password', 'test', { password: 'goodpassword'});

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Passwords don\'t match.');
      });

      it('should return a valid object when confirm password matches prerequisite password', () => {
        var response = validation.typeValidators.confirmPassword('confirm password', 'Re4t12345', { password: 'Re4t12345'});

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });
    });

    describe('date', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.date).to.be.a('function');
      });

      it('should return invalid object when fieldValue is null', () => {
        var response = validation.typeValidators.date('birthday', null);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is required.');
      });

      it('should return invalid object when fieldValue is undefined', () => {
        var response = validation.typeValidators.date('birthday', undefined);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is required.');
      });

      it('should return invalid object when fieldValue is empty', () => {
        var response = validation.typeValidators.date('birthday', '');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is required.');
      });

      it('should return invalid object when fieldValue is empty object', () => {
        var birthday = {};
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is not a complete date.');
      });

      it('should return invalid object when fieldValue.day is null', () => {
        var birthday = { month: '5', year: '1900' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is not a complete date.');
      });

      it('should return invalid object when fieldValue.month is null', () => {
        var birthday = { day: '1', year: '1900' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is not a complete date.');
      });

      it('should return invalid object when fieldValue.year is null', () => {
        var birthday = { day: '1', month: '12' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Birthday is not a complete date.');
      });

      it('should return invalid object when fieldValue is invalid date (invalid month)', () => {
        var birthday = { day: '1', month: '14', year: '2002' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return invalid object when fieldValue is invalid date (invalid day)', () => {
        var birthday = { day: '31', month: '1', year: '2002' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return invalid object when fieldValue is invalid date (invalid year)', () => {
        var birthday = { day: '21', month: '2', year: '-2' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return valid object when fieldValue is valid date', () => {
        var birthday = { day: '20', month: '2', year: '2002' };
        var response = validation.typeValidators.date('birthday', birthday);

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });
    });

    describe('diagnosisDate', () => {
      it('should be a function', () => {
        expect(validation.typeValidators.diagnosisDate).to.be.a('function');
      });

      it('should return invalid object when fieldValue is null', () => {
        var response = validation.typeValidators.diagnosisDate('diagnosis date', null);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is required.');
      });

      it('should return invalid object when fieldValue is undefined', () => {
        var response = validation.typeValidators.diagnosisDate('diagnosis date', undefined);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is required.');
      });

      it('should return invalid object when fieldValue is empty', () => {
        var response = validation.typeValidators.diagnosisDate('diagnosis date', '');

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is required.');
      });

      it('should return invalid object when fieldValue is empty object', () => {
        var diagnosis = {};
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is not a complete date.');
      });

      it('should return invalid object when fieldValue.day is null', () => {
        var diagnosis = { month: '5', year: '1900' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is not a complete date.');
      });

      it('should return invalid object when fieldValue.month is null', () => {
        var diagnosis = { day: '1', year: '1900' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is not a complete date.');
      });

      it('should return invalid object when fieldValue.year is null', () => {
        var diagnosis = { day: '1', month: '12' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Diagnosis date is not a complete date.');
      });

      it('should return invalid object when fieldValue is invalid date (invalid month)', () => {
        var diagnosis = { day: '1', month: '14', year: '2002' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return invalid object when fieldValue is invalid date (invalid day)', () => {
        var diagnosis = { day: '31', month: '1', year: '2002' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return invalid object when fieldValue is invalid date (invalid year)', () => {
        var diagnosis = { day: '21', month: '2', year: '-2' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis);

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, this date doesn’t look right');
      });

      it('should return invalid object when prerequisite birthday is empty', () => {
        var diagnosis = { day: '21', month: '2', year: '2004' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis, { birthday : null });

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('You have not specified your birthday!');
      });

      it('should return invalid object when prerequisite birthday is invalid', () => {
        var diagnosis = { day: '21', month: '2', year: '2004' };
        var birthday = { day: '21', year: '2004' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis, { birthday : birthday });

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('You have not specified a valid birthday!');
      });

      it('should return invalid object when prerequisite birthday is after diagnosis date', () => {
        var diagnosis = { day: '21', month: '2', year: '2004' };
        var birthday = { day: '22', month: '2', year: '2004' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis, { birthday : birthday });

        expect(response.valid).to.be.false;
        expect(response.message).to.equal('Hmm, diagnosis date usually comes after birthday.');
      });

      it('should return valid object when fieldValue and prerequisite birthday are valid and in order', () => {
        var diagnosis = { day: '21', month: '2', year: '2004' };
        var birthday = { day: '22', month: '3', year: '1984' };
        var response = validation.typeValidators.diagnosisDate('diagnosis date', diagnosis, { birthday : birthday });

        expect(response.valid).to.be.true;
        expect(response.message).to.be.null;
      });
    });
  });

  describe('validateField', () => {
    it('should be a function', () => {
      expect(validation.validateField).to.be.a('function');
    });

    it('should return valid if not validation for this field', () => {
      var response = validation.validateField('foo');

      expect(response.valid).to.be.true;
      expect(response.message).to.be.null;
    });

    it('should return valid for name when value is set', () => {
      var response = validation.validateField('name', 'full name', 'Frank Zappa');

      expect(response.valid).to.be.true;
      expect(response.message).to.be.null;
    });

    it('should return invalid for name when value is not set', () => {
      var response = validation.validateField('name', 'Full name', '');

      expect(response.valid).to.be.false;
      expect(response.message).to.equal('Full name is required.');
    });

    it('should return invalid for email when value is not set', () => {
      var response = validation.validateField('email', 'email', '');

      expect(response.valid).to.be.false;
      expect(response.message).to.equal('Email is required.');
    });

    it('should return invalid for email when value is invalid', () => {
      var response = validation.validateField('email', 'email address', 'aaa&eee');

      expect(response.valid).to.be.false;
      expect(response.message).to.equal('Email address is invalid.');
    });

    it('should return valid for email when value vaid email', () => {
      var response = validation.validateField('email', 'email address', 'joe@bloggs.com');

      expect(response.valid).to.be.true;
      expect(response.message).to.be.null
    });
  });

  describe('validateForm', () => {
    it('should be a function', () => {
      expect(validation.validateForm).to.be.a('function');
    });

    it('should return empty validation object when no form object passed in', () => {
      expect(validation.validateForm()).to.be.an('object');
      expect(Object.keys(validation.validateForm()).length).to.equal(0);
    });

    it('should return empty validation object when valid form entries passed in', () => {
      var formEntries = [
        { type: 'name', name: 'fullName', label: 'Full name', value: 'Frank Zappa' },
        { type: 'date', name: 'birthday', label: 'Birthday', value: {day: '18', month: '06', year: '2001' } },
      ];

      var result = validation.validateForm(formEntries);
      expect(result).to.be.an('object');
      expect(Object.keys(result).length).to.equal(0);
    });

    it('should return validation object with 1 key when invalid name passed in', () => {
      var formEntries = [
        { type: 'name', name: 'fullName', label: 'Full name', value: '' },
        { type: 'date', name: 'birthday', label: 'Birthday', value: {day: '18', month: '06', year: '2001' } },
      ];

      var result = validation.validateForm(formEntries);
      expect(result).to.be.an('object');
      expect(Object.keys(result).length).to.equal(1);
      expect(result.fullName).to.equal('Full name is required.');
    });

    it('should return validation object with 2 keys when invalid name and diagnosis date passed in', () => {
      var birthday = {day: '18', month: '06', year: '2001' };
      var diagnosisDate = {day: '18', month: '06', year: '2000' };
      var formEntries = [
        { type: 'name', name: 'fullName', label: 'Full name', value: '' },
        { type: 'date', name: 'birthday', label: 'Birthday', value: birthday },
        { type: 'diagnosisDate', name: 'diagnosisDate', label: 'diagnosis date', value: diagnosisDate, prerequisites: { birthday: birthday } },
      ];

      var result = validation.validateForm(formEntries);
      expect(result).to.be.an('object');
      expect(Object.keys(result).length).to.equal(2);
      expect(result.fullName).to.equal('Full name is required.');
      expect(result.diagnosisDate).to.equal('Hmm, diagnosis date usually comes after birthday.');
    });
  });
});
