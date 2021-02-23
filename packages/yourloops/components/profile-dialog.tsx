/**
 * Copyright (c) 2021, Diabeloop
 * Patient profile modale
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

import moment from "moment-timezone";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";

import { Units, User } from "../models/shoreline";
interface ProfileDialogProps {
  user: User;
  isOpen: boolean;
  handleClose: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      textAlign: "center",
      color: theme.palette.primary.main,
    },
    textField: {
      marginTop: "1em",
      "& input:disabled": {
        backgroundColor: "white",
        color: theme.palette.grey[800],
      },
    },
    disabled: {
      "&&:before": {
        borderBottom: "0.5px solid",
        color: theme.palette.grey[400],
      },
    },
  })
);

const ProfileDialog: FunctionComponent<ProfileDialogProps> = ({ user, isOpen, handleClose }: ProfileDialogProps) => {
  const { t } = useTranslation("yourloops");
  const { textField, title, disabled } = useStyles();

  const mail = user?.emails ? user.emails[0] : "";
  const hbA1c = "8.5%"; // TODO
  const birthDate = moment.utc(user?.profile?.patient?.birthday).format("L");

  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? user.profile?.fullName ?? "";

  return (
    <Dialog fullWidth={true} maxWidth="xs" open={isOpen} onClose={handleClose}>
      <DialogTitle className={title} id="patient-dialog-title">
        {t("patient-profile")}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          disabled
          id="firstname"
          label={t("firstName")}
          value={firstName}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
        <TextField
          fullWidth
          disabled
          id="lastname"
          label={t("lastName")}
          value={lastName}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
        <TextField
          fullWidth
          disabled
          id="birthDate"
          label={t("hcp-patient-profile-birthdate")}
          value={birthDate}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
        <TextField
          fullWidth
          disabled
          id="mail"
          label={t("email")}
          value={mail}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
        <TextField
          fullWidth
          disabled
          id="hbA1c"
          label={t("initial-hbA1c")}
          value={hbA1c}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
        <TextField
          fullWidth
          disabled
          id="units"
          label={t("units")}
          value={user.settings?.units?.bg ?? Units.gram}
          className={textField}
          InputProps={{ classes: { disabled } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {t("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
