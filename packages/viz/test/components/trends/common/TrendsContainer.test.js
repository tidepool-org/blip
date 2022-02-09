/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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
import moment from "moment-timezone";
import { shallow } from "enzyme";
import * as sinon from "sinon";
import { expect } from "chai";

import { MGDL_UNITS, MMOLL_UNITS, genRandomId } from "tideline";

import {
  TrendsContainer,
  mapStateToProps,
} from "../../../../src/components/trends/common/TrendsContainer";
import TrendsSVGContainer from "../../../../src/components/trends/common/TrendsSVGContainer";

describe("TrendsContainer", () => {
  describe("TrendsContainer (no redux)", () => {

    const extentSize = 7;
    const timezone = "US/Pacific";

    const devices = {
      dexcom: {
        id: "DexG4Rec_XXXXXXXXX",
        cgmInDay: 288,
      },
      libre: {
        id: "AbbottFreeStyleLibre_XXXXXXXXX",
        cgmInDay: 96,
      },
    };
    const randomInt = (min, max) => Math.floor(min + Math.random() * (max-min));
    const justOneDatum = (device = devices.dexcom, type = "cbg") => ([{
      id: genRandomId(),
      deviceId: device.id,
      msPer24: randomInt(0, 864e5),
      timezone,
      localDate: "2022-01-01",
      type,
      value: 100,
      units: MGDL_UNITS,
    }]);

    function makeDataStubs(data) {
      return {
        grouped: {
          cbg: data ?? [],
        },
      };
    }

    const unfocusCbgSlice = sinon.spy();

    const props = {
      activeDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      currentCbgData: [],
      days: ["2022-01-01"],
      currentPatientInViewId: "a1b2c3",
      extentSize,
      loading: false,
      yScaleClampTop: {
        [MGDL_UNITS]: 300,
        [MMOLL_UNITS]: 25,
      },
      tidelineData: {
        endpoints: [
          moment.utc("2016-03-01T00:00:00.000Z").toISOString(),
          moment.utc().endOf("day").add(1, "millisecond").toISOString(),
        ]
      },
      onSelectDate: sinon.stub(),
      trendsState: {
        cbgFlags: {
          cbg50Enabled: true,
          cbg80Enabled: true,
          cbg100Enabled: true,
          cbgMedianEnabled: true,
        },
      },
      unfocusCbgSlice,
    };

    const mgdl = {
      bgPrefs: {
        bgUnits: MGDL_UNITS,
        bgBounds: {
          veryHighThreshold: 300,
          targetUpperBound: 180,
          targetLowerBound: 80,
          veryLowThreshold: 60,
        },
      },
    };

    describe("mountData", () => {
      let wrapper;

      before(() => {
        const dataStubs = makeDataStubs(justOneDatum());
        props.tidelineData = { ...props.tidelineData, ...dataStubs };
        // console.info("mountData props", props);
        wrapper = shallow(
          <TrendsContainer
            {...props}
            {...mgdl}

          />, { disableLifecycleMethods: false }
        );
      });

      it("should set state.yScaleDomain", () => {
        const { yScaleDomain } = wrapper.state();
        expect(yScaleDomain).to.be.an("array").lengthOf(2);
        expect(yScaleDomain).to.be.deep.eq([mgdl.bgPrefs.bgBounds.veryLowThreshold, props.yScaleClampTop[MGDL_UNITS]]);
      });
    });

    describe("componentDidMount", () => {
      let mountDataSpy;
      let wrapper = null;

      before(() => {
        mountDataSpy = sinon.spy(TrendsContainer.prototype, "mountData");
      });

      after(() => {
        mountDataSpy.restore();
        if (wrapper) wrapper.unmount();
        wrapper = null;
      });

      it("should call the `mountData` method", () => {
        shallow(
          <TrendsContainer
            {...props}
            {...mgdl}
          />, { disableLifecycleMethods: false }
        );
        sinon.assert.callCount(mountDataSpy, 1);
      });
    });

    describe("componentDidUpdate", () => {
      let mountDataSpy;

      before(() => {
        mountDataSpy = sinon.spy(TrendsContainer.prototype, "mountData");
      });

      afterEach(() => {
        mountDataSpy.resetHistory();
      });

      after(() => {
        mountDataSpy.restore();
      });

      it("should call `mountData` if `loading` prop changes from true to false", () => {
        const container = shallow(
          <TrendsContainer
            {...props}
            {...mgdl}
          />, { disableLifecycleMethods: false }
        );
        mountDataSpy.resetHistory();
        sinon.assert.callCount(mountDataSpy, 0);

        container.setProps({ loading: true });
        sinon.assert.callCount(mountDataSpy, 0);

        container.setProps({ loading: false });
        sinon.assert.callCount(mountDataSpy, 1);
      });

      it("should not call `mountData` if `loading` prop does not change from true to false", () => {
        const container = shallow(
          <TrendsContainer
            {...props}
            {...mgdl}
          />, { disableLifecycleMethods: false }
        );
        mountDataSpy.resetHistory();
        sinon.assert.callCount(mountDataSpy, 0);

        container.setProps({ loading: false });
        sinon.assert.callCount(mountDataSpy, 0);
      });
    });

    describe("componentWillUnmount", () => {
      let toBeUnmounted;

      beforeEach(() => {
        toBeUnmounted = shallow(
          <TrendsContainer {...props} {...mgdl} />,
          { disableLifecycleMethods: false }
        );
      });

      describe("when a cbg slice segment is focused", () => {
        beforeEach(() => {
          unfocusCbgSlice.resetHistory();
        });
        it("should fire unfocusCbgSlice", () => {
          expect(unfocusCbgSlice.callCount, "unfocusCbgSlice.callCount before").to.equal(0);
          toBeUnmounted.setProps({
            trendsState: _.assign({ focusedCbgSlice: {} }, props.trendsState)
          });
          toBeUnmounted.unmount();
          expect(unfocusCbgSlice.callCount, "unfocusCbgSlice.callCount after").to.equal(1);
          expect(unfocusCbgSlice.args[0][0], "currentPatientInViewId").to.equal(props.currentPatientInViewId);
        });
      });
    });

    describe("render", () => {
      it("should render `TrendsSVGContainer`", () => {
        const dataStubs = makeDataStubs(justOneDatum());
        props.tidelineData = { ...props.tidelineData, ...dataStubs };
        const wrapper = shallow(
          <TrendsContainer {...props} {...mgdl} />,
          { disableLifecycleMethods: false }
        );
        expect(wrapper.find(TrendsSVGContainer)).to.have.length(1);
      });
    });
  });

  describe("mapStateToProps", () => {
    const userId = "a1b2c3";
    const state = {
      viz: {
        trends: {
          [userId]: {
            oneOption: true,
            otherOption: false,
          },
        },
      },
    };

    it("should map state.viz.trends[currentPatientInViewId] to `trendsState`", () => {
      expect(mapStateToProps(state, { currentPatientInViewId: userId }).trendsState)
        .to.deep.equal(state.viz.trends[userId]);
    });
  });
});
