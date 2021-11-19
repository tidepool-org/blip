/**
 * Copyright (c) 2021, Diabeloop
 * Allow to select a year
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

import { MIN_YEAR, MAX_YEAR } from "../../../components/date-pickers/models";
import YearSelector from "../../../components/date-pickers/year-selector";

function testYearSelector(): void {
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

  it("should correctly render the default list of years", async () => {
    const onSelectedYear = sinon.stub<[number], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <YearSelector
            selectedYear={2021}
            onSelectedYear={onSelectedYear}
          />, container, resolve);
      });
    });

    const yearSelector = document.getElementById("year-selector");
    expect(yearSelector).to.be.not.null;
    expect(yearSelector.children.length).to.be.eq(MAX_YEAR - MIN_YEAR + 1);
  });

  it("should select the previous year with the arrow up key", async () => {
    const onSelectedYear = sinon.stub<[number], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <YearSelector
            selectedYear={2021}
            maxYear={2024}
            minYear={2017}
            onSelectedYear={onSelectedYear}
          />, container, resolve);
      });
    });

    const yearSelector = document.getElementById("year-selector");
    const year2020 = document.getElementById("year-2020");
    const year2021 = document.getElementById("year-2021");

    expect(year2020.getAttribute("aria-selected")).to.be.eq("false");
    expect(year2021.getAttribute("aria-selected")).to.be.eq("true");

    Simulate.keyUp(yearSelector, { key: "ArrowUp" });

    expect(year2020.getAttribute("aria-selected")).to.be.eq("true");
    expect(year2021.getAttribute("aria-selected")).to.be.eq("false");

    Simulate.keyUp(yearSelector, { key: "Enter" });
    expect(onSelectedYear.calledOnce).to.be.true;
    // eslint-disable-next-line no-magic-numbers
    expect(onSelectedYear.firstCall.args[0]).to.be.eq(2020);
  });

  it("should select the next year with the arrow down key", async () => {
    const onSelectedYear = sinon.stub<[number], void>();
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <YearSelector
            selectedYear={2021}
            maxYear={2024}
            minYear={2017}
            onSelectedYear={onSelectedYear}
          />, container, resolve);
      });
    });

    const yearSelector = document.getElementById("year-selector");
    const year2021 = document.getElementById("year-2021");
    const year2022 = document.getElementById("year-2022");

    expect(year2021.getAttribute("aria-selected")).to.be.eq("true");
    expect(year2022.getAttribute("aria-selected")).to.be.eq("false");

    Simulate.keyUp(yearSelector, { key: "ArrowDown" });

    expect(year2021.getAttribute("aria-selected")).to.be.eq("false");
    expect(year2022.getAttribute("aria-selected")).to.be.eq("true");

    Simulate.keyUp(yearSelector, { key: " " });
    expect(onSelectedYear.calledOnce).to.be.true;
    // eslint-disable-next-line no-magic-numbers
    expect(onSelectedYear.firstCall.args[0]).to.be.eq(2022);
  });
}

export default testYearSelector;
