/** @jsx React.DOM */
/* global chai */
/* global sinon */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var DailyDose = require('../../../plugins/blip/basics/components/chart/DailyDose');

describe('DailyDose', function () {

  it('should be a function', function() {
    expect(DailyDose).to.be.a('function');
  });

  describe('render', function() {
    it('should render and show 2 warning messages for missing props', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<DailyDose/>);
      expect(console.warn.callCount).to.equal(2);
    });

    it('should render without problem when props provided', function () {
      console.warn = sinon.stub();

      var props = {
        data: {
          weight: 100,
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );
      
      expect(console.warn.callCount).to.equal(0);

      // actual rendered text is modified version of input 'note'
      var compElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose');
      expect(compElem).to.be.ok;
    });

    it('should render with blank input when no weight specified', function () {
      console.warn = sinon.stub();

      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );
      
      expect(console.warn.callCount).to.equal(0);
      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      expect(inputElem.getDOMNode().value).to.be.empty;
    });

    it('should render with filled in input when weight specified', function () {
      console.warn = sinon.stub();

      var props = {
        data: {
          weight: 10,
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );
      
      expect(console.warn.callCount).to.equal(0);
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(null);

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      expect(inputElem.getDOMNode().value).to.equal('10');
    });
  });

  describe('onWeightChange', function() {
    it('should update state with valid true when 2 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = 2;

      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);
      elem.onWeightChange();
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(2);
    });

    it('should update state with valid false when 2. is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = '2.';
      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);
      elem.onWeightChange();
      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal('2.');
    });

    it('should update state with valid false when 2.3 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = 2.3;

      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);
      elem.onWeightChange();
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(2.3);
    });
  });

  describe('onClickCalculate', function() {
    it('should result in call to addToBasicsData when weight is a number greater than 0', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = 2.3;

      elem.onClickCalculate();
      expect(props.addToBasicsData.withArgs('weight', 2.3).callCount).to.equal(1);
    });

    it('should not result in call to addToBasicsData when weight is 0', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = 0;

      elem.onClickCalculate();
      expect(props.addToBasicsData.callCount).to.equal(0);
    });

    it('should not result in call to addToBasicsData when weight is not a number', function() {
      var props = {
        data: {
          totalDailyDose: 11
        },
        addToBasicsData: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose 
          data={props.data}
          addToBasicsData={props.addToBasicsData}/>
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      inputElem.getDOMNode().value = 'foo';

      elem.onClickCalculate();
      expect(props.addToBasicsData.callCount).to.equal(0);
    });
  });
});