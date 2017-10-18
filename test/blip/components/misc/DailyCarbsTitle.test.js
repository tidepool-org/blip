/* global chai */
/* global sinon */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var DailyCarbsTitle = require('../../../../plugins/blip/basics/components/misc/DailyCarbsTitle');

describe('DailyCarbsTitle', function () {
  it('should render the average daily carbs', function () {
    var props = {
      data: {
        averageDailyCarbs: 120
      },
      iconClass: 'icon-down',
      sectionName: 'averageDailyCarbs',
      trackMetric: sinon.stub(),
    };

    var elem = TestUtils.renderIntoDocument(
      <DailyCarbsTitle
        data={props.data}
        iconClass={props.iconClass}
        sectionName={props.sectionName}
        trackMetric={props.trackMetric} />
    );

    var headerElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyCarbsTitle');
    expect(headerElem).to.be.ok;

    var titleElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyCarbsTitle-label');
    expect(ReactDOM.findDOMNode(titleElem).textContent).to.equal('Avg daily carbs');

    var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyCarbsTitle-value');
    expect(ReactDOM.findDOMNode(inputElem).textContent).to.equal('120 g');
  });
});
