/**
 * Copyright (c) 2021, Diabeloop
 * Patient main page
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
import { Route, Switch, useHistory } from "react-router-dom";
import bows from "bows";
import { useTranslation } from "react-i18next";

import { TeamContextProvider } from "../../lib/team";
import { DataContextProvider, DefaultDataContext } from "../../lib/data";

import { UserRoles } from "../../models/shoreline";
import { useAuth } from "../../lib/auth";
import PatientDataPage from "../../components/patient-data";
import InvalidRoute from "../../components/invalid-route";
import ProfilePage from "../profile";
import NotificationsPage from "../notifications";
import PrimaryNavBar from "./primary-nav-bar";
import CaregiversPage from "./caregivers/page";
import TeamsPage from "./teams/page";

const log = bows("PatientPage");

/**
 * Patient page
 */
function PatientPage(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const historyHook = useHistory();
  const { pathname } = historyHook.location;
  const { user } = useAuth();

  if (user === null) {
    throw new Error("User not logged-in");
  }

  const prefixURL = React.useMemo(() => user.getHomePage(), [user]);
  const defaultURL = `${prefixURL}/data`;

  React.useEffect(() => {
    if (user.role !== UserRoles.patient) {
      // Only allow patient for this route
      document.title = t("brand-name");
      log.info("Wrong page for current user");
      historyHook.replace(prefixURL);
    } else if (new RegExp(`^${prefixURL}/?$`).test(pathname)) {
      log.info(`Redirecting to ${defaultURL}`);
      historyHook.replace(defaultURL);
    }
  }, [pathname, historyHook, prefixURL, defaultURL, user, t]);

  return (
    <TeamContextProvider>
      <DataContextProvider context={DefaultDataContext}>
        <PrimaryNavBar prefixURL={prefixURL} />
        <Switch>
          <Route path={defaultURL}>
            <PatientDataPage prefixURL={defaultURL} />
          </Route>
          <Route exact={true} path={`${prefixURL}/caregivers`}>
            <CaregiversPage defaultURL={defaultURL} />
          </Route>
          <Route exact={true} path={`${prefixURL}/teams`}>
            <TeamsPage defaultURL={defaultURL} />
          </Route>
          <Route exact={true} path={`${prefixURL}/preferences`}>
            <ProfilePage defaultURL={defaultURL} />
          </Route>
          <Route exact={true} path={`${prefixURL}/notifications`}>
            <NotificationsPage defaultURL={defaultURL} />
          </Route>
          <Route path={prefixURL} exact={true} />
          <Route>
            <InvalidRoute defaultURL={defaultURL} />
          </Route>
        </Switch>
      </DataContextProvider>
    </TeamContextProvider>
  );
}

export default PatientPage;
