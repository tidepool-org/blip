/**
 * Copyright (c) 2021, Diabeloop
 * Calendar header: Allow to change the current displayed month on the calendar
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
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";

import { CalendarChangeMonth, animationStyle } from "./models";

interface CalendarHeaderProps {
  currentMonth: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  onMonthChange: (date: Dayjs) => void;
  changeMonth?: CalendarChangeMonth | null;
}

const calendarStyles = makeStyles(() => {
  return {
    root: {
      display: "flex",
      flexDirection: "row",
      cursor: "pointer",
      overflow: "hidden",
      width: 300,
    },
    divMonth: {
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      flex: 1,
    },
    divScroll: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      height: "100%",
    },
    month: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      alignSelf: "center",
      minWidth: "100%",
    },
    monthTranslated: {
      transform: "translateX(-100%)",
    },
  };
}, { name: "date-pickers-calendar-header" });

function CalendarHeader(props: CalendarHeaderProps): JSX.Element {
  const { currentMonth, onMonthChange, changeMonth, minDate, maxDate } = props;

  const { t } = useTranslation("yourloops");
  const classes = calendarStyles();
  const animClasses = animationStyle();

  const displayFormat = t("date-picker-header-date-format");
  const currMonthYear = currentMonth.format(displayFormat);
  const prevMonth = currentMonth.startOf("month").subtract(1, "month");
  const nextMonth = prevMonth.add(2, "month");
  const prevButtonDisabled = isDayjs(minDate) && prevMonth.isBefore(minDate.startOf("month"));
  const nextButtonDisabled = isDayjs(maxDate) && nextMonth.isAfter(maxDate);

  let displayedMonths: JSX.Element;
  if (changeMonth) {
    const isBefore = changeMonth.direction === "left";
    const divScrollClasses = clsx(classes.divScroll, {
      [animClasses.animatedMonthLTR]: isBefore,
      [animClasses.animatedMonthRTL]: !isBefore,
    });
    const changingMonthClasses = clsx(classes.month, classes.monthTranslated);
    const changingMonthYear = changeMonth.newMonth.format(displayFormat);

    displayedMonths = (
      <div className={divScrollClasses} aria-busy="true">
        <Typography id="calendar-header-prev-month" className={changingMonthClasses}>
          {changingMonthYear}
        </Typography>
        <Typography id="calendar-header-current-month" className={changingMonthClasses}>
          {currMonthYear}
        </Typography>
        <Typography id="calendar-header-next-month" className={changingMonthClasses}>
          {changingMonthYear}
        </Typography>
      </div>
    );
  } else {
    displayedMonths = (
      <Typography id="calendar-header-current-month" className={classes.month} aria-label={t("aria-calendar-current-month")}>
        {currMonthYear}
      </Typography>
    );
  }

  const onPrevButtonEvent = (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!prevButtonDisabled) {
      let validEvent = true;
      if (e.type === "keyup") {
        const key = (e as React.KeyboardEvent<HTMLButtonElement>).key;
        validEvent = key === " " || key === "Enter";
      }
      if (validEvent) {
        onMonthChange(prevMonth);
      }
    }
  };

  const onNextButtonEvent = (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!nextButtonDisabled) {
      let validEvent = true;
      if (e.type === "keyup") {
        const key = (e as React.KeyboardEvent<HTMLButtonElement>).key;
        validEvent = key === " " || key === "Enter";
      }
      if (validEvent) {
        onMonthChange(nextMonth);
      }
    }
  };

  return (
    <div id="calendar-header" className={classes.root}>
      <IconButton
        id="calendar-header-button-prev-month"
        disabled={prevButtonDisabled}
        aria-disabled={prevButtonDisabled}
        aria-label={t("aria-calendar-button-prev-month")}
        onClick={onPrevButtonEvent}
        onKeyUp={onPrevButtonEvent}
      >
        <NavigateBeforeIcon />
      </IconButton>

      <div id="calendar-header-displayed-month" className={classes.divMonth}>
        {displayedMonths}
      </div>

      <IconButton
        id="calendar-header-button-next-month"
        disabled={nextButtonDisabled}
        aria-disabled={nextButtonDisabled}
        aria-label={t("aria-calendar-button-next-month")}
        onClick={onNextButtonEvent}
        onKeyUp={onNextButtonEvent}
      >
        <NavigateNextIcon />
      </IconButton>
    </div>
  );
}

export default CalendarHeader;
