/**
 * Copyright (c) 2021, Diabeloop
 * Team dialog to leave a team
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

import _ from "lodash";
import React from "react";
import { /* Trans, */ useTranslation } from "react-i18next";
import { makeStyles, Theme } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { makeButtonsStyles } from "../../../components/theme";
import { LeaveTeamDialogContentProps } from "./types";

export interface LeaveTeamDialogProps {
  teamToLeave: null | LeaveTeamDialogContentProps;
}

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-buttons" });
const leaveTeamDialogClasses = makeStyles(
  (theme: Theme) => {
    return {
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "ylp-patient-remove-team-dialog" }
);

function LeaveTeamDialog(props: LeaveTeamDialogProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const dialogClasses = leaveTeamDialogClasses();
  const buttonsClasses = makeButtonsClasses();

  const { teamToLeave } = props;
  const dialogIsOpen = !_.isEmpty(teamToLeave?.team);
  const teamName = teamToLeave?.team?.name ?? "";

  const handleClose = () => {
    teamToLeave?.onDialogResult(false);
  };
  const handleLeaveTeam = () => {
    teamToLeave?.onDialogResult(true);
  };

  return (
    <Dialog
      id="team-leave-dialog"
      open={dialogIsOpen}
      aria-labelledby={t("aria-team-leave-dialog-title")}
      aria-describedby={t("aria-team-leave-dialog-question", { teamName })}
      onClose={handleClose}>
      <DialogTitle id="team-leave-dialog-title">
        <strong>{t("modal-patient-remove-team-title")}</strong>
      </DialogTitle>

      <DialogContent>
        <DialogContentText color="textPrimary" id="team-leave-dialog-question">
          {t("modal-remove-team-question", { name: teamName })}
        </DialogContentText>
        <DialogContentText color="textPrimary" id="team-leave-dialog-consequences">
          {t("modal-patient-remove-team-info-2")}
        </DialogContentText>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="team-leave-dialog-button-cancel"
          onClick={handleClose}
          className={`${dialogClasses.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("button-cancel")}
        </Button>
        <Button
          id="team-leave-dialog-button-leave"
          onClick={handleLeaveTeam}
          className={buttonsClasses.buttonRedAction}
          variant="contained">
          {t("modal-patient-remove-team-remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LeaveTeamDialog;
