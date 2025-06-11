/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React, { createElement } from 'react';
var expect = chai.expect;
var PatientInfo = require('../../../../app/pages/patient/patientinfo');

import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

describe('PatientInfo', function () {

  let props = {
    user: { userid: 5678 },
    patient: { userid: 1234 },
    fetchingPatient: false,
    fetchingUser: false,
    onUpdatePatient: sinon.stub(),
    onUpdatePatientSettings: sinon.stub(),
    onUpdateDataDonationAccounts: sinon.stub(),
    trackMetric: sinon.stub(),
    dataSources: [],
    fetchDataSources: sinon.stub(),
    connectDataSource: sinon.stub(),
    disconnectDataSource: sinon.stub(),
    isSmartOnFhirMode: false,
    api: {
      export: { get: sinon.stub() }
    },
    permsOfLoggedInUser: {},
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      createElement(
        props => (
          <BrowserRouter>
            <PatientInfo {...props} />
          </BrowserRouter>
        ), props )
    );
  });

  afterEach(() => {
props.onUpdatePatient.reset();
  props.trackMetric.reset();
  props.fetchDataSources.reset();
  props.connectDataSource.reset();
  props.disconnectDataSource.reset();
  props.onUpdatePatientSettings.reset();
  props.onUpdateDataDonationAccounts.reset();
  props.api.export.get.reset();
  });

  describe('render', function() {
    it('should render without problems when required props are present', () => {
      console.error = sinon.spy();
      var props = {
        fetchingPatient: false,
        fetchingUser: false,
        patient: {},
        onUpdatePatient: sinon.stub(),
        onUpdatePatientSettings: sinon.stub(),
        permsOfLoggedInUser: {},
        trackMetric: sinon.stub(),
      };
    });
  });

  describe('getInitialState', function() {
    it('should return an object with editing set to false and containing no validationErrors', function() {
      var props = {
        trackMetric: function() {}
      };

      wrapper.setProps(props);

      var initialState = wrapper.find(PatientInfo).childAt(0).state();
      expect(Object.keys(initialState).length).to.equal(3);
      expect(initialState.editing).to.equal(false);
      expect(Object.keys(initialState.validationErrors).length).length.to.equal(0);
    });
  });

  describe('toggleEdit', function() {
    it('should change the value of editing from false to true and back', function() {
      var props = {};

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      expect(elem.state().editing).to.equal(false);
      elem.instance().toggleEdit();
      expect(elem.state().editing).to.equal(true);
      elem.instance().toggleEdit();
      expect(elem.state().editing).to.equal(false);
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
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().isSamePersonUserAndPatient()).to.equal(false);
    });

    it('should return true when both userids are the same', function() {
      var props = {
        user: {
          userid: 1
        },
        patient: {
          userid: 1
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().isSamePersonUserAndPatient()).to.equal(true);
    });
  });

  describe('getDisplayName', function() {
    it('should return the user\'s full name', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            fullName: 'Joe Bloggs'
          }
        },
        trackMetric: function() {}
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem.instance().getDisplayName(elem.props().patient)).to.equal('Joe Bloggs');
    });
  });

  describe('getAgeText', function() {
    it('should return text `Born this year` if birthday less than 1 year', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1984-05-18'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      // NB: Remember that Date is a bit weird, in that months are zero indexed - so 4 -> May !
      //
      // Edge cases to do with how moment.dff behaves around dtes with diff between >1 and 1,
      // the range for 0 spans between these values
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1983, 4, 20))).to.equal('Born this year');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1983, 4, 19))).to.equal('Born this year');

      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1985, 4, 17))).to.equal('Born this year');
    });


    it('should return unknown birthday if birthdate is in future', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1984-05-18'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      // NB: Remember that Date is a bit weird, in that months are zero indexed - so 4 -> May !
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1980, 4, 17))).to.equal('Birthdate not known');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1981, 4, 17))).to.equal('Birthdate not known');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1982, 4, 17))).to.equal('Birthdate not known');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1983, 4, 17))).to.equal('Birthdate not known');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1983, 4, 18))).to.equal('Birthdate not known');
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
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1985, 4, 19))).to.equal('1 year old');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1986, 4, 19))).to.equal('2 years old');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1987, 4, 19))).to.equal('3 years old');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1988, 4, 19))).to.equal('4 years old');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(1999, 4, 19))).to.equal('15 years old');
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(2015, 4, 19))).to.equal('31 years old');
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

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var today = Date.UTC(2015, 4, 28); //for testing purposes - set today as fixed
      expect(elem).to.be.ok;
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('31 years old');
      elem.props().patient.profile.patient.birthday = '1984-04-30';
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('31 years old');
      elem.props().patient.profile.patient.birthday = '1984-05-29';
      expect(elem.instance().getAgeText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('30 years old');
    });
  });

  describe('getDiagnosisText', function() {
    it('should return unknown Dx date if less than 1 years old, or Dx date in future, and diagnosis type is not set', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1983, 3, 20))).to.equal('Diagnosis date not known');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1982, 4, 20))).to.equal('Diagnosis date not known');
    });

    it('should not return unknown Dx date if less than 1 years old, or Dx date in future, and diagnosis type is set', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18',
              diagnosisType: 'type1',
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1983, 3, 20))).to.equal('Diagnosed as Type 1');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1982, 4, 20))).to.equal('Diagnosed as Type 1');
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
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1984, 4, 18))).to.equal('Diagnosed this year');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1985, 4, 19))).to.equal('Diagnosed 1 year ago');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1986, 4, 19))).to.equal('Diagnosed 2 years ago');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1987, 4, 19))).to.equal('Diagnosed 3 years ago');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1988, 4, 19))).to.equal('Diagnosed 4 years ago');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(1999, 4, 19))).to.equal('Diagnosed 15 years ago');
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 19))).to.equal('Diagnosed 31 years ago');
    });

    it('should handle return correct text representation for various Dx dates', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var today = Date.UTC(2015, 4, 28); //for testing purposes - set today as fixed
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
      elem.props().patient.profile.patient.diagnosisDate = '1984-04-30';
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
      elem.props().patient.profile.patient.diagnosisDate = '1984-05-29';
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 30 years ago');
    });

    it('should handle return correct text representation when both diagnosis type and date are available', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisType: 'type1',
              diagnosisDate: '1984-05-18',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 31 years ago as Type 1');
    });

    it('should handle return correct text representation when only diagnosis type is available', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisType: 'type1',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed as Type 1');
    });

    it('should handle return correct text representation when an invalid diagnosis type is provided, and no date is available', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisType: 'imaginary',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosis date not known');
    });

    it('should handle return correct text representation when an invalid diagnosis type is provided, and a date is available', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18',
              diagnosisType: 'imaginary',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
    });

    it('should handle return correct text representation when only diagnosis date is available', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '1984-05-18',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      expect(elem).to.be.ok;
      expect(elem.instance().getDiagnosisText(elem.props().patient, Date.UTC(2015, 4, 28))).to.equal('Diagnosed 31 years ago');
    });
  });

  describe('getAboutText', function() {
    it('should return about text from patient profile', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              about: 'I am a developer.'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      expect(elem.instance().getAboutText(elem.props().patient)).to.equal('I am a developer.');
    });
  });

  describe('formValuesFromPatient', function() {
    it('should return empty object if patient is empty', function() {
      var props = {
        patient: {}
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      // If patient is empty object
      // Easy way to check if the returned variable is an empty POJO
      expect(Object.keys(elem.instance().formValuesFromPatient(elem.props().patient)).length).to.equal(0);
    });

    it('should return empty object when no form values present', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(0);
    });

    it('should return object containing fullName', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            fullName: 'Joe Bloggs'
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(1);
      expect(formValues.fullName).to.equal('Joe Bloggs');
    });

    it('should return object containing birthday', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              birthday: '1995-05-01'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(1);
      expect(formValues.birthday).to.equal('05/01/1995');
    });

    it('should return object containing diagnosisDate', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisDate: '2006-06-05'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(1);
      expect(formValues.diagnosisDate).to.equal('06/05/2006');
    });

    it('should return object containing diagnosisType', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              diagnosisType: 'type1'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(1);
      expect(formValues.diagnosisType).to.equal('type1');
    });

    it('should return object containing about', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            patient: {
              about: 'I have a wonderful coffee mug.'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(1);
      expect(formValues.about).to.equal('I have a wonderful coffee mug.');
    });

    it('should return object containing fullName, birthday, diagnosisDate, diagnosisType and about', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            fullName: 'Joe Bloggs',
            patient: {
              birthday: '1995-05-01',
              diagnosisDate: '2006-06-05',
              diagnosisType: 'type1',
              about: 'I have a wonderful coffee mug.'
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(5);
      expect(formValues.fullName).to.equal('Joe Bloggs');
      expect(formValues.birthday).to.equal('05/01/1995');
      expect(formValues.diagnosisDate).to.equal('06/05/2006');
      expect(formValues.diagnosisType).to.equal('type1');
      expect(formValues.about).to.equal('I have a wonderful coffee mug.');
    });

    it('should return object containing fullName, birthday, diagnosisDate, diagnosisType, about, mrn and email', function() {
      var props = {
        patient: {
          userid: 1,
          profile: {
            emails: ['joeyBlaags@example.com'],
            fullName: 'Joe Bloggs',
            patient: {
              birthday: '1995-05-01',
              diagnosisDate: '2006-06-05',
              diagnosisType: 'type1',
              about: 'I have a wonderful coffee mug.',
              mrn: '123abc456',
            }
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);

      var formValues = elem.instance().formValuesFromPatient(elem.props().patient);

      expect(Object.keys(formValues).length).to.equal(7);
      expect(formValues.fullName).to.equal('Joe Bloggs');
      expect(formValues.birthday).to.equal('05/01/1995');
      expect(formValues.diagnosisDate).to.equal('06/05/2006');
      expect(formValues.diagnosisType).to.equal('type1');
      expect(formValues.about).to.equal('I have a wonderful coffee mug.');
      expect(formValues.mrn).to.equal('123abc456');
      expect(formValues.email).to.equal('joeyBlaags@example.com');
    });
  });

  describe('prepareFormValuesForSubmit', function() {

    it('should throw an error with invalid birthday - non-leap year 29th Feb', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        patient: {
          profile : {}
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        birthday: '02/29/2015',
      };
      var error;
      try {
        elem.instance().prepareFormValuesForSubmit(formValues);
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should throw an error with invalid birthday - non-existent date', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        patient: {
          profile : {}
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        birthday: '000/00/0000',
      };
      var error;
      try {
        elem.instance().prepareFormValuesForSubmit(formValues);
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should convert valid birthday to YYYY-MM-DD equivalent', function() {
      var props = {
        patient: {
          profile : {
            patient: {}
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        birthday: '07/01/1984',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.birthday).to.equal('1984-07-01');

      formValues.birthday = '08/02/1984';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('1984-08-02');

      formValues.birthday = '03/31/2001';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('2001-03-31');

      // Can it handle leap years?
      formValues.birthday = '02/29/2016';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.birthday).to.equal('2016-02-29');
    });

    it('should throw an error with invalid diagnosisDate - non-leap year 29th Feb', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        patient: {
          profile : {
            patient: {}
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        diagnosisDate: '02/29/2015',
      };
      var error;
      try {
        elem.instance().prepareFormValuesForSubmit(formValues);
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should throw an error with invalid diagnosisDate - non-existent date', function() {
      console.error = sinon.spy(); // Stub the error function
      var props = {
        patient: {
          profile : {
            patient: {}
          }
        }
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        diagnosisDate: '000/00/0000',
      };
      var error;
      try {
        elem.instance().prepareFormValuesForSubmit(formValues);
      } catch(e) {
        error = e;
      }

      expect(error).to.be.ok;
      expect(error).to.be.an.instanceof(Error);
    });

    it('should convert valid diagnosisDate to YYYY-MM-DD equivalent', function() {
      var props = {
        patient: {
          profile : {
            patient: {},
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        diagnosisDate: '07/01/1984',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.diagnosisDate).to.equal('1984-07-01');

      formValues.diagnosisDate = '08/02/1984';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('1984-08-02');

      formValues.diagnosisDate = '03/31/2001';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('2001-03-31');

      // Can it handle leap years?
      formValues.diagnosisDate = '02/29/2016';
      result = elem.instance().prepareFormValuesForSubmit(formValues);
      expect(result.profile.patient.diagnosisDate).to.equal('2016-02-29');
    });

    it('should remove empty diagnosisType field', function() {
      var props = {
        patient: {
          profile : {
            patient: {},
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        diagnosisType: '',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.diagnosisType).to.be.an('undefined');
    });

    it('should remove empty about field', function() {
      var props = {
        patient: {
          profile : {
            patient: {},
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        about: '',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.about).to.be.an('undefined');
    });

    it('should remove empty mrn field if user account is clinician', function() {
      var props = {
        user: {
          roles: ['clinic'],
        },
        patient: {
          profile : {
            patient: {
              mrn: 'abcd1234'
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        mrn: '',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.mrn).to.be.an('undefined');
    });

    it('should not remove empty mrn field for non-clinical users', function() {
      var props = {
        patient: {
          profile : {
            patient: {
              mrn: 'abcd1234',
            },
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {};
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.mrn).to.equal('abcd1234');
    });

    it('should prepare full form and return expected values for normal user', function() {
      var props = {
        patient: {
          profile : {
            patient: {},
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        about: 'I am a testing developer.',
        birthday: '02-02-1990',
        diagnosisDate: '04-05-2001',
        diagnosisType: 'type1',
        email: 'exampleEmail@example.com',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.about).to.equal('I am a testing developer.');
      expect(result.profile.patient.birthday).to.equal('1990-02-02');
      expect(result.profile.patient.diagnosisDate).to.equal('2001-04-05');
      expect(result.profile.patient.diagnosisType).to.equal('type1');
      expect(result.emails).to.have.length(1);
      expect(result.emails[0]).to.equal('exampleEmail@example.com');
      expect(result.username).to.equal('exampleEmail@example.com');
      expect(result.profile.emails).to.have.length(1)
      expect(result.profile.emails[0]).to.equal('exampleEmail@example.com');
      expect(result.profile.patient.email).to.equal('exampleEmail@example.com');
    });

    it('should prepare full form and return expected values for clinic', function() {
      var props = {
        user: {
          roles: ['clinic'],
        },
        patient: {
          profile : {
            patient: {},
          },
        },
      };

      wrapper.setProps(props);
      var elem = wrapper.find(PatientInfo).childAt(0);
      var formValues = {
        about: 'I am a testing developer.',
        birthday: '02-02-1990',
        diagnosisDate: '04-05-2001',
        diagnosisType: 'type1',
        mrn: '123abc456',
        email: 'exampleEmail@example.com',
      };
      var result = elem.instance().prepareFormValuesForSubmit(formValues);

      expect(result.profile.patient.about).to.equal('I am a testing developer.');
      expect(result.profile.patient.birthday).to.equal('1990-02-02');
      expect(result.profile.patient.diagnosisDate).to.equal('2001-04-05');
      expect(result.profile.patient.diagnosisType).to.equal('type1');
      expect(result.profile.patient.mrn).to.equal('123abc456');
      expect(result.emails).to.have.length(1);
      expect(result.emails[0]).to.equal('exampleEmail@example.com');
      expect(result.username).to.equal('exampleEmail@example.com');
      expect(result.profile.emails).to.have.length(1)
      expect(result.profile.emails[0]).to.equal('exampleEmail@example.com');
      expect(result.profile.patient.email).to.equal('exampleEmail@example.com');
    });
  });

  describe('renderDiagnosisTypeInput', function() {
    let props = {
      patient: { userid: 1234 },
      user: { userid: 1234 },
    };

    beforeEach(() => {
      wrapper.setProps(props);
      wrapper.find(PatientInfo).childAt(0).setState({ editing: true });
      wrapper.update();
    });

    it('should render the renderDiagnosisTypeInput select while in editing mode', function() {
      expect(wrapper.find('select#diagnosisType')).to.have.length(1);
    });

    it('should set the value of renderDiagnosisTypeInput select if available in the patient prop', function() {
      wrapper.setProps({
        patient: {
          userid: 1234,
          profile: {
            patient: {
              diagnosisType: 'type1',
            },
          },
        },
      });

      const select = wrapper.find('select#diagnosisType');
      expect(select.props().defaultValue).to.equal('type1');
    });
  });

  describe('renderDonateForm', function() {
    let props = {
      user: { userid: 5678 },
      patient: { userid: 1234 },
    };

    beforeEach(() => {
      wrapper.setProps(props);
    });

    it('should render the donation form, but only if the patient is the logged-in user', function() {
      expect(wrapper.find('.PatientPage-donateForm')).to.have.length(0);

      wrapper.setProps({
        user: { userid: 1234 },
      });

      expect(wrapper.find('.PatientPage-donateForm')).to.have.length(1);
    });
  });

  describe('renderBgUnitSettings', function() {
    let props = {
      user: { userid: 5678 },
      patient: { userid: 1234 },
      permsOfLoggedInUser: {},
    };


    beforeEach(() => {
      wrapper.setProps(props);
    });

    it('should render the bg unit settings value if editing is not allowed', function() {
      const bgUnitSettings = wrapper.find('.PatientPage-bgUnitSettings').hostNodes();

      expect(bgUnitSettings).to.have.length(1);
      expect(bgUnitSettings.find('.bgUnits').text()).to.equal('mg/dL');
      expect(bgUnitSettings.find('.simple-form').length).to.equal(0);
    });

    it('should render the bg unit settings form if editing is allowed', function() {
      wrapper.setProps({
        permsOfLoggedInUser: { root: true },
      });

      const bgUnitSettings = wrapper.find('.PatientPage-bgUnitSettings').hostNodes();
      expect(bgUnitSettings).to.have.length(1);
      expect(bgUnitSettings.find('.simple-form').length).to.equal(1);
    });
  });

  describe('renderMRNInput', function(){
    let props = {
      user: { userid: 5678 },
      patient: { userid: 1234 },
      permsOfLoggedInUser: {},
    };

    beforeEach(() => {
      wrapper.setProps(props);
      wrapper.find(PatientInfo).childAt(0).setState({ editing: true });
      wrapper.update();
    });

    it('should not render the MRN input if editing is not allowed', function() {
      const mrnInput = wrapper.find('#mrn');
      expect(mrnInput).to.have.length(0);
    });

    it('should render the MRN input if user is custodial', function() {
      wrapper.setProps({
        permsOfLoggedInUser: { custodian: {} },
      });

      const mrnInput = wrapper.find('#mrn');
      expect(mrnInput).to.have.length(1);
    });
  });

  describe('renderEmailInput', function(){
    let props = {
      user: { userid: 5678 },
      patient: { userid: 1234 },
      permsOfLoggedInUser: {},
    };

    beforeEach(() => {
      wrapper.setProps(props);
      wrapper.find(PatientInfo).childAt(0).setState({ editing: true });
      wrapper.update();
    });

    it('should not render the email input if editing is not allowed', function() {
      const bgUnitSettings = wrapper.find('input#email');

      expect(bgUnitSettings).to.have.length(0);
    });

    it('should render the email input if user is custodial', function() {
      wrapper.setProps({
        permsOfLoggedInUser: { custodian: true },
      });

      const bgUnitSettings = wrapper.find('input#email');
      expect(bgUnitSettings).to.have.length(1);
    });
  });

  describe('renderExport', function() {
    it('should render the export UI', function(){
      expect(wrapper.find('.PatientPage-export')).to.have.length(1);
    })
  });

  describe('Smart on FHIR Mode', function() {
    describe('renderExport', function() {
      it('should not render the export UI in Smart on FHIR mode', function() {
        wrapper.setProps({ isSmartOnFhirMode: true });
        expect(wrapper.find('.PatientPage-export')).to.have.length(0);
      });
    });

    describe('renderEditLink', function() {
      it('should not render the edit link in Smart on FHIR mode', function() {
        wrapper.setProps({
          isSmartOnFhirMode: true,
          user: { userid: 1234 },
          patient: { userid: 1234 }
        });
        expect(wrapper.find('.PatientInfo-button--primary')).to.have.length(0);
      });
    });

    describe('profile field clickability', function() {
      it('should not render clickable profile fields in Smart on FHIR mode', function() {
        wrapper.setProps({
          isSmartOnFhirMode: true,
          user: { userid: 1234 },
          patient: {
            userid: 1234,
            profile: {
              fullName: 'Test User',
              patient: {
                birthday: '1990-01-01',
                diagnosisDate: '2000-01-01',
                diagnosisType: 'type1'
              }
            }
          }
        });

        // Profile fields should be non-clickable divs, not links
        expect(wrapper.find('.PatientInfo-block a')).to.have.length(0);
        expect(wrapper.find('.PatientInfo-block').at(0).type()).to.equal('div');
      });

      it('should render clickable profile fields when not in Smart on FHIR mode', function() {
        wrapper.setProps({
          isSmartOnFhirMode: false,
          user: { userid: 1234 },
          patient: {
            userid: 1234,
            profile: {
              fullName: 'Test User',
              patient: {
                birthday: '1990-01-01',
                diagnosisDate: '2000-01-01',
                diagnosisType: 'type1'
              }
            }
          }
        });

        // Profile fields should be clickable links when user is viewing their own profile
        expect(wrapper.find('a.PatientInfo-block')).to.have.length(3); // name, age, diagnosis
      });
    });
  });
});
