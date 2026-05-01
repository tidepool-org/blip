/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

var NotificationElem = require('../../../app/components/notification');
const { render } = require('@testing-library/react');
const { BrowserRouter } = require('react-router-dom');

describe('NotificationElem', function () {
  describe('render', function() {
    it('should render without problems', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      var props = {
        contents: {},
        onClose: sinon.stub()
      }
      var elem = render(
        <BrowserRouter>
          <NotificationElem {...props}/>
        </BrowserRouter>
      );

      expect(elem.container.firstChild).to.be.ok;
      expect(consoleErrorStub.callCount).to.equal(0);
      consoleErrorStub.restore();
    });
  });
});
