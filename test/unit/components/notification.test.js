/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

var NotificationElem = require('../../../app/components/notification');
const { mount } = require('enzyme');

describe('NotificationElem', function () {
  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {
        contents: {},
        onClose: sinon.stub()
      }
      var elem = mount(<NotificationElem {...props}/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});
