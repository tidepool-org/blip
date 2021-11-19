/**
 * Copyright (c) 2021, Diabeloop
 * Day.js init & custom plugins
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


import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";

const nbDaysPerWeek = 7;

/**
 * Custom plugin for day.js to display a calendar.
 * For the Typescript definition, see packages/yourloops/types/dayjs.d.ts
 *
 * Based on https://github.com/dmtrKovalenko/date-io/blob/e70582f726e4612ba08acb4083112803f790994f/packages/dayjs/src/dayjs-utils.ts#L339
 */
const weekArrayPlugin: dayjs.PluginFunc<void> = (_o, c /*, d */) => {
  c.prototype.getNestedWeekArray = function getNestedWeekArray() {
    const start = this.startOf("month").startOf("week");
    const end = this.endOf("month").endOf("week");

    let count = 0;
    let current = start;
    const nestedWeeks: dayjs.Dayjs[][] = [];

    while (current.isBefore(end)) {
      const weekNumber = Math.floor(count / nbDaysPerWeek);
      if (nestedWeeks.length <= weekNumber) {
        nestedWeeks.push([]);
      }
      nestedWeeks[weekNumber].push(current);

      current = current.add(1, "day");
      count += 1;
    }

    return nestedWeeks;
  };

  c.prototype.getWeekArray = function getWeekArray() {
    const start = this.startOf("month").startOf("week");

    let current = start;
    const numDays = 42; // 6 * 7 -> always display 6 weeks in the calendar
    const weekArray: dayjs.Dayjs[] = [];
    for (let i=0; i<numDays; i++) {
      weekArray.push(current);
      current = current.add(1, "day");
    }

    return weekArray;
  };
};

const weekdaysPlugin: dayjs.PluginFunc<void> = (_o, c /*, d */) => {
  c.prototype.getWeekdays = function getWeekdays(format = "dd") {
    const start = this.startOf("week");
    // eslint-disable-next-line no-magic-numbers
    return [0, 1, 2, 3, 4, 5, 6].map((diff) => start.add(diff, "day").format(format));
  };
};

function initDayJS() {
  dayjs.extend(dayjsUTC);
  dayjs.extend(dayjsTimezone);
  dayjs.extend(dayjsLocalizedFormat);
  dayjs.extend(weekArrayPlugin);
  dayjs.extend(weekdaysPlugin);

  dayjs.tz.setDefault(dayjs.tz.guess());
}

export default initDayJS;
