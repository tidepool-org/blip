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

import React from "react";
import { useTranslation } from "react-i18next";

import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import SecondaryHeaderBar from "./secondary-bar";
import SwitchRoleConsequencesDialog from "../../components/switch-role/switch-role-consequences-dialog";
import SwitchRoleConsentDialog from "../../components/switch-role/switch-role-consent-dialog";
import SwitchRoleToHcpSteps from "../../components/switch-role/switch-role-to-hcp-steps";
import { Notification } from "./notification";
import { AlertSeverity, useSnackbar } from "../../lib/useSnackbar";
import sendMetrics from "../../lib/metrics";
import { INotification } from "../../lib/notifications/models";
import { useAuth } from "../../lib/auth";
import { useNotification } from "../../lib/notifications/hook";
import { errorTextFromException } from "../../lib/utils";
import { Snackbar } from "../../components/utils/snackbar";

interface NotificationsPageProps {
  defaultURL: string;
}

const useStyles = makeStyles((theme: Theme) =>
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
    typography: {
      textAlign: "center",
      margin: theme.spacing(4),
    },
  })
);

const sortNotification = (notifA: INotification, notifB: INotification): number =>
  Date.parse(notifB.created) - Date.parse(notifA.created);

export const NotificationsPage = (props: NotificationsPageProps): JSX.Element => {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();
  const { user, switchRoleToHCP } = useAuth();
  const notifications = useNotification();
  const { openSnackbar, snackbarParams } = useSnackbar();
  const [notifs, setNotifs] = React.useState<INotification[]>([]);
  const [switchRoleStep, setSwitchRoleStep] = React.useState<SwitchRoleToHcpSteps>(
    SwitchRoleToHcpSteps.none
  );

  React.useEffect(() => {
    const loadNotifs = async () => {
      console.log("enter in useEffect");
      let results: INotification[];
      try {
        results = await notifications.getPendingInvitations(user?.userid);
        results.sort(sortNotification);
        setNotifs(results);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        const message = t(errorMessage);
        openSnackbar({ message, severity: AlertSeverity.error });
      }
    };

    loadNotifs();
  }, [notifications, user, t, openSnackbar]);

  function handleRemove(id: string): void {
    const newList = notifs.filter((item) => item.id !== id);
    setNotifs(newList);
  }

  const handleSwitchRoleToConsequences = (): void => {
    sendMetrics("user-switch-role", {
      from: user?.role,
      to: "hcp",
      step: SwitchRoleToHcpSteps.consequences,
    });
    setSwitchRoleStep(SwitchRoleToHcpSteps.consequences);
  };

  const handleSwitchRoleToConditions = (accept: boolean): void => {
    sendMetrics("user-switch-role", {
      from: user?.role,
      to: "hcp",
      step: SwitchRoleToHcpSteps.consent,
      cancel: !accept,
    });
    if (accept) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.consent);
    } else {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  };

  const handleSwitchRoleToUpdate = (accept: boolean): void => {
    sendMetrics("user-switch-role", {
      from: user?.role,
      to: "hcp",
      step: SwitchRoleToHcpSteps.update,
      cancel: !accept,
    });
    if (accept) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.update);

      switchRoleToHCP()
        .then(() => {
          sendMetrics("user-switch-role", {
            from: user?.role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: true,
          });
        })
        .catch((reason: unknown) => {
          openSnackbar({ message: t("modal-switch-hcp-failure"), severity: AlertSeverity.error });
          sendMetrics("user-switch-role", {
            from: user?.role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: false,
            error: errorTextFromException(reason),
          });
        });
    } else {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  };

  return (
    <React.Fragment>
      <SecondaryHeaderBar defaultURL={props.defaultURL} />
      <Snackbar params={snackbarParams} />
      <Container maxWidth="lg" style={{ marginTop: "1em" }}>
        <List>
          {notifs.length > 0 ? (
            notifs.map(({ id, created, creator, type, target }, index) => (
              <ListItem
                key={index}
                style={{ padding: "8px 0" }}
                divider={index !== notifs.length - 1}>
                <Notification
                  id={id}
                  created={created}
                  creator={creator}
                  type={type}
                  target={target}
                  // eslint-disable-next-line jsx-a11y/aria-role
                  role={user?.role}
                  onRemove={handleRemove}
                  onHelp={handleSwitchRoleToConsequences}
                />
              </ListItem>
            ))
          ) : (
            <Typography
              className={classes.typography}
              id="typography-no-pending-invitation-message"
              variant="body2"
              gutterBottom>
              {t("notification-no-pending-invitation")}
            </Typography>
          )}
        </List>
        <SwitchRoleConsequencesDialog
          title="modal-switch-hcp-team-title-from-notification"
          open={switchRoleStep === SwitchRoleToHcpSteps.consequences}
          onResult={handleSwitchRoleToConditions}
        />
        <SwitchRoleConsentDialog
          open={switchRoleStep === SwitchRoleToHcpSteps.consent}
          onResult={handleSwitchRoleToUpdate}
        />
      </Container>
    </React.Fragment>
  );
};
