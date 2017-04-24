/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Invitation = require('../../../app/components/invitation');

describe('Invitation', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Invitation).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        invitation: {
          creator: 'awesome'
        },
        onAcceptInvitation: sinon.stub(),
        onDismissInvitation: sinon.stub(),
        trackMetric: sinon.stub(),
      };
      var elem = React.createElement(Invitation, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});