/**
 * Copyright (c) 2021, Diabeloop
 * Display the days off a month
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
import { makeStyles } from "@material-ui/core/styles";

import { DAY_SIZE } from "./models";
import Day from "./day";

interface MonthDayElementsProps {
  daysArray: Dayjs[];
  selectedDate?: Dayjs;
  currentMonth: number;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  onChange: (date: Dayjs) => void;
}

export const dayStyles = makeStyles(() => ({
  dayElement: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    placeSelf: "center",
  },
}), { name: "date-pickers-day" });

function MonthDayElements(props: MonthDayElementsProps): JSX.Element {
  const classes = dayStyles();
  const { currentMonth, daysArray, selectedDate, onChange, minDate, maxDate } = props;

  const monthDaysElements = daysArray.map((day) => {
    const dateOfMonth = day.date();
    const month = day.month();
    const disabled = month !== currentMonth
      || (isDayjs(minDate) && day.isBefore(minDate))
      || (isDayjs(maxDate) && day.isAfter(maxDate));
    const selected = isDayjs(selectedDate) && selectedDate.isSame(day, "day");
    return (
      <Day
        id={`button-calendar-day-${day.format("YYYY-MM-DD")}`}
        key={`day-${month}-${dateOfMonth}`}
        day={dateOfMonth.toString(10)}
        selected={selected}
        color="primary"
        disabled={disabled}
        aria-selected={selected}
        aria-hidden={disabled}
        className={classes.dayElement}
        onClick={() => onChange(day)}
      />
    );
  });

  return (
    <React.Fragment>
      {monthDaysElements}
    </React.Fragment>
  );
}

export default MonthDayElements;
