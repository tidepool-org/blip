/**
 * Copyright (c) 2021, Diabeloop
 * Switch role from caregiver to HCP dialog - Accept terms
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
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Link from "@material-ui/core/Link";

import diabeloopUrl from "../../lib/diabeloop-url";
import { makeButtonsStyles } from "../theme";
import { SwitchRoleDialogProps } from "./models";

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-switch-role-consent-buttons" });
const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialogContent: {
        display: "flex",
        flexDirection: "column",
        width: theme.breakpoints.width("sm"),
        marginTop: "1.5em",
      },
      formControlPolicy: {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.primary,
      },
      checkbox: {
        marginBottom: "auto",
      },
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
      buttons: {
        display: "flex",
        flexDirection: "row",
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(5), // eslint-disable-line no-magic-numbers
        marginLeft: theme.spacing(1), // eslint-disable-line no-magic-numbers
      },
      dialogButtons: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: "16px",
        marginLeft: "42px",
        marginRight: "42px",
        marginBottom: "16px",
      },
      button: {
        marginLeft: "auto",
      },
    };
  },
  { name: "ylp-dialog-switch-role-consent" }
);

function SwitchRoleConsentDialog(props: SwitchRoleDialogProps): JSX.Element {
  const { open, onResult } = props;
  const buttonsClasses = makeButtonsClasses();
  const classes = dialogStyles();
  const { t, i18n } = useTranslation("yourloops");
  const [policyAccepted, setPolicyAccepted] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const resetForm = () => {
    setPolicyAccepted(false);
    setTermsAccepted(false);
  };
  const handleClose = () => {
    onResult(false);
    resetForm();
  };
  const handleAccept = () => {
    onResult(true);
    resetForm();
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const what = event.target.name;
    if (what === "policy") {
      setPolicyAccepted(!policyAccepted);
    } else if (what === "terms") {
      setTermsAccepted(!termsAccepted);
    }
  };

  const checkboxPolicy = (
    <Checkbox
      id="switch-role-consequences-dialog-checkbox-policy"
      className={classes.checkbox}
      checked={policyAccepted}
      onChange={handleChange}
      name="policy"
      color="primary"
    />
  );
  const checkboxTerms = (
    <Checkbox
      id="switch-role-consequences-dialog-checkbox-terms"
      className={classes.checkbox}
      checked={termsAccepted}
      onChange={handleChange}
      name="terms"
      color="primary"
    />
  );

  // TODO: Fix duplicate code with signup-consent
  const privacyPolicy = t("privacy-policy");
  const linkPrivacyPolicy = (
    <Link aria-label={privacyPolicy} href={diabeloopUrl.getPrivacyPolicyUrL(i18n.language)} target="_blank" rel="noreferrer">
      {privacyPolicy}
    </Link>
  );
  const terms = t("terms-of-use");
  const linkTerms = (
    <Link aria-label={terms} href={diabeloopUrl.getTermsUrL(i18n.language)} target="_blank" rel="noreferrer">
      {terms}
    </Link>
  );

  const labelPrivacyPolicy = (
    <Trans
      i18nKey="signup-consent-hcp-privacy-policy"
      t={t}
      components={{ linkPrivacyPolicy }}
      values={{ privacyPolicy }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {privacyPolicy}.
    </Trans>
  );

  const labelTerms = (
    <Trans
      i18nKey="signup-consent-hcp-terms-condition"
      t={t}
      components={{ linkTerms }}
      values={{ terms }}
      parent={React.Fragment}>
      I have read and accepted YourLoops {terms}.
    </Trans>
  );

  return (
    <Dialog id="switch-role-consent-dialog" open={open} onClose={handleClose}>
      <DialogContent id="switch-role-consequences-dialog-content" className={classes.dialogContent}>
        <FormControl id="switch-role-consequences-dialog-form">
          <FormGroup>
            <FormControlLabel
              id="switch-role-consequences-dialog-label-policy"
              control={checkboxPolicy}
              label={labelPrivacyPolicy}
              className={classes.formControlPolicy}
            />
            <FormControlLabel
              id="switch-role-consequences-dialog-label-terms"
              control={checkboxTerms}
              label={labelTerms}
              className={classes.formControlPolicy}
            />
          </FormGroup>
        </FormControl>
      </DialogContent>

      <DialogActions id="switch-role-consent-dialog-actions" className={classes.dialogButtons}>
        <Button
          id="switch-role-consent-dialog-button-decline"
          onClick={handleClose}
          className={`${classes.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("button-decline")}
        </Button>
        <Button
          id="switch-role-consent-dialog-button-accept"
          onClick={handleAccept}
          className={buttonsClasses.buttonOk}
          variant="contained"
          color="primary"
          disabled={!(policyAccepted && termsAccepted)}>
          {t("button-accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchRoleConsentDialog;
