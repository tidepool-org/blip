/** @jsx React.DOM */
/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var BrowserWarningOverlay = require('../../../app/components/browserwarningoverlay');

describe('BrowserWarningOverlay', function () {

  it('should be exposed as a module and be of type function', function() {
    expect(BrowserWarningOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var elem = TestUtils.renderIntoDocument(<BrowserWarningOverlay/>);
      expect(elem).to.be.ok;
    });
  });

  describe('handleSubmit', function() {
    it('should do nothing when no onSubmit defined and submit is clicked', function () {
      var elem = TestUtils.renderIntoDocument(<BrowserWarningOverlay/>);
      expect(elem).to.be.ok;
      var submitButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-terms-submit');

      TestUtils.Simulate.click(submitButton);
    });

    it('should call onSubmit when it is defined and submit is clicked', function () {
      var props = {
        onSubmit: sinon.stub()
      };
      var warningElem = React.createElement(BrowserWarningOverlay, props);
      var elem = TestUtils.renderIntoDocument(warningElem);
      expect(elem).to.be.ok;
      var submitButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-terms-submit');

      expect(props.onSubmit.callCount).to.equal(0);
      TestUtils.Simulate.click(submitButton);
      expect(props.onSubmit.callCount).to.equal(1);
    });
  });
});