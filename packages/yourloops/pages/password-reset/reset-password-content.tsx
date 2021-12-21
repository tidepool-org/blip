/**
 * Copyright (c) 2021, Diabeloop
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
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { errorTextFromException, REGEX_EMAIL } from "../../lib/utils";
import { checkPasswordStrength } from "../../lib/auth/helpers";
import { useAuth } from "../../lib/auth";
import { useAlert } from "../../components/utils/snackbar";
import { PasswordStrengthMeter } from "../../components/utils/password-strength-meter";
import Password from "../../components/utils/password";
import RequestPasswordMessage from "./request-password-message";
import ProgressIconButtonWrapper from "../../components/buttons/progress-icon-button-wrapper";

interface Errors {
  username: boolean;
  newPassword: boolean;
  confirmNewPassword: boolean;
}

const formStyle = makeStyles((theme: Theme) => {
  return {
    CardContent: {
      textAlign: "start",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
      },
    },
    CardActions: {
      [theme.breakpoints.up("sm")]: {
        marginRight: theme.spacing(4),
      },
      justifyContent: "flex-end",
    },
    fontWeightBold: {
      fontWeight: 600,
    },
  };
});

export default function ResetPasswordContent(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = formStyle();
  const auth = useAuth();
  const history = useHistory();
  const alert = useAlert();

  const [username, setUsername] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [usernameTextFieldFocused, setUsernameTextFieldFocused] = React.useState(false);

  const passwordCheck = checkPasswordStrength(newPassword);
  const resetKey = React.useMemo(() => new URLSearchParams(location.search).get("resetKey"), []);
  const errors: Errors = React.useMemo(
    () => ({
      username: _.isEmpty(username.trim()) || !REGEX_EMAIL.test(username),
      newPassword: passwordCheck.onError,
      confirmNewPassword: _.isEmpty(confirmNewPassword.trim()) || confirmNewPassword !== newPassword,
      resetKey: !resetKey,
    }), [confirmNewPassword, newPassword, passwordCheck.onError, resetKey, username]
  );

  const onSendResetPassword = async (): Promise<void> => {
    if (!errors.username && !errors.newPassword && !errors.confirmNewPassword && resetKey) {
      try {
        setInProgress(true);
        const success = await auth.resetPassword(
          resetKey,
          username,
          confirmNewPassword
        );
        setSuccess(success);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        alert.error(t(errorMessage));
      } finally {
        setInProgress(false);
      }
    }
  };

  return (
    <React.Fragment>
      {success ? (
        <RequestPasswordMessage
          header="password-reset-success-title"
          body="password-reset-success"
        />
      ) : (
        <>
          <CardContent className={classes.CardContent}>
            <Typography variant="h6" gutterBottom>
              {t("password-reset-title")}
            </Typography>

            {_.isEmpty(resetKey) &&
              <Typography color="error" className={classes.fontWeightBold}>
                {t("reset-key-is-missing")}
              </Typography>
            }

            <TextField
              id="username"
              margin="normal"
              label={t("email")}
              variant="outlined"
              value={username}
              required
              error={errors.username && username.length > 0 && !usernameTextFieldFocused}
              onBlur={() => setUsernameTextFieldFocused(false)}
              onFocus={() => setUsernameTextFieldFocused(true)}
              onChange={(e) => setUsername(e.target.value)}
              helperText={errors.username && username.length > 0 && !usernameTextFieldFocused && t("invalid-email")}
            />
            <Password
              id="password"
              label={t("new-password")}
              autoComplete="new-password"
              margin="normal"
              variant="outlined"
              value={newPassword}
              error={errors.newPassword && newPassword.length > 0}
              checkStrength
              required
              helperText={
                newPassword.length > 0 &&
                <PasswordStrengthMeter
                  force={passwordCheck.score}
                  error={errors.newPassword}
                  helperText={passwordCheck.helperText}
                />
              }
              onChange={(password) => setNewPassword(password)}
            />
            <Password
              id="confirm-password"
              label={t("confirm-new-password")}
              value={confirmNewPassword}
              error={errors.confirmNewPassword && confirmNewPassword.length > 0}
              helperText={errors.confirmNewPassword && t("password-dont-match")}
              autoComplete="new-password"
              variant="outlined"
              margin="normal"
              required
              onChange={(password) => setConfirmNewPassword(password)}
            />
          </CardContent>
          <CardActions className={classes.CardActions}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => history.push("/")}
            >
              {t("button-cancel")}
            </Button>
            <ProgressIconButtonWrapper inProgress={inProgress}>
              <Button
                variant="contained"
                color="primary"
                onClick={onSendResetPassword}
                disabled={_.some(errors) || inProgress}
              >
                {t("button-save")}
              </Button>
            </ProgressIconButtonWrapper>
          </CardActions>
        </>
      )}
    </React.Fragment>
  );
}
