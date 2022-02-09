/**
 * Copyright (c) 2021, Diabeloop
 * Date-pickers tests
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

import i18n from "../../../lib/language";

import testCalendarHeader from "./calendar-header.test";
import testMonthDayElements from "./month-days-elements.test";
import testCalendar from "./calendar.test";
import testYearSelector from "./year-selector.test";
import testDatePicker from "./date-picker.test";
import testRangeDatePicker from "./range-date-picker.test";
import testDialogDatePicker from "./dialog-date-picker.test";
import testDialogRangeDatePicker from "./dialog-range-date-picker.test";

function testDatePickers() {
  before(() => {
    i18n.addResourceBundle("en", "yourloops", {
      "date-picker-header-date-format": "MMMM YYYY",
      "date-picker-toolbar-date-format": "ddd, MMM D",
    });
  });

  describe("CalendarHeader", testCalendarHeader);
  describe("MonthDayElements", testMonthDayElements);
  describe("Calendar", testCalendar);
  describe("YearSelector", testYearSelector);
  describe("DatePicker", testDatePicker);
  describe("RangeDatePicker", testRangeDatePicker);
  describe("DialogDatePicker", testDialogDatePicker);
  describe("DialogRangeDatePicker", testDialogRangeDatePicker);
}

export default testDatePickers;
