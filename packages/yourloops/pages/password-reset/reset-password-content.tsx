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
import { useAuth } from "../../lib/auth";
import { useAlert } from "../../components/utils/snackbar";
import { PasswordConfirm } from "../../components/password/password-confirm";
import ProgressIconButtonWrapper from "../../components/buttons/progress-icon-button-wrapper";
import RequestPasswordMessage from "./request-password-message";

interface Errors {
  username: boolean;
  password: boolean;
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
  const [password, setPassword] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [usernameTextFieldFocused, setUsernameTextFieldFocused] = React.useState(false);
  const [hasPasswordError, setHasPasswordError] = React.useState(false);

  const resetKey = React.useMemo(() => new URLSearchParams(location.search).get("resetKey"), []);
  const errors: Errors = React.useMemo(
    () => ({
      username: _.isEmpty(username.trim()) || !REGEX_EMAIL.test(username),
      password: hasPasswordError,
    }), [username, hasPasswordError]
  );

  const onSendResetPassword = async (): Promise<void> => {
    if (!errors.username && !errors.password && resetKey) {
      try {
        setInProgress(true);
        const passwordResetSuccessful = await auth.resetPassword(
          resetKey,
          username,
          password
        );
        setSuccess(passwordResetSuccessful);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        alert.error(t(errorMessage));
      } finally {
        setInProgress(false);
      }
    }
  };

  const onSuccess = (password: string) => {
    setHasPasswordError(false);
    setPassword(password);
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
            <PasswordConfirm
              onError={() => setHasPasswordError(true)}
              onSuccess={onSuccess}
            />
          </CardContent>
          <CardActions className={classes.CardActions}>
            <Button onClick={() => history.push("/")}>
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
