/**
 * Copyright (c) 2021, Diabeloop
 * Patient main page
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
import { Router, RouteComponentProps, globalHistory } from "@reach/router";
import bows from 'bows';

import PatientNavBar from '../../components/patient-nav-bar';
// import PatientListPage from './patients-list';
import PatientDataPage from './patient-data';

/**
 * Patient page
 */
function PatientPage(props: RouteComponentProps) : JSX.Element | null {
  const log = bows("Patient Page");
  log.info("Patient page", globalHistory.location.pathname);
  if (globalHistory.location.pathname === "/patient") {
    log.info("Redirecting to the patients list", props);
    globalHistory.navigate("/patient/data");
    return null;
  }
  // log.info("Current path:", props.path);
  return (
    <div>
      <PatientNavBar />

      <Router >
        <PatientDataPage path="data" />
      </Router>
    </div>
  );
}
export default PatientPage;
