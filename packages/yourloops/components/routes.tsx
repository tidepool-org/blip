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

import * as React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";

import { UserRoles } from "../models/shoreline";
import { useAuth } from "../lib/auth";
import { externalTheme, mainTheme } from "./theme";
import FooterLinks from "./footer-links";
import { SnackbarContextProvider, DefaultSnackbarContext } from "./utils/snackbar";
import { NotificationContextProvider } from "../lib/notifications/hook";

export const PublicRoute = (props: RouteProps): JSX.Element => {
  const { isLoggedIn, user } = useAuth();
  if (isLoggedIn()) {
    return <Redirect to={{ pathname: user?.getHomePage() }} />;
  }
  return (
    <ThemeProvider theme={externalTheme}>
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        <Route {...props} />
      </SnackbarContextProvider>
      <FooterLinks />
    </ThemeProvider>
  );
};

export const PrivateRoute = (props: RouteProps): JSX.Element => {
  const { isLoggedIn, user } = useAuth();

  const renewConsentPath = props.path === "/renew-consent" || props.path === "/new-consent";
  const theme = renewConsentPath ? externalTheme : mainTheme;

  if (!isLoggedIn()) {
    return <Redirect to={{ pathname: "/", state: { from: props.location } }} />;
  }

  // Put the redirect under the contexts here because of the mount/unmount component logic
  // If not doing so, we have an update on an unmont component.
  let component: JSX.Element | null = null;
  if (user !== null && !renewConsentPath) {
    if (user.role === UserRoles.patient && user.shouldAcceptConsent()) {
      component = <Redirect to={{ pathname: "/new-consent", state: { from: props.location } }} />;
    }

    if (user.shouldRenewConsent()) {
      component = <Redirect to={{ pathname: "/renew-consent", state: { from: props.location } }} />;
    }
  }

  if (component === null) {
    component = <Route {...props} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        <NotificationContextProvider>
          {component}
        </NotificationContextProvider>
      </SnackbarContextProvider>
      <FooterLinks atBottom />
    </ThemeProvider>
  );
};
