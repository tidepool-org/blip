/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var NavbarPatientCard = require('../../../app/components/navbarpatientcard');

describe('NavbarPatientCard', function () {
  
  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<NavbarPatientCard/>);

      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `NavbarPatientCard`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});