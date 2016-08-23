/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var NavbarPatientCard = require('../../../app/components/navbarpatientcard');

describe('NavbarPatientCard', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        href: 'foo',
        trackMetric: function() {}
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});