/**
 * Copyright (c) 2022, Diabeloop
 * Tests on DialogPDFOptions
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

import DialogPDFOptions, { Presets, PrintPDFOptions } from "../../../components/dialogs/pdf-print-options";

function testDialogPDFOptions() {
  const MIN_DATE = "2020-01-01";
  const MAX_DATE = "2022-12-31";
  const handleResult = sinon.stub<[PrintPDFOptions], void>();
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    handleResult.resetHistory();
  });
  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
      container = null;
    }
  });

  const render = (open = true, minDate = MIN_DATE, maxDate = MAX_DATE) => {
    return act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <DialogPDFOptions open={open} minDate={minDate} maxDate={maxDate} onResult={handleResult} />, container, resolve);
      });
    });
  };

  const expectSelectedPreset = (preset: Presets | null) => {
    const oneWeekButton = document.getElementById("pdf-options-button-one-week");
    const twoWeeksButton = document.getElementById("pdf-options-button-two-weeks");
    const fourWeeksButton = document.getElementById("pdf-options-button-four-weeks");
    const threeMonthsButton = document.getElementById("pdf-options-button-three-months");

    const oneWeekSelected = oneWeekButton.getAttribute("aria-selected") === "true";
    const twoWeeksSelected = twoWeeksButton.getAttribute("aria-selected") === "true";
    const fourWeeksSelected = fourWeeksButton.getAttribute("aria-selected") === "true";
    const threeMonthsSelected = threeMonthsButton.getAttribute("aria-selected") === "true";

    switch (preset) {
    case "1week":
      expect(oneWeekSelected, "oneWeekSelected").to.be.true;
      expect(twoWeeksSelected, "twoWeeksSelected").to.be.false;
      expect(fourWeeksSelected, "fourWeeksSelected").to.be.false;
      expect(threeMonthsSelected, "threeMonthsSelected").to.be.false;
      break;
    case "2weeks":
      expect(oneWeekSelected, "oneWeekSelected").to.be.false;
      expect(twoWeeksSelected, "twoWeeksSelected").to.be.true;
      expect(fourWeeksSelected, "fourWeeksSelected").to.be.false;
      expect(threeMonthsSelected, "threeMonthsSelected").to.be.false;
      break;
    case "4weeks":
      expect(oneWeekSelected, "oneWeekSelected").to.be.false;
      expect(twoWeeksSelected, "twoWeeksSelected").to.be.false;
      expect(fourWeeksSelected, "fourWeeksSelected").to.be.true;
      expect(threeMonthsSelected, "threeMonthsSelected").to.be.false;
      break;
    case "3months":
      expect(oneWeekSelected, "oneWeekSelected").to.be.false;
      expect(twoWeeksSelected, "twoWeeksSelected").to.be.false;
      expect(fourWeeksSelected, "fourWeeksSelected").to.be.false;
      expect(threeMonthsSelected, "threeMonthsSelected").to.be.true;
      break;
    default:
      expect(oneWeekSelected, "oneWeekSelected").to.be.false;
      expect(twoWeeksSelected, "twoWeeksSelected").to.be.false;
      expect(fourWeeksSelected, "fourWeeksSelected").to.be.false;
      expect(threeMonthsSelected, "threeMonthsSelected").to.be.false;
      break;
    }
  };

  const expectResult = (preset: Presets | null, start = MIN_DATE, end = MAX_DATE) => {
    const buttonGenerate = document.getElementById("pdf-options-button-generate");
    buttonGenerate.click();
    expect(handleResult.calledOnce).to.be.true;
    expect(handleResult.firstCall.args.length).to.be.eq(1);

    const result = handleResult.firstCall.args[0];
    if (preset) {
      expect(result.preset).to.be.equal(preset);
    } else {
      expect(result.preset).to.be.undefined;
    }

    switch (preset) {
    case "1week":
      expect(result.start, "start").to.be.eq("2022-12-25");
      expect(result.end, "end").to.be.eq(MAX_DATE);
      break;
    case "2weeks":
      expect(result.start, "start").to.be.eq("2022-12-18");
      expect(result.end, "end").to.be.eq(MAX_DATE);
      break;
    case "4weeks":
      expect(result.start, "start").to.be.eq("2022-12-04");
      expect(result.end, "end").to.be.eq(MAX_DATE);
      break;
    case "3months":
      expect(result.start, "start").to.be.eq("2022-10-03");
      expect(result.end, "end").to.be.eq(MAX_DATE);
      break;
    default:
      expect(result.start, "start").to.be.equal(start);
      expect(result.end, "end").to.be.equal(end);
      break;
    }
  };

  it("should render nothing if not open", async () => {
    await render(false);
    const calendarElem = document.getElementById("dialog-pdf-options");
    expect(calendarElem).to.be.null;
  });

  it("should render if open",async () => {
    await render();
    const calendarElem = document.getElementById("dialog-pdf-options");
    expect(calendarElem).to.be.not.null;
  });

  it("should return undefined if cancel button is clicked", async () => {
    await render();
    document.getElementById("pdf-options-button-cancel").click();
    expect(handleResult.calledOnce).to.be.true;
    expect(handleResult.firstCall.args.length).to.be.eq(0);
  });

  it("should select by default the 4 weeks period", async () => {
    await render();

    const button = document.getElementById("pdf-options-button-four-weeks");
    expect(button).to.be.not.null;
    expectSelectedPreset("4weeks");
  });

  it("should allow to select 1 week preset", async () => {
    await render();
    document.getElementById("pdf-options-button-one-week").click();
    expectSelectedPreset("1week");
    expectResult("1week");
  });

  it("should allow to select 2 weeks preset", async () => {
    await render();
    document.getElementById("pdf-options-button-two-weeks").click();
    expectSelectedPreset("2weeks");
    expectResult("2weeks");
  });

  it("should allow to select 4 weeks preset", async () => {
    await render();
    document.getElementById("pdf-options-button-four-weeks").click();
    expectSelectedPreset("4weeks");
    expectResult("4weeks");
  });

  it("should allow to select 3 months preset", async () => {
    await render();
    document.getElementById("pdf-options-button-three-months").click();
    expectSelectedPreset("3months");
    expectResult("3months");
  });

  it("should allow to select a custom range 2022-11-01 to 2022-11-20", async () => {
    await render();
    document.getElementById("button-calendar-day-2022-11-01").click();
    document.getElementById("button-calendar-day-2022-11-20").click();
    expectSelectedPreset(null);
    expectResult(null, "2022-11-01", "2022-11-20");
  });

  it("should allow to select a custom range 2022-11-15 to 2022-11-08", async () => {
    await render();
    document.getElementById("button-calendar-day-2022-11-15").click();
    document.getElementById("button-calendar-day-2022-11-08").click();
    expectSelectedPreset(null);
    expectResult(null, "2022-11-08", "2022-11-15");
  });
}

export default testDialogPDFOptions;
