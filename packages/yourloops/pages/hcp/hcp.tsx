/**
 * Copyright (c) 2021, Diabeloop
 * HCPs main page
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

import * as React from 'react';
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import bows from 'bows';

import HcpNavBar from '../../components/hcp-nav-bar';
import PatientListPage from './patients-list';
import PatientDataPage from './patient-data';

/**
 * Health care professional page
 */
function HcpPage(props: RouteComponentProps) : JSX.Element | null {
  const log = bows("HCP Page");
  log.info("in HCP page ", props.history.location);
  if (props.history.location.pathname === "/hcp") {
    log.info("Redirecting to the patients list", props);
    props.history.push("/hcp/patients");
    return null;
  }
  // log.info("Current path:", props.path);
  return (
    <div>
      <HcpNavBar />
      
      <Switch>
        <Route path="/hcp/patients" component={PatientListPage} />
        <Route path="/hcp/patient/:patientId" component={PatientDataPage} />
      </Switch>
      
    </div>
  );
}
export default HcpPage;
