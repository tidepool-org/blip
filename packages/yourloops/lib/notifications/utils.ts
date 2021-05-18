/**
 * Copyright (c) 2021, Diabeloop
 * Utilities for notifications hook
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

import { INotificationAPI, APINotificationType } from "../../models/notification";
import { INotification, NotificationType } from "./models";

/**
 * Convert an API notification to our model
 * @param apin API Notification
 */
export function notificationConversion(apin: INotificationAPI): INotification | null {
  let type: NotificationType;
  switch (apin.type) {
  case APINotificationType.careTeamInvitation:
    type = NotificationType.directInvitation;
    break;
  case APINotificationType.medicalTeamPatientInvitation:
    type = NotificationType.careTeamPatientInvitation;
    break;
  case APINotificationType.medicalTeamProInvitation:
    type = NotificationType.careTeamProInvitation;
    break;
  case APINotificationType.medicalTeamDoAdmin:
    type = NotificationType.careTeamDoAdmin;
    // break; // TODO medicalTeamDoAdmin
    return null;
  case APINotificationType.medicalTeamRemoveMember:
    type = NotificationType.careTeamRemoveMember;
    // break; // TODO medicalTeamRemoveMember
    return null;
  default:
    throw new Error("Invalid notification type");
  }
  return {
    id: apin.key,
    creatorId: apin.creatorId,
    date: apin.created,
    email: apin.email,
    type,
    creator: apin.creator,
    role: apin.role,
    target: apin.target,
  };
}
