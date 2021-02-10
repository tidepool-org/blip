/**
 * Copyright (c) 2021, Diabeloop
 * Team dialog to add a new HCP member
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
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";

import { TeamMemberRole } from "../../models/team";
import { REGEX_EMAIL } from "../../lib/utils";

import { AddMemberDialogContentProps } from "./types";

interface AddMemberDialogProps {
  addMember: null | AddMemberDialogContentProps;
}

const dialogClasses = makeStyles((theme: Theme) => {
  return {
    dialogContent: {
      display: "flex",
      flexDirection: "column",
      minWidth: "25em",
    },
    buttonCancel: {
      marginRight: theme.spacing(2),
    },
  };
});

function AddMemberDialog(props: AddMemberDialogProps): JSX.Element | null {
  const { addMember } = props;

  const { t } = useTranslation("yourloops");
  const [email, setEMail] = React.useState("");
  const [role, setRole] = React.useState(TeamMemberRole.viewer);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const classes = dialogClasses();

  const teamName = addMember?.team.name ?? "";

  const handleChangeEMail = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const eMail = e.target.value;
    setEMail(eMail);
    setButtonDisabled(!REGEX_EMAIL.test(eMail));
  };
  const handleChangeRole = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setRole(checked ? TeamMemberRole.admin : TeamMemberRole.viewer);
  };

  const handleClickClose = (): void => {
    addMember?.onDialogResult({ email: null, role });
    setEMail("");
    setButtonDisabled(true);
    setRole(TeamMemberRole.viewer);
  };

  const handleClickAdd = (): void => {
    addMember?.onDialogResult({ email, role });
    setEMail("");
    setButtonDisabled(true);
    setRole(TeamMemberRole.viewer);
  };

  return (
    <Dialog
      id="team-members-dialog-add-member"
      open={addMember !== null}
      aria-labelledby={t("aria-team-members-dialog-add-member-title", { teamName })}
      onClose={handleClickClose}>

      <DialogTitle id="team-members-dialog-add-member-title">
        <strong>{t("team-members-dialog-add-member-title")}</strong>
        <br />
        <span id="team-members-dialog-add-member-title-team-name">{teamName}</span>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <TextField
          id="team-members-dialog-add-member-field-email"
          variant="outlined"
          onChange={handleChangeEMail}
          name="name"
          value={email}
          label={t("Email")}
          required={true}
          aria-required="true"
          type="email"
        />
        <FormControlLabel
          control={<Checkbox checked={role === TeamMemberRole.admin} onChange={handleChangeRole} name="role" color="primary" />}
          label={t("team-members-dialog-add-member-checkbox-admin")}
        />
      </DialogContent>

      <DialogActions>
        <Button
          id="team-members-dialog-add-member-button-cancel"
          onClick={handleClickClose}
          className={classes.buttonCancel}
          color="secondary"
          variant="contained">
          {t("Cancel")}
        </Button>
        <Button
          id="team-members-dialog-add-member-button-add"
          onClick={handleClickAdd}
          color="primary"
          variant="contained"
          disabled={buttonDisabled}>
          {t("team-members-dialog-add-member-button-add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMemberDialog;
