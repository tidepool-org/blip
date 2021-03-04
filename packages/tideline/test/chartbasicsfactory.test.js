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

const _ = require('lodash');
const sinon = require('sinon');
const { expect } = require('chai');
const { shallow, mount } = require('enzyme');

const React = require('react');

const basicsState = require('../plugins/blip/basics/logic/state');
const BasicsChart = require('../plugins/blip/basics/chartbasicsfactory').inner;
const TidelineData = require('../js/tidelinedata');
const types = require('../dev/testpage/types');

const { MGDL_UNITS } = require('../js/data/util/constants');

const { CARTRIDGE_CHANGE, INFUSION_SITE_CHANGE } = require('../plugins/blip/basics/logic/constants');

describe('BasicsChart', function() {
  /** @type {import('enzyme').ReactWrapper} */
  let wrapper = null;

  before(() => {
    sinon.stub(console, 'error').returns(console.warn.bind(console));
  });
  after(() => {
    sinon.restore();
  });
  beforeEach(() => {
    sinon.resetHistory();
  });
  afterEach(() => {
    if (wrapper !== null) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  async function newTidelineData(data) {
    const td = new TidelineData();
    await td.addData(data);
    return td;
  }

  it('should render', async() => {
    const td = await newTidelineData([new types.Bolus(), new types.Basal()]);
    const props = {
      bgUnits: MGDL_UNITS,
      bgClasses: td.bgClasses,
      onSelectDay: sinon.stub(),
      patient: {},
      tidelineData: td,
      permsOfLoggedInUser: {
        view: {},
      },
      timePrefs: {
        timezoneAware: true,
        timezoneName: 'UTC',
      },
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    wrapper = mount(<BasicsChart {...props} />);
    wrapper.update();
    expect(wrapper.exists('#chart-basics-factory')).to.be.true;
    expect(console.error.callCount, JSON.stringify(console.error.getCalls(), null, 2)).to.equal(0);
  });

  it('should console.error when required props are missing', () => {
    const props = {};
    try {
      shallow(<BasicsChart {...props} />);
    } catch (e) {
      console.warn(e);
    }
    expect(console.error.callCount).to.be.equals(9);
  });

  it('should not mutate basics state', async () => {
    const td = await newTidelineData([new types.Bolus(), new types.Basal()]);
    const props = {
      bgUnits: MGDL_UNITS,
      bgClasses: td.bgClasses,
      onSelectDay: sinon.stub(),
      tidelineData: td,
      timePrefs: {
        timezoneAware: true,
        timezoneName: 'UTC',
      },
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    wrapper = mount(<BasicsChart {...props} />);
    wrapper.update();
    expect(wrapper.state().sections === basicsState().sections).to.be.false;
  });

  describe('insulinDataAvailable', function() {
    it('should return false if insulin pump data is empty', async () => {
      const td = await newTidelineData([new types.CBG()]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      expect(wrapper.instance().insulinDataAvailable()).to.be.false;
    });

    it('should return true if bolus data is present', async () => {
      const td = await newTidelineData([new types.Bolus()]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();
      expect(wrapper.instance().insulinDataAvailable(wrapper.state().basicsData)).to.be.true;
    });

    it('should return true if basal data is present', async () => {
      const td = await newTidelineData([new types.Basal()]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();
      expect(wrapper.instance().insulinDataAvailable(wrapper.state().basicsData)).to.be.true;
    });

    it('should return true if wizard data is present', async () => {
      const td = await newTidelineData([new types.Wizard()]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();
      expect(wrapper.instance().insulinDataAvailable(wrapper.state().basicsData)).to.be.true;
    });
  });

  describe('automatedBasalEventsAvailable', function() {
    it('should return `false` if there are no `automatedStop` events available', async () => {
      const td = await newTidelineData([
        new types.Basal({ deliveryType: 'automated', deviceTime: '2018-03-03T00:00:00' }),
      ]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();
      expect(wrapper.instance().automatedBasalEventsAvailable(wrapper.state().basicsData)).to.be.false;
    });

    it('should return `true` if there are any `automatedStop` events available', async () => {
      const td = await newTidelineData([
        new types.Basal({ deliveryType: 'automated', deviceTime: '2018-03-03T00:00:00' }),
        new types.Basal({ deliveryType: 'scheduled', deviceTime: '2018-03-03T00:00:00' }),
      ]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };
      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();
      expect(wrapper.instance().automatedBasalEventsAvailable(wrapper.state().basicsData)).to.be.true;
    });
  });

  describe('adjustSectionsBasedOnAvailableData', function() {
    it('should deactivate sections for which there is no data available', async () => {
      const td = await newTidelineData([new types.CBG()]);
      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      const state = wrapper.state();
      // basals gets disabled when no data
      expect(state.sections.basals.active).to.be.false;
      expect(basicsState().sections.basals.active).to.be.true;

      // automated basal stop selector in basal section gets active: false added when no data
      expect(state.sections.basals.selectorOptions.rows[0][2].active).to.be.false;
      expect(basicsState().sections.basals.selectorOptions.rows[0][2].active).to.be.undefined;

      // boluses gets disabled when no data
      expect(state.sections.boluses.active).to.be.false;
      expect(basicsState().sections.boluses.active).to.be.true;

      // siteChanges gets disabled when no data
      expect(state.sections.siteChanges.active).to.be.false;
      expect(basicsState().sections.siteChanges.active).to.be.true;
    });

    it('should activate sections for which there is data present', async () => {
      const td = await newTidelineData([
        new types.SMBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: 'reservoirChange' }),
      ]);

      const props = {
        bgUnits: 'mg/dL',
        bgClasses: td.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {},
        },
        permsOfLoggedInUser: { root: true },
        tidelineData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Insulet' })],
          },
        }),
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      const state = wrapper.state();

      // basals remain enabled when data present
      expect(state.sections.basals.active).to.be.true;
      expect(basicsState().sections.basals.active).to.be.true;

      // boluses remain enabled when data present
      expect(state.sections.boluses.active).to.be.true;
      expect(basicsState().sections.boluses.active).to.be.true;

      // siteChanges remain enabled when data present
      expect(state.sections.siteChanges.active).to.be.true;
      expect(basicsState().sections.siteChanges.active).to.be.true;
    });

    it('should use Cartridge title for some manufacturers', async () => {
      const pumpManufacturer = { pump: { manufacturer: 'Roche'} };

      const td = await newTidelineData([
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
        tidelineData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Diabeloop' })],
          },
        }),
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      // siteChanges remain enabled when data present
      const state = wrapper.state();
      expect(state.sections.siteChanges.active).to.be.true;
      const basics = basicsState(td, td.latestPumpManufacturer);
      expect(basics.sections.siteChanges.active).to.be.true;
      expect(basics.sections.siteChanges.title).to.eql(CARTRIDGE_CHANGE.label);
    });

    it('should use Infusion Sites title for any other manufacturers', async () => {
      const pumpManufacturer = { pump: { manufacturer: 'any'} };

      const td = await newTidelineData([
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
        tidelineData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ['insulin-pump'], source: 'Diabeloop' })],
          },
        }),
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'UTC',
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      // siteChanges remain enabled when data present
      const state = wrapper.state();
      expect(state.sections.siteChanges.active).to.be.true;
      const basics = basicsState(td, td.latestPumpManufacturer);
      expect(basics.sections.siteChanges.active).to.be.true;
      expect(basics.sections.siteChanges.title).to.eql(INFUSION_SITE_CHANGE.label);
    });
  });
});
