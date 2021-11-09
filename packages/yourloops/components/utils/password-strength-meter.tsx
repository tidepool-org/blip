/**
 * Copyright (c) 2021, Diabeloop
 * Password Strength-O-meter
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

import { Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

interface PasswordStrengthMeterProps {
  force: number;
  error: boolean;
  helperText: string;
}

const styles = makeStyles((theme: Theme) => ({
  gauge: {
    width: "calc(25% - 3px)",
    height: "4px",
    borderRadius: "8px",
    backgroundColor: "#d5d5d59c",
  },
  weakBgColor: { backgroundColor: theme.palette.error.main },
  weakColor: { color: theme.palette.error.main },
  mediumBgColor: { backgroundColor: theme.palette.warning.dark },
  mediumColor: { color: theme.palette.warning.dark },
  strongBgColor: { backgroundColor: theme.palette.success.main },
  strongColor: { color: theme.palette.success.main },
}));

export function PasswordStrengthMeter({ force, error, helperText }: PasswordStrengthMeterProps): JSX.Element | null {
  const { gauge, strongBgColor, mediumBgColor, weakBgColor, weakColor, mediumColor, strongColor } = styles();
  let gaugeColor = "";
  let textColor = "";

  if (force === -1) {
    return null;
  }
  if (force === 0 || force === 1) {
    gaugeColor = weakBgColor;
    textColor = weakColor;
  } else if (force >= 2 && error) {
    gaugeColor = mediumBgColor;
    textColor = mediumColor;
  } else {
    gaugeColor = strongBgColor;
    textColor = strongColor;
  }

  return (
    <React.Fragment>
      <Box id="password-strength-meter" display="flex" justifyContent="space-between" my={1}>
        <div className={`${gauge} ${force >= 0 ? gaugeColor : ""}`} />
        <div className={`${gauge} ${force > 1 ? gaugeColor : ""}`} />
        <div className={`${gauge} ${force > 2 && !error ? gaugeColor : ""}`} />
        <div className={`${gauge} ${force > 3 && !error ? gaugeColor : ""}`} />
      </Box>
      <div className={textColor}>
        {helperText}
      </div>
    </React.Fragment>
  );
}

