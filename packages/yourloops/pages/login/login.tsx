/**
 * Copyright (c) 2021, Diabeloop
 * Login page
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
import { Link as RouterLink, useHistory } from "react-router-dom";
import bows from "bows";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import brandingLogo from "branding/logo.png";

import { HistoryState } from "../../models/generic";
import appConfig from "../../lib/config";
import metrics from "../../lib/metrics";
import { useAuth } from "../../lib/auth";
import { errorTextFromException } from "../../lib/utils";
import { useAlert } from "../../components/utils/snackbar";
import LanguageSelector from "../../components/language-select";
import Password from "../../components/utils/password";
import ButtonResendActivationLink from "./resend-link";

const loginStyle = makeStyles((theme: Theme) => {
  return {
    loginButton: {
      marginLeft: "auto !important",
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
      [theme.breakpoints.only("xs")]: {
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(0),
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(0),
      },
    },
    CardActions: {
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
      },
    },
    textField: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
    gridLangSelector: {
      padding: theme.spacing(2),
      textAlign: "center",
      fontSize: "small",
    },
  };
}, { name: "login-page-styles" });

/**
 * Login page
 */
function Login(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const auth = useAuth();
  const alert = useAlert();
  const theme = useTheme();
  const classes = loginStyle();
  const historyHook = useHistory<HistoryState>();
  const isXSBreakpoint: boolean = useMediaQuery(theme.breakpoints.only("xs"));

  const log = React.useMemo(() => bows("Login"), []);
  const urlParams = React.useMemo(() => new URLSearchParams(historyHook.location.search), [historyHook.location.search]);
  const signupEmail = React.useMemo(() => urlParams.get("signupEmail"), [urlParams]);
  const loginEmail = React.useMemo(() => urlParams.get("login"), [urlParams]);
  const sessionHasExpired = React.useMemo(() => urlParams.get("sessionExpired") === "true", [urlParams]);

  const [username, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [validateError, setValidateError] = React.useState(false);
  const [helperTextValue, setHelperTextValue] = React.useState("");
  const [resendActivationLinkInProgress, setResendActivationLinkInProgress] = React.useState(false);

  const emptyUsername = _.isEmpty(username);
  const emptyPassword = _.isEmpty(password);

  const onUsernameChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setUserName(event.target.value);
  };

  // Manage URL parameter: "sessionExpired"
  React.useEffect(() => {
    // Add the alert only is we should display it and it is not currently displayed
    if (sessionHasExpired && !alert.has("session-timeout")) {
      const handleClose = () => {
        // Remove the sessionExpired parameter
        urlParams.delete("sessionExpired");
        const params = urlParams.toString();
        historyHook.push(`${historyHook.location.pathname}${params.length > 0 ? "?" : ""}${params}`, historyHook.location.state);
      };

      alert.warning(t("login-message-session-timeout"), { infiniteTimeout: true, id: "session-timeout", onClose: handleClose });
    }
  }, [sessionHasExpired, urlParams, historyHook, alert, t]);

  // Manage URL parameter: "login"
  React.useEffect(() => {
    if (typeof loginEmail === "string" && username === "") {
      setUserName(loginEmail);
    }
    // Don't depends on a change here, so the user can re-login with another user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage URL parameter: "signupEmail"
  React.useEffect(() => {
    if (typeof signupEmail === "string" && username !== signupEmail) {
      setUserName(signupEmail);
    }
  }, [signupEmail, username]);

  const onClickLoginButton = async (): Promise<void> => {
    if (_.isEmpty(username) || _.isEmpty(password)) {
      setValidateError(true);
      return;
    }
    setValidateError(false);
    setHelperTextValue("");

    try {
      const signupKey = new URLSearchParams(location.search).get("signupKey");
      const user = await auth.login(username, password, signupKey);
      log.debug("Logged user:", user);
      // The redirect is done by packages/yourloops/components/routes.tsx#PublicRoute
    } catch (reason: unknown) {
      let action: JSX.Element | null = null;
      const errorMessage = errorTextFromException(reason);
      let translatedErrorMessage: string | null = null;
      if (errorMessage === "error-account-lock") {
        translatedErrorMessage = t(errorMessage, { delayBeforeNextLoginAttempt: appConfig.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT });
      } else if (errorMessage === "no-username" || errorMessage === "no-password") {
        // Theses error should never be displayed (no-username/no-password)
        // But it's to cover all possible cases
        translatedErrorMessage = t("error-invalid-credentials");
      } else if (errorMessage === "email-not-verified") {
        action = (
          <ButtonResendActivationLink
            username={username}
            log={log}
            setResendActivationLinkInProgress={setResendActivationLinkInProgress}
          />
        );
      }

      if (translatedErrorMessage === null) {
        translatedErrorMessage = t(errorMessage);
      }

      alert.error(translatedErrorMessage as string, { action });
      metrics.send("error", "login", errorMessage);
    }
  };

  const onValidateLogin = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onClickLoginButton();
    }
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={0} alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <Card className={classes.Card}>
            <Box py="1em">
              <CardMedia>
                <img src={brandingLogo} height={isXSBreakpoint ? 50 : 60} alt={t("alt-img-logo")} />
              </CardMedia>
            </Box>
            <CardContent className={classes.CardContent}>
              <Box
                id="form-login"
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <TextField
                  id="login-username"
                  autoComplete="username"
                  className={classes.textField}
                  margin="normal"
                  label={t("email")}
                  variant="outlined"
                  value={username}
                  disabled={typeof signupEmail === "string" || resendActivationLinkInProgress}
                  required
                  error={validateError && emptyUsername}
                  onChange={onUsernameChange}
                  onKeyPress={onValidateLogin}
                />
                <Password
                  id="login-password"
                  autoComplete="current-password"
                  variant="outlined"
                  margin="normal"
                  className={classes.textField}
                  label={t("password")}
                  onChange={setPassword}
                  onValidate={onClickLoginButton}
                  value={password}
                  required={true}
                  error={validateError && (emptyPassword || helperTextValue.length > 0)}
                  disabled={resendActivationLinkInProgress}
                  helperText={helperTextValue}
                />
              </Box>
              <Link id="link-password-reset" component={RouterLink} to="/request-password-reset" onClick={() => metrics.send("support", "password_reset")}>
                {t("forgot-password-question")}
              </Link>
            </CardContent>
            <CardActions className={classes.CardActions}>
              <Link id="link-signup" component={RouterLink} to="/signup" onClick={() => metrics.send("registration", "start_signup")}>
                {t("signup-steppers-create-account")}
              </Link>
              <Button
                id="login-button"
                variant="contained"
                color="primary"
                onClick={onClickLoginButton}
                className={classes.loginButton}
                disabled={emptyUsername || emptyPassword || resendActivationLinkInProgress}>
                {t("login")}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} className={classes.gridLangSelector}>
          <LanguageSelector />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Login;
