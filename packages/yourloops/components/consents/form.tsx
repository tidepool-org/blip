/**
 * Copyright (c) 2021, Diabeloop
 * Consents common form
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
import { Trans, useTranslation } from "react-i18next";

import { Theme, makeStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Link from "@material-ui/core/Link";

import { UserRoles } from "../../models/shoreline";
import diabeloopUrl from "../../lib/diabeloop-url";
import { ConsentCheck, ConsentFormProps } from "./models";

const formStyles = makeStyles(
  (theme: Theme) => {
    return {
      formControlLabel: {
        color: theme.palette.text.primary,
        textAlign: "start",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
      },
      formGroup: {
        textAlign: "left",
      },
      checkbox: {
        marginBottom: "auto",
      },
      labelMandatory: {
        marginLeft: theme.spacing(1) + 9, // eslint-disable-line no-magic-numbers
      },
    };
  },
  { name: "ylp-form-consents" }
);

export function ConsentPrivacyPolicy({ id, userRole, style, checked, onChange }: ConsentCheck): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const classes = formStyles();

  const checkboxPolicy = (
    <Checkbox
      id={`${id}-checkbox-privacy-policy`}
      className={classes.checkbox}
      checked={checked}
      onChange={onChange}
      name="policy"
      color="primary"
    />
  );
  const privacyPolicy = t("privacy-policy");
  const linkPrivacyPolicy = (
    <Link aria-label={privacyPolicy} href={diabeloopUrl.getPrivacyPolicyUrL(i18n.language)} target="_blank" rel="noreferrer">
      {privacyPolicy}
    </Link>
  );
  const labelPrivacyPolicy = (
    <Trans
      i18nKey={`consent-${userRole}-privacy-policy`}
      t={t}
      components={{ linkPrivacyPolicy }}
      values={{ privacyPolicy }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {privacyPolicy}.
    </Trans>
  );

  return (
    <FormControlLabel
      id={`${id}-label-privacy-policy`}
      control={checkboxPolicy}
      label={labelPrivacyPolicy}
      style={style}
      className={classes.formControlLabel}
    />
  );
}

export function ConsentTerms({ id, userRole, style, checked, onChange }: ConsentCheck): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const classes = formStyles();

  const checkboxTerms = (
    <Checkbox
      id={`${id}-checkbox-terms`}
      className={classes.checkbox}
      checked={checked}
      onChange={onChange}
      name="terms"
      color="primary"
    />
  );
  const terms = t("terms-of-use");
  const linkTerms = (
    <Link aria-label={terms} href={diabeloopUrl.getTermsUrL(i18n.language)} target="_blank" rel="noreferrer">
      {terms}
    </Link>
  );
  const labelTerms = (
    <Trans
      i18nKey={`consent-${userRole}-terms-of-use`}
      t={t}
      components={{ linkTerms }}
      values={{ terms }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {terms}.
    </Trans>
  );

  return (
    <FormControlLabel
      id={`${id}-label-terms`}
      control={checkboxTerms}
      label={labelTerms}
      style={style}
      className={classes.formControlLabel}
    />
  );
}

export function ConsentFeedback({ id, userRole, style, checked, onChange }: ConsentCheck): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = formStyles();

  const checkboxFeedback = (
    <Checkbox
      id={`${id}-checkbox-feedback`}
      className={classes.checkbox}
      checked={checked}
      onChange={onChange}
      name="feedback"
      color="primary"
    />
  );

  const labelFeedback = (
    <Trans i18nKey={`consent-${userRole}-feedback`} t={t}>
      I agree to receive information and news from Diabeloop. <i>(optional)</i>
    </Trans>
  );

  return (
    <FormControlLabel
      id={`${id}-label-feedback`}
      control={checkboxFeedback}
      label={labelFeedback}
      style={style}
      className={classes.formControlLabel}
    />
  );
}

function ConsentForm(props: ConsentFormProps): JSX.Element {
  const {
    userRole,
    id,
    className,
    group,
    policyAccepted,
    setPolicyAccepted,
    termsAccepted,
    setTermsAccepted,
    feedbackAccepted,
    setFeedbackAccepted,
  } = props;

  const classes = formStyles();
  const showFeedback = typeof setFeedbackAccepted === "function" && userRole === UserRoles.hcp;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const what = event.target.name;
    switch (what) {
    case "policy":
      setPolicyAccepted(!policyAccepted);
      break;
    case "terms":
      setTermsAccepted(!termsAccepted);
      break;
    case "feedback":
      if (typeof setFeedbackAccepted === "function") {
        setFeedbackAccepted(!feedbackAccepted);
      }
      break;
    default:
      throw new Error("Invalid change type");
    }
  };

  let formControlFeedback: JSX.Element | null = null;
  if (showFeedback) {
    formControlFeedback = <ConsentFeedback id={id} userRole={userRole} checked={feedbackAccepted ?? false} onChange={handleChange} />;
  }

  return (
    <FormControl id={`${id}-form`} className={className}>
      <FormGroup className={`${classes.formGroup} ${group ?? ""}`}>
        <ConsentPrivacyPolicy id={id} userRole={userRole} checked={policyAccepted} onChange={handleChange} />
        <ConsentTerms id={id} userRole={userRole} checked={termsAccepted} onChange={handleChange} />
        {formControlFeedback}
      </FormGroup>
    </FormControl>
  );
}

export default ConsentForm;
