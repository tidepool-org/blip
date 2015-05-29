var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var PatientInfo = require('../../../../app/pages/patient/patientinfo');

describe('PatientInfo', function () {
  it('should be a function', function() {
    expect(PatientInfo).to.be.a('function');
  });

  it('is a ReactElement', function () {
    expect(TestUtils.isElement(<PatientInfo/>)).to.equal(true);
  });


  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientInfo/>);
      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `PatientInfo`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.spy();
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
  
  describe('isSamePersonUserAndPatient', function() {
    it('should return false when both userids are the different', function() {
      var props = {
        user: {
          userid: 'foo'
        },
        patient: {
          userid: 'bar'
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.isSamePersonUserAndPatient()).to.equal(false);
    });

    it('should return true when both userids are the same', function() {
      var props = {
        user: {
          userid: 1
        },
        patient: {
          userid: 1
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.isSamePersonUserAndPatient()).to.equal(true);
    });
  });

  describe('getAgeText', function() {
    it('should return unknown birthday if less than 1 years old, or birthdate in future', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.getAgeText(elem.props.patient, new Date(1984, 4, 20))).to.equal('Birthdate not known');
      expect(elem.getAgeText(elem.props.patient, new Date(1983, 4, 20))).to.equal('Birthdate not known');
    });

    it('should return text representing years difference', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.getAgeText(elem.props.patient, new Date(1985, 4, 19))).to.equal('1 year old');
      expect(elem.getAgeText(elem.props.patient, new Date(1986, 4, 19))).to.equal('2 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1987, 4, 19))).to.equal('3 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1988, 4, 19))).to.equal('4 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1999, 4, 19))).to.equal('15 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 19))).to.equal('31 years old');
    });

    it('should handle return correct text representation for various birthdays', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var today = new Date(2015, 4, 28); //for testing purposes - set today as fixed
      expect(elem).to.be.ok;
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).to.equal('31 years old');
      elem.props.patient.profile.patient.birthday = '1984-04-30';
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).to.equal('31 years old');
      elem.props.patient.profile.patient.birthday = '1984-05-29';
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).to.equal('30 years old');
    });
  });

  describe('getDiagnosisText', function() {
    it('should return unknown birthday if less than 1 years old, or birthdate in future', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1983, 3, 20))).to.equal('Diagnosis date not known');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1982, 4, 20))).to.equal('Diagnosis date not known');
    });

    it('should return text representing years difference', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).to.be.ok;
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1984, 4, 18))).to.equal('Diagnosed this year');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1985, 4, 19))).to.equal('Diagnosed 1 year ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1986, 4, 19))).to.equal('Diagnosed 2 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1987, 4, 19))).to.equal('Diagnosed 3 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1988, 4, 19))).to.equal('Diagnosed 4 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1999, 4, 19))).to.equal('Diagnosed 15 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 19))).to.equal('Diagnosed 31 years ago');
    });

    it('should handle return correct text representation for various diagnosisDates', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18'
            }
          }
        },
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var today = new Date(2015, 4, 28); //for testing purposes - set today as fixed
      expect(elem).to.be.ok;
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
      elem.props.patient.profile.patient.diagnosisDate = '1984-04-30';
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
      elem.props.patient.profile.patient.diagnosisDate = '1984-05-29';
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).to.equal('Diagnosed 30 years ago');
    });
  });

  describe('validateFormValues', function() {
    it('should return error message when birthday is null', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: null,
        diagnosisDate: null,
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Date of birth needs to be a valid date');
    });

    it('should return error message when birthday is invalid string', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: 'randomstring',
        diagnosisDate: null,
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Date of birth needs to be a valid date');
    });

    it('should return error message when birthday is wrong date format', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '2014-05-01',
        diagnosisDate: null,
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Date of birth needs to be a valid date');
    });

    it('should return error message when diagnosisDate is null', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: null,
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Diagnosis date needs to be a valid date');
    });

    it('should return error message when diagnosisDate is invalid', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '1234',
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Diagnosis date needs to be a valid date');
    });

    it('should return no error message when diagnosisDate and birthday are valid and about is empty', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: null
      }
      var error = elem.validateFormValues(formValues);

      expect(typeof error).to.equal('undefined');
    });

    it('should return no error message when diagnosisDate and birthday and about is valid', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'This is a valid length about section'
      }
      var error = elem.validateFormValues(formValues);

      expect(typeof error).to.equal('undefined');
    });

    it('should return an error message when about is over max length', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' 
        + 'Enim in consectetur ultricies netus torquent nisi gravida pulvinar' 
        + ' - curae congue tellus sodales nec proin?Risus in nostra montes rhoncus'
        + ' vestibulum tempus per ut: curae maecenas nibh arcu eget. Dolby'
      }
      var error = elem.validateFormValues(formValues);

      expect(error).to.equal('Please keep "about" text under 256 characters');
    }); 

    it('should return no error message when diagnosisDate and birthday and about is at max length', function() {
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        fullName: 'Joe Bloggs',
        birthday: '01/01/1984',
        diagnosisDate: '01/05/1984',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' 
        + 'Enim in consectetur ultricies netus torquent nisi gravida pulvinar' 
        + ' - curae congue tellus sodales nec proin?Risus in nostra montes rhoncus'
        + ' vestibulum tempus per ut: curae maecenas nibh arcu eget. Dolb'
      }
      var error = elem.validateFormValues(formValues);

      expect(typeof error).to.equal('undefined');
    });   
  });
  
  describe('prepareFormValuesForSubmit', function() {

    it('should throw a errors with invalid birthday - non-leap year 29th Feb', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        birthday: '02/29/2015',
      }
      var error;
      try {
        elem.prepareFormValuesForSubmit(formValues)
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should throw a errors with invalid birthday - non-existent date', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        birthday: '000/00/0000',
      }
      var error;
      try {
        elem.prepareFormValuesForSubmit(formValues)
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should convert valid birthday to YYYY-MM-DD equivalents', function() {
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        birthday: '07/01/1984',
      }
      var result = elem.prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.birthday).to.equal('1984-07-01');
      
      formValues.birthday = '08/02/1984';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('1984-08-02');

      formValues.birthday = '03/31/2001';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('2001-03-31');

      // Can it handle leap years?
      formValues.birthday = '02/29/2016';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('2016-02-29');
    });

  it('should throw a errors with invalid diagnosisDate - non-leap year 29th Feb', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        diagnosisDate: '02/29/2015',
      }
      var error;
      try {
        elem.prepareFormValuesForSubmit(formValues)
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should throw a errors with invalid diagnosisDate - non-existent date', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        diagnosisDate: '000/00/0000',
      }
      var error;
      try {
        elem.prepareFormValuesForSubmit(formValues)
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should convert valid diagnosisDate to YYYY-MM-DD equivalents', function() {
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        diagnosisDate: '07/01/1984',
      }
      var result = elem.prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.diagnosisDate).to.equal('1984-07-01');
      
      formValues.diagnosisDate = '08/02/1984';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('1984-08-02');

      formValues.diagnosisDate = '03/31/2001';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('2001-03-31');

      // Can it handle leap years?
      formValues.diagnosisDate = '02/29/2016';
      result = elem.prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('2016-02-29');
    });

    it('should remove empty about field', function() {
      var props = {
        trackMetric: function() {},
        patient: {
          profile : {}
        }
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      var formValues = {
        about: '',
      }
      var result = elem.prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.about).to.be.an('undefined');
    });
  });
});