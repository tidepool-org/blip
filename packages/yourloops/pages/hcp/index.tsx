/**
 * Copyright (c) 2021, Diabeloop
 * HCPs main page
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

import { UserRoles } from "../../models/shoreline";
import { useAuth } from "../../lib/auth";
import { TeamContextProvider } from "../../lib/team";
import { DataContextProvider, DefaultDataContext } from "../../lib/data";
import PatientDataPage from "../../components/patient-data";
import InvalidRoute from "../../components/invalid-route";
import ProfilePage from "../profile";
import NotificationsPage from "../notifications";
import PrimaryNavBar from "./primary-nav-bar";
import PatientListPage from "./patients/page";
import TeamsPage from "./teams-page";

const defaultURL = "/professional/patients";
const log = bows("HcpPage");

/**
 * Health care professional page
 */
function HcpPage(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const historyHook = useHistory();
  const authHook = useAuth();

  const user = authHook.user;

  if (user === null) {
    throw new Error("User must be looged-in");
  }

  React.useEffect(() => {
    const { pathname } = historyHook.location;
    if (user.role !== UserRoles.hcp) {
      // Only allow hcp for this route
      document.title = t("brand-name");
      log.info("Wrong page for current user");
      historyHook.replace(user.getHomePage());
    } else if (/^\/professional\/?$/.test(pathname)) {
      log.info("Redirecting to the patients list");
      historyHook.replace(defaultURL);
    }
  }, [historyHook, user, t]);

  return (
    <TeamContextProvider>
      <PrimaryNavBar />
      <Switch>
        <Route path={defaultURL} component={PatientListPage} />
        <Route path="/professional/teams" component={TeamsPage} />
        <Route path="/professional/preferences" exact={true} component={() => <ProfilePage defaultURL={defaultURL} />} />
        <Route path="/professional/notifications" exact={true} component={() => <NotificationsPage defaultURL={defaultURL} />} />
        <DataContextProvider context={DefaultDataContext}>
          <Route path="/professional/patient/:patientId">
            <PatientDataPage prefixURL="/professional/patient" />
          </Route>
        </DataContextProvider>
        <Route path="/professional" exact={true} />
        <Route>
          <InvalidRoute defaultURL={defaultURL} />
        </Route>
      </Switch>
    </TeamContextProvider>
  );
}

export default HcpPage;
