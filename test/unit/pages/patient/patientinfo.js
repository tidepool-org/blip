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

  it('should render without problems', function () {
    var elem = TestUtils.renderIntoDocument(<PatientInfo/>);
    expect(elem).toExist();
  });
});