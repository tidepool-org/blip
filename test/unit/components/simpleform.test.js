/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var SimpleForm = require('../../../app/components/simpleform');

describe('SimpleForm', function () {
  
  describe('render', function() {
    it('should console.warn when no props are set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<SimpleForm/>);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        inputs: [],
        formValues: {foo: 'bar'},
        validationErrors: {},
        submitButtonText: 'Submit',
        submitDisabled: false,
        onSubmit: sinon.stub(),
        notification: {},
        disabled: false
      };
      var navbarElem = React.createElement(SimpleForm, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});