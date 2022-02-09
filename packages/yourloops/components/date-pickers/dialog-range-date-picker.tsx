/**
 * Copyright (c) 2022, Diabeloop
 * Display a dialog with a date-picker to select a range of days
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
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { useTheme, makeStyles, Theme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import { CalendarOrientation, DateRange, CalendarSelectionRange, MIN_YEAR, MAX_YEAR } from "./models";
import RangeDatePicker from "./range-date-picker";

interface DatePickerProps {
  isOpen: boolean;
  /** Please use string format `YYYY-MM-DD` if possible */
  start?: string | number | Dayjs | Date;
  /** Please use string format `YYYY-MM-DD` if possible */
  end?: string | number | Dayjs | Date;
  /** Please use string format `YYYY-MM-DD` if possible */
  minDate?: Dayjs | number | string | Date;
  /** Please use string format `YYYY-MM-DD` if possible */
  maxDate?: Dayjs | number | string | Date;
  /** Maximum possible of selected days */
  maxSelectableDays?: number;
  showToolbar?: boolean;
  onResult: (start?: string, end?: string) => void;
  onSelectedDateChange?: (start?: string, end?: string) => void;
}

const datePickerStyle = makeStyles((theme: Theme) => {
  return {
    dialogPaper: {
      margin: 0,
      maxWidth: "initial",
      [theme.breakpoints.down("sm")]: {
        maxHeight: "100%",
      },
    },
    content: {
      display: "flex",
      width: "fit-content",
      margin: 0,
      padding: "0px !important",
    },
    contentLandscape: {
      flexDirection: "row",
    },
    contentPortrait: {
      flexDirection: "column",
    },
    divChildren: {
      cursor: "pointer",
    },
  };
}, { name: "date-picker-days-range" });

const dummyDate = dayjs();

function DialogRangeDatePicker(props: DatePickerProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const orientation: CalendarOrientation = matches ? "landscape" : "portrait";
  const classes = datePickerStyle();
  const { maxSelectableDays, isOpen, onSelectedDateChange } = props;

  const { startDate, endDate, minDate, maxDate } = React.useMemo(() => {
    if (!isOpen) {
      return { startDate: dummyDate, endDate: dummyDate, minDate: dummyDate, maxDate: dummyDate };
    }
    // It's safe to use the UTC in the calendar
    // - dayjs don't support well the timezone (lost of copy)
    // - We return a day without any timezone, it's up to the caller to do
    //   what it want with it
    let minDate = props.minDate ? dayjs(props.minDate, { utc: true }).startOf("day") : dayjs(`${MIN_YEAR}-01-01`, { utc: true });
    let maxDate = props.maxDate ? dayjs(props.maxDate, { utc: true }).endOf("day") : dayjs(`${MAX_YEAR-1}-12-31`, { utc: true });
    let startDate = props.start ? dayjs(props.start, { utc: true }).startOf("day") : dayjs(new Date(), { utc: true }).startOf("day");
    let endDate = props.end ? dayjs(props.end, { utc: true }).startOf("day") : dayjs(new Date(), { utc: true }).startOf("day");

    // Ensure we are coherent, or the rest of the code may not like it
    if (endDate.isBefore(startDate)) {
      // Swap start/end
      const tmp = startDate;
      startDate = endDate;
      endDate = tmp;
    }
    if (maxDate.isBefore(minDate)) {
      // Swap min/max
      const tmp = minDate;
      minDate = maxDate;
      maxDate = tmp;
    }
    if (startDate.isBefore(minDate)) {
      startDate = minDate;
    }
    if (endDate.isAfter(maxDate)) {
      endDate = maxDate;
    }
    return { startDate, endDate, minDate, maxDate };
  }, [isOpen, props.start, props.end, props.maxDate, props.minDate]);

  const [nextSelection, setNextSelection] = React.useState<"first" | "last">("first");
  const [selected, setSelected] = React.useState<DateRange>({ start: startDate, end: endDate });
  const [selectable, setSelectable] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    if (isOpen) {
      // Refresh our states
      const range: DateRange = { start: startDate, end: endDate };
      setNextSelection("first");
      setSelected(range);
      if (onSelectedDateChange) {
        onSelectedDateChange(range.start.format("YYYY-MM-DD"), range.end.format("YYYY-MM-DD"));
      }
    }
  }, [isOpen, startDate, endDate, onSelectedDateChange]);

  const handleCancel = () => {
    props.onResult();
  };
  const handleOK = () => {
    props.onResult(selected.start.format("YYYY-MM-DD"), selected.end.format("YYYY-MM-DD"));
  };

  const updateSelectedDate = (date: dayjs.Dayjs): void => {
    let range: DateRange;
    if (nextSelection === "first") {
      setNextSelection("last");
      range = { start: date, end: date };

      if (typeof maxSelectableDays === "number" && maxSelectableDays > 0) {
        // Substract 1 day to the value, or we will be able to select
        // maxSelectableDays+1 days total
        setSelectable({
          start: date.subtract(maxSelectableDays - 1, "days"),
          end: date.add(maxSelectableDays - 1, "days"),
        });
      }
    } else {
      setNextSelection("first");
      if (typeof maxSelectableDays === "number") {
        // Use minDate/maxDate to do the limits
        setSelectable(undefined);
      }

      if (date.isAfter(selected.start)) {
        range = { start: selected.start, end: date };
      } else {
        range = { start: date, end: selected.end };
      }
    }

    setSelected(range);
    if (onSelectedDateChange) {
      onSelectedDateChange(range.start.format("YYYY-MM-DD"), range.end.format("YYYY-MM-DD"));
    }
  };

  const contentClasses = clsx(classes.content, {
    [classes.contentLandscape]: orientation === "landscape",
    [classes.contentPortrait]: orientation === "portrait",
  });

  return (
    <Dialog id="date-picker-dialog" onClose={handleCancel} open={isOpen} PaperProps={{ className: classes.dialogPaper }}>
      <DialogContent id="calendar-view" className={contentClasses}>
        <RangeDatePicker
          selection={{ mode: "range", selected, selectable, maxSelectableDays } as CalendarSelectionRange}
          minDate={minDate}
          maxDate={maxDate}
          orientation={orientation}
          onChange={updateSelectedDate}
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

export default DialogRangeDatePicker;
