/**
 * Copyright (c) 2020, Diabeloop
 * Switch role from caregiver to HCP dialog
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
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
import { makeButtonsStyles } from "../../components/theme";
import { SwitchRoleDialogProps } from "./models";

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-switch-role-consent-buttons" });
const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialog: {
        display: "flex",
        flexDirection: "column",
        width: theme.breakpoints.width("sm"),
        marginTop: "1.5em",
      },
      formControlPolicy: {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.secondary,
      },
      buttonCancel: {
        marginRight: theme.spacing(2),
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
      checked={policyAccepted}
      onChange={handleChange}
      name="policy"
      color="primary"
    />
  );
  const checkboxTerms = (
    <Checkbox
      id="switch-role-consequences-dialog-checkbox-terms"
      checked={termsAccepted}
      onChange={handleChange}
      name="terms"
      color="primary"
    />
  );

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
      <DialogContent id="switch-role-consequences-dialog-content" className={classes.dialog}>
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

      <DialogActions id="switch-role-consent-dialog-actions" style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
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
          disabled={!(policyAccepted && termsAccepted)}>
          {t("button-accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchRoleConsentDialog;
