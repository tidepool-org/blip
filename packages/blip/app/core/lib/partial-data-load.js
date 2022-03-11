/**
 * Copyright (c) 2021-2022, Diabeloop
 * Use to know which data range needed to be fetched from the backend
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

/**
 * @typedef {{start: moment.Moment, end: moment.Moment}} DateRange
 */

/**
 * Helper to know which days of data we need to fetch from the API
 */
class PartialDataLoad {

  /**
   * @param {DateRange} range start/end epoch values in ms
   * @param {DateRange} initialLoadedRange start/end epoch values in ms
   */
  constructor(range, initialLoadedRange) {
    /** @type {DateRange} */
    this.range = range;
    /** @type {DateRange[]} */
    this.loadedRanges = [initialLoadedRange];
  }

  /**
   * @private
   * @param {DateRange} range Range to check
   * @returns {DateRange}
   */
  limitRange(range) {
    let { start, end } = range;
    if (moment.isMoment(start) && moment.isMoment(end)) {
      start = start.isBefore(this.range.start) ? this.range.start : start;
      start = start.isAfter(this.range.end) ? this.range.end : start;
      end = end.isAfter(this.range.end) ? this.range.end : end;
      end = end.isBefore(this.range.start) ? this.range.start : end;
      return { start, end };
    }
    throw new Error("Invalid range parameter");
  }

  /**
   * @param {DateRange} wantedRange The date range needed, inclusive values, start of utc days
   * @param {boolean} check set to true, to do a read-only check, default to false
   */
  getMissingRanges(wantedRange, check = false) {
    /** @type {DateRange[]} */
    const missingRanges = [];

    let { start, end } = this.limitRange(wantedRange);
    if (end.isBefore(start)) {
      throw new Error("Invalid wanted range");
    }

    for (const loadedRange of this.loadedRanges) {
      if (start.isBefore(loadedRange.start)) {
        // We have a missing range
        if (end.isBefore(loadedRange.start)) {
          // Completely before our range
          missingRanges.push({
            start,
            end: end.clone().subtract(1, "day").endOf("day"),
          });
          break; // This is all we need
        } else {
          missingRanges.push({
            start,
            end: loadedRange.start.clone().subtract(1, "day").endOf("day"),
          });
          if (loadedRange.end.isBefore(end)) {
            start = loadedRange.end; // Update start value
          } else {
            break; // This is all we need
          }
        }
      } else if (start.isBefore(loadedRange.end) && end.isAfter(loadedRange.end)) {
        // start is within the current tested range
        start = loadedRange.end;
      } else if (end.isSameOrBefore(loadedRange.end)) {
        // Already loaded
        break;
      }
    }

    if (!check && missingRanges.length > 0) {
      this.sortAndMergeRanges(wantedRange);
    }

    return missingRanges;
  }

  /**
   * Set the specified ranged as loaded
   * @private
   * @param {DateRange} newRange The new range just added
   */
  sortAndMergeRanges(newRange) {
    // Update our loaded range
    this.loadedRanges.push({
      start: newRange.start.clone(),
      end: newRange.end.clone(),
    });

    this.loadedRanges.sort((a, b) => a.start.valueOf() - b.start.valueOf());

    let prevRange = this.loadedRanges[0];
    for (let i = 1; i < this.loadedRanges.length; i++) {
      let currentRange = this.loadedRanges[i];
      if (prevRange.end.isSameOrAfter(currentRange.start)) {
        if (prevRange.end.isSameOrBefore(currentRange.end)) {
          prevRange.end = currentRange.end;
        }
        this.loadedRanges[i] = null;
      }
    }

    this.loadedRanges = this.loadedRanges.filter((v) => v !== null);
  }

  toDebug() {
    let ranges = [];
    for (const loadedRange of this.loadedRanges) {
      ranges.push({
        start: loadedRange.start.toISOString(),
        end: loadedRange.end.toISOString(),
      });
    }
    return {
      ranges,
      range: {
        start: this.range.start.toISOString(),
        end: this.range.end.toISOString(),
      }
    };
  }

  toString() {
    return JSON.stringify(this.toDebug());
  }
}

export default PartialDataLoad;
