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

import { TeamContextProvider } from "../../lib/team";
import { DataContextProvider, DefaultDataContext } from "../../lib/data";
import HcpNavBar from "../../components/hcp-nav-bar";
import PatientListPage from "./patients-list";
import PatientDataPage from "./patient-data";
import TeamsPage from "./teams-page";

const log = bows("HcpPage");

/**
 * Health care professional page
 */
function HcpPage(): JSX.Element | null {
  const historyHook = useHistory();
  const pathname = historyHook.location.pathname;

  React.useEffect(() => {
    if (/^\/hcp\/?$/.test(pathname)) {
      log.info("Redirecting to the patients list");
      historyHook.push("/hcp/patients");
    }
  }, [pathname, historyHook]);

  log.info("render", pathname);

  return (
    <TeamContextProvider>
      <HcpNavBar />
      <Switch>
        <Route path="/hcp/patients" component={PatientListPage} />
        <Route path="/hcp/teams" component={TeamsPage} />
        <DataContextProvider context={DefaultDataContext}>
          <Route path="/hcp/patient/:patientId" component={PatientDataPage} />
        </DataContextProvider>
      </Switch>
    </TeamContextProvider>
  );
}

export default HcpPage;
