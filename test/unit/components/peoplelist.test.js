/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var PeopleList = require('../../../app/components/peoplelist');

describe('PeopleList', function () {
  
  describe('render', function() {
    it('should console.warn when required props not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PeopleList/>);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(1);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `PeopleList`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {},
        patient: {}
      };
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return object with expected properties', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {},
        patient: {}
      };
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);
      var state = elem.getInitialState();

      expect(state.editing).to.equal(false);
    }); 
  });
});