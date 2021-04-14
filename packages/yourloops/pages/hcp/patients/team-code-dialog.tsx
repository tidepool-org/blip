/**
 * Copyright (c) 2021, Diabeloop
 * Display team code after an invitation sent - Dialog
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

import { makeButtonsStyles } from "../../../components/theme";

export interface TeamCodeDialogProps {
  /** Team code */
  code: string;
  /** Team name */
  name: string;
  /** Close the modal event callback */
  onClose: () => void;
}

const reCode = /^([0-9]{3})([0-9]{3})([0-9]{3})$/;
const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-team-code-buttons" });
const dialogClasses = makeStyles(
  (theme: Theme) => {
    return {
      contentCode: {
        display: "flex",
        fontSize: "x-large",
      },
      divTeamCode: {
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: theme.palette.grey[200],
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingTop: "0.3rem",
        paddingBottom: "0.3rem",
        borderColor: theme.palette.grey[200],
        borderWidth: "1px",
        borderRadius: theme.shape.borderRadius,
      },
      dialogActions: {
        marginBottom: "0.5em",
        marginRight: " 0.5em",
      },
    };
  },
  { name: "ylp-dialog-team-code" }
);

function TeamCodeDialog(props: TeamCodeDialogProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const buttonsClasses = makeButtonsClasses();
  const classes = dialogClasses();
  const { code, name, onClose } = props;
  const dialogIsOpen = code.match(reCode) !== null;

  let displayCode = "";
  if (dialogIsOpen) {
    displayCode = code.replace(reCode, "$1 - $2 - $3");
  }

  return (
    <Dialog id="patient-list-dialog-team-code" aria-labelledby={t("team-card-label-code")} open={dialogIsOpen} onClose={onClose}>
      <DialogTitle id="patient-list-dialog-team-code-title">
        <strong>{name}</strong>
      </DialogTitle>

      <DialogContent id="patient-list-dialog-team-code-content-placeholder">
        <DialogContentText id="patient-list-dialog-team-code-content-placeholder-1">
          {t("modal-team-code-descr-placeholder")}
        </DialogContentText>
        <DialogContentText id="patient-list-dialog-team-code-content-placeholder-2">
          {t("modal-team-code-descr-placeholder-2")}
        </DialogContentText>
      </DialogContent>

      <DialogContent id="patient-list-dialog-team-code-content-code" className={classes.contentCode}>
        <div className={classes.divTeamCode}>{displayCode}</div>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          id="patient-list-dialog-team-code-button-ok"
          onClick={onClose}
          className={buttonsClasses.buttonCancel}
          color="secondary"
          variant="contained">
          {t("common-ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TeamCodeDialog;
