var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = require('expect');

var PatientInfo = require('../../../../app/pages/patient/patientinfo');

describe('PatientInfo', function () {
  it('should be a function', function() {
    expect(typeof PatientInfo).toBe('function');
  });

  it('is a ReactElement', function () {
    expect(TestUtils.isElement(<PatientInfo/>)).toBe(true);
  });


  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientInfo/>);
      expect(elem).toExist();
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `PatientInfo`.')).toBe(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.spy();
      var props = {
        trackMetric: function() {}
      };

      var patientInfoElem = React.createElement(PatientInfo, props);
      var elem = TestUtils.renderIntoDocument(patientInfoElem);
      expect(elem).toExist();
      expect(console.warn.callCount).toBe(0);
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
      expect(elem).toExist();
      expect(elem.isSamePersonUserAndPatient()).toBe(false);
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
      expect(elem).toExist();
      expect(elem.isSamePersonUserAndPatient()).toBe(true);
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
      expect(elem).toExist();
      expect(elem.getAgeText(elem.props.patient, new Date(1984, 4, 20))).toBe('Birthdate not known');
      expect(elem.getAgeText(elem.props.patient, new Date(1983, 4, 20))).toBe('Birthdate not known');
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
      expect(elem).toExist();
      expect(elem.getAgeText(elem.props.patient, new Date(1985, 4, 19))).toBe('1 year old');
      expect(elem.getAgeText(elem.props.patient, new Date(1986, 4, 19))).toBe('2 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1987, 4, 19))).toBe('3 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1988, 4, 19))).toBe('4 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(1999, 4, 19))).toBe('15 years old');
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 19))).toBe('31 years old');
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
      expect(elem).toExist();
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).toBe('31 years old');
      elem.props.patient.profile.patient.birthday = '1984-04-30';
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).toBe('31 years old');
      elem.props.patient.profile.patient.birthday = '1984-05-29';
      expect(elem.getAgeText(elem.props.patient, new Date(2015, 4, 28))).toBe('30 years old');
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
      expect(elem).toExist();
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1983, 3, 20))).toBe('Diagnosis date not known');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1982, 4, 20))).toBe('Diagnosis date not known');
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
      expect(elem).toExist();
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1984, 4, 18))).toBe('Diagnosed this year');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1985, 4, 19))).toBe('Diagnosed 1 year ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1986, 4, 19))).toBe('Diagnosed 2 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1987, 4, 19))).toBe('Diagnosed 3 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1988, 4, 19))).toBe('Diagnosed 4 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(1999, 4, 19))).toBe('Diagnosed 15 years ago');
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 19))).toBe('Diagnosed 31 years ago');
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
      expect(elem).toExist();
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).toBe('Diagnosed 31 years ago');
      elem.props.patient.profile.patient.diagnosisDate = '1984-04-30';
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).toBe('Diagnosed 31 years ago');
      elem.props.patient.profile.patient.diagnosisDate = '1984-05-29';
      expect(elem.getDiagnosisText(elem.props.patient, new Date(2015, 4, 28))).toBe('Diagnosed 30 years ago');
    });
  });
});