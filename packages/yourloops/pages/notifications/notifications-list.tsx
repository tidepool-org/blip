/**
 * Copyright (c) 2020, Diabeloop
 * Notifications page
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

import * as React from "react";

import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import { UserRoles } from "../../models/shoreline";
import { MS_IN_DAY } from "../../models/generic";
import { useAuth } from "../../lib/auth";
import SecondaryHeaderBar from "./secondary-bar";
import { INotification, Notification, NotificationType } from "./notification";

interface NotificationsPageProps {
  defaultURL: string;
}

const sortNotification = (notifA: INotification, notifB: INotification): number =>
  Date.parse(notifB.date) - Date.parse(notifA.date);

export const NotificationsPage = (props: NotificationsPageProps): JSX.Element => {
  const { user } = useAuth();

  const fakeNotif1: INotification = {
    date: new Date().toISOString(),
    emitter: { firstName: "Jean", lastName: "Dujardin", role: UserRoles.hcp },
    type: NotificationType.joinGroup,
    target: "Service de Diabétologie CH Angers",
  };
  const fakeNotif2: INotification = {
    date: "2021-02-18T10:00:00",
    emitter: { firstName: "Jeanne", lastName: "Dubois", role: UserRoles.patient },
    type: NotificationType.dataShare,
  };
  const fakeNotif3: INotification = {
    date: new Date(Date.now() - MS_IN_DAY).toISOString(), // yesterday date
    emitter: { firstName: "Bob", lastName: "L'Eponge", role: UserRoles.hcp },
    type: NotificationType.joinGroup,
    target: "Crabe croustillant",
  };
  const notifs: INotification[] = [fakeNotif1, fakeNotif2, fakeNotif3];

  return (
    <React.Fragment>
      <SecondaryHeaderBar defaultURL={props.defaultURL} />
      <Container maxWidth="lg" style={{ marginTop: "1em" }}>
        <List>
          {notifs.sort(sortNotification).map(({ date, emitter, type, target }, index) => (
            <ListItem key={index} style={{ padding: "8px 0" }} divider={index !== notifs.length - 1}>
              <Notification date={date} emitter={emitter} type={type} target={target} userRole={user?.role} />
            </ListItem>
          ))}
        </List>
      </Container>
    </React.Fragment>
  );
};
