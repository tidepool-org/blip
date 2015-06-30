/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var NotificationElem = require('../../../app/components/notification');

describe('NotificationElem', function () {
  
  describe('render', function() {
    it('should not console.warn when props is empty', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<NotificationElem/>);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        type: 'foo',
        onClose: function() {}
      };
      var notificationElem = React.createElement(NotificationElem, props);
      var elem = TestUtils.renderIntoDocument(notificationElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});