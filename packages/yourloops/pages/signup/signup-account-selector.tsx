/**
 * Copyright (c) 2021, Diabeloop
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

import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Paper from "@material-ui/core/Paper";

import metrics from "../../lib/metrics";
import RadioLabel from "./signup-radio-label";
import { FormValuesType, useSignUpFormState } from "./signup-formstate-context";
import SignUpFormProps from "./signup-form-props";
import { UserRoles } from "../../models/shoreline";

const useStyles = makeStyles((theme: Theme) => ({
  FormControl: {
    [theme.breakpoints.up("sm")]: {
      margin: theme.spacing(3),
    },
  },
  FormHelperText: {
    textAlign: "center",
  },
  Paper: {
    textAlign: "start",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  FormControlLabel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
}));

/**
 * Sign Up Account Selector
 */
function SignUpAccountSelector(props: SignUpFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();
  const { state, dispatch } = useSignUpFormState();
  const [error, setError] = React.useState(false);
  const { handleBack, handleNext } = props;
  const [helperText, setHelperText] = React.useState("");

  const isInvalidRole = state.formValues.accountRole === UserRoles.unset
    || state.formValues.accountRole === UserRoles.patient;

  const resetFormState = (): void => {
    setError(false);
    setHelperText("");
  };

  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    keyField: FormValuesType
  ) => {
    dispatch({
      type: "EDIT_FORMVALUE",
      key: keyField,
      value: (event.target as HTMLInputElement).value,
    });
    resetFormState();
  };

  const validForm = (): boolean => {
    if (isInvalidRole) {
      setError(true);
      setHelperText(t("signup-account-selection-error"));
      return false;
    }
    return true;
  };

  const onNext = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    resetFormState();
    if (validForm()) {
      handleNext();
      metrics.send("registration", "select_account_type", state.formValues.accountRole);
    }
  };

  return (
    <Box
      id="form-signup"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <FormControl
        id="signup-account-selector-form-control"
        component="fieldset"
        error={error}
        className={classes.FormControl}
      >
        <FormHelperText className={classes.FormHelperText}>{helperText}</FormHelperText>
        <RadioGroup
          id="signup-account-selector-radio-group"
          aria-label="account-selector"
          name="account-selector"
          value={state.formValues.accountRole}
          onChange={(e) => handleRadioChange(e, "accountRole")}
        >
          <Paper elevation={3} className={classes.Paper}>
            <FormControlLabel
              className={classes.FormControlLabel}
              value={UserRoles.caregiver}
              id="form-label-signup-account-caregiver"
              control={<Radio id="signup-account-selector-radio-caregiver" color="primary" />}
              label={
                <RadioLabel
                  id="signup-account-selector-radio-label-caregiver"
                  header={t("signup-radiolabel-caregiver-header")}
                  body={t("signup-radiolabel-caregiver-body")}
                />
              }
            />
          </Paper>
          <Paper elevation={3} className={classes.Paper}>
            <FormControlLabel
              className={classes.FormControlLabel}
              value={UserRoles.hcp}
              id="form-label-signup-account-hcp"
              control={<Radio id="signup-account-selector-radio-hcp" color="primary" />}
              label={
                <RadioLabel
                  id="signup-account-selector-radio-label-hcp"
                  header={t("signup-radiolabel-hcp-header")}
                  body={t("signup-radiolabel-hcp-body")}
                />
              }
            />
          </Paper>
          <Paper elevation={3} className={classes.Paper}>
            <FormControlLabel
              className={classes.FormControlLabel}
              value={UserRoles.patient}
              id="form-label-signup-account-patient"
              control={<Radio id="signup-account-selector-radio-patient" color="primary" />}
              label={
                <RadioLabel
                  id="signup-account-selector-radio-label-patient"
                  header={t("signup-radiolabel-patient-header")}
                  body={t("signup-account-selection-msg")}
                />
              }
            />
          </Paper>
        </RadioGroup>
      </FormControl>
      <Box
        id="signup-account-selector-button-group"
        display="flex"
        justifyContent="end"
        mx={3}
        mt={4}
      >
        <Button
          className={classes.backButton}
          id="button-signup-steppers-back"
          onClick={handleBack}>
          {t("signup-steppers-back")}
        </Button>
        <Button
          id="button-signup-steppers-next"
          variant="contained"
          color="primary"
          disabled={isInvalidRole}
          onClick={onNext}>
          {t("signup-steppers-next")}
        </Button>
      </Box>
    </Box>
  );
}

export default SignUpAccountSelector;
