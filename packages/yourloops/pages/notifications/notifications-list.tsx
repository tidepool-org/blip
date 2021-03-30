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

import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { AppBar, Breadcrumbs, Container, createStyles, Link, List, ListItem, makeStyles, Toolbar } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

import HeaderBar from "../../components/header-bars/primary";
import { UserRoles } from "../../models/shoreline";
import { MS_IN_DAY } from "../../models/generic";
import { useAuth } from "../../lib/auth";
import { INotification, Notification, NotificationType } from "./notification";

const useStyles = makeStyles(() =>
  createStyles({
    homeIcon: {
      marginRight: "0.5em",
    },
    breadcrumbLink: {
      display: "flex",
    },
    toolBar: {
      display: "grid",
      gridTemplateRows: "auto",
      gridTemplateColumns: "auto auto auto",
      paddingLeft: "6em",
      paddingRight: "6em",
    },
  })
);

const NotificationHeader = () => {
  const { t } = useTranslation("yourloops");
  const historyHook = useHistory();
  const classes = useStyles();
  const { user } = useAuth();

  const handleClickHome = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    historyHook.push(`/${user?.role ?? ""}`);
  };

  return (
    <Fragment>
      <HeaderBar />
      <AppBar position="static" color="secondary">
        <Toolbar className={classes.toolBar}>
          <Breadcrumbs aria-label={t("aria-breadcrumbs")} separator={<NavigateNextIcon fontSize="small" />}>
            <Link className={classes.breadcrumbLink} color="textPrimary" onClick={handleClickHome}>
              <HomeIcon className={classes.homeIcon} />
              {t("home")}
            </Link>
            <div>{t("notifications")}</div>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>
    </Fragment>
  );
};

const sortNotification = (notifA: INotification, notifB: INotification): number =>
  Date.parse(notifB.date) - Date.parse(notifA.date);

export const NotificationsPage = (): JSX.Element => {
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
    <Fragment>
      <NotificationHeader />
      <Container maxWidth="lg" style={{ marginTop: "1em" }}>
        <List>
          {notifs.sort(sortNotification).map(({ date, emitter, type, target }, index) => (
            <ListItem key={index} style={{ padding: "8px 0" }} divider={index !== notifs.length - 1}>
              <Notification date={date} emitter={emitter} type={type} target={target} userRole={user?.role} />
            </ListItem>
          ))}
        </List>
      </Container>
    </Fragment>
  );
};
