/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var PersonCard = require('../../../app/components/personcard');

describe('PersonCard', function () {
  
  describe('render', function() {
    it('should not console.warn when props is empty', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PersonCard/>);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });

    it('should not console.warn when props are set', function() {
      console.warn = sinon.stub();
      var props = {
        href: '/foobar',
        onClick: sinon.stub
      };
      var navbarElem = React.createElement(PersonCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });
});