
/**
 * @typedef {import("enzyme").ShallowWrapper} ShallowWrapper
 * @typedef {import("enzyme").ReactWrapper} ReactWrapper
 */
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import * as sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";
import moment from "moment-timezone";
import { MGDL_UNITS, MS_IN_DAY } from "tideline";

import DataUtilStub from "../../../helpers/DataUtil";
import Daily, { DailyChart } from "../../../../app/components/chart/daily";
import { components as vizComponents } from "tidepool-viz";

const { Loader } = vizComponents;

require("tideline/css/tideline.less");
require("../../../../app/core/less/fonts.less");
require("../../../../app/style.less");

describe("Daily", () => {
  const timezone = "America/Los_Angeles";
  const bgPrefs = {
    bgClasses: {
      "very-low": {
        boundary: 60
      },
      "low": {
        boundary: 80
      },
      "target": {
        boundary: 180
      },
      "high": {
        boundary: 200
      },
      "very-high": {
        boundary: 300
      }
    },
    bgUnits: MGDL_UNITS
  };

  const baseProps = {
    bgPrefs,
    chartPrefs: {
      daily: {},
    },
    permsOfLoggedInUser: {
      root: true,
    },
    dialogDatePicker: (props) => props.isOpen ? <div id="date-picker">{props.date}</div> : null,
    dataUtil: new DataUtilStub(),
    profileDialog: sinon.stub().returns(<div id="profile-dialog" />),
    epochLocation: moment.utc("2014-03-13T12:00:00.000Z").valueOf(),
    msRange: MS_IN_DAY, // ['2014-03-13T00:00:00.000Z', '2014-03-13T23:59:59.999Z'],
    loading: false,
    onClickRefresh: sinon.stub(),
    onClickPrint: sinon.stub(),
    onCreateMessage: sinon.stub(),
    onShowMessageThread: sinon.stub(),
    onSwitchToBasics: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onSwitchToTrends: sinon.stub(),
    onDatetimeLocationChange: sinon.stub().resolves(false),
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    patient: {
      profile: {
        fullName: "Jane Doe"
      },
      permissions: {
        note: {},
        view: {}
      }
    },
    tidelineData: {
      opts: {
        timePrefs: {
          timezoneAware: true,
          timezoneName: timezone,
        },
      },
      data: [{ type: "cbg", value: 80, units: "mg/dL", epoch: 0, timezone: "UTC" }],
      grouped: { cbg: [{ type: "cbg", value: 80, units: "mg/dL", epoch: 0, timezone: "UTC" }] },
      getTimezoneAt: sinon.stub().returns(timezone),
      endpoints: ["2014-03-01T00:00:00.000Z", "2014-03-13T23:59:59.999Z"],
      getLocaleTimeEndpoints: sinon.stub().returns({
        startDate: new Date("2014-03-01T00:00:00.000Z"),
        endDate: new Date("2014-03-13T23:59:59.999Z"),
      }),
    },
    canPrint: false,
    timePrefs: {
      timezoneAware: true,
      timezoneName: timezone,
    },
  };

  /** @type {ShallowWrapper | ReactWrapper | null} */
  let wrapper = null;
  /** @type {Daily | null | undefined} */
  let instance = null;
  /** @type {sinon.SinonStub<[date: Date], void>} */
  let dailyChartGoToDate;

  before(() => {
    sinon.stub(DailyChart.prototype, "reCreateChart");
    sinon.stub(DailyChart.prototype, "rerenderChartData");
    sinon.stub(DailyChart.prototype, "mountChart");
    sinon.stub(DailyChart.prototype, "unmountChart");
    sinon.stub(DailyChart.prototype, "render").returns(<div className="fake-daily-chart" />);
    dailyChartGoToDate = sinon.stub(DailyChart.prototype, "goToDate");
  });

  beforeEach(() => {
    wrapper = mount(<Daily {...baseProps} />);
    wrapper.update();
    instance = wrapper?.instance();
  });

  afterEach(() => {
    baseProps.onClickPrint.reset();
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
    baseProps.onDatetimeLocationChange.resetHistory();
    baseProps.tidelineData.getTimezoneAt.resetHistory();
    dailyChartGoToDate.reset();
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  after(() => {
    sinon.restore();
  });

  describe("render", () => {
    it("should have a refresh button which should call onClickRefresh when clicked", () => {
      var props = _.assign({}, baseProps, {
        onClickRefresh: sinon.spy(),
      });

      wrapper.setProps(props);

      var refreshButton = wrapper.find(".btn-refresh");

      sinon.assert.callCount(props.onClickRefresh, 0);
      refreshButton.simulate("click");
      sinon.assert.callCount(props.onClickRefresh, 1);
    });

    it("should not have a print button when a pdf is not ready to print", () => {
      var props = _.assign({}, baseProps, {
        canPrint: false,
      });

      wrapper.setProps(props);

      var printLink = wrapper.find(".printview-print-icon").hostNodes();
      expect(printLink.length).to.equal(0);
    });

    it("should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked", () => {
      var props = _.assign({}, baseProps, {
        canPrint: true,
      });

      wrapper.setProps(props);

      var printLink = wrapper.find(".printview-print-icon").hostNodes();
      expect(printLink.length).to.equal(1);

      sinon.assert.callCount(props.onClickPrint, 0);
      printLink.simulate("click");
      sinon.assert.callCount(props.onClickPrint, 1);
    });

    it("should show a loader when loading prop is true", () => {
      const loader = () => wrapper.find(Loader).last();

      expect(loader().length).to.equal(1);
      expect(loader().prop("show")).to.be.false;

      wrapper.setProps({ loading: true });
      expect(loader().props().show).to.be.true;
    });

    it("should render the bg toggle", () => {
      const toggle = wrapper.find("BgSourceToggle");
      expect(toggle.length).to.equal(1);
    });

    it("should render the stats", () => {
      const stats = wrapper.find("Stats");
      expect(stats.length).to.equal(1);
    });

    it("should render the date-picker input element", () => {
      let titleElem = wrapper?.find(".calendar-nav-icon");
      expect(titleElem?.length).to.be.above(0);
      titleElem = wrapper?.find("#daily-chart-title-date");
      expect(titleElem?.length).to.be.above(0);
      expect(titleElem.last().getDOMNode().getAttribute("disabled")).to.be.null;
    });

    it("should render the date title as disabled when loading", () => {
      const props = {...baseProps, loading: true };
      wrapper?.setProps(props);
      const titleElem = wrapper?.find("#daily-chart-title-date");
      expect(titleElem?.length).to.be.above(0);
      expect(titleElem.last().getDOMNode().getAttribute("disabled")).to.be.not.null;
    });

    it("should render the date title as disabled when in transition", () => {
      instance?.handleInTransition(true);
      wrapper?.update();
      const titleElem = wrapper?.find("#daily-chart-title-date");
      expect(titleElem?.length).to.be.above(0);
      expect(titleElem.last().getDOMNode().getAttribute("disabled")).to.be.not.null;
    });

    it("should set the new displayed date after a return of the date-picker", () => {
      let onResult = null;
      const DatePicker = (props) => {
        onResult = props.onResult;
        return (
          <div id="date-picker-with-result">
            <button id="button-ok" type="button">OK</button>
          </div>
        );
      };
      DatePicker.propTypes = {
        onResult: PropTypes.func.isRequired,
      };
      const props = {...baseProps, dialogDatePicker: DatePicker };
      wrapper?.setProps(props);
      expect(onResult).to.be.a("function");
      onResult("2021-11-01");
      expect(dailyChartGoToDate.calledOnce).to.be.true;
      expect(dailyChartGoToDate.firstCall.args[0]).to.be.instanceOf(Date);
      // Timezone "America/Los_Angeles" @ 12h -> "2021-11-01" +7h -> 12 + 7 = 19
      expect(dailyChartGoToDate.firstCall.args[0].toISOString()).to.be.eq("2021-11-01T19:00:00.000Z");
    });
  });

  describe("handleDatetimeLocationChange", () => {
    const epoch = Date.parse("2018-01-15T12:00:00.000Z");

    it("should update the base props `datetimeLocation` & `dateRange` state", () => {
      baseProps.tidelineData.getTimezoneAt.resetHistory();
      instance.handleDatetimeLocationChange(epoch);
      sinon.assert.calledOnce(baseProps.tidelineData.getTimezoneAt);
      sinon.assert.calledOnce(baseProps.onDatetimeLocationChange);
      sinon.assert.calledWith(baseProps.onDatetimeLocationChange, moment.utc("2018-01-15T12:00:00.000Z").valueOf());
    });

    it("should set the `title` state", () => {
      expect(wrapper.state().title).to.equal(instance.getTitle(baseProps.epochLocation));
      instance.handleDatetimeLocationChange(epoch);
      expect(wrapper.state().title).to.equal("Mon, Jan 15, 2018");
    });
  });

  describe("toggleBgDataSource", () => {
    it("should call the `updateChartPrefs` handler to update the bgSource", () => {
      const instance = wrapper.instance();
      instance.toggleBgDataSource(null, "cbg");

      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { bgSource: "cbg" },
      });

      instance.toggleBgDataSource(null, "smbg");

      sinon.assert.callCount(baseProps.updateChartPrefs, 2);
      sinon.assert.calledWith(baseProps.updateChartPrefs, {
        daily: { bgSource: "smbg" },
      });
    });
  });
});
