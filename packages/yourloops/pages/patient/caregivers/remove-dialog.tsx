/**
 * Copyright (c) 2021, Diabeloop
 * Patient care givers page: Remove a caregiver dialog
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

import { makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { makeButtonsStyles } from "../../../components/theme";

import { getUserFirstName, getUserLastName } from "../../../lib/utils";
import { RemoveDialogContentProps } from "./types";

export interface RemoveDialogProps {
  actions: RemoveDialogContentProps | null;
}

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-buttons" });
const removeDialogClasses = makeStyles(
  (theme: Theme) => {
    return {
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "ylp-patient-remove-caregiver-dialog" }
);

/**
 * Remove a caregiver dialog / modale
 */
function RemoveDialog(props: RemoveDialogProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = removeDialogClasses();
  const buttonsClasses = makeButtonsClasses();

  const handleClose = () => {
    props.actions?.onDialogResult(false);
  };
  const handleRemoveCaregiver = () => {
    props.actions?.onDialogResult(true);
  };

  const dialogIsOpen = props.actions !== null;
  const firstName = props.actions === null ? "" : getUserFirstName(props.actions.caregiver.user);
  const lastName = props.actions === null ? "" : getUserLastName(props.actions.caregiver.user);

  return (
    <Dialog
      id="patient-remove-caregiver-dialog"
      open={dialogIsOpen}
      aria-labelledby={t("modal-patient-remove-caregiver-title")}
      onClose={handleClose}>
      <DialogTitle id="patient-remove-caregiver-dialog-title">
        <strong>{t("modal-patient-remove-caregiver-title")}</strong>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {t("modal-remove-info", { name: `${firstName} ${lastName}` })}
        </DialogContentText>
        <DialogContentText>
          {t("modal-patient-remove-caregiver-info-2")}
        </DialogContentText>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="patient-remove-caregiver-dialog-button-cancel"
          onClick={handleClose}
          className={`${classes.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button
          id="patient-remove-caregiver-dialog-button-remove"
          onClick={handleRemoveCaregiver}
          className={buttonsClasses.buttonRedAction}
          variant="contained">
          {t("modal-patient-remove-caregiver-remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveDialog;
