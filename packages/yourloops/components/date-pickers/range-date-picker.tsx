/**
 * Copyright (c) 2022, Diabeloop
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
import { Dayjs, isDayjs } from "dayjs";

import {
  CalendarOrientation,
  CalendarChangeMonth,
  CalendarSelectionRange,
} from "./models";
import PickerToolbar from "./picker-toolbar";
import CalendarBox from "./calendar-box";
import { useChangeMonthState } from "./change-month";

interface CalendarViewProps {
  showToolbar?: boolean;
  selection: CalendarSelectionRange;
  minDate: Dayjs;
  maxDate: Dayjs;
  orientation: CalendarOrientation;
  onChange: (d: Dayjs) => void;
}

function RangeDatePicker(props: CalendarViewProps): JSX.Element {
  const { selection, minDate, maxDate, orientation, onChange } = props;

  const [currentMonth, setCurrentMonth] = React.useState<Dayjs>(() => {
    const lastMonth = selection.selected.end.startOf("month");
    if (isDayjs(minDate) && lastMonth.subtract(1, "day").isBefore(minDate)) {
      // Don't display an unselectable month
      return lastMonth.add(1, "month");
    }
    return lastMonth;
  });

  const [changingMonth, handlePrevMonth, handleNextMonth] = useChangeMonthState({
    currentMonth,
    setCurrentMonth,
    minDate,
    maxDate,
    mode: selection.mode,
  });

  const prevMonth = React.useMemo(() => {
    return currentMonth.subtract(1, "month");
  }, [currentMonth]);

  const changingPrevMonth = React.useMemo<CalendarChangeMonth | null>(() => {
    if (changingMonth) {
      return {
        direction: changingMonth.direction,
        onAnimationEnd: changingMonth.onAnimationEnd,
        toMonth: changingMonth.toMonth.subtract(1, "month"),
      };
    }
    return null;
  }, [changingMonth]);

  return (
    <React.Fragment>
      {props.showToolbar && <PickerToolbar
        selection={selection}
        orientation={orientation}
      />}
      <CalendarBox
        position="first"
        selection={selection}
        orientation={orientation}
        currentMonth={prevMonth}
        minDate={minDate}
        maxDate={maxDate}
        changingMonth={changingPrevMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onChange={onChange}
      />
      <CalendarBox
        position="last"
        selection={selection}
        orientation={orientation}
        currentMonth={currentMonth}
        minDate={minDate}
        maxDate={maxDate}
        changingMonth={changingMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onChange={onChange}
      />
    </React.Fragment>
  );
}

export default RangeDatePicker;
