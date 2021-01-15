/**
 * Copyright (c) 2020, Diabeloop
 * Login page
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import bows from "bows";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  IconButton,
  TextField,
  Grid,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { t } from "../../lib/language";
import api from "../../lib/api";
import { User } from "models/shoreline";

import brandingLogo from "branding/logo.png";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoginProps extends RouteComponentProps {
}

interface LoginState {
  username: string;
  password: string;
  showPassword: boolean;
  validateError: boolean;
  helperTextValue: string | null;
  loginFormStyles: string[];
}

/**
 * Login page
 */
class Login extends React.Component<LoginProps, LoginState> {
  private log: Console;

  constructor(props: LoginProps) {
    super(props);

    this.state = {
      username: "",
      password: "",
      validateError: false,
      showPassword: false,
      helperTextValue: "",
      loginFormStyles: ["stage-transition-container-variant"],
    };

    this.log = bows("Login");

    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onClickShowPasswordVisibility = this.onClickShowPasswordVisibility.bind(this);
    this.onClickLoginButton = this.onClickLoginButton.bind(this);
    this.onClickForgotPassword = this.onClickForgotPassword.bind(this);
    this.onClickSignup = this.onClickSignup.bind(this);
  }

  public render(): JSX.Element {
    const { username, password, showPassword, validateError, helperTextValue } = this.state;

    const emptyUsername = _.isEmpty(username);
    const emptyPassword = _.isEmpty(password);
    return (
      <Container maxWidth="sm" style={{ margin: "auto" }}>
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
                  onChange={this.onUsernameChange}
                  helperText={helperTextValue}
                />
                <FormControl>
                  <InputLabel htmlFor="login-password">{t("Password")}</InputLabel>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    error={validateError && emptyPassword}
                    onChange={this.onPasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.onClickShowPasswordVisibility}
                          onMouseDown={this.onMouseDownPassword.bind(this)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </form>
            </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.onClickLoginButton}
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

  private onUsernameChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  private onPasswordChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }

  private onClickShowPasswordVisibility() {
    const { showPassword } = this.state;
    if (showPassword) {
      this.setState({ showPassword: false });
      api.sendMetrics("Hide password");
    } else {
      this.setState({ showPassword: true });
      api.sendMetrics("Show password");
    }
  }

  private onMouseDownPassword(ev: React.MouseEvent): void {
    this.log.debug("onMouseDownPassword", ev);
  }

  private onClickLoginButton() {
    const { username, password } = this.state;
    if (_.isEmpty(username) || _.isEmpty(password)) {
      this.setState({ validateError: true });
      return;
    }
    this.setState({ validateError: false });
    api.login(username, password)
      .then((user: User) => {
        this.log.info(user);
        if (api.userIsPatient) {
          this.props.history.push("/patient");
        } else {
          this.props.history.push("/hcp");
        }
      }).catch((reason: Error) => {
        console.log(reason);
        this.setState({ validateError: true, helperTextValue: reason.message });
        this.log.error(reason);
      });
  }

  private onClickForgotPassword() {
    this.log.debug("onClickForgotPassword");
  }

  private onClickSignup() {
    this.log.debug("onClickSignup");
  }
}

export default Login;
