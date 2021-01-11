/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
var expect = chai.expect;

var Messages = require('../../../../app/components/messages/messages');

describe('Messages', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Messages).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      sinon.spy(console, 'error');
      var props = {
        timePrefs: {}
      };
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(render).to.be.ok;
      expect(console.error.callCount).to.equal(0);
      console.error.restore();
    });
  });

  describe('Initial State', function() {
    it('should equal expected initial state', function() {
      var props = {
        messages : []
      };
      var elem = React.createElement(Messages, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.state;

      expect(state.messages).to.deep.equal(props.messages);
    });
  });
});
