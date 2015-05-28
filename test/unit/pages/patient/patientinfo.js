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
});