/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var MailTo = require('../../../app/components/mailto');

describe('MailTo', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(MailTo).to.be.a('function');
  });

  describe('render', function() {

    it('should render and throw 4 warnings when no props defined', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(MailTo, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(4);
    });

    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        linkTitle: 'some string',
        emailAddress: 'gordonmdent@gmail.com',
        emailSubject: 'Awesome Sauce',
        onLinkClicked: sinon.stub()
      };
      var elem = React.createElement(MailTo, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});