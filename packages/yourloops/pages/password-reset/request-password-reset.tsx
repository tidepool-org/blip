/**
 * Copyright (c) 2021, Diabeloop
 * Request password reset page
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
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";

import brandingLogo from "branding/logo.png";

import { useAuth } from "../../lib/auth";
import { errorTextFromException, REGEX_EMAIL } from "../../lib/utils";
import { useAlert } from "../../components/utils/snackbar";
import LanguageSelector from "../../components/language-select";

import RequestPasswordForm from "./request-password-form";
import RequestPassordMessage from "./request-password-message";

const loginStyle = makeStyles((theme: Theme) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
    },
    divLanguageSelector: {
      marginLeft: "auto",
      marginRight: "auto",
      padding: "16px",
    },
    Card: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      padding: theme.spacing(4),
    },
    CardContent: {
      textAlign: "start",
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
    },
    CardActions: {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      padding: theme.spacing(2),
      justifyContent: "flex-end",
    },
    TextField: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
  };
});

/**
 * Request password page
 */
function RequestPasswordResetPage(): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const history = useHistory();
  const auth = useAuth();
  const alert = useAlert();
  const classes = loginStyle();
  const [username, setUserName] = React.useState("");
  const [validateError, setValidateError] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const onUsernameChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setUserName(event.target.value);
  };

  const onBack = (): void => {
    history.goBack();
  };

  const validateUserName = (): boolean => {
    const err = _.isEmpty(username.trim()) || !REGEX_EMAIL.test(username);
    setValidateError(err);
    return !err;
  };

  const onSendResetLink = async (): Promise<void> => {
    if (validateUserName()) {
      try {
        setInProgress(true);
        const success = await auth.sendPasswordResetEmail(username, i18n.language);
        setSuccess(success);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        alert.error(t(errorMessage));
      }
      setInProgress(false);
    }
  };

  return (
    <Container className={classes.container} maxWidth="sm">
      <Card className={classes.Card}>
        <CardMedia
          style={{
            display: "flex",
            paddingTop: "1em",
            paddingBottom: "1em",
          }}>
          <img
            src={brandingLogo}
            alt={t("Login Branding Logo")}
            style={{
              height: "60px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </CardMedia>
        {success ? (
          <RequestPassordMessage header="password-request-reset-title" body="password-request-reset-instructions" />
        ) : (
          <RequestPasswordForm
            username={username}
            error={validateError}
            inProgress={inProgress}
            onBack={onBack}
            validateUserName={validateUserName}
            onSendResetLink={onSendResetLink}
            onUsernameChange={onUsernameChange}
          />
        )}
      </Card>
      <div className={classes.divLanguageSelector}>
        <LanguageSelector />
      </div>
    </Container>
  );
}

export default RequestPasswordResetPage;
