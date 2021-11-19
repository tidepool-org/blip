/**
 * Copyright (c) 2021, Diabeloop
 * Simple DatePicker to select a single day
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
import dayjs, { Dayjs, isDayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { useTheme, makeStyles, Theme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import CalendarView from "./calendar-view";

interface DatePickerProps {
  id?: string;
  date?: string | number | Dayjs | Date;
  minDate?: Dayjs | number | string | Date;
  maxDate?: Dayjs | number | string | Date;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onResult?: (date?: string) => void;
}

const datePickerStyle = makeStyles((theme: Theme) => {
  return {
    dialogPaper: {
      margin: 0,
      borderRadius: 0,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "initial",
      },
    },
    content: {
      "&:first-child": {
        padding: 0,
        margin: 0,
      },
    },
    divChildren: {
      cursor: "pointer",
    },
  };
}, { name: "date-picker-single-day" });

function DatePicker(props: DatePickerProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = datePickerStyle();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const [isOpen, setIsOpen] = React.useState(false);

  const { date, minDate, maxDate } = React.useMemo(() => {
    // use startOf() here to clone the date, and to be sure we use the same timezone offset
    // dayjs don't handle properly the clone of the timezone
    const minDate = props.minDate ? dayjs(props.minDate).startOf("day") : undefined;
    const maxDate = props.maxDate ? dayjs(props.maxDate).endOf("day") : undefined;
    let date = props.date ? dayjs(props.date).startOf("day") : dayjs().startOf("day");
    // When changing the date, for example by changing the current year,
    // which can done in an upper element with YearSelector,
    // be sure we respect the min/max date
    if (isDayjs(minDate) && date.isBefore(minDate)) {
      date = minDate;
    } else if (isDayjs(maxDate) && date.isAfter(maxDate)) {
      date = maxDate;
    }
    return { date, minDate, maxDate };
  }, [props.date, props.maxDate, props.minDate]);

  const [selectedDate, setSelectedDate] = React.useState(date);

  const handleOpen = () => {
    setSelectedDate(date); // Refresh our selected date
    setIsOpen(true);
  };
  const handleClose = () => setIsOpen(false);
  const handleCancel = () => {
    handleClose();
    if (props.onResult) {
      props.onResult();
    }
  };
  const handleOK = () => {
    handleClose();
    if (props.onResult) {
      props.onResult(selectedDate.format("YYYY-MM-DD"));
    }
  };

  const onKeyUpOpen = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleOpen();
    }
  };

  const onKeyUpClose = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCancel();
    }
  };

  const onKeyUpValidate = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      handleOK();
    }
  };

  let calendarView: JSX.Element | null = null;
  if (isOpen) {
    // Don't render the whole calendar everytime
    // only needed when the dialog is displayed
    calendarView = (
      <CalendarView
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        direction={matches ? "landscape" : "portrait"}
        onChange={setSelectedDate} />
    );
  }

  return (
    <React.Fragment>
      <div
        id={props.id ?? "date-picker-button-show-calendar"}
        className={clsx(classes.divChildren, props.className, isOpen ? props.activeClassName : null)}
        onClick={handleOpen}
        onKeyUp={onKeyUpOpen}
        role="button"
        tabIndex={0}
      >
        {props.children}
      </div>
      <Dialog onClose={handleCancel} aria-labelledby="date-picker-selected-date" open={isOpen} PaperProps={{ className: classes.dialogPaper }}>
        <DialogContent className={classes.content}>
          {calendarView}
        </DialogContent>
        <DialogActions>
          <Button id="date-picker-button-cancel" onClick={handleCancel} onKeyUp={onKeyUpClose} color="primary">
            {t("button-cancel")}
          </Button>
          <Button id="date-picker-button-ok" onClick={handleOK} onKeyUp={onKeyUpValidate} color="primary" variant="contained">
            {t("button-ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default DatePicker;
