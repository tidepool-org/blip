/**
 * Copyright (c) 2020, Diabeloop
 * Patient data page
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
import { RouteComponentProps, withRouter } from "react-router-dom";
import bows from 'bows';

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// import Button from '@material-ui/core/Button';
// import AddCircle from '@material-ui/icons/AddCircle';

import { User } from "../../models/shoreline";
import appConfig from "../../lib/config";
import appApi, { apiClient } from "../../lib/api";
// import { t } from "../../lib/language";
import Blip from "blip";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PatientDataProps extends RouteComponentProps {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PatientDataState {
  users: User[] | null;
}

interface PatientListProps {
  users: User[];
  onClickPatient: (user: User) => void;
}


function PatientsList(props: PatientListProps): JSX.Element {
  const items: JSX.Element[] = [];
  const { users, onClickPatient } = props;
  for (const user of users) {
    const userName = user.profile?.fullName ?? user.username;
    const onClick = () => {
      onClickPatient(user);
    };
    items.push((
      <ListItem
        button={true}
        key={user.userid}
        onClick={onClick}
      >
        <ListItemText primary={userName} />
      </ListItem>
    ));
  }

  return <List style={{ overflow: "scroll" }}>{items}</List>;
}

class PatientData extends React.Component<PatientDataProps, PatientDataState> {
  private log: Console;

  constructor(props: PatientDataProps) {
    super(props);

    this.log = bows("PatientData");

    this.state = {
      users: null,
    };

    this.onSelectPatient = this.onSelectPatient.bind(this);
  }

  public componentDidMount(): void {
    apiClient.getUserShares().then((users: User[]) => {
      this.setState({ users });
    }).catch((reason: unknown) => {
      this.log.error(reason);
    });
  }

  public render(): JSX.Element {
    const { users } = this.state;
    let listPatients: JSX.Element | null = null;

    if (users !== null) {
      listPatients = <PatientsList users={users} onClickPatient={this.onSelectPatient} />;
    }

    return (
      <div id="patient-data" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "row", flexGrow: 1, overflowY: "scroll" }}>
          {listPatients}
          <Blip config={appConfig} api={appApi} />
        </div>
      </div>
    );
  }

  private onSelectPatient(user: User): void {
    this.log.info('Click on', user);
    apiClient.loadPatientData(user.userid).catch((reason: unknown) => {
      this.log.error(reason);
    });
  }

}

export default withRouter(PatientData);
