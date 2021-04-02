/**
 * Copyright (c) 2021, Diabeloop
 * Remove patient dialog for HCP / Caregivers
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

import { Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { User } from "../models/shoreline";
import { getUserFirstLastName } from "../lib/utils";
import { makeButtonsStyles } from "./theme";

export interface RemovePatientDialogContentProps {
  patient: User;
  onDialogResult: (confirmed: boolean) => void;
}

export interface RemovePatientDialogProps {
  actions: RemovePatientDialogContentProps | null;
}

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-remove-patient-dialog-buttons" });
const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialog: {
        display: "flex",
        flexDirection: "column",
        width: "25rem",
      },
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "ylp-dialog-remove-patient-dialog" }
);

function RemovePatientDialog(props: RemovePatientDialogProps): JSX.Element {
  const buttonsClasses = makeButtonsClasses();
  const classes = dialogStyles();
  const { t } = useTranslation("yourloops");

  const dialogIsOpen = props.actions !== null;
  const userName = props.actions !== null ? getUserFirstLastName(props.actions.patient) : { firstName: "", lastName: "" };
  const name = t("user-name", userName);

  const handleClose = () => {
    props.actions?.onDialogResult(false);
  };
  const handleClickRemove = () => {
    props.actions?.onDialogResult(true);
  };

  return (
    <Dialog id="patient-list-dialog-remove" aria-labelledby={t("remove-patient")} open={dialogIsOpen} onClose={handleClose}>
      <DialogTitle id="patient-list-dialog-remove-title">
        <strong>{t("remove-patient")}</strong>
      </DialogTitle>

      <DialogContent id="patient-list-dialog-remove-content" className={classes.dialog}>
        <DialogContentText id="patient-list-dialog-remove-question">
          {t("modal-remove-patient-question", { name })}
        </DialogContentText>
        <DialogContentText id="patient-list-dialog-remove-consequences">
          {t("modal-remove-patient-info-2")}
        </DialogContentText>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="patient-list-dialog-remove-button-cancel"
          onClick={handleClose}
          className={`${classes.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button
          id="patient-list-dialog-remove-button-remove"
          onClick={handleClickRemove}
          className={buttonsClasses.buttonRedAction}
          variant="contained">
          {t("remove-patient")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemovePatientDialog;
