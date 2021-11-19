/**
 * Copyright (c) 2021, Diabeloop
 * Calendar header: Allow to change the current displayed month on the calendar
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
import { act } from "react-dom/test-utils";
import * as sinon from "sinon";
import { expect } from "chai";
import dayjs from "dayjs";

import { CalendarChangeMonth } from "../../../components/date-pickers/models";
import CalendarHeader from "../../../components/date-pickers/calendar-header";

function testCalendarHeader(): void {
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
    const today = dayjs("2021-11-01T12:00:00Z"); // Monday
    const onMonthChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarHeader
            currentMonth={today}
            onMonthChange={onMonthChange}
          />, container, resolve);
      });
    });

    expect(document.getElementById("calendar-header")).to.be.not.null;

    const buttonPrevMonth = document.getElementById("calendar-header-button-prev-month");
    expect(buttonPrevMonth, "buttonPrevMonth").to.be.not.null;
    expect(buttonPrevMonth.nodeName.toLowerCase(), "buttonPrevMonth node").to.be.eq("button");
    expect(buttonPrevMonth.getAttribute("disabled"), "buttonPrevMonth disabled").to.be.null;
    buttonPrevMonth.click();
    expect(onMonthChange.calledOnce).to.be.true;
    expect(onMonthChange.firstCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-10-01");

    const buttonNextMonth = document.getElementById("calendar-header-button-next-month");
    expect(buttonNextMonth, "buttonNextMonth").to.be.not.null;
    expect(buttonNextMonth.nodeName.toLowerCase(), "buttonNextMonth node").to.be.eq("button");
    expect(buttonNextMonth.getAttribute("disabled"), "buttonNextMonth disabled").to.be.null;
    buttonNextMonth.click();
    expect(onMonthChange.calledTwice).to.be.true;
    expect(onMonthChange.secondCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-12-01");

    const displayedMonth = document.getElementById("calendar-header-current-month");
    expect(displayedMonth).to.be.not.null;
    expect(displayedMonth.innerText).to.be.eq("November 2021");
  });

  it("should correctly restrict prev/next month when disabled", async () => {
    const today = dayjs("2021-11-01T12:00:00Z"); // Monday
    const minDate = today;
    const maxDate = today.endOf("month");
    const onMonthChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarHeader
            currentMonth={today}
            minDate={minDate}
            maxDate={maxDate}
            onMonthChange={onMonthChange}
          />, container, resolve);
      });
    });

    const buttonPrevMonth = document.getElementById("calendar-header-button-prev-month");
    expect(buttonPrevMonth, "buttonPrevMonth").to.be.not.null;
    expect(buttonPrevMonth.getAttribute("disabled"), "buttonPrevMonth disabled").to.be.not.null;

    const buttonNextMonth = document.getElementById("calendar-header-button-next-month");
    expect(buttonNextMonth, "buttonNextMonth").to.be.not.null;
    expect(buttonNextMonth.getAttribute("disabled"), "buttonNextMonth disabled").to.be.not.null;
  });

  it("should render the transition when requested", async () => {
    const today = dayjs("2021-11-01T12:00:00Z"); // Monday
    const onMonthChange = sinon.stub<[dayjs.Dayjs], void>();
    const changeMonth: CalendarChangeMonth = {
      direction: "right",
      newMonth: today.add(1, "month"),
      onAnimationEnd: sinon.stub(),
    };

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <CalendarHeader
            currentMonth={today}
            onMonthChange={onMonthChange}
            changeMonth={changeMonth}
          />, container, resolve);
      });
    });

    const prevMonth = document.getElementById("calendar-header-prev-month");
    expect(prevMonth, "prevMonth").to.be.not.null;
    expect(prevMonth.innerText, "prevMonth text").to.be.eq("December 2021");

    const nextMonth = document.getElementById("calendar-header-next-month");
    expect(nextMonth, "nextMonth").to.be.not.null;
    expect(nextMonth.innerText, "nextMonth text").to.be.eq("December 2021");
  });
}

export default testCalendarHeader;
