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

var _ = require('lodash');
const sinon = require('sinon');
const expect = require('chai').expect;

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-dom/test-utils');

var basicsState = require('../plugins/blip/basics/logic/state');
var BasicsChart = require('../plugins/blip/basics/chartbasicsfactory').inner;
var TidelineData = require('../js/tidelinedata');
var types = require('../dev/testpage/types');

var { MGDL_UNITS } = require('../js/data/util/constants');

const { CARTRIDGE_CHANGE, INFUSION_SITE_CHANGE } = require('../plugins/blip/basics/logic/constants');

describe('BasicsChart', function() {
  before(() => {
    sinon.stub(console, 'error');
  });
  after(() => {
    sinon.restore();
  });
  beforeEach(() => {
    sinon.resetHistory();
  });

  it('should render', function() {
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
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    var elem = React.createElement(BasicsChart, props);
    expect(elem).to.be.ok;
    expect(console.error.callCount).to.equal(0);
  });

  it('should console.error when required props are missing', () => {
    var props = {};
    try {
      React.createElement(BasicsChart, props);
    } catch (e) {
      console.warn(e);
    }
    expect(console.error.callCount).to.be.equals(11);
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
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    var elem = React.createElement(BasicsChart, props);
    var render = TestUtils.renderIntoDocument(elem);
    expect(render.state.sections === basicsState().sections).to.be.false;
  });

  describe('_insulinDataAvailable', function() {
    it('should return false if insulin pump data is empty', function() {
      var td = new TidelineData([new types.CBG()]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._insulinDataAvailable()).to.be.false;
    });

    it('should return true if bolus data is present', function() {
      var td = new TidelineData([new types.Bolus()]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._insulinDataAvailable()).to.be.true;
    });

    it('should return true if basal data is present', function() {
      var td = new TidelineData([new types.Basal()]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._insulinDataAvailable()).to.be.true;
    });

    it('should return true if wizard data is present', function() {
      var td = new TidelineData([new types.Wizard()]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._insulinDataAvailable()).to.be.true;
    });
  });

  describe('_automatedBasalEventsAvailable', function() {
    it('should return `false` if there are no `automatedStop` events available', function() {
      var td = new TidelineData([
        new types.Basal({ deliveryType: 'automated', deviceTime: '2018-03-03T00:00:00' }),
      ]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._automatedBasalEventsAvailable()).to.be.false;
    });

    it('should return `true` if there are any `automatedStop` events available', function() {
      var td = new TidelineData([
        new types.Basal({ deliveryType: 'automated', deviceTime: '2018-03-03T00:00:00' }),
        new types.Basal({ deliveryType: 'scheduled', deviceTime: '2018-03-03T00:00:00' }),
      ]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      expect(render._automatedBasalEventsAvailable()).to.be.true;
    });
  });

  describe('_adjustSectionsBasedOnAvailableData', function() {
    it('should deactivate sections for which there is no data available', function() {
      var td = new TidelineData([new types.CBG()]);
      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      // basals gets disabled when no data
      expect(render.state.sections.basals.active).to.be.false;
      expect(basicsState().sections.basals.active).to.be.true;

      // automated basal stop selector in basal section gets active: false added when no data
      expect(render.state.sections.basals.selectorOptions.rows[0][2].active).to.be.false;
      expect(basicsState().sections.basals.selectorOptions.rows[0][2].active).to.be.undefined;

      // boluses gets disabled when no data
      expect(render.state.sections.boluses.active).to.be.false;
      expect(basicsState().sections.boluses.active).to.be.true;

      // siteChanges gets disabled when no data
      expect(render.state.sections.siteChanges.active).to.be.false;
      expect(basicsState().sections.siteChanges.active).to.be.true;
    });

    it('should activate sections for which there is data present', function() {
      var td = new TidelineData([
        new types.SMBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: 'reservoirChange' }),
      ]);

      var props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {},
        },
        permsOfLoggedInUser: { root: true },
        patientData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Insulet' })],
          },
        }),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      // basals remain enabled when data present
      expect(render.state.sections.basals.active).to.be.true;
      expect(basicsState().sections.basals.active).to.be.true;

      // boluses remain enabled when data present
      expect(render.state.sections.boluses.active).to.be.true;
      expect(basicsState().sections.boluses.active).to.be.true;

      // siteChanges remain enabled when data present
      expect(render.state.sections.siteChanges.active).to.be.true;
      expect(basicsState().sections.siteChanges.active).to.be.true;
    });

    it('should use Cartridge title for some manufacturers', function() {
      const pumpManufacturer = { pump: { manufacturer: 'Roche'} };
  
      const td = new TidelineData([
        new types.CBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: 'reservoirChange' }),
        new types.Settings({source: 'Diabeloop', payload: { ...pumpManufacturer }}),
      ]);

      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {},
        },
        permsOfLoggedInUser: { root: true },
        patientData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Diabeloop' })],
          },
        }),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      // siteChanges remain enabled when data present
      expect(render.state.sections.siteChanges.active).to.be.true;
      const basics = basicsState(td, td.latestPumpManufacturer);
      expect(basics.sections.siteChanges.active).to.be.true;
      expect(basics.sections.siteChanges.title).to.eql(CARTRIDGE_CHANGE.label);
    });

    it('should use Infusion Sites title for any other manufacturers', function() {
      const pumpManufacturer = { pump: { manufacturer: 'any'} };
  
      const td = new TidelineData([
        new types.CBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: 'reservoirChange' }),
        new types.Settings({source: 'Diabeloop', payload: { ...pumpManufacturer }}),
      ]);

      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {},
        },
        permsOfLoggedInUser: { root: true },
        patientData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Diabeloop' })],
          },
        }),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);

      // siteChanges remain enabled when data present
      expect(render.state.sections.siteChanges.active).to.be.true;
      const basics = basicsState(td, td.latestPumpManufacturer);
      expect(basics.sections.siteChanges.active).to.be.true;
      expect(basics.sections.siteChanges.title).to.eql(INFUSION_SITE_CHANGE.label);
    });
  });

  describe('componentDidMount', function() {
    it('should track metrics which device data was available to the user when viewing', function() {
      this.timeout(8000); // Double timeout for this test, as it seems to fail often on travis

      var elem;
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      props.patientData = td;
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'Pump only'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.SMBG()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'BGM only'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.CBG()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'CGM only'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.CBG(), new types.SMBG()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'BGM+CGM'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.SMBG(), new types.Basal()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'BGM+Pump'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.CBG(), new types.Basal()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'CGM+Pump'});

      props.trackMetric.reset();
      props.patientData = new TidelineData([new types.CBG(), new types.SMBG(), new types.Basal()]);
      elem = React.createElement(BasicsChart, props);
      TestUtils.renderIntoDocument(elem);
      sinon.assert.calledWith(props.trackMetric, 'web - viewed basics data', {device: 'BGM+CGM+Pump'});
    });
  });

  describe('componentWillUnmount', function() {
    it('should call the updateBasicsData prop method with the current state', function() {
      var td = new TidelineData([new types.Bolus(), new types.Basal()]);
      var props = {
        bgUnits: MGDL_UNITS,
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patientData: td,
        timePrefs: {},
        updateBasicsData: sinon.stub(),
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      var elem = React.createElement(BasicsChart, props);
      var render = TestUtils.renderIntoDocument(elem);
      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(render).parentNode);

      sinon.assert.calledOnce(props.updateBasicsData);
      sinon.assert.calledWithMatch(props.updateBasicsData, {
        data: sinon.match.object,
        sections: sinon.match.object,
        timezone: sinon.match.string,
      });
    });
  });
});