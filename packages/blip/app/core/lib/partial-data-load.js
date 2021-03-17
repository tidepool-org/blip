/**
 * Copyright (c) 2021, Diabeloop
 * Use to know when patient-data need to fetch more data from tide-whisperer
 * when the /data/v1/* routes are available.
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

/* eslint-disable no-bitwise */

import moment from 'moment-timezone';
import { MS_IN_DAY } from 'tideline';

/**
 * @typedef {{start: number, end: number}} DateRange
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
    const start = moment.utc(range.start).startOf('day');
    const end = moment.utc(range.end).endOf('day');


    /** @type {DateRange} */
    this.range = {
      start: start.valueOf(),
      end: end.valueOf(),
    };

    this.nDays = end.diff(start, 'days');
    const arraySize = Math.ceil(this.nDays/32.0);
    this.daysLoaded = [];
    for (let i=0; i<arraySize; i++) {
      // Represent each UTC day as 1bit of a 32bits number
      this.daysLoaded.push(0|0);
    }
    this.setRangeLoaded(initialLoadedRange);
  }

  /**
   * @param {DateRange} displayRange Epoch dates values
   */
  setRangeLoaded(displayRange) {
    const { start, end } = this.getStartEndDay(displayRange);

    for (let day=start; day<end; day++) {
      const idx = (day / 32)|0;
      const bit = (day % 32)|0;
      this.daysLoaded[idx] |= 1<<bit;
    }
  }

  /**
   * @param {DateRange} displayRange Epoch dates values
   * @return {DateRange} epoch values of data to load, or null of we have it all
   */
  getRangeToLoad(displayRange) {
    const { start, end } = this.getStartEndDay(displayRange);

    const days = [];
    for (let d=start; d<end; d++) {
      const idx = (d / 32)|0;
      const bit = (d % 32)|0;
      const daysBits = this.daysLoaded[idx];
      if (!(daysBits & (1<<bit))) {
        days.push(d);
      }
    }

    if (days.length > 0) {
      return {
        start: this.range.start + MS_IN_DAY * days[0],
        end: this.range.start + MS_IN_DAY * (days[days.length - 1] + 1),
      };
    }
    return null;
  }

  /**
   * @private
   * @param {DateRange} displayRange
   */
  getStartEndDay(displayRange) {
    let dStart = displayRange.start - this.range.start;
    let dEnd = displayRange.end - this.range.start;

    if (dStart < 0) {
      // silently change the value
      dStart = 0;
    } else if (dStart > this.nDays * MS_IN_DAY) {
      dStart = (this.nDays - 1) * MS_IN_DAY;
    }
    if (dEnd < 0) {
      dEnd = MS_IN_DAY;
    } else if (dEnd > this.nDays * MS_IN_DAY) {
      dEnd = this.nDays * MS_IN_DAY;
    }

    const startDay = Math.floor(dStart / MS_IN_DAY);
    const endDay = Math.ceil(dEnd / MS_IN_DAY) + 1;

    return { start: startDay, end: endDay };
  }

  toDebug() {
    const daysLoadedStr = [];
    for (let n=0; n<this.daysLoaded.length; n++) {
      daysLoadedStr.push('0b' + this.daysLoaded[n].toString(2));
    }
    const rangeStr = {
      start: moment.utc(this.range.start).toISOString(),
      end: moment.utc(this.range.end).toISOString(),
    };
    return {
      range: this.range,
      nDays: this.nDays,
      daysLoaded: this.daysLoaded,
      rangeStr,
      daysLoadedStr,
    };
  }
}


export default PartialDataLoad;
