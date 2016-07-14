/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Message = require('../../../../app/components/messages/message');

describe('Message', function () {
  var timePrefs = {
    timezoneAware: true,
    timezoneName: 'Pacific/Honolulu'
  };

  describe('getInitialState', function() {
    it('should return an object with editing set to false', function() {
      var note = {
        timestamp : new Date().toISOString(),
        messagetext : 'foo',
        user : {
          fullName:'Test User'
        }
      };
      var elem = TestUtils.renderIntoDocument(<Message theNote={note} timePrefs={timePrefs} />);
      expect(elem).to.be.ok;

      var initialState = elem.getInitialState();
      expect(Object.keys(initialState).length).to.equal(1);
      expect(initialState.editing).to.equal(false);
    });
  });

  describe('render', function() {
    it('should render a populated message', function() {
      var note = {
        timestamp : new Date().toISOString(),
        messagetext : 'foo bar',
        user : {
          fullName:'Test User'
        }
      };

      var elem = TestUtils.renderIntoDocument(<Message theNote={note} timePrefs={timePrefs} />);
      expect(elem).to.be.ok;

      // actual rendered text is modified version of input 'note'
      var headerElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'message-header');
      expect(headerElem).to.be.ok;

      // actual rendered text is modified version of input 'note'
      var timestampElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'message-timestamp');
      expect(timestampElem).to.be.ok;

      var textElem = elem.refs.messageText;
      expect(textElem).to.be.ok;
      expect(textElem.textContent).to.equal(note.messagetext);
    });
  });
});