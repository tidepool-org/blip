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
import { Route, RouteComponentProps } from "react-router-dom";
import bows from 'bows';

import PatientNavBar from '../../components/patient-nav-bar';
// import PatientListPage from './patients-list';
import PatientDataPage from './patient-data';

/**
 * Patient page
 */
function PatientPage(props: RouteComponentProps) : JSX.Element | null {
  const log = bows("Patient Page");
  log.info("Patient page", props.history.location.pathname);
  if (props.history.location.pathname === "/patient") {
    log.info("Redirecting to the patients list", props);
    props.history.push("/patient/data");
    return null;
  }
  // log.info("Current path:", props.path);
  return (
    <div>
      <PatientNavBar />

      <Route path="/patient/data" component={PatientDataPage} />

    </div>
  );
}
export default PatientPage;
