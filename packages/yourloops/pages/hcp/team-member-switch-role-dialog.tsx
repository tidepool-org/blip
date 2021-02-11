/**
 * Copyright (c) 2021, Diabeloop
 * Dialog to confirm to switch team's admin role to viewer
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
import Typography from "@material-ui/core/Typography";

import { useAuth } from "../../lib/auth/hook/use-auth";
import { SwitchRoleDialogContentProps } from "./types";

interface SwitchRoleDialogProps {
  switchAdminRole: null | SwitchRoleDialogContentProps;
}

const dialogClasses = makeStyles((theme: Theme) => {
  return {
    buttonCancel: {
      marginRight: theme.spacing(2),
    },
  };
});

function SwitchRoleDialog(props: SwitchRoleDialogProps): JSX.Element | null {
  const { switchAdminRole } = props;

  const { t } = useTranslation("yourloops");
  const auth = useAuth();
  const classes = dialogClasses();

  if (switchAdminRole === null) {
    return null;
  }

  if (switchAdminRole.userId !== auth.user?.userid) {
    switchAdminRole.onDialogResult(true);
    return null;
  }

  const teamName = switchAdminRole.team.name;

  const handleClose = () => {
    switchAdminRole.onDialogResult(false);
  };
  const handleClickOK = () => {
    switchAdminRole.onDialogResult(true);
  };

  return (
    <Dialog
      id="team-members-dialog-switch-role"
      open={switchAdminRole !== null}
      aria-labelledby={t("aria-team-members-dialog-switch-role-title", { teamName })}
      aria-describedby={t("team-members-dialog-switch-role-question")}
      onClose={handleClose}>

      <DialogTitle id="team-members-dialog-switch-role-title">
        <strong>{t("team-members-dialog-switch-role-title")}</strong>
        <br />
        <span id="team-members-dialog-switch-role-title-team-name">{teamName}</span>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="team-members-dialog-switch-role-question">
          {t("team-members-dialog-switch-role-question")}
        </DialogContentText>
        <DialogContentText id="team-members-dialog-switch-role-consequences">
          {t("team-members-dialog-switch-role-consequences")}
        </DialogContentText>
        <Typography component="ul" variant="body1" color="textSecondary">
          <li id="team-members-dialog-switch-role-consequences-1">{t("team-members-dialog-switch-role-consequences-1")}</li>
          <li id="team-members-dialog-switch-role-consequences-2">{t("team-members-dialog-switch-role-consequences-2")}</li>
          <li id="team-members-dialog-switch-role-consequences-3">{t("team-members-dialog-switch-role-consequences-3")}</li>
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          id="team-members-dialog-switch-role-button-cancel"
          onClick={handleClose}
          className={classes.buttonCancel}
          color="secondary"
          variant="contained">
          {t("Cancel")}
        </Button>
        <Button
          id="team-members-dialog-switch-role-button-ok"
          onClick={handleClickOK}
          color="primary"
          variant="contained">
          {t("team-members-dialog-switch-role-button-ok")}
        </Button>
      </DialogActions>

    </Dialog>
  );
}

export default SwitchRoleDialog;
