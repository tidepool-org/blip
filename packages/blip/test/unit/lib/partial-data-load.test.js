/**
 * Copyright (c) 2022, Diabeloop
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

import moment from "moment-timezone";
import { expect } from "chai";

import PartialDataLoad from "../../../app/core/lib/partial-data-load";

describe("PartialDataLoad", () => {
  /** @type {PartialDataLoad} */
  let dataLoad;
  const range = {
    start: moment.utc("2022-01-01", "YYYY-MM-DD"),
    end: moment.utc("2022-03-01", "YYYY-MM-DD"),
  };
  const initialLoadedRange = {
    start: moment.utc("2022-02-15", "YYYY-MM-DD"),
    end: moment.utc("2022-03-01", "YYYY-MM-DD"),
  };

  beforeEach(() => {
    dataLoad = new PartialDataLoad(range, initialLoadedRange);
  });

  function expectInitial() {
    expect(dataLoad.range === range).to.be.true;
    expect(dataLoad.loadedRanges).to.be.an("array").lengthOf(1);
    expect(dataLoad.loadedRanges[0] === initialLoadedRange).to.be.true;
  }

  it("should have been correctly initialized", () => {
    expectInitial();
  });

  it("should not accept wrong range parameter", () => {
    let err = null;
    try {
      dataLoad.getMissingRanges(null, true);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.not.null;

    try {
      err = null;
      dataLoad.getMissingRanges({start: "a", end: 0 }, true);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.not.null;

    try {
      err = null;
      dataLoad.getMissingRanges({
        start: moment.utc("2022-02-10", "YYYY-MM-DD"),
        end: moment.utc("2022-02-09", "YYYY-MM-DD"),
      }, true);
    } catch (e) {
      err = e;
    }
    expect(err).to.be.not.null;
  });

  it("should limit the wanted range to the available range", () => {
    const testRange = {
      start: moment.utc("2021-01-01", "YYYY-MM-DD"),
      end: moment.utc("2023-01-01", "YYYY-MM-DD"),
    };

    const result = dataLoad.getMissingRanges(testRange, true);
    expectInitial();

    expect(result).to.be.an("array").lengthOf(1);
    expect(result[0]).to.be.an("object").not.null;
    expect(moment.isMoment(result[0].start), "start is moment").to.be.true;
    expect(moment.isMoment(result[0].end), "end is moment").to.be.true;
    expect(result[0].start.toISOString(), "start").to.be.eq(range.start.toISOString());
    expect(result[0].end.toISOString(), "end").to.be.eq(initialLoadedRange.start.clone().subtract(1, "day").endOf("day").toISOString());
  });

  it("should return a needed range before the initial loaded range (check = true)", () => {
    const testRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-02", "YYYY-MM-DD"),
    };
    const result = dataLoad.getMissingRanges(testRange, true);
    expectInitial();
    expect(result).to.be.an("array").lengthOf(1);
    expect(result[0]).to.be.an("object").not.null;
    expect(moment.isMoment(result[0].start), "start is moment").to.be.true;
    expect(moment.isMoment(result[0].end), "end is moment").to.be.true;
    expect(result[0].start.toISOString()).to.be.eq(testRange.start.toISOString());
    expect(result[0].end.toISOString()).to.be.eq(testRange.end.clone().subtract(1, "day").endOf("day").toISOString());
  });

  it("should return a needed range before the initial loaded range (check = false)", () => {
    const testRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-02", "YYYY-MM-DD"),
    };
    const result = dataLoad.getMissingRanges(testRange);

    expect(result).to.be.an("array").lengthOf(1);
    expect(result[0]).to.be.an("object").not.null;
    expect(moment.isMoment(result[0].start), "result start is moment").to.be.true;
    expect(moment.isMoment(result[0].end), "result end is moment").to.be.true;
    expect(result[0].start.toISOString(), "result[0].start").to.be.eq(testRange.start.toISOString());
    expect(result[0].end.toISOString(), "result[0].end").to.be.eq(testRange.end.clone().subtract(1, "day").endOf("day").toISOString());

    expect(dataLoad.range === range).to.be.true;
    expect(dataLoad.loadedRanges).to.be.an("array").lengthOf(2);
    const firstRange = dataLoad.loadedRanges[0];
    expect(firstRange).to.be.an("object").not.null;
    expect(moment.isMoment(firstRange.start), "range start is moment").to.be.true;
    expect(moment.isMoment(firstRange.end), "range end is moment").to.be.true;
    expect(firstRange.start.toISOString(), "firstRange.start").to.be.eq(testRange.start.toISOString());
    expect(firstRange.end.toISOString(), "firstRange.end").to.be.eq(testRange.end.toISOString());
    expect(dataLoad.loadedRanges[1] === initialLoadedRange).to.be.true;
  });

  it("should return a partial range load and merge loaded range (before)", () => {
    const testRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-17", "YYYY-MM-DD"),
    };
    const result = dataLoad.getMissingRanges(testRange);
    expect(result.length).to.be.eq(1);
    expect(result[0].start.toISOString(), "result[0].start").to.be.eq(testRange.start.toISOString());
    expect(result[0].end.toISOString(), "result[0].end").to.be.eq(initialLoadedRange.start.clone().subtract(1, "millisecond").toISOString());

    expect(dataLoad.loadedRanges.length).to.be.eq(1);
    expect(dataLoad.loadedRanges[0].start.toISOString(), "loadedRanges start").to.be.eq(testRange.start.toISOString());
  });

  it("should return a partial range load and merge loaded range (in between)", () => {
    const firstRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-10", "YYYY-MM-DD"),
    };
    const secondRange = {
      start: moment.utc("2022-02-05", "YYYY-MM-DD"),
      end: moment.utc("2022-02-16", "YYYY-MM-DD"),
    };

    let result = dataLoad.getMissingRanges(firstRange);
    expect(result.length).to.be.eq(1);
    expect(dataLoad.loadedRanges.length).to.be.eq(2);
    result = dataLoad.getMissingRanges(secondRange);
    expect(result.length).to.be.eq(1);
    expect(result[0].start.toISOString(), "result[0].start").to.be.eq(firstRange.end.toISOString());
    expect(result[0].end.toISOString(), "result[0].end").to.be.eq(initialLoadedRange.start.clone().subtract(1, "millisecond").toISOString());
    expect(dataLoad.loadedRanges.length).to.be.eq(1);

    expect(dataLoad.loadedRanges.length).to.be.eq(1);
    expect(dataLoad.loadedRanges[0].start.toISOString(), "loadedRanges start").to.be.eq(firstRange.start.toISOString());
    expect(dataLoad.loadedRanges[0].end.toISOString(), "loadedRanges end").to.be.eq(range.end.toISOString());
  });

  it("should return partial ranges and merge what can be", () => {
    const firstRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-10", "YYYY-MM-DD"),
    };
    const secondRange = {
      start: moment.utc("2022-01-25", "YYYY-MM-DD"),
      end: moment.utc("2022-02-13", "YYYY-MM-DD"),
    };

    let result = dataLoad.getMissingRanges(firstRange);
    expect(result.length).to.be.eq(1);
    expect(dataLoad.loadedRanges.length).to.be.eq(2);
    result = dataLoad.getMissingRanges(secondRange);
    expect(result.length).to.be.eq(2);
    expect(result[0].start.toISOString(), "result[0].start").to.be.eq(secondRange.start.toISOString());
    expect(result[0].end.toISOString(), "result[0].end").to.be.eq(firstRange.start.clone().subtract(1, "ms").toISOString());
    expect(result[1].start.toISOString(), "result[1].start").to.be.eq(firstRange.end.toISOString());
    expect(result[1].end.toISOString(), "result[1].end").to.be.eq(secondRange.end.clone().subtract(1, "ms").toISOString());
    expect(dataLoad.loadedRanges.length).to.be.eq(2);
  });

  it("should return an empty array when requested already loaded data", () => {
    const firstRange = {
      start: moment.utc("2022-02-01", "YYYY-MM-DD"),
      end: moment.utc("2022-02-10", "YYYY-MM-DD"),
    };
    const secondRange = {
      start: moment.utc("2022-02-20", "YYYY-MM-DD"),
      end: moment.utc("2022-02-24", "YYYY-MM-DD"),
    };
    dataLoad.getMissingRanges(firstRange);
    const result = dataLoad.getMissingRanges(secondRange);
    expect(result.length).to.be.eq(0);
  });

  it("should return the debug info", () => {
    expect(dataLoad.toDebug()).to.be.an("object").not.null;
    expect(dataLoad.toString()).to.be.a("string");
  });
});
