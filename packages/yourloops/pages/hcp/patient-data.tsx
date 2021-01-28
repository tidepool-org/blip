/**
 * Copyright (c) 2021, Diabeloop
 * HCPs patient data page
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

import Container from "@material-ui/core/Container";

import Blip from "blip";

import appConfig from "../../lib/config";
import apiClient from "../../lib/auth/api";

interface PatientDataProps {
  patientId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PatientDataState {}

class PatientDataPage extends React.Component<RouteComponentProps<PatientDataProps>, PatientDataState> {
  private log: Console;

  constructor(props: PatientDataProps) {
    super(props as RouteComponentProps);

    this.log = bows("HCPPatientData");

    this.state = {
      user: null,
    };
  }

  public componentDidMount(): void {
    const { patientId } = this.props.match.params;

    this.log.debug("Mounted", this.props.match.params.patientId);

    if (typeof patientId === "string") {
      this.refresh(patientId).catch((reason: unknown) => {
        this.log.error(reason);
      });
    } else {
      this.log.error("Invalid patientId", patientId, this.props);
    }
  }

  public render(): JSX.Element {
    return (
      <Container maxWidth="lg">
        <Blip config={appConfig} api={apiClient} />
      </Container>
    );
  }

  private async refresh(patientId: string): Promise<void> {
    if (!apiClient.havePatientsShare) {
      await apiClient.getUserShares();
    }
    await apiClient.loadPatientData(patientId);
  }
}

export default PatientDataPage;
