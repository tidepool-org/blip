/**
 * Copyright (c) 2021, Diabeloop
 * Notifications models (hydrophone interfaces)
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

import { Session } from "../../lib/auth/models";
import { Profile } from "../../models/shoreline";
import { TeamMemberRole } from "../../models/team";

export enum NotificationType {
  directInvitation,
  careTeamProInvitation,
  careTeamPatientInvitation,
  careTeamDoAdmin,
  careTeamRemoveMember,
}

export interface INotification {
  id: string;
  type: NotificationType;
  /** Current user email for received invitation, target user email for sent invitations */
  email: string;
  /** User who create the invitation == creator.userid? */
  creatorId: string;
  /** Notification creation date */
  date: string;
  target?: {
    /** TeamID */
    id: string;
    /** Team name */
    name: string;
  };
  /** The role we will have in the team */
  role?: TeamMemberRole;
  /** Some information on the user who created this notification */
  creator: {
    userid: string;
    profile?: Profile;
  };
}

export interface NotificationContext {
  initialized: boolean;
  receivedInvitations: INotification[];
  sentInvitations: INotification[];
  update: () => void;
  accept: (notification: INotification) => Promise<void>;
  decline: (notification: INotification) => Promise<void>;
  cancel: (notification: INotification) => Promise<void>;
}

export interface NotificationAPI {
  /** Fetch the invitation we received */
  getReceivedInvitations: (session: Readonly<Session>) => Promise<INotification[]>;
  /** Fetch the invitations we have sent */
  getSentInvitations: (session: Readonly<Session>) => Promise<INotification[]>;
  acceptInvitation: (session: Readonly<Session>, notification: INotification) => Promise<void>;
  declineInvitation: (session: Readonly<Session>, notification: INotification) => Promise<void>;
  cancelInvitation: (session: Readonly<Session>, notification: INotification) => Promise<void>;
}

export interface NotificationProvider {
  children: React.ReactNode;
  /** Used to test the hook */
  api?: NotificationAPI;
  /** Used for test components which need this hook */
  value?: NotificationContext;
}
