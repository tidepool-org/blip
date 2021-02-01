/**
 * Copyright (c) 2021, Diabeloop
 * Display patient data
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
import { RouteComponentProps } from "react-router-dom";
import bows from "bows";

import Blip from "blip";

import appConfig from "../../lib/config";
import apiClient from "../../lib/auth/api";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PatientDataState {}

class PatientDataPage extends React.Component<RouteComponentProps, PatientDataState> {
  private log: Console;

  constructor(props: RouteComponentProps) {
    super(props);

    this.log = bows("PatientData");

    this.state = {
      user: null,
    };
  }

  public componentDidMount(): void {
    this.log.debug("Mounted");

    if (apiClient.isLoggedIn) {
      const user = apiClient.whoami;
      const userId = user?.userid as string;
      this.log.debug("Loading patient data", userId);
      apiClient.loadPatientData(userId).catch((reason: unknown) => {
        this.log.error(reason);
      });
    } else {
      this.log.error("Not logged-in");
    }
  }

  public render(): JSX.Element {
    this.log.debug("render");
    return (
      <div id="patient-data" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Blip config={appConfig} api={apiClient} />
      </div>
    );
  }
}

export default PatientDataPage;
