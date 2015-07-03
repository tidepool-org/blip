/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Messages = require('../../../../app/components/messages/messages');

describe('Messages', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Messages).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var props = {};
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(console.warn.calledWith('Warning: Required prop `timePrefs` was not specified in `Messages`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `timePrefs` was not specified in `MessageForm`. Check the render method of `Messages`.')).to.equal(true);
      expect(console.warn.callCount).to.equal(2);
    });

    it('should render without problems with required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        messages : [],
        createDatetime : '',
        user : {},
        patient : {},
        onClose : sinon.stub(),
        onSave : sinon.stub(),
        onEdit : sinon.stub(),
        onNewMessage : sinon.stub(),
        timePrefs: {}
      };
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should equal expected initial state', function() {
      var props = {
        messages : []
      };
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.messages.length).to.equal(0);
    });
  });
});