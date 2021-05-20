/**
 * Copyright (c) 2021, Diabeloop
 * A single notification component
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

import React from "react";
import _ from "lodash";
import { TFunction, useTranslation, Trans } from "react-i18next";
import moment from "moment-timezone";

import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import HelpIcon from "@material-ui/icons/Help";
import MedicalServiceIcon from "../../components/icons/MedicalServiceIcon";
import IconButton from "@material-ui/core/IconButton";
import { Button, createStyles, makeStyles } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

import { IUser, UserRoles } from "../../models/shoreline";
import { INotification, NotificationType } from "../../lib/notifications/models";
import { errorTextFromException, getUserFirstName, getUserLastName } from "../../lib/utils";
import { useNotification } from "../../lib/notifications/hook";
import { useTeam } from "../../lib/team/hook";
import { useSharedUser } from "../../lib/share";
import sendMetrics from "../../lib/metrics";
import { useAlert } from "../../components/utils/snackbar";

interface NotificationSpanProps {
  id: string;
  t: TFunction<"yourloops">;
  notification: INotification;
  className: string;
}

interface NotificationProps {
  notification: INotification;
  userRole: UserRoles;
  onHelp: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: { display: "flex", alignItems: "center", width: "100%" },
    rightSide: {
      width: "300px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    notificationSpan: { marginLeft: "1em", flex: "1" },
    button: { marginLeft: "1em" },
  })
);

const NotificationSpan = ({ t, notification, className, id }: NotificationSpanProps): JSX.Element => {
  const { creator, type } = notification;
  const firstName = getUserFirstName(creator as IUser);
  const lastName = getUserLastName(creator as IUser);
  const careteam = notification.target?.name ?? "";
  const values = { firstName, lastName, careteam };

  let notificationText: JSX.Element;
  switch (type) {
  case NotificationType.directInvitation:
    notificationText = (
      <Trans t={t} i18nKey="notification-caregiver-invitation-by-patient" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        <strong>{firstName} {lastName}</strong> wants to share their diabetes data with you.
      </Trans>
    );
    break;
  case NotificationType.careTeamProInvitation:
    notificationText = (
      <Trans t={t} i18nKey="notification-hcp-invitation-by-team" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        <strong>{firstName} {lastName}</strong> invites you to join <strong>{careteam}</strong>.
      </Trans>
    );
    break;
  case NotificationType.careTeamPatientInvitation:
    notificationText = (
      <Trans t={t} i18nKey="notification-patient-invitation-by-team" components={{ strong: <strong /> }} values={values} parent={React.Fragment}>
        You&apos;re invited to share your diabetes data with <strong>{careteam}</strong>.
      </Trans>
    );
    break;
  default:
    notificationText = <i>Invalid invitation type</i>;
  }

  return <span id={id} className={className}>{notificationText}</span>;
};

const NotificationIcon = ({ id, type }: { id: string; type: NotificationType; }): JSX.Element => {
  switch (type) {
  case NotificationType.directInvitation:
    return <PersonIcon id={id} />;
  case NotificationType.careTeamProInvitation:
    return <GroupIcon id={id} />;
  case NotificationType.careTeamPatientInvitation:
    return <MedicalServiceIcon id={id} />;
  default:
    return <GroupIcon id={id} />;
  }
};

const NotificationDate = ({ id, createdDate }: { id: string; createdDate: string }): JSX.Element => {
  const { t } = useTranslation("yourloops");
  // FIXME display at localtime ?
  const date = moment.utc(createdDate);
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
  const notifications = useNotification();
  const alert = useAlert();
  const teamHook = useTeam();
  const [_sharedUsersContext, sharedUsersDispatch] = useSharedUser(); // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
  const [inProgress, setInProgress] = React.useState(false);
  const classes = useStyles();
  const { notification } = props;
  const { id } = notification;

  const onAccept = async (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    setInProgress(true);
    try {
      await notifications.accept(notification);
      sendMetrics("accept-invitation", { type: notification.type });
      sharedUsersDispatch({ type: "reset" });
      if (_.isFunction(teamHook.refresh)) {
        teamHook.refresh(true);
      }
    } catch (reason: unknown) {
      const errorMessage = errorTextFromException(reason);
      alert.error(t(errorMessage));
      setInProgress(false);
    }
  };

  const onDecline = async (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    setInProgress(true);
    try {
      await notifications.decline(notification);
      sendMetrics("decline-invitation", { type: notification.type });
    } catch (reason: unknown) {
      const errorMessage = errorTextFromException(reason);
      alert.error(t(errorMessage));
      setInProgress(false);
    }
  };

  return (
    <div id={`notification-line-${id}`} className={classes.container}>
      <NotificationIcon id={`notification-icon-${id}`} type={notification.type} />
      <NotificationSpan id={`notification-text-${id}`} t={t} notification={notification} className={classes.notificationSpan} />
      <div className={classes.rightSide}>
        <NotificationDate createdDate={notification.date} id={id} />
        {props.userRole === UserRoles.caregiver && notification.type === NotificationType.careTeamProInvitation ? (
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
              className={classes.button}
              disabled={inProgress}
              onClick={onAccept}>
              {t("button-accept")}
            </Button>
          </div>
        )}
        <Button
          id={`notification-button-decline-${id}`}
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={inProgress}
          onClick={onDecline}>
          {t("button-decline")}
        </Button>
      </div>
    </div>
  );
};
