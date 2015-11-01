/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;
var rewire = require('rewire');
var rewireModule = require('../../utils/rewireModule');

/**
 * Need to set window.config for config module
 */
window.config = {};

describe('PatientNew', function () {
  var PatientNew = rewire('../../../app/pages/patientnew');

  it('should be exposed as a module and be of type function', function() {
    expect(PatientNew).to.be.a('function');
  });

  describe('render', function() {
    it('should warn when required props are not present', function() {
      console.warn = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientNew/>);
      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(2);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `PatientNew`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientNew`.')).to.equal(true);
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.warn = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientNew/>);
      var initialState = elem.getInitialState();
      expect(initialState.working).to.equal(false);
      expect(initialState.formValues.isOtherPerson).to.equal(false);
      expect(initialState.formValues.fullName).to.equal('');
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('isFormDisabled', function() {

    it('should be false when fetching user is true', function() {
      var props = {
        fetchingUser: false,
        user: { name: 'Foo' },
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };

      console.warn = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);

      expect(elem.isFormDisabled()).to.equal(false);
    });

    it('should be false when fetching user is true and user is not falsey', function() {
      var props = {
        fetchingUser: true,
        user: { name: 'Foo' },
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };

      console.warn = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);

      expect(elem.isFormDisabled()).to.equal(false);
    });

    it('should be true when fetching user is true and user is falsey', function() {
      var props = {
        fetchingUser: true,
        user: null,
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };

      console.warn = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientNew {...props}/>);

      expect(elem.isFormDisabled()).to.equal(true);
    });
  });
});
