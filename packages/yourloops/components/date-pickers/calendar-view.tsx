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
import { Dayjs, isDayjs } from "dayjs";

import { makeStyles, Theme } from "@material-ui/core/styles";

import { CalendarChangeMonth, TRANSITION_DURATION } from "./models";
import PickerToolbar from "./picker-toolbar";
import Header from "./calendar-header";
import Calendar from "./calendar";
import YearSelector from "./year-selector";

interface CalendarViewProps {
  selectedDate: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  direction?: "landscape" | "portrait";
  disablePast?: boolean;
  disableFuture?: boolean;
  onChange: (d: Dayjs) => void;
}

const calendarViewStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: (props: CalendarViewProps) => props.direction === "landscape" ? "row" : "column",
      backgroundColor: theme.palette.background.paper,
      width: "fit-content",
      margin: 0,
      padding: 0,
    },
    calendarBox: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: 300,
      height: 325,
    },
  };
}, { name: "date-pickers-calendar-view" });

function CalendarView(props: CalendarViewProps): JSX.Element {
  const { selectedDate, minDate, maxDate } = props;
  const classes = calendarViewStyles(props);
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate.startOf("month"));
  const [changeMonth, setChangeMonth] = React.useState<CalendarChangeMonth | null>(null);
  const [changeYear, setChangeYear] = React.useState(false);

  const canChangeToMonth = (d: Dayjs) => {
    const minMonth = minDate?.startOf("month");
    if (isDayjs(minMonth) && d.isBefore(minMonth)) {
      return { result: false, date: minMonth };
    }
    const maxMonth = maxDate?.endOf("month").endOf("day");
    if (isDayjs(maxMonth) && d.isAfter(maxMonth)) {
      return { result: false, date: maxMonth };
    }
    return { result: true, date: d };
  };

  const setCurrentMonthSafe = (d: Dayjs) => {
    const { date } = canChangeToMonth(d);
    setCurrentMonth(date);
  };

  const setNewMonth = (month: Dayjs) => {
    if (!canChangeToMonth(month).result) {
      return;
    }
    const startTime = Date.now();
    const transitionTimeoutThreshold = 150;
    let timeoutTransition = window.setTimeout(() => {
      console.log("setNewMonth: Transition timeout", `${Date.now() - startTime}ms`);
      timeoutTransition = 0;
      setCurrentMonthSafe(month);
      setChangeMonth(null);
    }, TRANSITION_DURATION + transitionTimeoutThreshold);
    setChangeMonth({
      direction: month.isAfter(currentMonth) ? "right" : "left",
      newMonth: month,
      onAnimationEnd: () => {
        if (timeoutTransition > 0) {
          window.clearTimeout(timeoutTransition);
          setCurrentMonthSafe(month);
          setChangeMonth(null);
        }
      },
    });
  };

  const setSelectedDate = (d: Dayjs, updateCurrentMonth?: boolean) => {
    if (isDayjs(minDate) && d.isBefore(minDate)) {
      props.onChange(minDate);
    } else if (isDayjs(maxDate) && d.isAfter(maxDate)) {
      props.onChange(maxDate);
    } else {
      props.onChange(d);
    }

    if (updateCurrentMonth && d.month() !== currentMonth.month()) {
      setNewMonth(d.startOf("month"));
    }
  };

  let calendarBox;
  if (changeYear) {
    const onSelectedYear = (year: number) => {
      setChangeYear(false);
      setCurrentMonthSafe(currentMonth.set("year", year));
      setSelectedDate(selectedDate.set("year", year));
    };
    calendarBox = (
      <div id="calendar-box" className={classes.calendarBox}>
        <YearSelector selectedYear={selectedDate.year()} onSelectedYear={onSelectedYear} minYear={minDate?.year()} maxYear={maxDate?.year()} />
      </div>
    );
  } else {
    calendarBox = (
      <div id="calendar-box" className={classes.calendarBox}>
        <Header currentMonth={currentMonth} onMonthChange={setNewMonth} changeMonth={changeMonth} minDate={minDate} maxDate={maxDate} />
        <Calendar
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          changeMonth={changeMonth}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    );
  }

  return (
    <div id="calendar-view" className={classes.root}>
      <PickerToolbar selectedDate={selectedDate} direction={props.direction} onClickYear={() => setChangeYear(true)} />
      {calendarBox}
    </div>
  );
}

export default CalendarView;
