/**
 * Copyright (c) 2021, Diabeloop
 * Allow to select a date (day/month/year) by displaying each days in a specific month
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

import _ from "lodash";
import React from "react";
import { Dayjs } from "dayjs";
import clsx from "clsx";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import { CalendarChangeMonth, animationStyle } from "./models";
import MonthDayElements, { dayStyles } from "./month-days-elements";

interface CalendarProps {
  /** Set the displayed month, current month if not set, and the currently selected day */
  currentMonth: Dayjs;
  selectedDate?: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disablePast?: boolean;
  disableFuture?: boolean;
  changeMonth?: CalendarChangeMonth | null;
  onChange: (date: Dayjs, updateCurrentMonth?: boolean) => void;
}

interface CalendarStylesParams {
  direction?: "left" | "right";
}

const calendarStyles = makeStyles((theme: Theme) => {
  return {
    calendar: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.background.paper,
      overflow: "hidden",
      width: 300,
    },
    weekdays: {
      display: "grid",
      gridTemplateColumns: "repeat(7, auto)",
      gridTemplateRows: "auto",
      justifyContent: "center",
      rowGap: 5,
      columnGap: 5,
      width: 300,
      minWidth: 300,
    },
    dayLabel: {
      textAlign: "center",
    },
    divScroll: {
      width: 300,
      display: "flex",
      flexDirection: (props: CalendarStylesParams) => props.direction === "left" ? "row-reverse" : "row",
    },
  };
}, { name: "date-pickers-calendar" });

function Calendar(props: CalendarProps): JSX.Element {
  // use startOf() here to clone the date, and to be sure we use the same timezone offset
  // dayjs don't handle properly the clone of the timezone
  const { currentMonth, selectedDate, onChange, changeMonth, minDate, maxDate } = props;
  const dayClasses = dayStyles();
  const animClasses = animationStyle();
  const classes = calendarStyles({ direction: changeMonth?.direction });

  const { daysArray, weekDays, currentMonthNumber } = React.useMemo(() => ({
    daysArray: currentMonth.getWeekArray(),
    weekDays: currentMonth.getWeekdays(),
    currentMonthNumber: currentMonth.month(),
  }), [currentMonth]);

  const weekDaysElements = React.useMemo(() => weekDays.map((day: string, index: number) => (
    <Typography
      id={`calendar-weekday-${index}`}
      aria-hidden="true"
      key={day}
      variant="caption"
      color="textSecondary"
      className={`${dayClasses.dayElement} ${classes.dayLabel}`}
    >
      {_.capitalize(day)}
    </Typography>
  )), [weekDays, dayClasses.dayElement, classes.dayLabel]);

  const weekdaysValues = (
    <div id="calendar-weekdays-values-current" role="grid" className={classes.weekdays}>
      <MonthDayElements
        currentMonth={currentMonthNumber}
        daysArray={daysArray}
        onChange={onChange}
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );

  let weekdaysDiv = weekdaysValues;
  if (changeMonth) {
    const isBefore = changeMonth.direction === "left";
    const newMonth = changeMonth.newMonth.month();
    const newDaysArray = changeMonth.newMonth.getWeekArray();
    const changingWeekdaysValues = (
      <div id="calendar-weekdays-values-new" role="grid" className={classes.weekdays}>
        <MonthDayElements
          currentMonth={newMonth}
          daysArray={newDaysArray}
          onChange={_.noop}
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    );
    const classChangeMonth = clsx(classes.divScroll, {
      [animClasses.animatedMonthLTR]: isBefore,
      [animClasses.animatedMonthRTL]: !isBefore,
    });
    weekdaysDiv = (
      <div className={classChangeMonth} onAnimationEnd={changeMonth.onAnimationEnd} aria-busy="true">
        {weekdaysValues}
        {changingWeekdaysValues}
      </div>
    );
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (changeMonth) {
      return;
    }
    if (!selectedDate) {
      onChange(currentMonth);
      return;
    }
    switch (e.key) {
    case "ArrowUp":
      onChange(selectedDate.subtract(1, "week"), true);
      break;
    case "ArrowDown":
      onChange(selectedDate.add(1, "week"), true);
      break;
    case "ArrowLeft":
      onChange(selectedDate.subtract(1, "day"), true);
      break;
    case "ArrowRight":
      onChange(selectedDate.add(1, "day"), true);
      break;
    }
  };

  return (
    <div id="calendar-month" className={classes.calendar} tabIndex={0} onKeyUp={onKeyUp} role="grid">
      <div id="calendar-weekdays-names" className={classes.weekdays}>
        {weekDaysElements}
      </div>
      {weekdaysDiv}
    </div>
  );
}

export default Calendar;
