/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
const { render } = require('@testing-library/react');
var expect = chai.expect;

var Invitation = require('../../../app/components/invitation');

describe('Invitation', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Invitation).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        var props = {
          invitation: {
            creator: 'awesome'
          },
          onAcceptInvitation: sinon.stub(),
          onDismissInvitation: sinon.stub(),
          trackMetric: sinon.stub(),
        };
        var elem = React.createElement(Invitation, props);
        render(elem);
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });
});
