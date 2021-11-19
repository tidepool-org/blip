/**
 * Copyright (c) 2021, Diabeloop
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
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

interface PickerToolbarProps {
  selectedDate: Dayjs;
  direction?: "landscape" | "portrait";
  onClickYear?: () => void;
}

const toolbarStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(2, 1, 2, 1),
      width: (props: PickerToolbarProps) => props.direction === "landscape" ? "200px" : "initial",
    },
    selectedDate: {
      backgroundColor: "transparent",
      color: theme.palette.primary.contrastText,
      marginLeft: 14,
      marginRight: 14,
    },
  };
}, { name: "date-pickers-toolbar" });

function PickerToolbar(props: PickerToolbarProps): JSX.Element {
  const classes = toolbarStyles(props);
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

  return (
    <div id="date-picker-toolbar" className={classes.root}>
      <Button
        id="date-picker-button-change-year"
        color="primary"
        size="small"
        variant="contained"
        onClick={onClickYear}
        onKeyUp={onClickYear}
        aria-label={t("aria-calendar-select-year")}
        disableElevation
      >
        {props.selectedDate.year()}
      </Button>
      <Typography id="date-picker-selected-date" variant="h4" className={classes.selectedDate}>
        {props.selectedDate.format(t("date-picker-toolbar-date-format"))}
      </Typography>
    </div>
  );
}

export default PickerToolbar;
