/**
 * Copyright (c) 2020, Diabeloop
 * HCPs patient data page
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
import { RouteComponentProps } from "@reach/router";
import bows from 'bows';

import Blip from "blip";

import appConfig from "../../lib/config";
import apiClient from "../../lib/api";
// import { User } from "../../models/shoreline";
// import { t } from "../../lib/language";

interface PatientDataProps extends RouteComponentProps {
  patientId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PatientDataState {
}

class PatientDataPage extends React.Component<PatientDataProps, PatientDataState> {
  private log: Console;

  constructor(props: PatientDataProps) {
    super(props);

    this.log = bows("HCPPatientData");

    this.state = {
      user: null,
    };
  }

  public componentDidMount(): void {
    const { patientId } = this.props;

    this.log.debug("Mounted");

    if (typeof patientId === "string") {
      apiClient.loadPatientData(patientId).catch((reason: unknown) => {
        this.log.error(reason);
      });
    } else {
      this.log.error('Invalid patientId', patientId, this.props);
    }
  }

  public render(): JSX.Element {
    return (
      <div id="patient-data" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Blip config={appConfig} api={apiClient} />
      </div>
    );
  }
}

export default PatientDataPage;
