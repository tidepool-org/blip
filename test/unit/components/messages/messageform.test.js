/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

var MessageForm = require('../../../../app/components/messages/messageform');
const { mount } = require('enzyme');

describe('MessageForm', function () {
  var timePrefs = {
    timezoneAware: true,
    timezoneName: 'Pacific/Honolulu'
  };

  it('should be exposed as a module and be of type function', function() {
    expect(MessageForm).to.be.a('function');
  });

  describe('getInitialState', function() {
    it('should equal expected initial state', function() {
      var props = {};
      var elem = React.createElement(MessageForm, props);
      var render = mount(elem);
      var state = render.childAt(0).instance().getInitialState();

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
