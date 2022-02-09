
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-dom/test-utils";
import { expect } from "chai";
import * as sinon from "sinon";

import Header from "../../../../app/components/chart/header";

describe("Header", function () {
  describe("render", () => {
    const props = {
      patient: {
        profile: {
          fullName: "Jane Doe",
        },
      },
      chartType: "Awesome",
      inTransition: false,
      atMostRecent: false,
      title: "Most Awesome",
      iconBack: true,
      iconNext: true,
      iconMostRecent: true,
      onClickBack: sinon.stub(),
      onClickBasics: sinon.stub(),
      onClickTrends: sinon.stub(),
      onClickMostRecent: sinon.stub(),
      onClickNext: sinon.stub(),
      onClickOneDay: sinon.stub(),
      onClickSettings: sinon.stub(),
      ProfileDialog: sinon.stub().returns(null),
      trackMetric: sinon.stub(),
    };

    before(() => {
      sinon.spy(console, "error");
    });
    after(() => {
      console.error.restore();
    });
    afterEach(() => {
      expect(console.error.callCount).to.be.eq(0);
      console.error.resetHistory();
      props.onClickBack.resetHistory();
      props.onClickBasics.resetHistory();
      props.onClickMostRecent.resetHistory();
      props.onClickNext.resetHistory();
      props.onClickOneDay.resetHistory();
      props.onClickSettings.resetHistory();
      props.onClickTrends.resetHistory();
    });

    const renderIntoDocument = (elem) => {
      const div = document.createElement("div");
      ReactDOM.render(elem, div);
      return div;
    };

    it("should render without problems", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = renderIntoDocument(dailyElem);
      expect(elem.querySelector(".patient-data-subnav").length).to.be.not.null;
    });

    it("should trigger onClickBack when inTransition is false and back button is clicked", () => {
      const dailyElem = React.createElement(Header, props);

      const elem = renderIntoDocument(dailyElem);
      const backButton = elem.querySelector("#button-nav-back");
      expect(backButton).to.be.not.null;
      expect(props.onClickBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.onClickBack.callCount).to.equal(1);
    });

    it("should not trigger onClickBack when inTransition is true and back button is clicked", () => {
      const dailyElem = React.createElement(Header, { ...props, inTransition: true });
      const elem = renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const backButton = elem.querySelector("#button-nav-back");
      expect(backButton).to.be.not.null;

      expect(props.onClickBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.onClickBack.callCount).to.equal(0);
    });

    it("should trigger onClickTrends when trends button is clicked", function () {
      const dailyElem = React.createElement(Header, props);
      const elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const trendsButton = TestUtils.findRenderedDOMComponentWithClass(elem, "js-trends");

      expect(props.onClickTrends.callCount).to.equal(0);
      TestUtils.Simulate.click(trendsButton);
      expect(props.onClickTrends.callCount).to.equal(1);
    });

    it("should trigger onClickMostRecent when inTransition is false and mostRecent button is clicked", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const mostRecentButton = elem.querySelector("#button-nav-mostrecent");
      expect(mostRecentButton).to.be.not.null;

      expect(props.onClickMostRecent.callCount).to.equal(0);
      TestUtils.Simulate.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(1);
    });

    it("should not trigger onClickMostRecent when inTransition is true and mostRecent button is clicked", () => {
      const dailyElem = React.createElement(Header, { ...props, inTransition: true });
      const elem = renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const mostRecentButton = elem.querySelector("#button-nav-mostrecent");
      expect(mostRecentButton).to.be.not.null;

      expect(props.onClickMostRecent.callCount).to.equal(0);
      TestUtils.Simulate.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(0);
    });

    it("should trigger onClickNext when inTransition is false and next button is clicked", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const nextButton = elem.querySelector("#button-nav-next");
      expect(nextButton).to.be.not.null;

      expect(props.onClickNext.callCount).to.equal(0);
      TestUtils.Simulate.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(1);
    });

    it("should not trigger onClickNext when inTransition is true and next button is clicked", () => {
      const dailyElem = React.createElement(Header, { ...props, inTransition: true });
      const elem = renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const nextButton = elem.querySelector("#button-nav-next");
      expect(nextButton).to.be.not.null;

      expect(props.onClickNext.callCount).to.equal(0);
      TestUtils.Simulate.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(0);
    });

    it("should trigger onClickBasics when basics button is clicked", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const basicsButton = TestUtils.findRenderedDOMComponentWithClass(elem, "js-basics");

      expect(props.onClickBasics.callCount).to.equal(0);
      TestUtils.Simulate.click(basicsButton);
      expect(props.onClickBasics.callCount).to.equal(1);
    });

    it("should trigger onClickOneDay when daily button is clicked", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const dayButton = TestUtils.findRenderedDOMComponentWithClass(elem, "js-daily");

      expect(props.onClickOneDay.callCount).to.equal(0);
      TestUtils.Simulate.click(dayButton);
      expect(props.onClickOneDay.callCount).to.equal(1);
    });

    it("should trigger onClickSettings when settings button is clicked", () => {
      const dailyElem = React.createElement(Header, props);
      const elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      const settingsButton = TestUtils.findRenderedDOMComponentWithClass(elem, "js-settings");

      expect(props.onClickSettings.callCount).to.equal(0);
      TestUtils.Simulate.click(settingsButton);
      expect(props.onClickSettings.callCount).to.equal(1);
    });
  });
});
