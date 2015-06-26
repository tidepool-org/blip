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

    it('should render without problems when properties are defined', function () {
      console.warn = console.log;
      var props = {};
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);
      //expect(console.warn.callCount).to.equal(0);
    });

    it('should render without problems when properties are defined', function () {
      console.warn = sinon.stub();
      var props = {
        messages : [],
        createDatetime : '',
        user : {},
        patient : {},
        onClose : sinon.stub(),
        onSave : sinon.stub(),
        onEdit : sinon.stub(),
        onNewMessage : sinon.stub()
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