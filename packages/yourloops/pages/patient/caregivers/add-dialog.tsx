/**
 * Copyright (c) 2021, Diabeloop
 * Patient care givers page: Add a caregiver dialog
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

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";

import { REGEX_EMAIL } from "../../../lib/utils";

import { AddDialogContentProps } from "./types";

export interface AddDialogProps {
  actions: AddDialogContentProps | null;
}

/**
 * Add a caregiver dialog / modale
 */
function AddDialog(props: AddDialogProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const [email, setEmail] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isValidEmail = (mail = email): boolean => mail.length > 0 && REGEX_EMAIL.test(mail);
  const resetDialog = () => {
    setTimeout(() => {
      setEmail("");
      setErrorMessage(null);
    }, 100);
  };
  const handleClose = () => {
    props.actions?.onDialogResult(null);
    resetDialog();
  };
  const handleClickAdd = () => {
    if (isValidEmail()) {
      props.actions?.onDialogResult(email);
      resetDialog();
    } else {
      setErrorMessage(t("invalid-email"));
    }
  };
  const handleVerifyEmail = () => {
    if (email.length > 0 && !isValidEmail()) {
      setErrorMessage(t("invalid-email"));
    }
  };
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = event.target.value.trim();
    if (errorMessage !== null && isValidEmail(inputEmail)) {
      setErrorMessage(null);
    }
    setEmail(inputEmail);
  };

  const dialogIsOpen = props.actions !== null;
  const buttonAddDisabled = errorMessage !== null || !isValidEmail();

  return (
    <Dialog
      id="patient-add-caregiver-dialog"
      open={dialogIsOpen}
      aria-labelledby={t("modal-add-caregiver")}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="patient-add-caregiver-dialog-title">
        <strong>{t("modal-add-caregiver")}</strong>
      </DialogTitle>

      <DialogContent>
        <TextField
          id="patient-add-caregiver-dialog-email"
          label={t("email")}
          variant="outlined"
          value={email}
          required
          error={errorMessage !== null}
          onBlur={handleVerifyEmail}
          onChange={handleChangeEmail}
          helperText={errorMessage}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button
          id="patient-add-caregiver-dialog-button-cancel"
          onClick={handleClose}
        >
          {t("button-cancel")}
        </Button>
        <Button
          id="patient-add-caregiver-dialog-button-add"
          onClick={handleClickAdd}
          disabled={buttonAddDisabled}
          variant="contained"
          color="primary"
        >
          {t("button-invite")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddDialog;
