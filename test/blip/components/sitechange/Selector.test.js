/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016 Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* global chai */
/* global sinon */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
var rewire = require('rewire');

var constants = require('../../../../plugins/blip/basics/logic/constants');

var Selector = rewire('../../../../plugins/blip/basics/components/sitechange/Selector');

describe('SiteChangeSelector', function () {
  var basicsActions = {
    setSiteChangeEvent: sinon.stub()
  };

  Selector.__set__('basicsActions', basicsActions);

  beforeEach(function() {
    basicsActions.setSiteChangeEvent = sinon.stub();
    this.props = {
      data: {
        latestPump: 'Tandem',
        canUpdateSettings: true,
        patientName: 'Jill Jellyfish',
      },
      selectedSubtotal: '',
      selectorOptions: {
        primary: { key: constants.SITE_CHANGE_RESERVOIR, label: 'Reservoir Change' },
        rows: [
          [
            { key: constants.SITE_CHANGE_TUBING, label: 'Tube Primes' },
            { key: constants.SITE_CHANGE_CANNULA, label: 'Cannula Fills' },
          ],
        ],
      },
      updateBasicsSettings: sinon.stub(),
      sectionId: 'siteChanges',
      trackMetric: sinon.stub(),
    };
  });

  it('should be a function', function() {
    expect(Selector).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problem when props provided', function () {
      var elem = React.createElement(Selector, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector');
      expect(compElem).to.be.ok;

      var messageElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-message');
      expect(ReactDOM.findDOMNode(messageElem).textContent).to.equal('We do not have enough information to visualize your infusion site changes. Choose Fill Tubing or Fill Cannula to indicate your infusion site changes.');
    });

    it('should render with cannula message when cannula selected', function () {
      this.props.selectedSubtotal = constants.SITE_CHANGE_CANNULA;

      var elem = React.createElement(Selector, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector');
      expect(compElem).to.be.ok;
  
      var messageElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-message--cannula');
      expect(ReactDOM.findDOMNode(messageElem).textContent).to.equal('We are using Fill Cannula to visualize your infusion site changes. Choose Fill Tubing if those are better indicators.');

      var optionElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-option--selected');
      expect(ReactDOM.findDOMNode(optionElem).textContent).to.equal('Fill Cannula');
    });

    it('should render with tubing message when tubing selected', function () {
      this.props.selectedSubtotal = constants.SITE_CHANGE_TUBING;

      var elem = React.createElement(Selector, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector');
      expect(compElem).to.be.ok;
  
      var messageElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-message--tubing');
      expect(ReactDOM.findDOMNode(messageElem).textContent).to.equal('We are using Fill Tubing to visualize your infusion site changes.');

      var optionElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-option--tubing');
      expect(ReactDOM.findDOMNode(optionElem).textContent).to.equal('Fill Tubing');
    });

    it('should render with message disabled when canUpdateSettings is false', function () {
      this.props.data.canUpdateSettings = false;

      var elem = React.createElement(Selector, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector');
      expect(compElem).to.be.ok;
  
      var messageElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-message--disabled');
      expect(ReactDOM.findDOMNode(messageElem).textContent).to.equal('We do not have enough information to visualize infusion site changes. Ask ' + this.props.data.patientName + ' to choose Fill Tubing or Fill Cannula to indicate infusion site changes.');
    });
  });

  describe('onChange', function() {
    it('should switch from cannulaPrime to tubingPrime', function () {
      this.props.selectedSubtotal = constants.SITE_CHANGE_CANNULA;

      var elem = React.createElement(Selector, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector');
      expect(compElem).to.be.ok;
  
      var messageElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-message--cannula');
      expect(ReactDOM.findDOMNode(messageElem).textContent).to.equal('We are using Fill Cannula to visualize your infusion site changes. Choose Fill Tubing if those are better indicators.');

      var cannulaOptionElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-option--selected');
      expect(ReactDOM.findDOMNode(cannulaOptionElem).textContent).to.equal('Fill Cannula');

      var tubingOptionElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'SiteChangeSelector-option--tubing');

      expect(basicsActions.setSiteChangeEvent.callCount).to.equal(0);
      renderedElem.handleSelectSubtotal(constants.SITE_CHANGE_TUBING, 'Fill Tubing');
      expect(basicsActions.setSiteChangeEvent.withArgs('siteChanges', constants.SITE_CHANGE_TUBING, 'Fill Tubing', this.props.trackMetric, this.props.updateBasicsSettings).callCount).to.equal(1);
    });
  });
});