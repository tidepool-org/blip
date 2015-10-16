

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var MessageForm = require('../../../../app/components/messages/messageform');

describe('MessageForm', function () {
  var timePrefs = {
    timezoneAware: true,
    timezoneName: 'Pacific/Honolulu'
  };

  it('should be exposed as a module and be of type function', function() {
    expect(MessageForm).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
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
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `timePrefs` was not specified in `MessageForm`.')).to.equal(true);
      expect(console.warn.callCount).to.equal(1);
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
      expect(state.editing).to.equal(false);
      expect(state.saving).to.equal(false);
      expect(state.changeDateTime).to.equal(false);
    });
  });
});