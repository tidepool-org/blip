/**
 * Copyright (c) 2021, Diabeloop
 * Simple DatePicker to select a single day
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

import { waitTimeout } from "../../../lib/utils";
import DatePicker from "../../../components/date-pickers/date-picker";

function testDatePicker(): void {
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

  it("should render the provided title", async () => {
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <DatePicker>
            <span id="the-date-title">Date</span>
          </DatePicker>, container, resolve);
      });
    });
    const titleElem = document.getElementById("the-date-title");
    expect(titleElem).to.be.not.null;

    const calendarElem = document.getElementById("calendar-view");
    expect(calendarElem).to.be.null;
  });

  it("should display the calender when clicking on the title", async () => {
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <DatePicker activeClassName="active">
            <span id="the-date-title">Date</span>
          </DatePicker>, container, resolve);
      });
    });

    const divTitleElem = document.getElementById("date-picker-button-show-calendar");
    expect(divTitleElem).to.be.not.null;
    expect(divTitleElem.classList.contains("active")).to.be.false;
    const titleElem = document.getElementById("the-date-title");
    expect(titleElem).to.be.not.null;
    titleElem.click();

    const calendarElem = document.getElementById("calendar-view");
    expect(calendarElem).to.be.not.null;
    expect(divTitleElem.classList.contains("active")).to.be.true;
  });

  it("should call the callback function on cancel", async () => {
    const onResult = sinon.stub<[string|undefined], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(<DatePicker onResult={onResult}>Text</DatePicker>, container, resolve);
      });
    });

    // Click version
    const titleElem = document.getElementById("date-picker-button-show-calendar");
    expect(titleElem, "titleElem").to.be.not.null;
    titleElem.click();
    await waitTimeout(1);
    let buttonCancel = document.getElementById("date-picker-button-cancel");
    expect(buttonCancel, "buttonCancel").to.be.not.null;
    buttonCancel.click();
    expect(onResult.calledOnce).to.be.true;
    expect(onResult.firstCall.args.length).to.be.lt(1);

    // Key version
    Simulate.keyUp(titleElem, { key: " " });
    buttonCancel = document.getElementById("date-picker-button-cancel");
    expect(buttonCancel, "buttonCancel").to.be.not.null;
    Simulate.keyUp(buttonCancel, { key: " " });
    expect(onResult.calledTwice).to.be.true;
    expect(onResult.secondCall.args.length).to.be.lt(1);
  });

  it("should return the selected date", async () => {
    const onResult = sinon.stub<[string|undefined], void>();
    await act(() => {
      return new Promise((resolve) => {
        // Note: wrong date value is intentional
        ReactDOM.render(
          <DatePicker
            onResult={onResult}
            date="2021-10-02"
            maxDate="2021-11-26"
            minDate="2021-11-01">
              Text
          </DatePicker>, container, resolve);
      });
    });

    const titleElem = document.getElementById("date-picker-button-show-calendar");
    titleElem.click();

    let buttonChangeMonth = document.getElementById("calendar-header-button-prev-month");
    expect(buttonChangeMonth).to.be.not.null;
    expect(buttonChangeMonth.getAttribute("disabled")).to.be.not.null;
    buttonChangeMonth = document.getElementById("calendar-header-button-next-month");
    expect(buttonChangeMonth).to.be.not.null;
    expect(buttonChangeMonth.getAttribute("disabled")).to.be.not.null;

    let buttonDay = document.getElementById("button-calendar-day-2021-11-01");
    expect(buttonDay).to.be.not.null;
    expect(buttonDay.getAttribute("aria-selected")).to.be.eq("true");

    buttonDay = document.getElementById("button-calendar-day-2021-11-10");
    expect(buttonDay).to.be.not.null;
    expect(buttonDay.getAttribute("aria-selected")).to.be.eq("false");
    buttonDay.click();

    const buttonOk = document.getElementById("date-picker-button-ok");
    Simulate.keyUp(buttonOk, { key: " " });

    expect(onResult.calledOnce).to.be.true;
    expect(onResult.firstCall.args[0]).to.be.eq("2021-11-10");

    // Wait the modal disapear, will crash in timeout if it takes too long
    while (document.getElementById("date-picker-button-ok") !== null) {
      await waitTimeout(100);
    }
  });
}

export default testDatePicker;
