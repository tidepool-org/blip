/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Invitation = require('../../../app/components/invitation');

describe('Invitation', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Invitation).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Invitation />);
      expect(console.warn.callCount).to.equal(4);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `Invitation`.')).to.equal(true);
    });

    it('should render without problems when required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        invitation: {
          creator: 'awesome'
        },
        onAcceptInvitation: sinon.stub(),
        onDismissInvitation: sinon.stub(),
        trackMetric: sinon.stub(),
      };
      var elem = React.createElement(Invitation, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});