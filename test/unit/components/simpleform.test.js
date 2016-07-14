/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var SimpleForm = require('../../../app/components/simpleform');

describe('SimpleForm', function () {
  describe('render', function() {
    it('should not console.error on render', function() {
      console.error = sinon.stub();
      var props = {};
      var navbarElem = React.createElement(SimpleForm, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});