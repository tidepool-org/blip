/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
var expect = chai.expect;

var NotificationElem = require('../../../app/components/notification');

describe('NotificationElem', function () {
  describe('render', function () {
    it('should render without problems', function () {
      sinon.spy(console, 'error');
      var props = {
        contents: {},
        onClose: sinon.stub()
      };
      var elem = TestUtils.renderIntoDocument(<NotificationElem {...props} />);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
      console.error.restore();
    });
  });
});
