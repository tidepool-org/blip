/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var ModalOverlay = require('../../../app/components/modaloverlay');

describe('ModalOverlay', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(ModalOverlay).to.be.a('function');
  });

  describe('render', function() {

    it('should render without problems when required props present', function () {
      console.warn = sinon.stub();
      var props = {
        show: true,
        dialog: 'some fake node',
        overlayClickHandler: sinon.stub()
      };
      var elem = React.createElement(ModalOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });

    it('should render with 3 warnings when no props are present', function () {
      console.warn = sinon.stub();
      var props = {};
      var elem = React.createElement(ModalOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(3);
    });
  });
});