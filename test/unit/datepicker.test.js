var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = require('expect');

var DatePicker = require('../../app/components/datepicker');

describe('DatePicker', function () {
  it('should be a function', function() {
    expect(typeof DatePicker).toBe('function');
  });

  it('is a ReactElement', function () {
    expect(TestUtils.isElement(<DatePicker/>)).toBe(true);
  });

  it('should render without problems', function () {
    var elem = TestUtils.renderIntoDocument(<DatePicker/>);
    expect(elem).toExist();
  });
});