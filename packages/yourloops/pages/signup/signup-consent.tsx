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
import { useTranslation, Trans } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Link from "@material-ui/core/Link";

import diabeloopUrl from "../../lib/diabeloop-url";
import { useSignUpFormState, FormValuesType } from "./signup-formstate-context";
import SignUpFormProps from "./signup-form-props";

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(3),
  },
  formHelperText: {
    textAlign: "center",
  },
  formControlLabel: {
    alignItems: "start",
    textAlign: "start",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
    marginLeft: "100px",
    marginRight: "100px",
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

export default function SignUpConsent(props: SignUpFormProps): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const classes = useStyles();
  const { handleBack, handleNext } = props;
  const { state, dispatch } = useSignUpFormState();
  const consentsChecked = state.formValues.terms && state.formValues.privacyPolicy;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    keyField: FormValuesType
  ) => {
    dispatch({
      type: "EDIT_FORMVALUE",
      key: keyField,
      value: (event.target as HTMLInputElement).checked,
    });
  };

  const onNext = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    handleNext();
  };

  // TODO: Fix duplicate code with switch-role-consent-dialog.tsx
  const privacyPolicy = t("footer-link-url-privacy-policy");
  const linkPrivacyPolicy = (
    <Link aria-label={privacyPolicy} href={diabeloopUrl.getPrivacyPolicyUrL(i18n.language)} target="_blank" rel="noreferrer">
      {privacyPolicy}
    </Link>
  );
  const terms = t("terms-and-conditions");
  const linkTerms = (
    <Link aria-label={terms} href={diabeloopUrl.getTermsUrL(i18n.language)} target="_blank" rel="noreferrer">
      {terms}
    </Link>
  );

  const labelPrivacyPolicy = (
    <Trans
      i18nKey={`signup-consent-${state.formValues.accountRole}-privacy-policy`}
      t={t}
      components={{ linkPrivacyPolicy }}
      values={{ privacyPolicy }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {privacyPolicy}.
    </Trans>
  );

  const labelTerms = (
    <Trans
      i18nKey={`signup-consent-${state.formValues.accountRole}-terms-condition`}
      t={t}
      components={{ linkTerms }}
      values={{ terms }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {terms}.
    </Trans>
  );

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
        className={classes.formControl}
      >
        <FormControlLabel
          id="signup-consent-privacy-ctl"
          className={classes.formControlLabel}
          classes={{
            label: "signup-consent-privacy-text",
          }}
          control={
            <Checkbox
              id="signup-consent-privacy-check"
              checked={state.formValues.privacyPolicy}
              onChange={(e) => handleChange(e, "privacyPolicy")}
              color="primary"
            />
          }
          label={labelPrivacyPolicy}
        />
        <FormControlLabel
          id="signup-consent-terms-ctl"
          className={classes.formControlLabel}
          classes={{
            label: "signup-consent-terms-text",
          }}
          control={
            <Checkbox
              id="checkbox-signup-consent-terms"
              checked={state.formValues.terms}
              onChange={(e) => handleChange(e, "terms")}
              color="primary"
            />
          }
          label={labelTerms}
          labelPlacement="end"
        />
      </FormControl>
      <div id="signup-consent-button-group" className={classes.buttons}>
        <Button
          id="button-signup-steppers-back"
          variant="contained"
          color="secondary"
          disabled={props.activeStep === 0}
          className={classes.button}
          classes={{ label: "button-signup-steppers-back-label" }}
          onClick={handleBack}>
          {t("signup-steppers-back")}
        </Button>
        <Button
          id="button-signup-steppers-next"
          variant="contained"
          color="primary"
          disabled={!consentsChecked}
          className={classes.button}
          classes={{ label: "button-signup-steppers-next-label" }}
          onClick={onNext}>
          {t("signup-steppers-next")}
        </Button>
      </div>
    </form>
  );
}
