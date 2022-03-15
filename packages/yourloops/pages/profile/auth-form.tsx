/**
 * Copyright (c) 2021, Diabeloop
 * Profile page - Authentication part
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

import { ClassNameMap } from "@material-ui/styles/withStyles";
import TextField from "@material-ui/core/TextField";

import { getUserEmail } from "../../lib/utils";
import { User } from "../../lib/auth";
import Password from "../../components/password/password";
import { Errors } from "./models";
import { PasswordConfirm } from "../../components/password/password-confirm";

interface AuthenticationFormProps {
  user: User;
  classes: ClassNameMap<"textField">;
  errors: Errors;
  currentPassword: string;
  setCurrentPassword: React.Dispatch<string>;
  setPassword: React.Dispatch<string>;
  setPasswordConfirmation: React.Dispatch<string>;
  setPasswordConfirmationError: React.Dispatch<boolean>;
}

function AuthenticationForm(props: AuthenticationFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const {
    user,
    classes,
    errors,
    currentPassword,
    setCurrentPassword,
    setPassword,
    setPasswordConfirmation,
    setPasswordConfirmationError,
  } = props;

  const onError = (password: string, passwordConfirmation: string) => {
    setPassword(password);
    setPasswordConfirmation(passwordConfirmation);
    setPasswordConfirmationError(true);
  };

  const onSuccess = (password: string) => {
    setPasswordConfirmation(password);
    setPassword(password);
    setPasswordConfirmationError(false);
  };

  return (
    <React.Fragment>
      <TextField
        id="profile-textfield-mail"
        label={t("email")}
        value={getUserEmail(user)}
        disabled
        className={classes.textField}
      />
      <Password
        id="profile-textfield-password-current"
        autoComplete="current-password"
        variant="standard"
        label={t("current-password")}
        value={currentPassword}
        error={errors.currentPassword}
        helperText={t("no-password")}
        onChange={setCurrentPassword}
      />
      <PasswordConfirm
        variant={"standard"}
        onError={onError}
        onSuccess={onSuccess}
      />
    </React.Fragment>
  );
}

export default AuthenticationForm;
