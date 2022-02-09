/**
 * Copyright (c) 2021-2022, Diabeloop
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
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";

import { CalendarOrientation, CalendarPosition, CalendarChangeMonth, animationStyle } from "./models";

interface CalendarHeaderProps {
  /** For range calendar to distinguish  */
  id?: string;
  position?: CalendarPosition,
  orientation: CalendarOrientation;
  currentMonth: Dayjs;
  /** Set to undefined to disabled the prev month button */
  onPrevMonth?: () => void;
  /** Set to undefined to disabled the next month button */
  onNextMonth?: () => void;
  /** Defined during the change month animation */
  changingMonth?: CalendarChangeMonth | null;
}

const calendarStyles = makeStyles(() => {
  return {
    root: {
      display: "flex",
      flexDirection: "row",
      cursor: "pointer",
      height: 50, // Instead of natural 48px, because I like rounded values
    },
    rootLandscape: {
      marginLeft: 5,
      marginRight: 5,
    },
    rootPortrait: {
      marginLeft: 10,
      marginRight: 10,
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
    buttonHidden: {
      // When using range calendar, button may be hidden
      // depending on the calendar position
      visibility: "hidden",
    },
  };
}, { name: "date-pickers-calendar-header" });

function CalendarHeader(props: CalendarHeaderProps): JSX.Element {
  const { currentMonth, changingMonth, position, onPrevMonth, onNextMonth } = props;

  const { t } = useTranslation("yourloops");
  const classes = calendarStyles();
  const animClasses = animationStyle();

  const displayFormat = t("date-picker-header-date-format");
  const currMonthYear = currentMonth.format(displayFormat);
  const prevButtonDisabled = typeof onPrevMonth !== "function";
  const nextButtonDisabled = typeof onNextMonth !== "function";
  const prevButtonHidden = position === "last" && props.orientation === "landscape";
  const nextButtonHidden = position === "first" && props.orientation === "landscape";
  const id = position ? `calendar-header-${position}` : "calendar-header";

  let displayedMonths: JSX.Element;
  if (changingMonth) {
    const isBefore = changingMonth.direction === "left";
    const newMonth = isBefore ? currentMonth.subtract(1, "month") : currentMonth.add(1, "month");
    const divScrollClasses = clsx(classes.divScroll, {
      [animClasses.animatedMonthLTR]: isBefore,
      [animClasses.animatedMonthRTL]: !isBefore,
    });
    const changingMonthClasses = clsx(classes.month, classes.monthTranslated);
    const changingMonthYear = newMonth.format(displayFormat);

    displayedMonths = (
      <div id={`${id}-change-month-anim`} className={divScrollClasses} onAnimationEnd={changingMonth.onAnimationEnd} aria-busy="true">
        <Typography id={`${id}-prev-month`} className={changingMonthClasses}>
          {changingMonthYear}
        </Typography>
        <Typography id={`${id}-current-month`} className={changingMonthClasses}>
          {currMonthYear}
        </Typography>
        <Typography id={`${id}-next-month`} className={changingMonthClasses}>
          {changingMonthYear}
        </Typography>
      </div>
    );
  } else {
    displayedMonths = (
      <Typography id={`${id}-current-month`} className={classes.month} aria-label={t("aria-calendar-current-month")}>
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
        onPrevMonth();
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
        onNextMonth();
      }
    }
  };

  const headerClasses = clsx(classes.root, {
    [classes.rootLandscape]: props.orientation === "landscape",
    [classes.rootPortrait]: props.orientation === "portrait",
  });

  return (
    <div id={id} className={headerClasses}>
      <IconButton
        id={`${id}-button-prev-month`}
        className={clsx({ [classes.buttonHidden]: prevButtonHidden })}
        disabled={prevButtonDisabled}
        aria-disabled={prevButtonDisabled || prevButtonHidden}
        aria-label={t("aria-calendar-button-prev-month")}
        onClick={onPrevButtonEvent}
        onKeyUp={onPrevButtonEvent}
      >
        <NavigateBeforeIcon />
      </IconButton>

      <div id={`${id}-button-ndisplayed-month`} className={classes.divMonth}>
        {displayedMonths}
      </div>

      <IconButton
        id={`${id}-button-next-month`}
        className={clsx({ [classes.buttonHidden]: nextButtonHidden })}
        disabled={nextButtonDisabled}
        aria-disabled={nextButtonDisabled || nextButtonHidden}
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
