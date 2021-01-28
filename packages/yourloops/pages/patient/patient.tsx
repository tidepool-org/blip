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
import { Route, RouteComponentProps } from "react-router-dom";
import bows from "bows";

import PatientNavBar from "../../components/patient-nav-bar";
// import PatientListPage from './patients-list';
import PatientDataPage from "./patient-data";

/**
 * Patient page
 */
function PatientPage(props: RouteComponentProps): JSX.Element | null {
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
