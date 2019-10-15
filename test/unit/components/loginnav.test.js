/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
var expect = chai.expect;

var LoginNav = require('../../../app/components/loginnav');

describe('LoginNav', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginNav).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(LoginNav, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(render).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});
