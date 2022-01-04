/**
 * Copyright (c) 2021, Diabeloop
 * Allow to select a year
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
import clsx from "clsx";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import { MAX_YEAR, MIN_YEAR } from "./models";

interface YearSelectorProps {
  selectedYear: number;
  minYear?: number;
  /** Max year included */
  maxYear?: number;
  onSelectedYear: (year: number) => void;
}

const yearSelectorStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      cursor: "pointer",
      overflowY: "auto",
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginTop: "auto",
      marginBottom: "auto",
    },
    year: {
      "textAlign": "center",
      "&:active, &:hover": {
        color: theme.palette.primary.main,
      },
    },
    selectedYear: {
      fontWeight: "bold", // theme.typography.fontWeightBold,
      color: theme.palette.primary.main,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  };
}, { name: "date-pickers-year-selector" });

function YearSelector(props: YearSelectorProps): JSX.Element {
  const minYear = props.minYear ?? MIN_YEAR;
  const maxYear = (props.maxYear ?? MAX_YEAR) + 1;
  const classes = yearSelectorStyles();
  const refSelected = React.useRef<HTMLDivElement>(null);
  const refSelector = React.useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = React.useState(props.selectedYear);

  React.useEffect(() => {
    if (refSelector !== null && refSelector.current !== null) {
      refSelector.current.focus();
    }
  }, [refSelector]);

  React.useEffect(() => {
    if (refSelected !== null && refSelected.current !== null) {
      refSelected.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [refSelected, selectedYear]);

  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
    case "Enter":
    case " ":
      props.onSelectedYear(selectedYear);
      break;
    case "ArrowUp":
      e.preventDefault();
      e.stopPropagation();
      if (minYear < selectedYear) {
        setSelectedYear(selectedYear - 1);
      }
      break;
    case "ArrowDown":
      e.preventDefault();
      e.stopPropagation();
      if (selectedYear + 1 < maxYear) {
        setSelectedYear(selectedYear + 1);
      }
      break;
    }
  };

  const years: JSX.Element[] = [];
  for (let i=minYear; i < maxYear; i++) {
    const displayedYear = i.toString(10);
    const isSelectedYear = i === selectedYear;
    years.push(
      <Typography
        key={displayedYear}
        id={`year-${displayedYear}`}
        variant={isSelectedYear ? "h6" : "subtitle1"}
        component="div"
        className={clsx(classes.year, { [classes.selectedYear]: isSelectedYear })}
        onClick={() => props.onSelectedYear(i)}
        role="option"
        aria-selected={isSelectedYear}
        ref={isSelectedYear ? refSelected : null}
      >
        {displayedYear}
      </Typography>
    );
  }

  return (
    <div id="year-selector" className={classes.root} role="listbox" tabIndex={0} onKeyUp={onKeyUp} ref={refSelector}>
      {years}
    </div>
  );
}

export default YearSelector;
