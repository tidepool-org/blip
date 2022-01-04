/**
 * Copyright (c) 2021, Diabeloop
 * API calls to hydrophone
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

import bows from "bows";

import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";
import HttpStatus from "../http-status-codes";
import appConfig from "../config";
import { Session } from "../auth/models";
import { errorFromHttpStatus } from "../utils";

import { INotificationAPI } from "../../models/notification";
import { INotification, NotificationAPI, NotificationType } from "./models";
import { notificationConversion } from "./utils";

const log = bows("Notification API");

async function getInvitations(session: Readonly<Session>, url: URL): Promise<INotification[]> {
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
      [HttpHeaderKeys.traceToken]: session.traceToken,
    },
    cache: "no-cache",
  });

  if (response.ok) {
    const notificationsFromAPI = await response.json() as INotificationAPI[];
    if (Array.isArray(notificationsFromAPI)) {
      // TODO remove me when all notifications types are supported
      const notifications: INotification[] = [];
      for (const nfa of notificationsFromAPI) {
        const notification = notificationConversion(nfa);
        if (notification) {
          notifications.push(notification);
        }
      }
      return notifications;
      // END TODO
      // return notificationsFromAPI.map(notificationConversion);
    }
    return Promise.reject(new Error("Invalid response from API"));
  } else if (response.status === HttpStatus.StatusNotFound) {
    log.info("No new notification for the current user");
    return Promise.resolve([]);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

/**
 * Get a notifications for the current user.
 * @param {Readonly<Session>} auth Generally an email
 * @return {Promise<INotification[]>} Return the logged-in user or a promise rejection.
 */
function getReceivedInvitations(session: Readonly<Session>): Promise<INotification[]> {
  const confirmURL = new URL(`/confirm/invitations/${session.user.userid}`, appConfig.API_HOST);
  return getInvitations(session, confirmURL);
}

/**
 * Get a notifications for the current user.
 * @param {Readonly<Session>} auth Generally an email
 * @return {Promise<INotification[]>} Return the logged-in user or a promise rejection.
 */
function getSentInvitations(session: Readonly<Session>): Promise<INotification[]> {
  const confirmURL = new URL(`/confirm/invite/${session.user.userid}`, appConfig.API_HOST);
  return getInvitations(session, confirmURL);
}

async function updateInvitation(session: Readonly<Session>, url: URL, key: string): Promise<void> {
  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
      [HttpHeaderKeys.traceToken]: session.traceToken,
    },
    cache: "no-cache",
    body: JSON.stringify({ key }),
  });

  if (response.ok) {
    log.info("updateInvitation response:", await response.text());
    return Promise.resolve();
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

function acceptInvitation(session: Readonly<Session>, notification: INotification): Promise<void> {
  let confirmURL: URL;
  switch (notification.type) {
  case NotificationType.directInvitation:
    confirmURL = new URL(`/confirm/accept/invite/${session.user.userid}/${notification.creatorId}`, appConfig.API_HOST);
    return updateInvitation(session, confirmURL, notification.id);
  case NotificationType.careTeamProInvitation:
  case NotificationType.careTeamPatientInvitation:
    confirmURL = new URL("/confirm/accept/team/invite", appConfig.API_HOST);
    return updateInvitation(session, confirmURL, notification.id);
  default:
    log.info("TODO accept", notification);
    return Promise.reject(new Error(`Unknown notification ${notification.type}`));
  }
}

function declineInvitation(session: Readonly<Session>, notification: INotification): Promise<void> {
  let confirmURL: URL;
  switch (notification.type) {
  case NotificationType.directInvitation:
    confirmURL = new URL(`/confirm/dismiss/invite/${session.user.userid}/${notification.creatorId}`, appConfig.API_HOST);
    return updateInvitation(session, confirmURL, notification.id);
  case NotificationType.careTeamProInvitation:
  case NotificationType.careTeamPatientInvitation:
  {
    const teamId = notification.target?.id;
    if (typeof teamId !== "string") {
      return Promise.reject(new Error("Invalid target team id"));
    }
    confirmURL = new URL(`/confirm/dismiss/team/invite/${teamId}`, appConfig.API_HOST);
    return updateInvitation(session, confirmURL, notification.id);
  }
  default:
    log.info("TODO accept", notification);
    return Promise.reject(new Error(`Unknown notification ${notification.type}`));
  }
}

async function cancelInvitation(session: Readonly<Session>, notification: INotification): Promise<void> {
  const confirmURL = new URL("/confirm/cancel/invite", appConfig.API_HOST);
  const body: Partial<INotificationAPI> = {
    key: notification.id,
  };

  let id: string | undefined;
  switch (notification.type) {
  case NotificationType.careTeamProInvitation:
  case NotificationType.careTeamPatientInvitation:
    id = notification.target?.id;
    if (typeof id !== "string") {
      throw new Error("Missing or invalid team ID in notification");
    }
    body.target = notification.target;
    break;
  case NotificationType.directInvitation:
    body.email = notification.email;
    break;
  default:
    throw new Error("Invalid notification type");
  }

  const response = await fetch(confirmURL.toString(), {
    method: "POST",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
      [HttpHeaderKeys.traceToken]: session.traceToken,
    },
    cache: "no-cache",
    body: JSON.stringify(body),
  });

  if (response.ok || response.status === 404) {
    log.info("cancelInvitation response:", await response.text());
    return Promise.resolve();
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

const notificationAPI: NotificationAPI = {
  getReceivedInvitations,
  getSentInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
export default notificationAPI;
