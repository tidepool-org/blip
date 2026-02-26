/* global chai */
/* global describe */
/* global sinon */
/* global it */

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
      var instance = new MessageForm.WrappedComponent({ timePrefs: timePrefs });
      var state = instance.getInitialState();

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
