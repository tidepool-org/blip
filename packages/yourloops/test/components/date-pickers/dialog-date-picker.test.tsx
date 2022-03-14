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

import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import * as sinon from "sinon";
import { expect } from "chai";

import { waitTimeout } from "../../../lib/utils";
import DialogDatePicker from "../../../components/date-pickers/dialog-date-picker";

describe("Dialog date picker", () => {

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

  it("should render nothing if not open", async () => {
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <DialogDatePicker isOpen={false} onResult={_.noop} />, container, resolve);
      });
    });

    const calendarElem = document.getElementById("calendar-box");
    expect(calendarElem).to.be.null;
  });

  it("should call onSelectedDateChange() when the selected date changed", async () => {
    const onSelectedDateChanged = sinon.stub();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <DialogDatePicker isOpen date="2022-01-26" onSelectedDateChange={onSelectedDateChanged} onResult={_.noop} />, container, resolve);
      });
    });

    expect(onSelectedDateChanged.calledOnce, "calledOnce").to.be.true;
    expect(onSelectedDateChanged.firstCall.args[0], "firstCall").to.be.eq("2022-01-26");

    const buttonPrevDay = document.getElementById("button-calendar-day-2022-01-25");
    expect(buttonPrevDay, "button-calendar-day-2022-01-25").to.be.not.null;
    buttonPrevDay.click();
    await waitTimeout(2);

    expect(onSelectedDateChanged.calledTwice, "calledTwice").to.be.true;
    expect(onSelectedDateChanged.secondCall.args[0], "secondCall").to.be.eq("2022-01-25");
  });

  it("should call the callback function on cancel", async () => {
    const onResult = sinon.stub<[string | undefined], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(<DialogDatePicker isOpen onResult={onResult} />, container, resolve);
      });
    });

    const buttonCancel = document.getElementById("date-picker-button-cancel");
    expect(buttonCancel, "buttonCancel").to.be.not.null;
    buttonCancel.click();
    expect(onResult.calledOnce).to.be.true;
    expect(onResult.firstCall.args.length).to.be.lt(1);
  });

  it("should return the selected date", async () => {
    const onResult = sinon.stub<[string | undefined], void>();
    await act(() => {
      return new Promise((resolve) => {
        // Note: wrong date value is intentional
        ReactDOM.render(
          <DialogDatePicker
            isOpen
            onResult={onResult}
            date="2021-10-02"
            maxDate="2021-11-26"
            minDate="2021-11-01"
          />, container, resolve);
      });
    });

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
    buttonOk.click();

    expect(onResult.calledOnce, "onResult.calledOnce").to.be.true;
    expect(onResult.firstCall.args[0]).to.be.eq("2021-11-10");
  });
});

