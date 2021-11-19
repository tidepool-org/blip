/**
 * Copyright (c) 2021, Diabeloop
 * Calendar view: Bring the calendar, the header and the toolbar together
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import * as sinon from "sinon";
import { expect } from "chai";
import dayjs from "dayjs";

import { waitTimeout } from "../../../lib/utils";
import { TRANSITION_DURATION } from "../../../components/date-pickers/models";
import CalendarView from "../../../components/date-pickers/calendar-view";

function testCalendarView(): void {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
      container = null;
    }
  });

  it("should correctly render a month", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            onChange={onChange}
          />, container, resolve);
      });
    });

    let calendarElem = document.getElementById("calendar-view");
    expect(calendarElem).to.be.not.null;
    expect(calendarElem.nodeName.toLowerCase()).to.be.eq("div");

    calendarElem = document.getElementById("calendar-month");
    expect(calendarElem).to.be.not.null;
    expect(calendarElem.nodeName.toLowerCase()).to.be.eq("div");

    calendarElem = document.getElementById("date-picker-selected-date");
    expect(calendarElem).to.be.not.null;
    expect(calendarElem.nodeName.toLowerCase()).to.be.eq("h4");
    expect(calendarElem.innerText).to.be.eq("Tue, Nov 9");
  });

  it("should correctly change the selected day", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const buttonAnotherDay = document.getElementById("button-calendar-day-2021-11-15");
    expect(buttonAnotherDay).to.be.not.null;
    buttonAnotherDay.click();

    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-15");
  });

  it("should not select a date before the minDate", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            minDate={today}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const calendarElem = document.getElementById("calendar-month");
    Simulate.keyUp(calendarElem, { key: "ArrowLeft" });
    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-09");
  });

  it("should not select a date after the maxDate", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            maxDate={today}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const calendarElem = document.getElementById("calendar-month");
    Simulate.keyUp(calendarElem, { key: "ArrowRight" });
    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-09");
  });

  it("should correctly change the current month", async function testChangeMonth() {
    this.timeout(TRANSITION_DURATION * 10);
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const buttonPrevMonthElem = document.getElementById("calendar-header-button-prev-month");
    Simulate.keyUp(buttonPrevMonthElem, { key: "Enter" });

    const prevMonthElem = document.getElementById("calendar-header-prev-month");
    expect(prevMonthElem).to.be.not.null;
    expect(prevMonthElem.innerText).to.be.eq("October 2021");

    let buttonLastNovemberDay = document.getElementById("button-calendar-day-2021-11-30");
    expect(buttonLastNovemberDay).to.be.not.null;
    expect(buttonLastNovemberDay.innerText).to.be.eq("30");

    let buttonFirstOctoberDay = document.getElementById("button-calendar-day-2021-10-01");
    expect(buttonFirstOctoberDay).to.be.not.null;
    expect(buttonFirstOctoberDay.innerText).to.be.eq("1");

    // Wait the transition end
    await waitTimeout(2 * TRANSITION_DURATION);
    buttonLastNovemberDay = document.getElementById("button-calendar-day-2021-11-30");
    expect(buttonLastNovemberDay).to.be.null;
    buttonFirstOctoberDay = document.getElementById("button-calendar-day-2021-10-01");
    expect(buttonFirstOctoberDay).to.be.not.null;
  });

  it("should refuse to change the current month before the minDate", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            minDate={dayjs("2021-11-03")}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const buttonPrevMonthElem = document.getElementById("calendar-header-button-prev-month");
    expect(buttonPrevMonthElem.getAttribute("disabled")).to.not.be.null;
    buttonPrevMonthElem.click();
    await waitTimeout(1);

    const prevMonthElem = document.getElementById("calendar-header-prev-month");
    expect(prevMonthElem).to.be.null;
  });

  it("should refuse to change the current month after the maxDate", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            maxDate={dayjs("2021-11-20")}
            onChange={onChange}
            direction="portrait"
          />, container, resolve);
      });
    });

    const buttonNextMonthElem = document.getElementById("calendar-header-button-next-month");
    expect(buttonNextMonthElem.getAttribute("disabled")).to.not.be.null;
    buttonNextMonthElem.click();
    await waitTimeout(1);

    const nextMonthElem = document.getElementById("calendar-header-next-month");
    expect(nextMonthElem).to.be.null;
  });

  it("should allow to change the current year to a previous year", async () => {
    const today = dayjs("2021-11-09");
    const minDate = dayjs("2020-12-03");
    const maxDate = dayjs("2022-02-05");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            minDate={minDate}
            maxDate={maxDate}
            onChange={onChange}
          />, container, resolve);
      });
    });

    const buttonYear = document.getElementById("date-picker-button-change-year");
    expect(buttonYear).to.be.not.null;
    expect(buttonYear.innerText).to.be.eq("2021");

    buttonYear.click();
    await waitTimeout(1);

    const yearSelector = document.getElementById("year-selector");
    expect(yearSelector).to.be.not.null;
    expect(yearSelector.children.length).to.be.eq(3);

    let yearElem = document.getElementById("year-2019");
    expect(yearElem, "year-2019").to.be.null;

    yearElem = document.getElementById("year-2020");
    expect(yearElem, "year-2020").to.be.not.null;
    expect(yearElem.getAttribute("aria-selected"), "year-2020 selected").to.be.eq("false");

    yearElem = document.getElementById("year-2021");
    expect(yearElem, "year-2021").to.be.not.null;
    expect(yearElem.getAttribute("aria-selected"), "year-2021 selected").to.be.eq("true");

    yearElem = document.getElementById("year-2022");
    expect(yearElem, "year-2022").to.be.not.null;
    expect(yearElem.getAttribute("aria-selected"), "year-2022 selected").to.be.eq("false");

    yearElem = document.getElementById("year-2023");
    expect(yearElem, "year-2023").to.be.null;

    yearElem = document.getElementById("year-2020");
    yearElem.click();
    await waitTimeout(1);

    let prevYearButton = document.getElementById("button-calendar-day-2020-12-03");
    expect(prevYearButton, "prevYearButton 2020-12-03").to.be.not.null;
    expect(prevYearButton.getAttribute("disabled"), "prevYearButton 2020-12-03 disabled").to.be.null;

    prevYearButton = document.getElementById("button-calendar-day-2020-12-02");
    expect(prevYearButton, "prevYearButton 2020-12-02").to.be.not.null;
    expect(prevYearButton.getAttribute("disabled"), "prevYearButton 2020-12-02 disabled").to.be.not.null;
  });

  it("should allow to change the current year to a next year", async () => {
    const today = dayjs("2021-11-09");
    const minDate = dayjs("2020-12-03");
    const maxDate = dayjs("2022-02-05");
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarView
            selectedDate={today}
            minDate={minDate}
            maxDate={maxDate}
            onChange={onChange}
          />, container, resolve);
      });
    });

    const buttonYear = document.getElementById("date-picker-button-change-year");
    expect(buttonYear).to.be.not.null;
    buttonYear.click();
    await waitTimeout(1);

    const yearElem = document.getElementById("year-2022");
    expect(yearElem, "year-2022").to.be.not.null;
    yearElem.click();
    await waitTimeout(1);

    let nextYearButton = document.getElementById("button-calendar-day-2022-02-05");
    expect(nextYearButton, "prevYearButton 2022-02-05").to.be.not.null;
    expect(nextYearButton.getAttribute("disabled"), "prevYearButton 2022-02-05 disabled").to.be.null;

    nextYearButton = document.getElementById("button-calendar-day-2022-02-06");
    expect(nextYearButton, "prevYearButton 2022-02-06").to.be.not.null;
    expect(nextYearButton.getAttribute("disabled"), "prevYearButton 2022-02-06 disabled").to.be.not.null;
  });
}

export default testCalendarView;
