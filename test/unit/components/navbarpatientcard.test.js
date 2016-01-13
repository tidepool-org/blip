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
    it('should console.error when trackMetric not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<NavbarPatientCard/>);

      expect(elem).to.be.ok;
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `NavbarPatientCard`.')).to.equal(true);
    });

    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});