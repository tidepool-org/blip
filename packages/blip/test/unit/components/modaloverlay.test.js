/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
var expect = chai.expect;

var ModalOverlay = require('../../../app/components/modaloverlay');

describe('ModalOverlay', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(ModalOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props present', function () {
      console.error = sinon.stub();
      var props = {
        show: true,
        dialog: 'some fake node',
        overlayClickHandler: sinon.stub()
      };
      var elem = React.createElement(ModalOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});
