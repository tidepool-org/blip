/**
 * Copyright (c) 2021, Diabeloop
 * Generic password component file
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

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { FormHelperTextProps } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

export enum PasswordVisibility {
  text = "text",
  hidden = "password",
}

export interface PasswordProps {
  id: string;
  label: string;
  value: string;
  onChange: (eventPayload: string) => void;
  onValidate?: () => void;
  error: boolean;
  helperText: React.ReactNode | string;
  required?: boolean;
  disabled?: boolean;
  autoComplete: "current-password" | "new-password";
  variant: "standard" | "filled" | "outlined";
  margin?: "none" | "dense" | "normal";
  className?: string;
  style?: React.CSSProperties;
  checkStrength?: boolean; // If true must be used with the password strength meter as helper text
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      "marginTop": "1em",
      "& input:disabled": {
        backgroundColor: "white",
      },
    },
    adornment: {
      [theme.breakpoints.down("sm")]: {
        padding: 0,
      },
    },
  })
);

const Password: React.FunctionComponent<PasswordProps> = ({
  id,
  label,
  value,
  error,
  helperText,
  style,
  className,
  required,
  disabled,
  variant,
  margin,
  autoComplete,
  onValidate,
  onChange,
  checkStrength,
}: PasswordProps) => {
  const classes = useStyles();
  const { t } = useTranslation("yourloops");

  const [showPassword, setShowPassword] = React.useState(false);
  const handleShowPasswordChange = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };
  const handleValidate = typeof onValidate !== "function" ? undefined : (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onValidate();
    }
  };

  const tip = t("aria-toggle-password-visibility");

  const helperTextContent = useMemo(() => {
    if (checkStrength) {
      return (helperText) as React.ReactNode;
    }
    if (error) {
      return helperText as string;
    }
    return null;
  }, [checkStrength, error, helperText]);


  // Here we have to force typing of helperText because it generates a render error on html
  // "div cannot be a child of p". By default helperText is wrapped into <p>
  // Needs to type it as a <div> component
  let helperTextProps: Partial<FormHelperTextProps<"div">> | undefined;
  if (typeof helperText !== "string") {
    helperTextProps = { component: "div" } as Partial<FormHelperTextProps<"div">>;
  }

  return (
    <TextField
      id={id}
      autoComplete={autoComplete}
      label={label}
      value={value}
      error={error}
      required={required}
      disabled={disabled}
      variant={variant}
      type={showPassword ? PasswordVisibility.text : PasswordVisibility.hidden}
      onChange={handleChange}
      onKeyPress={handleValidate}
      helperText={helperTextContent}
      FormHelperTextProps={helperTextProps}
      style={style}
      margin={margin}
      className={className ?? classes.textField}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={tip} aria-label={tip} placement="bottom">
              <IconButton
                id={`${id}-btn-show-pwd`}
                className={classes.adornment}
                aria-label={tip}
                onClick={handleShowPasswordChange}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default Password;
