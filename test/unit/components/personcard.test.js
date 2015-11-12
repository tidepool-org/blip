/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var PersonCard = require('../../../app/components/personcard');

describe('PersonCard', function () {
  
  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PersonCard/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});