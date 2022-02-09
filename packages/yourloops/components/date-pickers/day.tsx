/**
 * Copyright (c) 2021-2022, Diabeloop
 * A button for a single day (date of the month) in the calendar
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
import { makeStyles, alpha, Theme } from "@material-ui/core/styles";
import ButtonBase, { ButtonBaseProps } from "@material-ui/core/ButtonBase";

interface DayProps extends ButtonBaseProps {
  day: string;
  selected?: boolean;
}

const dayStyles = makeStyles((theme: Theme) => ({
  root: {
    ...theme.typography.caption,
    "padding": 0,
    "backgroundColor": theme.palette.background.paper,
    "color": theme.palette.text.primary,
    "&$disabled": {
      color: theme.palette.text.secondary,
      backgroundColor: "transparent",
    },
    "&$selected": {
      "color": theme.palette.primary.contrastText,
      "backgroundColor": theme.palette.primary.main,
      "&:hover": {
        willChange: "background-color",
        backgroundColor: theme.palette.primary.dark,
      },
      "&$disabled": {
        color: theme.palette.text.secondary,
        backgroundColor: alpha(theme.palette.action.active, theme.palette.action.activatedOpacity),
      },
    },
    "&:hover": {
      willChange: "background-color",
      backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
    },
    "transition": theme.transitions.create("background-color", {
      duration: theme.transitions.duration.short,
      easing: theme.transitions.easing.easeOut,
    }),
  },
  /* Pseudo-class applied to the root element if `disabled={true}`. */
  disabled: {
  },
  /* Pseudo-class applied to the root element if `selected={true}`. */
  selected: {},
}), { name: "date-pickers-day" });

function Day(props: DayProps): JSX.Element {
  const classes = dayStyles(props);
  const className = clsx(
    classes.root,
    props.className,
    {
      [classes.selected]: Boolean(props.selected),
      [classes.disabled]: Boolean(props.disabled),
    }
  );

  return (
    <ButtonBase
      {...props}
      centerRipple
      className={className}
      tabIndex={-1}
    >
      {props.day}
    </ButtonBase>
  );
}

export default Day;
