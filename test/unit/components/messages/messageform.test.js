/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
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

  describe('getInitialState', function() {
    it('should equal expected initial state', function() {
      var props = {};
      var elem = React.createElement(MessageForm, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getWrappedInstance().getInitialState();

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
