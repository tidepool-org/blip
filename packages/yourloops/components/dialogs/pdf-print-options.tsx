/**
 * Copyright (c) 2022, Diabeloop
 * Display the rendering PDF options
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
import dayjs, { Dayjs } from "dayjs";

import { useTheme, makeStyles, Theme } from "@material-ui/core/styles";

import DateRangeIcon from "@material-ui/icons/DateRange";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { CalendarOrientation } from "../date-pickers/models";
import RangeDatePicker from "../date-pickers/range-date-picker";

export type Presets = "1week" | "2weeks" | "4weeks" | "3months";
export interface PrintPDFOptions {
  /** Print start date (ISO day ex: 2022-02-10) */
  start: string;
  /** Print end date (ISO day ex: 2022-02-10) */
  end: string;
  preset?: Presets;
}
interface DialogPDFOptionsProps {
  open: boolean;
  /** Oldest available date date (ISO day ex: 2022-02-10) */
  minDate: string;
  /** Newest available date date (ISO day ex: 2022-02-10) */
  maxDate: string;
  onResult: (options?: PrintPDFOptions) => void;
}
const DEFAULT_PRESET: Presets = "4weeks";
const MAX_SELECTABLE_DAYS = 90;

const printOptionsStyle = makeStyles((theme: Theme) => {
  return {
    marginTop: {
      marginTop: theme.spacing(2),
    },
    customRangeText: {
      marginBottom: theme.spacing(1),
    },
    presetButtons: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("xs")]: {
        marginRight: 0,
        width: "calc(50% - 5px)",
      },
    },
    calendarBox: {
      flexDirection: "column",
      width: "fit-content",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
      },
    },
  };
}, { name: "dialog-pdf-options" });

function getDatesFromPreset(preset: Presets, minDate: Dayjs, maxDate: Dayjs) {
  const end = maxDate.format("YYYY-MM-DD");
  let start: Dayjs;
  switch (preset) {
  case "1week":
    start = maxDate.subtract(6, "days");
    break;
  case "2weeks":
    start = maxDate.subtract(13, "days");
    break;
  case "4weeks":
    start = maxDate.subtract(27, "days");
    break;
  case "3months":
  default:
    start = maxDate.subtract(89, "days");
    break;
  }
  if (start.isBefore(minDate)) {
    start = minDate;
  }
  return { start: start.format("YYYY-MM-DD"), end, preset };
}

function DialogPDFOptions(props: DialogPDFOptionsProps) {
  const { open, onResult } = props;
  const { t } = useTranslation("yourloops");
  const theme = useTheme();
  const matchLandscape = useMediaQuery(theme.breakpoints.up("sm"));
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = printOptionsStyle();
  const orientation: CalendarOrientation = matchLandscape ? "landscape" : "portrait";

  const [customStartDate, setCustomStartDate] = React.useState<Dayjs|null>(null);
  const { minDate, maxDate } = React.useMemo(() => {
    let mi = dayjs(props.minDate, { utc: true });
    let ma = dayjs(props.maxDate, { utc: true });
    if (customStartDate) {
      const newMinDate = customStartDate.subtract(MAX_SELECTABLE_DAYS, "day");
      const newMaxDate = customStartDate.add(MAX_SELECTABLE_DAYS, "day");
      if (newMinDate.isAfter(mi)) {
        mi = newMinDate;
      }
      if (newMaxDate.isBefore(ma)) {
        ma = newMaxDate;
      }
    }
    return { minDate: mi, maxDate: ma };
  }, [props.minDate, props.maxDate, customStartDate]);

  const [openState, setOpenState] = React.useState(false);
  const [pdfOptions, setPDFOptions] = React.useState<PrintPDFOptions>(getDatesFromPreset(DEFAULT_PRESET, minDate, maxDate));

  const { start, end, displayedDates } = React.useMemo(() => {
    const startDate = customStartDate ?? dayjs(pdfOptions.start, { utc: true });
    const endDate = customStartDate ?? dayjs(pdfOptions.end, { utc: true });
    const displayed = `${startDate.format("ll")} → ${endDate.format("ll")}`;
    return { start: startDate, end: endDate, displayedDates: displayed };
  }, [pdfOptions, customStartDate]);

  React.useEffect(() => {
    // The openState is used to prevent to reset the selected dates, after a custom date selection
    // Side effect of the useMemo for min/max dates.
    // It's a workaround to mimic the prevProps param of React.Component.componentDidUpdate(prevProps)
    if (open && !openState) {
      setOpenState(true);
      setPDFOptions(getDatesFromPreset(DEFAULT_PRESET, minDate, maxDate));
    }
    if (!open && openState) {
      setOpenState(false);
    }
  }, [open, openState, minDate, maxDate]);

  const handleClickPreset = (preset: Presets) => {
    setPDFOptions(getDatesFromPreset(preset, minDate, maxDate));
  };

  const handleChangeCustomDate = (d: Dayjs) => {
    if (customStartDate) {
      const startDate = customStartDate.isBefore(d) ? customStartDate.format("YYYY-MM-DD") : d.format("YYYY-MM-DD");
      const endDate = customStartDate.isBefore(d) ? d.format("YYYY-MM-DD") : customStartDate.format("YYYY-MM-DD");
      setPDFOptions({ start: startDate, end: endDate });
      setCustomStartDate(null);
    } else {
      setCustomStartDate(d);
    }
  };

  const presetSelected = pdfOptions.preset;
  return (
    <Dialog
      id="dialog-pdf-options"
      fullScreen={fullScreen}
      open={open}
      onClose={() => onResult()}
      data-start={pdfOptions.start}
      data-end={pdfOptions.end}
      maxWidth={false}
    >
      <DialogContent>
        <Typography variant="h4">{t("pdf-generate-report")}</Typography>

        <Typography variant="body2" className={classes.marginTop}>{t("dialog-pdf-options-presets")}</Typography>
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent={matchLandscape ? "start" : "space-between"}>
          <Chip
            id="pdf-options-button-one-week"
            variant={presetSelected === "1week" ? "default" : "outlined"}
            color={presetSelected === "1week" ? "primary" : "default"}
            aria-selected={presetSelected === "1week"}
            onClick={() => handleClickPreset("1week")}
            className={classes.presetButtons}
            label={t("preset-dates-range-1week")}
          />
          <Chip
            id="pdf-options-button-two-weeks"
            variant={presetSelected === "2weeks" ? "default" : "outlined"}
            color={presetSelected === "2weeks" ? "primary" : "default"}
            aria-selected={presetSelected === "2weeks"}
            onClick={() => handleClickPreset("2weeks")}
            className={classes.presetButtons}
            label={t("preset-dates-range-2weeks")}
          />
          <Chip
            id="pdf-options-button-four-weeks"
            variant={presetSelected === "4weeks" ? "default" : "outlined"}
            color={presetSelected === "4weeks" ? "primary" : "default"}
            aria-selected={presetSelected === "4weeks"}
            onClick={() => handleClickPreset("4weeks")}
            className={classes.presetButtons}
            label={t("preset-dates-range-4weeks")}
          />
          <Chip
            id="pdf-options-button-three-months"
            variant={presetSelected === "3months" ? "default" : "outlined"}
            color={presetSelected === "3months" ? "primary" : "default"}
            aria-selected={presetSelected === "3months"}
            onClick={() => handleClickPreset("3months")}
            className={classes.presetButtons}
            label={t("preset-dates-range-3months")}
          />
        </Box>

        <Box display="flex" mt={2} flexDirection="column">
          <Typography variant="body2" className={classes.customRangeText}>{t("dialog-pdf-options-custom-range")}</Typography>
          <TextField
            id="pdf-options-button-custom-range"
            variant="standard"
            aria-selected={!presetSelected}
            data-displayed={displayedDates}
            value={displayedDates}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box display="flex" className={classes.calendarBox}>
          <RangeDatePicker
            minDate={minDate}
            maxDate={maxDate}
            orientation={orientation}
            onChange={handleChangeCustomDate}
            selection={{ mode: "range", selected: { start, end } }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button id="pdf-options-button-cancel" onClick={() => onResult()}>
          {t("button-cancel")}
        </Button>
        <Button
          id="pdf-options-button-generate"
          onClick={() => onResult(pdfOptions)}
          disabled={!!customStartDate}
          color="primary"
          variant="contained"
        >
          {t("button-generate")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogPDFOptions;
