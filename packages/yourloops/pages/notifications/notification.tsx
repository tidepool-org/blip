/**
 * Copyright (c) 2020, Diabeloop
 * Notification component
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
import { TFunction, useTranslation, Trans } from "react-i18next";
import moment from "moment-timezone";

import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import HelpIcon from "@material-ui/icons/Help";
import MedicalServiceIcon from "../../components/icons/MedicalServiceIcon";
import IconButton from "@material-ui/core/IconButton";
import { Button, createStyles, makeStyles } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

import { User, UserRoles } from "../../models/shoreline";
import { INotification, NotificationType } from "../../lib/notifications/models";
import { errorTextFromException, getUserFirstName, getUserLastName } from "../../lib/utils";
import { useNotification } from "../../lib/notifications/hook";
import { AlertSeverity, useSnackbar } from "../../lib/useSnackbar";
import { Snackbar } from "../../components/utils/snackbar";

type NotificationProps = INotification & {
  role: UserRoles | undefined;
  onRemove: (id: string) => void;
  onHelp: () => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    container: { display: "flex", alignItems: "center", width: "100%" },
    rightSide: {
      width: "300px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    notification: { marginLeft: "1em", flex: "1" },
    button: { marginLeft: "1em" },
  })
);

const NotificationSpan = ({ t, notification, className }: { t: TFunction<"yourloops">; notification: INotification; className: string; }): JSX.Element => {
  const { id, type, creator, target } = notification;
  // "notification-patient-invitation-by-team": "You're invited to share your diabetes data with <strong>{{careteam}}</strong>.",
  // "notification-patient-invitation-by-caregiver": "You're invited to share your diabetes data with <strong>{{firstName}} {{lastName}}</strong>.",
  // "notification-hcp-invitation-by-team": "<strong>{{firstName}} {{lastName}}</strong> invites you to join {{careteam}}.",
  // "notification-caregiver-invitation-by-patient": "<strong>{{firstName}} {{lastName}}</strong> wants to share their diabetes data with you.",
  // "notification-team-invitation-by-patient": "<strong>{{firstName}} {{lastName}}</strong> now shares their diabetes data with <strong>{{careteam}}</strong>.",
  const firstName = getUserFirstName(creator as User);
  const lastName = getUserLastName(creator as User);
  const careteam = target?.name ?? "";
  const values = { firstName, lastName, careteam };

  let notificationText: JSX.Element;
  switch (type) {
  case NotificationType.directshare:
    notificationText = (
      <Trans t={t} i18nKey="notification-caregiver-invitation-by-patient" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        <strong>{firstName} {lastName}</strong> wants to share their diabetes data with you.
      </Trans>
    );
    break;
  case NotificationType.careteam:
    notificationText = (
      <Trans t={t} i18nKey="notification-hcp-invitation-by-team" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        <strong>{firstName} {lastName}</strong> invites you to join <strong>{careteam}</strong>.
      </Trans>
    );
    break;
  case NotificationType.careteamPatient:
    notificationText = (
      <Trans t={t} i18nKey="notification-patient-invitation-by-team" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        You’re invited to share your diabetes data with <strong>{careteam}</strong>.
      </Trans>
    );
    break;
  default:
    notificationText = <i>Invalid invitation type</i>;
  }

  return <span id={`notification-text-${id}`} className={className}>{notificationText}</span>;
};

const NotificationIcon = ({ type, id }: { type: NotificationType; id: string; }): JSX.Element => {
  switch (type) {
  case NotificationType.directshare:
    return <PersonIcon id={id} />;
  case NotificationType.careteam:
    return <GroupIcon id={id} />;
  case NotificationType.careteamPatient:
    return <MedicalServiceIcon id={id} />;
  default:
    return <GroupIcon id={id} />;
  }
};

const getDate = (emittedDate: string, id: string, t: TFunction<"yourloops">): JSX.Element => {
  // FIXME display at localtime ?
  const date = moment.utc(emittedDate);
  const diff = moment.utc().diff(date, "days");
  const tooltip = date.format("LT");
  const ariaLabel = date.format("LLLL");

  let display: string;
  if (diff === 0) {
    display = t("today");
  } else if (diff === 1) {
    display = t("yesterday");
  } else {
    display = date.format("L");
  }

  return (
    <Tooltip title={tooltip} aria-label={ariaLabel} placement="bottom">
      <div id={`notification-date-${id}`}>{display}</div>
    </Tooltip>
  );
};

export const Notification = (props: NotificationProps): JSX.Element => {
  const { t } = useTranslation("yourloops");
  const { id, created, creator, type, target, onRemove } = props;
  const notifications = useNotification();
  const { openSnackbar, snackbarParams } = useSnackbar();
  const [inProgress, setInProgress] = React.useState(false);
  const { container, notification, rightSide, button } = useStyles();

  const onAccept = async (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    // submit to api
    try {
      setInProgress(true);
      await notifications.accept(id, creator.userid, target?.id, type);
      onRemove(id);
    } catch (reason: unknown) {
      const errorMessage = errorTextFromException(reason);
      const message = t(errorMessage);
      openSnackbar({ message, severity: AlertSeverity.error });
    }
    setInProgress(false);
  };

  const onDecline = async (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    // submit to api
    try {
      setInProgress(true);
      await notifications.decline(id, creator.userid, target?.id, type);
      onRemove(id);
    } catch (reason: unknown) {
      const errorMessage = errorTextFromException(reason);
      const message = t(errorMessage);
      openSnackbar({ message, severity: AlertSeverity.error });
    }
    setInProgress(false);
  };

  return (
    <div id={`notification-line-${id}`} className={container}>
      <Snackbar params={snackbarParams} />
      <NotificationIcon id={`notification-icon-${id}`} type={type} />
      <NotificationSpan t={t} notification={props} className={notification} />
      <div className={rightSide}>
        {getDate(created, id, t)}
        {props.role === UserRoles.caregiver && type === NotificationType.careteam ? (
          <IconButton
            size="medium"
            color="primary"
            aria-label="notification-help-button"
            onClick={props.onHelp}>
            <HelpIcon id={`notification-help-${id}`} />
          </IconButton>
        ) : (
          <div>
            <Button
              id={`notification-button-accept-${id}`}
              color="primary"
              variant="contained"
              className={button}
              disabled={inProgress}
              onClick={onAccept}>
              {t("accept")}
            </Button>
          </div>
        )}
        <Button
          id={`notification-button-decline-${id}`}
          className={button}
          variant="contained"
          color="secondary"
          disabled={inProgress}
          onClick={onDecline}>
          {t("decline")}
        </Button>
      </div>
    </div>
  );
};
