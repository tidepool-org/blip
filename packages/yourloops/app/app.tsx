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

import * as React from 'react';
import { render as renderDOM } from "react-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import bows from 'bows';

import "@fontsource/roboto";
import "branding/theme-base.css";
import "branding/theme.css";

import { initI18n } from "../lib/language";

import { theme } from "../components/theme";
import LoginPage from '../pages/login';
import HcpPage from '../pages/hcp';
import PatientPage from "../pages/patient";
import RequestPasswordReset from '../pages/request-passord-reset';
import { AuthProvider } from '../lib/auth/hook/use-auth';
import PrivateRoute from '../components/private-route';

class Yourloops {
  private log: Console;

  constructor() {
    this.log = bows("Yourloops");
  }

  public async init(): Promise<void> {
    this.log.info("Init");

    await initI18n();
    this.log.debug("i18next initialized");
  }

  public render(): void {
    const router = this.router();
    let div = document.getElementById("app");
    if (div === null) {
      div = document.createElement("div");
      div.id = "app";
      document.body.appendChild(div);
    }
    renderDOM(router, div);
  }

  private router(): JSX.Element {
    return (
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Switch>
              <Route exact path="/" component={LoginPage} />
              <Route path="/request-password-reset" component={RequestPasswordReset} />
              <PrivateRoute path="/hcp" component={HcpPage} />
              <PrivateRoute path="/patient" component={PatientPage} />
            </Switch>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    );
  }
}

export default Yourloops;
