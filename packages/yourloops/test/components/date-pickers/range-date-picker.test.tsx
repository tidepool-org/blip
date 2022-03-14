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
import { act } from "react-dom/test-utils";
import * as sinon from "sinon";
import { expect } from "chai";
import dayjs from "dayjs";

import RangeDatePicker from "../../../components/date-pickers/range-date-picker";

describe("Range date picker", () => {

  const minDate = dayjs("2000-01-01", { utc: true });
  const maxDate = dayjs("2100-01-01", { utc: true });
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
    const range = { start: dayjs("2021-11-09"), end: dayjs("2021-11-20") };
    const rangeSelectable = { start: dayjs("2021-11-01"), end: dayjs("2021-12-02") };
    const onChange = sinon.stub<[dayjs.Dayjs], void>();

    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <RangeDatePicker
            orientation="portrait"
            minDate={minDate}
            maxDate={maxDate}
            selection={{ mode: "range", selected: range, selectable: rangeSelectable, maxSelectableDays: 20 }}
            onChange={onChange}
            showToolbar
          />, container, resolve);
      });
    });

    let elem = document.getElementById("calendar-box-first");
    expect(elem, "calendar-box-first").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "calendar-box-first").to.be.eq("div");
    elem = document.getElementById("calendar-box-last");
    expect(elem, "calendar-box-last").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "calendar-box-last").to.be.eq("div");

    elem = document.getElementById("calendar-month-first");
    expect(elem, "calendar-month-first").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "calendar-month-first").to.be.eq("div");
    elem = document.getElementById("calendar-month-last");
    expect(elem, "calendar-month-last").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "calendar-month-last").to.be.eq("div");

    elem = document.getElementById("date-picker-toolbar");
    expect(elem, "date-picker-toolbar").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "date-picker-toolbar").to.be.eq("div");

    elem = document.getElementById("date-picker-toolbar-max-days-range");
    expect(elem, "date-picker-toolbar-max-days-range").to.be.not.null;
    expect(elem.nodeName.toLowerCase(), "date-picker-toolbar-max-days-range").to.be.eq("p");
  });
});


