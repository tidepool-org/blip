/* global chai */
/* global sinon */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
var rewire = require('rewire');

var DailyDose = rewire('../../../plugins/blip/basics/components/chart/DailyDose');

describe('DailyDose', function () {
  var basicsActions = {
    addToBasicsData: sinon.stub()
  };

  DailyDose.__set__('basicsActions', basicsActions);

  beforeEach(function() {
    // Reset the stub before each test
    basicsActions.addToBasicsData = sinon.stub()
  });

  it('should be a function', function() {
    expect(DailyDose).to.be.a('function');
  });

  describe('render', function() {
    it('should render and show 2 warning messages for missing props', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<DailyDose/>);
      expect(console.error.callCount).to.equal(1);
    });

    it('should render without problem when props provided', function () {
      console.error = sinon.stub();

      var props = {
        data: {
          weight: 100,
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );
      
      expect(console.error.callCount).to.equal(0);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose');
      expect(compElem).to.be.ok;
    });

    it('should render with blank input when no weight specified', function () {
      console.error = sinon.stub();

      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );
      
      expect(console.error.callCount).to.equal(0);
      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      expect(React.findDOMNode(inputElem).value).to.be.empty;
    });

    it('should render with filled in input when weight specified', function () {
      console.error = sinon.stub();

      var props = {
        data: {
          weight: 10,
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );
      
      expect(console.error.callCount).to.equal(0);
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(null);

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      expect(React.findDOMNode(inputElem).value).to.equal('10');
    });
  });

  describe('onWeightChange', function() {
    it('should update state with valid true when 2 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 2;

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
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = '2.';
      expect(elem.state.valid).to.be.false;
      elem.onWeightChange();
      expect(elem.state.valid).to.be.false;
    });

    it('should update state with valid true when 2.3 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 2.3;

      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);
      elem.onWeightChange();
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(2.3);
    });

    it('should update state with valid true when 0.11 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 0.11;

      expect(elem.state.valid).to.be.false;
      expect(elem.state.formWeight).to.equal(null);
      elem.onWeightChange();
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(0.11);
    });

    it('should update state with valid false when -4 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = -4;

      expect(elem.state.valid).to.be.false;
      elem.onWeightChange();
      expect(elem.state.valid).to.be.false;
    });

    it('should update state with valid true when 500 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 500;

      expect(elem.state.valid).to.be.false;
      elem.onWeightChange();
      expect(elem.state.valid).to.be.true;
      expect(elem.state.formWeight).to.equal(500);
      var errorElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'DailyDose-weightInputForm-tooHigh');
      expect(errorElems.length).to.equal(0);
    });

    it('should update state with valid false when 501 is input value', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 501;

      expect(elem.state.valid).to.be.false;
      elem.onWeightChange();
      expect(elem.state.valid).to.be.false;
      var errorElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'DailyDose-weightInputForm-tooHigh');
      expect(errorElems.length).to.equal(1);
    });
  });

  describe('onClickCalculate', function() {
    it('should result in call to addToBasicsData when weight is a number greater than 0', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 2.3;

      elem.onClickCalculate();
      expect(basicsActions.addToBasicsData.withArgs('weight', 2.3).callCount).to.equal(1);
    });

    it('should not result in call to addToBasicsData when weight is 0', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 0;

      elem.onClickCalculate();
      expect(basicsActions.addToBasicsData.callCount).to.equal(0);
    });

    it('should not result in call to addToBasicsData when weight is not a number', function() {
      var props = {
        data: {
          totalDailyDose: 11
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyDose data={props.data} />
      );

      var inputElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyDose-weightInputForm-input');
      React.findDOMNode(inputElem).value = 'foo';

      elem.onClickCalculate();
      expect(basicsActions.addToBasicsData.callCount).to.equal(0);
    });
  });
});