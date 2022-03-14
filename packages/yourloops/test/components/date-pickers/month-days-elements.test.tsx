/**
 * Copyright (c) 2021, Diabeloop
 * Display the days off a month
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
import dayjs from "dayjs";
import * as sinon from "sinon";
import { expect } from "chai";

import MonthDayElements from "../../../components/date-pickers/month-days-elements";

describe("Month day element", () => {

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
    const yesterday = today.subtract(1, "day");
    const tomorrow = today.add(1, "day");
    const days = today.getWeekArray();
    const onChange = sinon.stub<[dayjs.Dayjs], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <MonthDayElements
            daysArray={days}
            currentMonth={today.month()}
            onChange={onChange}
            selection={{ mode: "single", selected: today }}
            minDate={yesterday}
            maxDate={tomorrow}
          />, container, resolve);
      });
    });

    const todayElem = document.getElementById("button-calendar-day-2021-11-01");
    const yesterdayElem = document.getElementById("button-calendar-day-2021-10-31");
    const tomorrowElem = document.getElementById("button-calendar-day-2021-11-02");
    const afterTomorrowElem = document.getElementById("button-calendar-day-2021-11-03");

    expect(todayElem, "todayElem").to.be.not.null;
    expect(todayElem.getAttribute("disabled"), "todayElem disabled").to.be.null;
    expect(todayElem.getAttribute("aria-selected")).to.be.eq("true");
    expect(todayElem.className).to.contain("date-pickers-day-selected");
    expect(todayElem.innerText).to.be.eq("1");
    todayElem.click();
    expect(onChange.calledOnce, "calledOnce").to.be.true;
    expect(today.isSame(onChange.firstCall.args[0], "day"), "today.isSame").to.be.true;

    expect(yesterdayElem, "yesterdayElem").to.be.not.null;
    expect(yesterdayElem.getAttribute("disabled"), "yesterdayElem disabled").to.be.a("string");
    expect(yesterdayElem.innerText).to.be.eq("31");

    expect(tomorrowElem, "tomorrowElem").to.be.not.null;
    expect(tomorrowElem.getAttribute("disabled"), "tomorrowElem disabled").to.be.null;
    expect(tomorrowElem.innerText).to.be.eq("2");
    tomorrowElem.click();
    expect(onChange.calledTwice, "calledTwice").to.be.true;
    expect(tomorrow.isSame(onChange.secondCall.args[0], "day"), "tomorrow.isSame").to.be.true;

    expect(afterTomorrowElem, "afterTomorrowElem").to.be.not.null;
    expect(afterTomorrowElem.getAttribute("disabled"), "afterTomorrowElem disabled").to.be.a("string");
    expect(afterTomorrowElem.innerText).to.be.eq("3");
  });
});


