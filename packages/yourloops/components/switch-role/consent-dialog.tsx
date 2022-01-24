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

import React from "react";
import { useTranslation } from "react-i18next";

import { Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import { UserRoles } from "../../models/shoreline";
import { ConsentForm } from "../consents";
import { SwitchRoleConsentDialogProps } from "./models";

const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialogContent: {
        display: "flex",
        flexDirection: "column",
        width: theme.breakpoints.values["sm"],
        marginTop: "1.5em",
      },
      formControlPolicy: {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.primary,
      },
      checkbox: {
        marginBottom: "auto",
      },
      dialogButtons: {
        display: "flex",
        justifyContent: "space-around",
      },
    };
  },
  { name: "ylp-dialog-switch-role-consent" },
);

function SwitchRoleConsentDialog(props: SwitchRoleConsentDialogProps): JSX.Element {
  const { open, onResult } = props;
  const classes = dialogStyles();
  const { t } = useTranslation("yourloops");
  const [policyAccepted, setPolicyAccepted] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [feedbackAccepted, setFeedbackAccepted] = React.useState(false);

  const resetForm = () => {
    setPolicyAccepted(false);
    setTermsAccepted(false);
    setFeedbackAccepted(false);
  };
  const handleClose = () => {
    onResult(false, false);
    resetForm();
  };
  const handleAccept = () => {
    onResult(true, feedbackAccepted);
    resetForm();
  };

  return (
    <Dialog id="switch-role-consent-dialog" open={open} onClose={handleClose}>
      <DialogContent id="switch-role-consequences-dialog-content" className={classes.dialogContent}>
        <ConsentForm
          id="switch-role-consequences-dialog"
          userRole={UserRoles.hcp}
          policyAccepted={policyAccepted}
          setPolicyAccepted={setPolicyAccepted}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          feedbackAccepted={feedbackAccepted}
          setFeedbackAccepted={setFeedbackAccepted}
        />
      </DialogContent>

      <DialogActions id="switch-role-consent-dialog-actions" className={classes.dialogButtons}>
        <Button
          id="switch-role-consent-dialog-button-decline"
          onClick={handleClose}
        >
          {t("button-decline")}
        </Button>
        <Button
          id="switch-role-consent-dialog-button-accept"
          onClick={handleAccept}
          variant="contained"
          color="primary"
          disabled={!(policyAccepted && termsAccepted)}
        >
          {t("button-accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchRoleConsentDialog;
