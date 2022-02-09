/**
 * Copyright (c) 2021-2022, Diabeloop
 * Display a dialog with a date-picker to select a single day
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

import { useTheme, makeStyles, Theme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import { CalendarOrientation, CalendarSelectionSingle, MIN_YEAR, MAX_YEAR } from "./models";
import DatePicker from "./date-picker";

interface CalendarStylesProps {
  orientation: CalendarOrientation;
}

interface DatePickerProps {
  date?: string | number | Dayjs | Date;
  minDate?: Dayjs | number | string | Date;
  maxDate?: Dayjs | number | string | Date;
  showToolbar?: boolean;
  /** true to have the dialog open */
  isOpen: boolean;
  onResult: (date?: string) => void;
  onSelectedDateChange?: (date?: string) => void;
}

const datePickerStyle = makeStyles((theme: Theme) => {
  return {
    dialogPaper: {
      margin: 0,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "initial",
        maxHeight: "100%",
        marginLeft: 16,
        marginRight: 16,
      },
    },
    content: {
      display: "flex",
      flexDirection: (props: CalendarStylesProps) => props.orientation === "landscape" ? "row" : "column",
      backgroundColor: "transparent",
      width: "fit-content",
      margin: 0,
      padding: "0px !important",
    },
  };
}, { name: "date-picker-single-day" });

const dummyDate = dayjs();

function DialogDatePicker(props: DatePickerProps): JSX.Element {
  const { isOpen, onSelectedDateChange } = props;
  const { t } = useTranslation("yourloops");
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const orientation: CalendarOrientation = matches ? "landscape" : "portrait";
  const classes = datePickerStyle({ orientation });

  const { date, minDate, maxDate } = React.useMemo(() => {
    if (!isOpen) {
      return { date: dummyDate, maxDate: dummyDate, minDate: dummyDate };
    }
    // It's safe to use the UTC in the calendar
    // - dayjs don't support well the timezone (lost of copy)
    // - We return a day without any timezone, it's up to the caller to do
    //   what it want with it
    const minDate = props.minDate ? dayjs(props.minDate, { utc: true }).startOf("day") : dayjs(`${MIN_YEAR}-01-01`, { utc: true });
    const maxDate = props.maxDate ? dayjs(props.maxDate, { utc: true }).endOf("day") : dayjs(`${MAX_YEAR-1}-12-31`, { utc: true });
    let date = props.date ? dayjs(props.date, { utc: true }).startOf("day") : dayjs(new Date(), { utc: true }).startOf("day");
    // When changing the date, for example by changing the current year,
    // which can done in an upper element with YearSelector,
    // be sure we respect the min/max date
    if (isDayjs(minDate) && date.isBefore(minDate)) {
      date = minDate;
    } else if (isDayjs(maxDate) && date.isAfter(maxDate)) {
      date = maxDate;
    }
    return { date, minDate, maxDate };
  }, [props.date, props.maxDate, props.minDate, isOpen]);

  const [selected, setSelected] = React.useState(date);

  React.useEffect(() => {
    if (isOpen) {
      setSelected(date);
    }
  }, [isOpen, date]);

  React.useEffect(() => {
    if (isOpen && onSelectedDateChange) {
      onSelectedDateChange(selected.format("YYYY-MM-DD"));
    }
  }, [isOpen, selected, onSelectedDateChange]);

  const handleCancel = () => {
    props.onResult();
  };
  const handleOK = () => {
    props.onResult(selected.format("YYYY-MM-DD"));
  };

  return (
    <Dialog onClose={handleCancel} aria-labelledby="date-picker-selected-date" open={isOpen} PaperProps={{ className: classes.dialogPaper }}>
      <DialogContent id="calendar-view" className={classes.content}>
        <DatePicker
          selection={{ mode: "single", selected } as CalendarSelectionSingle}
          minDate={minDate}
          maxDate={maxDate}
          orientation={orientation}
          onChange={setSelected}
          showToolbar={props.showToolbar}
        />
      </DialogContent>
      <DialogActions>
        <Button id="date-picker-button-cancel" onClick={handleCancel}>
          {t("button-cancel")}
        </Button>
        <Button id="date-picker-button-ok" onClick={handleOK} color="primary" variant="contained">
          {t("button-ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogDatePicker;
