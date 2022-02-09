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
import { shallow } from "enzyme";
import { expect } from "chai";
import * as sinon from "sinon";

import { MGDL_UNITS } from "tideline";

import bgBounds from "../../../helpers/bgBounds";
import { TrendsSVGContainer } from "../../../../src/components/trends/common/TrendsSVGContainer";
import Background
  from "../../../../src/components/trends/common/Background";
import CBGSlicesContainer
  from "../../../../src/components/trends/cbg/CBGSlicesContainer";
import NoData from "../../../../src/components/trends/common/NoData";
import TargetRangeLines from "../../../../src/components/trends/common/TargetRangeLines";
import XAxisLabels from "../../../../src/components/trends/common/XAxisLabels";
import XAxisTicks from "../../../../src/components/trends/common/XAxisTicks";
import YAxisLabelsAndTicks from "../../../../src/components/trends/common/YAxisLabelsAndTicks";

/**
 * @typedef {import("enzyme").ShallowWrapper } ShallowWrapper
 */

describe("TrendsSVGContainer", () => {
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
    bgPrefs: {
      bgBounds,
      bgUnits: MGDL_UNITS,
    },
    // normally provided by react-sizeme wrapper but we test w/o that
    size: {
      width: 960,
      height: 520,
    },
    dates: ["2017-01-01"],
    cbgData: [{ id: "a2b3c4", localDate: "2017-01-01", msPer24: 6000, value: 180 }],
    yScaleDomain: [60, 300],
    displayFlags: {
      cbg100Enabled: false,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    onSelectDate: _.noop,
    showingCbgDateTraces: false,
  };
  const focusedSliceData = {
    msFrom: 0,
    msTo: 10000,
    firstQuartile: 25,
    thirdQuartile: 75,
    ninetiethQuantile: 200,
    tenthQuantile: 300,
    max: 200,
    min: 0,
    median: 100,
  };
  const focusedSlice = {
    data: focusedSliceData,
    position: {
      left: 0,
      tooltipLeft: true,
      yPositions: focusedSliceData,
    },
  };

  /** @type {ShallowWrapper} */
  let wrapper = null;

  beforeEach(() => {
    sinon.spy(TrendsSVGContainer.prototype, "setScales");
  });
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    TrendsSVGContainer.prototype.setScales.restore();
  });

  describe("setScales", () => {
    beforeEach(() => {
      // Stub render, because it crash on mounting
      sinon.stub(TrendsSVGContainer.prototype, "render").returns(null);
    });
    afterEach(() => {
      TrendsSVGContainer.prototype.render.restore();
    });
    it("should set the range of the xScale", () => {
      expect(TrendsSVGContainer.prototype.setScales.callCount, "setScales.callCount before").to.equal(0);
      wrapper = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
      expect(TrendsSVGContainer.prototype.setScales.callCount, "setScales.callCount after").to.equal(1);
      const { xScale } = wrapper.state();
      expect(xScale, "xScale").to.be.not.null;
      expect(xScale.range()).to.deep.equal([48, 942]);
    });

    it("should set the range of the yScale", () => {
      expect(TrendsSVGContainer.prototype.setScales.callCount, "setScales.callCount before").to.equal(0);
      wrapper = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
      expect(TrendsSVGContainer.prototype.setScales.callCount, "setScales.callCount after").to.equal(1);
      const { yScale } = wrapper.state();
      expect(yScale, "yScale").to.be.not.null;
      expect(yScale.range()).to.deep.equal([480, 80]);
    });
  });

  describe("componentDidMount", () => {
    beforeEach(() => {
      sinon.stub(TrendsSVGContainer.prototype, "render").returns(null);
    });
    afterEach(() => {
      TrendsSVGContainer.prototype.render.restore();
    });
    it("should call the `setScales` method", () => {
      sinon.spy(TrendsSVGContainer.prototype, "componentDidMount");
      expect(TrendsSVGContainer.prototype.componentDidMount.callCount).to.equal(0);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);
      wrapper = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
      expect(TrendsSVGContainer.prototype.componentDidMount.callCount).to.equal(1);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(1);
      TrendsSVGContainer.prototype.componentDidMount.restore();
    });
  });

  describe("componentDidUpdate", () => {
    describe("when yScaleDomain changes", () => {
      it("should call the `setScales` method", () => {
        const container = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
        TrendsSVGContainer.prototype.setScales.resetHistory();
        expect(TrendsSVGContainer.prototype.setScales.callCount, "before setProps").to.equal(0);

        container.setProps({ yScaleDomain: [50, 300] });
        expect(TrendsSVGContainer.prototype.setScales.callCount, "after setProps").to.equal(1);
      });
    });

    describe("when yScaleDomain does not change", () => {
      it("should not call the `setScales` method", () => {
        const container = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
        TrendsSVGContainer.prototype.setScales.resetHistory();
        expect(TrendsSVGContainer.prototype.setScales.callCount, "before setProps").to.equal(0);

        container.setProps({ yScaleDomain: [60, 300] });
        expect(TrendsSVGContainer.prototype.setScales.callCount, "after setProps").to.equal(0);
      });
    });

    describe("when showingCbgDateTraces is true", () => {

      before(() => {
        sinon.spy(TrendsSVGContainer.prototype, "setState");
        sinon.spy(TrendsSVGContainer.prototype, "componentDidUpdate");
      });
      beforeEach(() => {
        const showingCbgDateTracesProps = _.assign({}, props, { showingCbgDateTraces: true });
        wrapper = shallow(<TrendsSVGContainer {...showingCbgDateTracesProps} />, { disableLifecycleMethods: false });
        TrendsSVGContainer.prototype.setState.resetHistory();
        TrendsSVGContainer.prototype.componentDidUpdate.resetHistory();
      });
      after(() => {
        TrendsSVGContainer.prototype.setState.restore();
        TrendsSVGContainer.prototype.componentDidUpdate.restore();
      });

      describe("when a cbg slice segment has been focused long enough", () => {
        it("should set focusedSegmentDataGroupedByDate in state", () => {
          const focusedSliceKeys = ["thirdQuartile", "ninetiethQuantile"];
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ cbgData: props.cbgData, focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount, "componentDidUpdate.callCount").to.equal(2);
          expect(TrendsSVGContainer.prototype.setState.callCount, "setState.callCount").to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.args[0][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: {
              "2017-01-01": props.cbgData,
            },
          });
        });
      });

      describe("when you've moved to focus a different cbg slice segment", () => {
        it("should calculate new focusedSegmentDataGroupedByDate object", () => {
          const focusedSliceKeys = ["firstQuartile", "thirdQuartile"];
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.args[0][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: {},
          });
        });
      });

      describe("when you've just stopped focusing a cbg slice segment", () => {
        beforeEach(() => {
          wrapper.setProps({ focusedSlice, focusedSliceKeys: ["firstQuartile", "thirdQuartile"] });
          TrendsSVGContainer.prototype.setState.resetHistory();
          TrendsSVGContainer.prototype.componentDidUpdate.resetHistory();
        });
        it("should reset focusedSegmentDataGroupedByDate to `null` in state", () => {
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({
            focusedSlice: null, focusedSliceKeys: null, showingCbgDateTraces: false,
          });
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount, "componentDidUpdate.callCount").to.equal(2);
          expect(TrendsSVGContainer.prototype.setState.callCount, "setState.callCount").to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.args[0][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: null,
          });
        });
      });
    });

    describe("when showingCbgDateTraces is false", () => {
      before(() => {
        sinon.spy(TrendsSVGContainer.prototype, "setState");
        sinon.spy(TrendsSVGContainer.prototype, "componentDidUpdate");
      });
      beforeEach(() => {
        wrapper = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
        TrendsSVGContainer.prototype.setState.resetHistory();
        TrendsSVGContainer.prototype.componentDidUpdate.resetHistory();
      });
      after(() => {
        TrendsSVGContainer.prototype.setState.restore();
        TrendsSVGContainer.prototype.componentDidUpdate.restore();
      });
      describe("when you haven't focused a cbg slice segment", () => {
        it("should not set the `focusedSegmentDataGroupedByDate` state in componentDidUpdate", () => {
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({
            activeDays: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          });
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
        });
      });

      describe("when you've just focused a cbg slice segment", () => {
        it("should not set the `focusedSegmentDataGroupedByDate` state in componentDidUpdate", () => {
          const focusedSliceKeys = ["thirdQuartile", "ninetiethQuantile"];
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ cbgData: props.cbgData, focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.componentDidUpdate.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
        });
      });
    });
  });

  describe("render", () => {
    let wrapper;
    before(() => {
      wrapper = shallow(<TrendsSVGContainer {...props} />, { disableLifecycleMethods: false });
    });

    it("should render a Background", () => {
      expect(wrapper.find(Background)).to.have.length(1);
    });

    it("should render a XAxisLabels", () => {
      expect(wrapper.find(XAxisLabels)).to.have.length(1);
    });

    it("should render a XAxisTicks", () => {
      expect(wrapper.find(XAxisTicks)).to.have.length(1);
    });

    it("should render a YAxisLabelsAndTicks", () => {
      expect(wrapper.find(YAxisLabelsAndTicks)).to.have.length(1);
    });

    it("should render a CBGSlicesContainer", () => {
      expect(wrapper.find(CBGSlicesContainer)).to.have.length(1);
    });

    it("should render a TargetRangeLines", () => {
      expect(wrapper.find(TargetRangeLines)).to.have.length(1);
    });

    it("should render the TargetRangeLines on top", () => {
      expect(wrapper.find("svg").children().last().is(TargetRangeLines)).to.be.true;
    });

    describe("showing CGM data", () => {
      it("should render a CBGSlicesContainer", () => {
        expect(wrapper.find(CBGSlicesContainer)).to.have.length(1);
      });

      it("should render a unselected all data message when all days unselected", () => {
        const activeDays = { ...props.activeDays };
        for (const k in activeDays) {
          activeDays[k] = false;
        }
        const unselectedProps = _.assign({}, props, { cbgData: [], activeDays });
        const unselectedWrapper = shallow(<TrendsSVGContainer {...unselectedProps} />, { disableLifecycleMethods: false });
        expect(unselectedWrapper.find(NoData)).to.have.length(1);
        expect(unselectedWrapper.find(NoData).prop("unselectedAllData")).to.be.true;
      });

      it("should render a no data message when there are no cbg values", () => {
        const noCBGDataProps = _.assign({}, props, { cbgData: [] });
        const noDataWrapper = shallow(<TrendsSVGContainer {...noCBGDataProps} />, { disableLifecycleMethods: false });
        expect(noDataWrapper.find(NoData)).to.have.length(1);
        expect(noDataWrapper.find(NoData).prop("dataType")).to.equal("cbg");
      });
    });
  });
});
