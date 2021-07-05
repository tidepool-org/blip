/**
 * Copyright (c) 2021, Diabeloop
 * Main App file
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
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom";

import "@fontsource/roboto";
import "branding/theme-base.css";
import "branding/theme.css";

import sendMetrics from "../lib/metrics";
import { AuthContextProvider } from "../lib/auth";
import { PrivateRoute, PublicRoute } from "../components/routes";
import InvalidRoute from "../components/invalid-route";
import { LoginPage, ConsentPage } from "../pages/login";
import { SignUpPage } from "../pages/signup";
import HcpPage from "../pages/hcp";
import PatientPage from "../pages/patient";
import PatientConsentPage from "../pages/patient/patient-consent";
import CaregiverPage from "../pages/caregiver";
import { RequestPasswordResetPage, ConfirmPasswordResetPage } from "../pages/password-reset";

const RE_PATIENT_URL = /^\/patient\/[0-9a-f]+\/?(.*)/;
const RE_CAREGIVER_URL = /^\/caregiver\/patient\/[0-9a-f]+\/?(.*)/;
const RE_HCP_URL = /^\/professional\/patient\/[0-9a-f]+\/?(.*)/;
const CONFIDENTIALS_PARAMS = ["signupEmail", "signupKey", "resetKey"];
function MetricsLocationListener() {
  const location = useLocation();
  const locPathname = location.pathname;
  const locSearch = location.search;

  React.useEffect(() => {
    let pathname: string | null = null;
    let match = locPathname.match(RE_PATIENT_URL);
    if (match !== null) {
      pathname = `/patient/userid/${match[1]}`;
    }
    match = pathname === null ? locPathname.match(RE_CAREGIVER_URL) : null;
    if (match !== null) {
      pathname = `/caregiver/patient/userid/${match.length > 1 ? match[1] : ""}`;
    }
    match = pathname === null ? locPathname.match(RE_HCP_URL) : null;
    if (match !== null) {
      pathname = `/professional/patient/userid/${match.length > 1 ? match[1] : ""}`;
    }

    if (pathname === null) {
      pathname = locPathname;
    }

    const searchParams = new URLSearchParams(locSearch);
    let nParams = 0;
    for (let i=0; i<CONFIDENTIALS_PARAMS.length; i++) {
      const paramName = CONFIDENTIALS_PARAMS[i];
      if (searchParams.has(paramName)) {
        pathname = `${pathname}${nParams > 0 ? "&" : "?"}${paramName}=confidential`;
        nParams++;
      }
    }

    sendMetrics("setCustomUrl", pathname);
    sendMetrics("trackPageView");
  }, [locPathname, locSearch]);
  return null;
}

const Yourloops = (): JSX.Element => {
  return (
    <Router>
      <MetricsLocationListener />
      <AuthContextProvider>
        <Switch>
          <PublicRoute exact path="/" component={LoginPage} />
          {/* The /login route is required because some backend service generate URL with it */}
          <PublicRoute exact path="/login" component={LoginPage} />
          <PublicRoute exact path="/signup" component={SignUpPage} />
          <PublicRoute path="/request-password-reset" component={RequestPasswordResetPage} />
          <PublicRoute path="/confirm-password-reset" component={ConfirmPasswordResetPage} />
          <PrivateRoute path="/new-consent" component={PatientConsentPage} />
          <PrivateRoute path="/renew-consent" component={ConsentPage} />
          <PrivateRoute path="/caregiver" component={CaregiverPage} />
          <PrivateRoute path="/professional" component={HcpPage} />
          <PrivateRoute path="/patient" component={PatientPage} />
          <Route component={InvalidRoute} />
        </Switch>
      </AuthContextProvider>
    </Router>
  );
};

export default Yourloops;
