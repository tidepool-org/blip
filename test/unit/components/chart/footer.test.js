/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');

import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import * as viz from '@tidepool/viz';
const RangeSelect = viz.components.RangeSelect;

var _ = require('lodash');
var expect = chai.expect;

import Footer from '../../../../app/components/chart/footer';

describe('Footer', function () {
  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {
        chartType: 'Awesome',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: true,
        showingSmbg: false,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should trigger onClickBoxOverlay when trends, showingSmbg and overlayCheckbox changed', function () {
      var props = {
        chartType: 'trends',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: false,
        showingSmbg: true,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var overlayCheckbox = TestUtils.scryRenderedDOMComponentsWithTag(elem, 'input')[0];
      expect(overlayCheckbox.name).to.equal('overlayCheckbox');
      expect(props.onClickBoxOverlay.callCount).to.equal(0);
      TestUtils.Simulate.change(overlayCheckbox);
      expect(props.onClickBoxOverlay.callCount).to.equal(1);
    });

    it('should trigger onClickGroup when trends, showingSmbg and groupCheckbox changed', function () {
      var props = {
        chartType: 'trends',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: false,
        showingSmbg: true,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var groupCheckbox = TestUtils.scryRenderedDOMComponentsWithTag(elem, 'input')[1];
      expect(groupCheckbox.name).to.equal('groupCheckbox');
      expect(props.onClickGroup.callCount).to.equal(0);
      TestUtils.Simulate.change(groupCheckbox);
      expect(props.onClickGroup.callCount).to.equal(1);
    });

    it('should trigger onClickLines when trends, showingSmbg and linesCheckbox changed', function () {
      var props = {
        chartType: 'trends',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: false,
        showingSmbg: true,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var linesCheckbox = TestUtils.scryRenderedDOMComponentsWithTag(elem, 'input')[2];
      expect(linesCheckbox.name).to.equal('linesCheckbox');
      expect(props.onClickLines.callCount).to.equal(0);
      TestUtils.Simulate.change(linesCheckbox);
      expect(props.onClickLines.callCount).to.equal(1);
    });

    it('should trigger onClickValues when valuesCheckbox changed', function () {
      var props = {
        chartType: 'bgLog',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: false,
        showingSmbg: true,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var valuesCheckbox = TestUtils.scryRenderedDOMComponentsWithTag(elem, 'input')[0];
      expect(valuesCheckbox.name).to.equal('valuesCheckbox');
      expect(props.onClickValues.callCount).to.equal(0);
      TestUtils.Simulate.change(valuesCheckbox);
      expect(props.onClickValues.callCount).to.equal(1);
    });

    it('should trigger onClickRefresh when refresh button clicked', function () {
      var props = {
        chartType: 'bgLog',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: false,
        showingSmbg: true,
        showingValues: false,
      };
      var dailyElem = React.createElement(Footer, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'btn-refresh');
      expect(props.onClickRefresh.callCount).to.equal(0);
      TestUtils.Simulate.click(refreshButton);
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should render a RangeSelect when trends, showingCbg', function () {
      var props = {
        chartType: 'trends',
        onClickBoxOverlay: sinon.stub(),
        onClickGroup: sinon.stub(),
        onClickLines: sinon.stub(),
        onClickValues: sinon.stub(),
        onClickRefresh: sinon.stub(),
        onClickBgDataToggle: sinon.stub(),
        boxOverlay: false,
        grouped: true,
        showingLines: false,
        showingCbg: true,
        showingSmbg: false,
        showingValues: false,
        displayFlags: {
          cbg100Emabled: false,
          cbg80Enabeled: true,
          cbg50Enabeled: true,
          cbgMedianEnabled: true,
        },
        currentPatientInViewId: 'abc123',
      };
      // RangeSelect is a redux connect()ed component and needs a Provider/store
      var footer = mount(
        <Provider store={configureStore([])({})}>
          <Footer {...props} />
        </Provider>
      );

      expect(footer.find(RangeSelect).length).to.equal(1);
    });
  });
});
