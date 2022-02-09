/**
 * Copyright (c) 2022, Diabeloop
 * Display:
 * - a month, with arrow to change the current month.
 * - year selector
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

import { makeStyles, Theme } from "@material-ui/core/styles";

import {
  CalendarOrientation,
  CalendarPosition,
  CalendarChangeMonth,
  CalendarSelection,
  CalendarSelectionSingle,
} from "./models";
import Header from "./calendar-header";
import Calendar from "./calendar";
import YearSelector from "./year-selector";

interface CalendarBoxProps {
  selection: CalendarSelection;
  orientation: CalendarOrientation;
  position?: CalendarPosition;
  currentMonth: Dayjs;
  minDate: Dayjs;
  maxDate: Dayjs;
  changingMonth?: CalendarChangeMonth | null;
  /** Set to undefined to disabled the prev month button */
  onPrevMonth?: () => void;
  /** Set to undefined to disabled the next month button */
  onNextMonth?: () => void;
  /** Setting the first or the last date */
  onChange: (d: Dayjs) => void;
  /** Only with CalendarSelectionSingle */
  onSelectYear?: (year: number) => void;
}

const calendarBoxStyles = makeStyles((theme: Theme) => {
  return {
    calendarBox: {
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      width: 300,
      [theme.breakpoints.down("sm")]: {
        width: 250,
        marginLeft: "auto",
        marginRight: "auto",
      },
    },
  };
}, { name: "date-pickers-calendar-views" });

/**
 * Display:
 * - a month, with arrow to change the current month.
 * - year selector
 */
function CalendarBox(props: CalendarBoxProps): JSX.Element {
  const classes = calendarBoxStyles(props);
  const {
    selection,
    currentMonth,
    minDate,
    maxDate,
    position,
    changingMonth,
    onChange,
    onSelectYear,
  } = props;

  const id = position ? `calendar-box-${position}` : "calendar-box";

  return (
    <div id={id} className={classes.calendarBox}>
      {
        (onSelectYear && selection.mode === "single") ?
          <YearSelector
            selectedYear={(selection as CalendarSelectionSingle).selected.year()}
            onSelectYear={onSelectYear}
            minYear={minDate.year()}
            maxYear={maxDate.year()}
          /> :
          <React.Fragment>
            <Header
              position={position}
              orientation={props.orientation}
              currentMonth={currentMonth}
              onPrevMonth={props.onPrevMonth}
              onNextMonth={props.onNextMonth}
              changingMonth={changingMonth}
            />
            <Calendar
              position={position}
              selection={selection}
              currentMonth={currentMonth}
              onChange={onChange}
              changeMonth={changingMonth}
              minDate={minDate}
              maxDate={maxDate}
            />
          </React.Fragment>
      }
    </div>
  );
}

export default CalendarBox;
