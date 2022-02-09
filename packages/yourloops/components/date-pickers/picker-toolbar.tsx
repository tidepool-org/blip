/**
 * Copyright (c) 2021-2022, Diabeloop
 * Date picker toolbar (display current year) + selected date
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
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import {
  CalendarOrientation,
  CalendarSelection,
  CalendarSelectionRange,
  CalendarSelectionSingle,
} from "./models";

interface PickerToolbarProps {
  selection: CalendarSelection;
  orientation: CalendarOrientation;
  onClickYear?: () => void;
}

const toolbarStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(2, 1, 2, 1),
      display: "flex",
      flexDirection: "column",
    },
    landscape: {
      width: 200,
    },
    text: {
      backgroundColor: "transparent",
      color: theme.palette.primary.contrastText,
      marginLeft: 14,
      marginRight: 14,
    },
    btnChangeYear: {
      marginRight: "auto",
    },
  };
}, { name: "date-pickers-toolbar" });

function SinglePickerToolbar(props: PickerToolbarProps): JSX.Element {
  const classes = toolbarStyles();
  const { t } = useTranslation("yourloops");

  const onClickYear = (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClickYear) {
      let validEvent = true;
      if (e.type === "keyup") {
        const key = (e as React.KeyboardEvent<HTMLButtonElement>).key;
        validEvent = key === " " || key === "Enter";
      }
      if (validEvent) {
        props.onClickYear();
      }
    }
  };

  const selectedDate = (props.selection as CalendarSelectionSingle).selected;

  return (
    <React.Fragment>
      <Button
        id="date-picker-button-change-year"
        className={classes.btnChangeYear}
        color="primary"
        size="small"
        variant="contained"
        onClick={onClickYear}
        onKeyUp={onClickYear}
        aria-label={t("aria-calendar-select-year")}
        disableElevation
      >
        {selectedDate.year()}
      </Button>
      <Typography id="date-picker-selected-date" variant="h4" className={classes.text}>
        {selectedDate.format(t("date-picker-toolbar-date-format"))}
      </Typography>

    </React.Fragment>
  );
}

function RangePickerToolbar(props: PickerToolbarProps): JSX.Element {
  const { selected, maxSelectableDays } = (props.selection as CalendarSelectionRange);
  const classes = toolbarStyles();
  const { t } = useTranslation("yourloops");
  const dateFormat = t("date-picker-toolbar-date-format");

  const numDays = selected.end.diff(selected.start, "days") + 1;
  return (
    <React.Fragment>
      <Typography variant="body2" className={classes.text}>{t("date-picker-toolbar-from")}</Typography>
      <Typography id="date-picker-selected-date-from" variant="h5" className={classes.text}>
        {selected.start.format(dateFormat)}
      </Typography>
      <Typography variant="body2" className={classes.text}>{t("date-picker-toolbar-to")}</Typography>
      <Typography id="date-picker-selected-date-to" variant="h5" className={classes.text}>
        {selected.end.format(dateFormat)}
      </Typography>

      <Typography id="date-picker-toolbar-days-range" variant="body2" className={classes.text} style={{ marginTop: "auto" }}>
        {t("date-picker-days-range", { numDays })}
      </Typography>

      {
        typeof maxSelectableDays === "number" ? (
          <Typography id="date-picker-toolbar-max-days-range" variant="body2" className={classes.text}>
            {t("date-picker-max-range", { numDays: maxSelectableDays })}
          </Typography>
        ) : null
      }
    </React.Fragment>
  );
}

function PickerToolbar(props: PickerToolbarProps): JSX.Element {
  const { selection } = props;
  const classes = toolbarStyles();

  const toolbarClasses = clsx(classes.root, { [classes.landscape]: props.orientation === "landscape" });
  return (
    <div id="date-picker-toolbar" className={toolbarClasses}>
      {selection.mode === "single" && <SinglePickerToolbar {...props} />}
      {selection.mode === "range" && <RangePickerToolbar {...props} />}
    </div>
  );
}

export default PickerToolbar;
