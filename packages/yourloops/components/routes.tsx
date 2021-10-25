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
import { Redirect, Route, RouteProps, useHistory } from "react-router-dom";
import bows from "bows";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";

import { HistoryState } from "../models/generic";
import { UserRoles } from "../models/shoreline";
import { useAuth, SessionTimeout } from "../lib/auth";
import { setPageTitle } from "../lib/utils";
import { NotificationContextProvider } from "../lib/notifications/hook";
import { SnackbarContextProvider, DefaultSnackbarContext } from "./utils/snackbar";
import { externalTheme, mainTheme } from "./theme";
import FooterLinks from "./footer-links";

const log = bows("Routes");

export const PublicRoute = (props: RouteProps): JSX.Element | null => {
  const historyHook = useHistory<HistoryState>();
  const { isAuthInProgress, isLoggedIn, user } = useAuth();

  React.useEffect(() => {
    setPageTitle();
  });

  let component: JSX.Element | null = null;
  if (!isAuthInProgress && isLoggedIn && user !== null) {
    const pathname = historyHook.location.state?.from?.pathname ?? user.getHomePage();
    log.info("PublicRoute: User is logged-in, redirecting to", pathname);
    component = <Redirect to={{ pathname }} />;
  } else {
    component = <Route {...props} />;
  }

  return (
    <ThemeProvider theme={externalTheme}>
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        {component}
      </SnackbarContextProvider>
      <FooterLinks />
    </ThemeProvider>
  );
};

export const PrivateRoute = (props: RouteProps): JSX.Element | null => {
  const historyHook = useHistory<HistoryState>();
  const { isAuthInProgress, isLoggedIn, user, isAuthHookInitialized } = useAuth();

  const renewConsentPath = props.path === "/renew-consent" || props.path === "/new-consent";
  const theme = renewConsentPath ? externalTheme : mainTheme;

  // Put the redirect under the contexts here because of the mount/unmount component logic
  // If not doing so, we have an update on an unmount component.
  let component: JSX.Element | null = null;
  if (isAuthInProgress || !isAuthHookInitialized) {
    log.info("PrivateRoute: Auth in progress -> return null");

  } else if (!isLoggedIn || user === null) {
    log.info("PrivateRoute: Not logged-in -> redirect to login page");
    component = <Redirect to={{ pathname: "/", state: { from: props.location } }} />;

  } else if (!renewConsentPath && user.role === UserRoles.patient && user.shouldAcceptConsent()) {
    component = <Redirect to={{ pathname: "/new-consent", state: { from: props.location } }} />;

  } else if (!renewConsentPath && user.shouldRenewConsent()) {
    component = <Redirect to={{ pathname: "/renew-consent", state: { from: props.location } }} />;

  } else if (!renewConsentPath && !historyHook.location.pathname.startsWith(user.getHomePage())) {
    // We are on the wrong prefix, be sure the path prefix is good
    const homePage = user.getHomePage();
    log.warn("PrivateRoute: Wrong path prefix for user, redirecting to ", homePage);
    component = <Redirect to={{ pathname: homePage }} />;

  } else {
    component = (
      <NotificationContextProvider>
        <Route {...props} />
      </NotificationContextProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <SessionTimeout />
      <CssBaseline />
      <SnackbarContextProvider context={DefaultSnackbarContext}>
        {component}
      </SnackbarContextProvider>
      <FooterLinks atBottom={!renewConsentPath} />
    </ThemeProvider>
  );
};
