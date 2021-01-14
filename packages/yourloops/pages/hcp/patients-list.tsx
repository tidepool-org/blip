/**
 * Copyright (c) 2021, Diabeloop
 * Patient list for HCPs
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
import { RouteComponentProps, globalHistory } from "@reach/router";
import bows from 'bows';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import apiClient from "../../lib/api";
import { User } from "../../models/shoreline";

interface PatientListProps {
  patients: User[];
  onClickPatient: (user: User) => void;
}

interface PatientListPageState {
  patients: null | User[];
}

function PatientsList(props: PatientListProps): JSX.Element {
  const items: JSX.Element[] = [];
  const { patients, onClickPatient } = props;
  for (const user of patients) {
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

class PatientListPage extends React.Component<RouteComponentProps, PatientListPageState> {
  private log: Console;

  constructor(props: RouteComponentProps) {
    super(props);

    this.log = bows("PatientListPage");

    this.state = {
      patients: null,
    };

    this.onSelectPatient = this.onSelectPatient.bind(this);
  }

  public componentDidMount(): void {
    this.log.debug("Mounted");

    apiClient.getUserShares().then((patients: User[]) => {
      this.setState({ patients });
    }).catch((reason: unknown) => {
      this.log.error(reason);
    });
  }

  render(): JSX.Element | null {
    const { patients } = this.state;
    let listPatients: JSX.Element | null = null;

    if (patients !== null) {
      listPatients = <PatientsList patients={patients} onClickPatient={this.onSelectPatient} />;
    }
    return listPatients;
  }

  private onSelectPatient(user: User): void {
    this.log.info('Click on', user);
    globalHistory.navigate(`/hcp/patient/${user.userid}`);
  }
}

export default PatientListPage;
