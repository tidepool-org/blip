/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var { render } = require('@testing-library/react');
var expect = chai.expect;

var Messages = require('../../../../app/components/messages/messages');

describe('Messages', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Messages).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      const consoleError = sinon.stub(console, 'error');
      var props = {
        timePrefs: {}
      };

      try {
        var { container } = render(React.createElement(Messages, props));
        expect(container.firstChild).to.not.be.null;
        expect(consoleError.callCount).to.equal(0);
      } finally {
        consoleError.restore();
      }
    });
  });

  describe('initial state', function() {
    it('should equal expected initial state', function() {
      var props = {
        messages : []
      };
      var instance = new Messages.WrappedComponent(props);
      var state = instance.state;

      expect(state.messages).to.deep.equal(props.messages);
    });
  });
});
