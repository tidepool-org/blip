/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var NotificationElem = require('../../../app/components/notification');

describe('NotificationElem', function () {
  
  describe('render', function() {
    it('should render without problems', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<NotificationElem/>);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});