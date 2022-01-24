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

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { Team, useTeam } from "../../lib/team";
import { useAuth } from "../../lib/auth";
import { makeButtonsStyles } from "../../components/theme";
import { TeamLeaveDialogContentProps } from "./types";

interface LeaveTeamDialogProps {
  teamToLeave: TeamLeaveDialogContentProps | null;
}

interface LeaveTeamDialogElementsProps {
  team: Team | null;
  teamName: string;
  onlyMember: boolean;
  userIsTheOnlyAdministrator: boolean;
  buttonsDisabled: boolean;
  handleClose: () => void;
  handleLeaveTeam: () => void;
}
const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "YlpLeaveTeamDialogButtons" });

function LeaveTeamDialogTitle(props: LeaveTeamDialogElementsProps): JSX.Element | null {
  const { team, teamName, onlyMember, userIsTheOnlyAdministrator } = props;
  const { t } = useTranslation("yourloops");

  if (team === null) {
    return null;
  }

  let msg = "";
  if (onlyMember) {
    msg = t("team-leave-dialog-and-del-title");
  } else if (userIsTheOnlyAdministrator) {
    msg = t("team-leave-dialog-only-admin-title");
  } else {
    msg = t("team-leave-dialog-title");
  }

  return (
    <DialogTitle id="team-leave-dialog-title">
      <strong>{msg}</strong>
      <br />
      <span id="team-leave-dialog-title-team-name">{teamName}</span>
    </DialogTitle>
  );
}

function LeaveTeamDialogContent(props: LeaveTeamDialogElementsProps): JSX.Element | null {
  const { team, teamName, onlyMember, userIsTheOnlyAdministrator } = props;
  const { t } = useTranslation("yourloops");

  if (team === null) {
    return null;
  }

  let question: JSX.Element | null = null;
  let consequences: JSX.Element | null = null;

  if (onlyMember) {
    question = (
      <DialogContentText color="textPrimary" id="team-leave-dialog-question">
        <Trans i18nKey="team-leave-dialog-and-del-question" t={t} components={{ strong: <strong /> }} values={{ teamName }} parent={React.Fragment}>
          Since you are the only &quot;member&quot; in this team, {{ teamName }} will be <strong>permanently deleted</strong> if
          you leave it.
        </Trans>
      </DialogContentText>
    );
    consequences = (
      <DialogContentText color="textPrimary" id="team-leave-dialog-consequences">
        {t("team-leave-dialog-and-del-consequences")}
      </DialogContentText>
    );
  } else if (userIsTheOnlyAdministrator) {
    consequences = (
      <DialogContentText color="textPrimary" id="team-leave-dialog-consequences">
        <Trans
          i18nKey="team-leave-dialog-only-admin-consequences"
          t={t}
          components={{ strong: <strong /> }}
          parent={React.Fragment}>
          Since you are the only team&apos;s administrator, you need to
          <strong>give administrator permission to another member</strong> before leaving.
        </Trans>
      </DialogContentText>
    );
  } else {
    question = (
      <DialogContentText color="textPrimary" id="team-leave-dialog-question">
        {t("team-leave-dialog-question")}
      </DialogContentText>
    );
    consequences = (
      <DialogContentText color="textPrimary" id="team-leave-dialog-consequences">
        {t("team-leave-dialog-consequences")}
      </DialogContentText>
    );
  }

  return (
    <DialogContent>
      {question}
      {consequences}
    </DialogContent>
  );
}

function LeaveTeamDialogActions(props: LeaveTeamDialogElementsProps): JSX.Element | null {
  const { team, onlyMember, userIsTheOnlyAdministrator, buttonsDisabled, handleClose, handleLeaveTeam } = props;
  const buttonClasses = makeButtonsClasses();

  const { t } = useTranslation("yourloops");

  if (team === null) {
    return null;
  }

  let buttonOK: JSX.Element | null = null;
  let buttonCancel: JSX.Element | null = null;

  if (onlyMember) {
    buttonOK = (
      <Button
        id="team-leave-dialog-button-leave"
        onClick={handleLeaveTeam}
        disabled={buttonsDisabled}
        className={buttonClasses.alertActionButton}
        variant="contained"
      >
        {t("team-leave-dialog-button-leave-and-del")}
      </Button>
    );
    buttonCancel = (
      <Button
        id="team-leave-dialog-button-cancel"
        onClick={handleClose}
        disabled={buttonsDisabled}
      >
        {t("button-cancel")}
      </Button>
    );
  } else if (userIsTheOnlyAdministrator) {
    buttonOK = (
      <Button
        id="team-leave-dialog-button-ok"
        onClick={handleClose}
        disabled={buttonsDisabled}
        color="primary"
        variant="contained"
      >
        {t("button-ok")}
      </Button>
    );
  } else {
    buttonOK = (
      <Button
        className={buttonClasses.alertActionButton}
        id="team-leave-dialog-button-leave"
        onClick={handleLeaveTeam}
        disabled={buttonsDisabled}
        color="primary"
        variant="contained"
      >
        {t("team-leave-dialog-button-leave")}
      </Button>
    );
    buttonCancel = (
      <Button
        id="team-leave-dialog-button-cancel"
        onClick={handleClose}
        disabled={buttonsDisabled}
      >
        {t("button-cancel")}
      </Button>
    );
  }

  return (
    <DialogActions>
      {buttonCancel}
      {buttonOK}
    </DialogActions>
  );
}

function LeaveTeamDialog(props: LeaveTeamDialogProps): JSX.Element {
  const { teamToLeave } = props;
  const dialogIsOpen = teamToLeave !== null;
  const team = teamToLeave?.team ?? null;

  const auth = useAuth();
  const { t } = useTranslation("yourloops");
  const teamHook = useTeam();

  let teamName = "";
  let onlyMember = false;
  let userIsTheOnlyAdministrator = false;
  if (team !== null) {
    teamName = team.name;
    onlyMember = teamHook.getNumMedicalMembers(team) < 2;
    userIsTheOnlyAdministrator = teamHook.isUserTheOnlyAdministrator(team, auth.user?.userid as string);
  }

  const ariaTitle = t("aria-team-leave-dialog-title");
  const ariaQuestion = t("aria-team-leave-dialog-question", { teamName });

  const handleClose = () => {
    teamToLeave?.onDialogResult(false);
  };
  const handleLeaveTeam = () => {
    teamToLeave?.onDialogResult(true);
  };

  const dialogProps = {
    team,
    teamName,
    onlyMember,
    userIsTheOnlyAdministrator,
    buttonsDisabled: !dialogIsOpen,
    handleClose,
    handleLeaveTeam,
  };

  return (
    <Dialog
      id="team-leave-dialog"
      open={dialogIsOpen}
      aria-labelledby={ariaTitle}
      aria-describedby={ariaQuestion}
      onClose={handleClose}>
      <LeaveTeamDialogTitle {...dialogProps} />
      <LeaveTeamDialogContent {...dialogProps} />
      <LeaveTeamDialogActions {...dialogProps} />
    </Dialog>
  );
}

export default LeaveTeamDialog;
