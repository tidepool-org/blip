/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var MessageForm = require('../../../../app/components/messages/messageform');

describe('MessageForm', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(MessageForm).to.be.a('function');
  });

  describe('render', function() {

    it('should render without problems when properties are defined', function () {
      console.warn = sinon.stub();
      var props = {
        formFields : {},
        messagePrompt : '',
        saveBtnText : '',
        cancelBtnText : '',
        onCancel : sinon.stub(),
        onSubmit : sinon.stub()
      };
      var elem = React.createElement(MessageForm, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should equal expected initial state', function() {
      var props = {};
      var elem = React.createElement(MessageForm, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.msg).to.equal('');
      expect(state.whenUtc).to.equal(null);
      expect(state.date).to.equal(null);
      expect(state.time).to.equal(null);
      expect(state.offset).to.equal(null);
      expect(state.editing).to.equal(false);
      expect(state.saving).to.equal(false);
      expect(state.changeDateTime).to.equal(false);
    });
  });
});