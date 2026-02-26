/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

var MailTo = require('../../../app/components/mailto');
const { render } = require('@testing-library/react');

describe('MailTo', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(MailTo).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      var props = {
        linkTitle: 'some string',
        emailAddress: 'gordonmdent@gmail.com',
        emailSubject: 'Awesome Sauce',
        onLinkClicked: sinon.stub()
      };
      var elem = React.createElement(MailTo, props);
      render(elem);
      expect(consoleErrorStub.callCount).to.equal(0);
      consoleErrorStub.restore();
    });
  });
});
