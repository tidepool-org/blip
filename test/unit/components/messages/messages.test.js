/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Messages = require('../../../../app/components/messages/messages');

describe('Messages', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Messages).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(console.error.calledWith('Warning: Failed propType: Required prop `timePrefs` was not specified in `Messages`.')).to.equal(true);
    });

    it('should render without problems with required props are present', function () {
      console.error = sinon.stub();
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
      expect(console.error.calledWith('Warning: Failed propType: Required prop `timePrefs` was not specified in `Messages`.')).to.equal(false);
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

    });
  });
});