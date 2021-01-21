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
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import bows from "bows";

import { makeStyles /*, Theme */ } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";

import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { t } from "../../lib/language";
import brandingLogo from "branding/logo.png";
import { useState } from "react";
import { useAuth } from "../../lib/auth/hook/use-auth";

const loginStyle = makeStyles(( /* theme: Theme */) => {
  return {
    mainContainer: { margin: "auto" },
    loginButton: {
      marginLeft: "auto !important",
    },
  };
});

/**
 * Login page
 */
function Login(props: RouteComponentProps): JSX.Element {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validateError, setValidateError] = useState(false);
  const [helperTextValue, setHelperTextValue] = useState("");
  const auth = useAuth();
  const classes = loginStyle();
  const emptyUsername = _.isEmpty(username);
  const emptyPassword = _.isEmpty(password);
  const log = bows("Login");

  const onUsernameChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setUserName(event.target.value);
  };

  const onPasswordChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  const onClickShowPasswordVisibility = (): void => {
    if (showPassword) {
      setShowPassword(false);
      //authApi.sendMetrics("Hide password");
    } else {
      setShowPassword(true);
      // authApi.sendMetrics("Show password");
    }
  };

  const onClickLoginButton = async (): Promise<void> => {
    if (_.isEmpty(username) || _.isEmpty(password)) {
      setValidateError(true);
      return;
    }
    setValidateError(false);
    setHelperTextValue("");

    try {
      const user = await auth.login(username, password);
      // for now, simply read the profile
      // we will refactor by creating a class obj with IsPatient method
      if (!_.isEmpty(user?.profile?.patient)) {
        props.history.push("/patient");
      } else {
        props.history.push("/hcp");
      }
    } catch (reason: unknown) {
      log.error(reason);
      setValidateError(true);
      const message = _.isError(reason) ? reason.message : (new String(reason)).toString();
      setHelperTextValue(message);
    }
  };

  const onClickLoginReset = (): void => {
    props.history.push("/request-password-reset");
  };

  // function onClickForgotPassword() {
  //   //this.log.debug("onClickForgotPassword");
  // }

  // function onClickSignup() {
  //   //this.log.debug("onClickSignup");
  // }

  return (
    <Container maxWidth="sm" className={classes.mainContainer}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12}>
          <Card>
            <CardMedia style={{ display: "flex", paddingTop: "1em", paddingBottom: "1em" }}>
              <img src={brandingLogo} style={{ height: "60px", marginLeft: "auto", marginRight: "auto" }} alt={t('Login Branding Logo')} />
            </CardMedia>
            <CardContent>
              <form style={{ display: "flex", flexDirection: "column" }} noValidate autoComplete="off">
                <TextField
                  id="login-username"
                  label={t("Email")}
                  value={username}
                  required
                  error={validateError && emptyUsername}
                  onChange={onUsernameChange}
                />
                <TextField
                  id="login-password"
                  label={t("Password")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  error={validateError && (emptyPassword || helperTextValue.length > 0)}
                  onChange={onPasswordChange}
                  helperText={helperTextValue}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label={t("aria-toggle-password-visibility")} onClick={onClickShowPasswordVisibility}>
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </CardContent>
            <CardActions>
              <Link
                to="/request-password-reset"
                onClick={onClickLoginReset}>
                {t('Forgot your password?')}
              </Link>
              <Button
                variant="contained"
                color="primary"
                onClick={onClickLoginButton}
                className={classes.loginButton}
                disabled={emptyUsername || emptyPassword}
              >
                {t("Login")}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Login;
