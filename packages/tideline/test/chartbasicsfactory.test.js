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

import _ from "lodash";
import React from "react";
import * as sinon from "sinon";
import { expect } from "chai";
import { shallow, mount } from "enzyme";

import basicsState from "../plugins/blip/basics/logic/state";
import { BasicsChartNoSize as BasicsChart } from "../plugins/blip/basics/chartbasicsfactory";
import TidelineData from "../js/tidelinedata";
import * as types from "../dev/testpage/types";

import { CARTRIDGE_CHANGE, INFUSION_SITE_CHANGE } from "../plugins/blip/basics/logic/constants";

describe("BasicsChart", function() {
  /** @type {import('enzyme').ReactWrapper} */
  let wrapper = null;

  before(() => {
    sinon.stub(console, "error").returns(console.warn.bind(console));
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

  it("should render", async() => {
    const td = await newTidelineData([new types.Bolus(), new types.Basal()]);
    const props = {
      bgUnits: td.opts.bgUnits,
      bgClasses: td.opts.bgClasses,
      onSelectDay: sinon.stub(),
      patient: {
        profile: {
          fullName: "John Doe",
        },
      },
      tidelineData: td,
      permsOfLoggedInUser: {
        view: {},
      },
      timePrefs: {
        timezoneAware: true,
        timezoneName: "UTC",
      },
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    wrapper = mount(<BasicsChart {...props} />);
    wrapper.update();
    expect(wrapper.exists("#chart-basics-factory")).to.be.true;
    expect(console.error.callCount, JSON.stringify(console.error.getCalls(), null, 2)).to.equal(0);
  });

  it("should console.error when required props are missing", () => {
    const props = {};
    try {
      shallow(<BasicsChart {...props} />);
    } catch (e) {
      console.warn(e);
    }
    expect(console.error.callCount).to.be.equals(9);
  });

  it("should not mutate basics state", async () => {
    const td = await newTidelineData([new types.Bolus(), new types.Basal()]);
    const props = {
      bgUnits: td.opts.bgUnits,
      bgClasses: td.opts.bgClasses,
      onSelectDay: sinon.stub(),
      tidelineData: td,
      timePrefs: {
        timezoneAware: true,
        timezoneName: "UTC",
      },
      trackMetric: sinon.stub(),
      size: { width: 1000 }
    };
    wrapper = mount(<BasicsChart {...props} />);
    wrapper.update();
    expect(wrapper.state().sections === basicsState().sections).to.be.false;
  });

  describe("insulinDataAvailable", function() {
    it("should return false if insulin pump data is empty", async () => {
      const td = await newTidelineData([new types.CBG()]);
      const props = {
        bgUnits: td.opts.bgUnits,
        bgClasses: td.opts.bgClasses,
        onSelectDay: sinon.stub(),
        tidelineData: td,
        timePrefs: {
          timezoneAware: true,
          timezoneName: "UTC",
        },
        trackMetric: sinon.stub(),
        size: { width: 1000 }
      };

      wrapper = mount(<BasicsChart {...props} />);
      wrapper.update();

      expect(wrapper.instance().insulinDataAvailable()).to.be.false;
    });
  });

  describe("adjustSectionsBasedOnAvailableData", function() {
    it("should use Cartridge title for some manufacturers", async () => {
      const pumpManufacturer = { pump: { manufacturer: "Roche"} };

      const td = await newTidelineData([
        new types.CBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: "reservoirChange" }),
        new types.Settings({source: "Diabeloop", payload: { ...pumpManufacturer }}),
      ]);

      const props = {
        bgUnits: td.opts.bgUnits,
        bgClasses: td.opts.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {
            fullName: "John Doe",
          },
        },
        permsOfLoggedInUser: { root: true },
        tidelineData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ["insulin-pump"], source: "Diabeloop" })],
          },
        }),
        timePrefs: {
          timezoneAware: true,
          timezoneName: "UTC",
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

    it("should use Infusion Sites title for any other manufacturers", async () => {
      const pumpManufacturer = { pump: { manufacturer: "any"} };

      const td = await newTidelineData([
        new types.CBG(),
        new types.Bolus(),
        new types.Basal(),
        new types.DeviceEvent({ subType: "reservoirChange" }),
        new types.Settings({source: "Diabeloop", payload: { ...pumpManufacturer }}),
      ]);

      const props = {
        bgUnits: td.opts.bgUnits,
        bgClasses: td.opts.bgClasses,
        onSelectDay: sinon.stub(),
        patient: {
          profile: {
            fullName: "John Doe",
          },
        },
        permsOfLoggedInUser: { root: true },
        tidelineData: _.assign({}, td, {
          grouped: {
            upload: [new types.Upload({ deviceTags: ["insulin-pump"], source: "Diabeloop" })],
          },
        }),
        timePrefs: {
          timezoneAware: true,
          timezoneName: "UTC",
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
