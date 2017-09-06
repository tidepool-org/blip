/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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

/* jshint esversion:6 */
/* global sinon */

var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var basicsState = require('../plugins/blip/basics/logic/state');
var BasicsChart = require('../plugins/blip/basics/chartbasicsfactory');
var TidelineData = require('../js/tidelinedata');
var types = require('../dev/testpage/types');

var { MGDL_UNITS, MMOLL_UNITS } = require('../js/data/util/constants');

describe('BasicsChart', function() {
  it('should render', function() {
    console.error = sinon.stub();
    var td = new TidelineData([new types.Bolus(), new types.Basal()]);
    var props = {
      bgUnits: MGDL_UNITS,
      bgClasses: td.bgClasses,
      onSelectDay: sinon.stub(),
      patient: {},
      patientData: td,
      permsOfLoggedInUser: {
        view: {},
      },
      timePrefs: {},
      updateBasicsData: sinon.stub(),
      updateBasicsSettings: sinon.stub(),
      trackMetric: sinon.stub()
    };
    var elem = React.createElement(BasicsChart, props);
    var render = TestUtils.renderIntoDocument(elem);
    expect(elem).to.be.ok;
    expect(console.error.callCount).to.equal(0);
  });

  it('should console.error when required props are missing', function() {
    console.error = sinon.stub();
    var props = {};
    var elem = React.createElement(BasicsChart, props);
    try {
      TestUtils.renderIntoDocument(elem);
    }
    catch(e) {
      expect(console.error.callCount).to.equal(10);
    }
  });

  it('should not mutate basics state', function() {
    var td = new TidelineData([new types.Bolus(), new types.Basal()]);
    var props = {
      bgUnits: MGDL_UNITS,
      bgClasses: td.bgClasses,
      onSelectDay: sinon.stub(),
      patientData: td,
      timePrefs: {},
      updateBasicsData: sinon.stub(),
      trackMetric: sinon.stub()
    };
    var elem = React.createElement(BasicsChart, props);
    var render = TestUtils.renderIntoDocument(elem);
    expect(render.state.sections === basicsState.sections).to.be.false;
    // siteChanges gets disabled in componentWillMount when no data
    expect(render.state.sections.siteChanges.active).to.be.false;
    expect(basicsState.sections.siteChanges.active).to.be.true;
    // calibration selector in fingerstick section gets active: false added in componentWillMount when no data
    expect(render.state.sections.fingersticks.selectorOptions.rows[0][2].active).to.be.false;
    expect(basicsState.sections.fingersticks.selectorOptions.rows[0][2].active).to.be.undefined;
  });

  it('should calculate bgDistribution for mmol/L data', function() {
    var td = new TidelineData([new types.Bolus(), new types.Basal(), new types.SMBG({ units: MMOLL_UNITS })]);
    var props = {
      bgUnits: MMOLL_UNITS,
      bgClasses: td.bgClasses,
      onSelectDay: sinon.stub(),
      patientData: td,
      timePrefs: {},
      updateBasicsData: sinon.stub(),
      trackMetric: sinon.stub()
    };
    var elem = React.createElement(BasicsChart, props);
    var render = TestUtils.renderIntoDocument(elem);
    expect(render.state.data.bgDistribution.smbg.target).to.equal(1);
  });

  describe('_aggregatedDataEmpty', function() {
    it('should return true if aggregated data is empty', function() {
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._aggregatedDataEmpty()).to.be.true;
    });

    it('should return false if aggregated data is present', function() {
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: _.assign({}, td, {
          basicsData: _.assign({}, td.basicsData, {
            data: _.assign({}, td.basicsData.data, {
              basalBolusRatio: {
                basal: 25,
                bolus: 75,
              },
              averageDailyDose: '10',
              averageDailyCarbs: '80',
            }),
            sections: [],
          }),
        }),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._aggregatedDataEmpty()).to.be.false;
    });
  });

  describe('componentDidMount', function() {
    it('should track pump vacation message metric if aggregated data is missing', function() {
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      sinon.assert.callCount(props.trackMetric, 1);
      sinon.assert.calledWith(props.trackMetric, 'web - pump vacation message displayed');
    });

    it('should not track pump vacation message metric if aggregated data is present', function() {
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: _.assign({}, td, {
          basicsData: _.assign({}, td.basicsData, {
            data: _.assign({}, td.basicsData.data, {
              basalBolusRatio: {
                basal: 25,
                bolus: 75,
              },
              averageDailyDose: '10',
              averageDailyCarbs: '80',
            }),
            sections: [],
          }),
        }),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      sinon.assert.callCount(props.trackMetric, 0);
    });
  });
});
