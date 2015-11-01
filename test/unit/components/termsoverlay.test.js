/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var TermsOverlay = require('../../../app/components/termsoverlay');

describe('TermsOverlay', function () {
  
  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<TermsOverlay/>);

      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `TermsOverlay`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var termsOverlayElem = React.createElement(TermsOverlay, props);
      var elem = TestUtils.renderIntoDocument(termsOverlayElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});