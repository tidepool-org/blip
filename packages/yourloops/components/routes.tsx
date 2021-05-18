/**
 * Copyright (c) 2021, Diabeloop
 * Wrapper for <Route>
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
import { Redirect, Route, RouteProps } from "react-router-dom";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";

import { useAuth } from "../lib/auth";
import { getURLPrefixFromUser } from "../lib/diabeloop-url";
import { publicRoutesTheme, mainTheme } from "./theme";
import FooterLinks from "./footer-links";
import { SnackbarContextProvider, DefaultSnackbarContext } from "./utils/snackbar";
import { NotificationContextProvider } from "../lib/notifications/hook";

export const PublicRoute = (props: RouteProps): JSX.Element => {
  const { isLoggedIn, user } = useAuth();

  return isLoggedIn() ? (
    <Redirect to={{ pathname: getURLPrefixFromUser(user), state: { from: props.location } }} />
  ) : (
    <ThemeProvider theme={publicRoutesTheme}>
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        <Route {...props} />
      </SnackbarContextProvider>
      <FooterLinks />
    </ThemeProvider>
  );
};

export const PrivateRoute = (props: RouteProps): JSX.Element => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn() ? (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        <NotificationContextProvider>
          <Route {...props} />
        </NotificationContextProvider>
      </SnackbarContextProvider>
      <FooterLinks atBottom />
    </ThemeProvider>
  ) : (
    <Redirect to={{ pathname: "/", state: { from: props.location } }} />
  );
};
