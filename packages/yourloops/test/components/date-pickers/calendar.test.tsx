/**
 * Copyright (c) 2021, Diabeloop
 * Allow to select a date (day/month/year) by displaying each days in a specific month
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
import { CalendarChangeMonth, TRANSITION_DURATION } from "../../../components/date-pickers/models";
import Calendar from "../../../components/date-pickers/calendar";

function testCalendar(): void {
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
    const onChange = sinon.stub<[dayjs.Dayjs, boolean | undefined], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <Calendar
            currentMonth={today}
            selectedDate={today}
            onChange={onChange}
          />, container, resolve);
      });
    });

    const calendarElem = document.getElementById("calendar-month");
    expect(calendarElem).to.be.not.null;
    expect(calendarElem.nodeName.toLowerCase()).to.be.eq("div");

    const firstDay = document.getElementById("calendar-weekday-0");
    expect(firstDay).to.be.not.null;
    expect(firstDay.innerText).to.be.eq("Su");

    const todayButton = document.getElementById("button-calendar-day-2021-11-09");
    expect(todayButton).to.be.not.null;
    expect(todayButton.getAttribute("aria-selected")).to.be.eq("true");
    expect(todayButton.getAttribute("type")).to.be.eq("button");
    expect(todayButton.nodeName.toLowerCase()).to.be.eq("button");

    const tomorrowElem = document.getElementById("button-calendar-day-2021-11-10");
    expect(tomorrowElem).to.be.not.null;
    tomorrowElem.click();
    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-10");
  });

  it("should render the month transition change", async function testTransition() {
    this.timeout(10 * TRANSITION_DURATION);
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs, boolean | undefined], void>();
    const onAnimationEnd = sinon.stub();
    const changeMonth: CalendarChangeMonth = {
      direction: "left",
      newMonth: today.subtract(1, "month"),
      onAnimationEnd,
    };

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <Calendar
            currentMonth={today}
            selectedDate={today}
            onChange={onChange}
            changeMonth={changeMonth}
          />, container, resolve);
      });
    });

    expect(document.getElementById("calendar-weekdays-values-new"), "calendar-weekdays-values-new").to.be.not.null;

    while (!onAnimationEnd.called) {
      await waitTimeout(TRANSITION_DURATION);
    }
    expect(onAnimationEnd.calledOnce).to.be.true;
  });

  it("should react to arrows keys to change the selected date", async () => {
    const today = dayjs("2021-11-09");
    const onChange = sinon.stub<[dayjs.Dayjs, boolean | undefined], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <Calendar
            currentMonth={today}
            selectedDate={today}
            onChange={onChange}
          />, container, resolve);
      });
    });

    const calendarElem = document.getElementById("calendar-month");
    Simulate.keyUp(calendarElem, { key: "ArrowUp" });
    expect(onChange.callCount).to.be.eq(1);
    expect(onChange.getCall(0).args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-02");

    Simulate.keyUp(calendarElem, { key: "ArrowDown" });
    expect(onChange.callCount).to.be.eq(2);
    expect(onChange.getCall(1).args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-16");

    Simulate.keyUp(calendarElem, { key: "ArrowLeft" });
    expect(onChange.callCount).to.be.eq(3);
    expect(onChange.getCall(2).args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-08");

    Simulate.keyUp(calendarElem, { key: "ArrowRight" });
    expect(onChange.callCount).to.be.eq(4);
    expect(onChange.getCall(3).args[0].format("YYYY-MM-DD")).to.be.eq("2021-11-10");
  });
}

export default testCalendar;
