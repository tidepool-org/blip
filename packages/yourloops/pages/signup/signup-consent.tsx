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

import * as React from "react";
import { useTranslation } from "react-i18next";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

import { useSignUpFormState } from "./signup-formstate-context";
import SignUpFormProps from "./signup-form-props";

const useStyles = makeStyles((theme: Theme) => ({
  FormControl: {
    margin: theme.spacing(3),
  },
  FormHelperText: {
    textAlign: "center",
  },
  FormControlLabel: {
    alignItems: "start",
    textAlign: "start",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  Button: {
    marginRight: theme.spacing(1),
  },
}));

export default function SignUpConsent(props: SignUpFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();
  const { handleBack, handleNext } = props;
  const { state, dispatch } = useSignUpFormState();
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");

  const resetFormState = (): void => {
    setError(false);
    setHelperText("");
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    keyField: string
  ) => {
    dispatch({
      type: "EDIT_FORMVALUE",
      key: keyField,
      value: (event.target as HTMLInputElement).checked,
    });
    resetFormState();
  };

  const valideForm = (): boolean => {
    if (state.formValues?.terms && state.formValues?.privacyPolicy) {
      return true;
    }

    setError(true);
    setHelperText("you must accept consent");
    return false;
  };

  const onNext = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    resetFormState();
    if (valideForm()) {
      handleNext();
    }
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      noValidate
      autoComplete="off"
    >
      <FormControl
        required
        component="fieldset"
        error={error}
        className={classes.FormControl}
      >
        <FormHelperText className={classes.FormHelperText}>
          {t(helperText)}
        </FormHelperText>
        <FormControlLabel
          className={classes.FormControlLabel}
          control={
            <Checkbox
              checked={state.formValues.privacyPolicy}
              onChange={(e) => handleChange(e, "privacyPolicy")}
              color="default"
              inputProps={{
                "aria-label": "checkbox with default color",
              }}
            />
          }
          label={t(
            `signup-consent-${state.formValues.accountRole}-privacy-policy`,
            { privacyPolicy: "Privacy Policy" }
          )}
        />
        <FormControlLabel
          className={classes.FormControlLabel}
          control={
            <Checkbox
              checked={state.formValues.terms}
              onChange={(e) => handleChange(e, "terms")}
              color="default"
              inputProps={{
                "aria-label": "checkbox with default color",
              }}
            />
          }
          label={t(
            `signup-consent-${state.formValues.accountRole}-terms-condition`,
            { terms: "Terms or Use" }
          )}
          labelPlacement="end"
        />
        <div id="signup-consent-button-group">
          <Button
            variant="contained"
            color="secondary"
            disabled={props.activeStep === 0}
            onClick={handleBack}
            className={classes.Button}
          >
            {t("signup-steppers-back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.Button}
            onClick={onNext}
          >
            {t("signup-steppers-next")}
          </Button>
        </div>
      </FormControl>
    </form>
  );
}
