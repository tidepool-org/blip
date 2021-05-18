/**
 * Copyright (c) 2021, Diabeloop
 * Notifications API models (hydrophone interfaces)
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

import { Profile } from "./shoreline";
import { TeamMemberRole } from "./team";

export enum APINotificationType {
careTeamInvitation = "careteam_invitation",
medicalTeamProInvitation = "medicalteam_invitation",
medicalTeamPatientInvitation = "medicalteam_patient_invitation",
medicalTeamDoAdmin = "medicalteam_do_admin",
medicalTeamRemoveMember = "medicalteam_remove",
}

export interface INotificationAPI {
key: string;
type: APINotificationType;
/** Current user email */
email: string;
/** User who create the invitation == creator.userid? */
creatorId: string;
/** Undocumented value */
context?: null;
/** Notification creation date */
created: string;
target?: {
  /** TeamID */
  id: string;
  /** Team name */
  name: string;
};
/** The role we will have in the team */
role?: TeamMemberRole;
/** Undocumented value */
shortKey: string;
/** Some information on the user who created this notification */
creator: {
  userid: string;
  profile?: Profile;
};
}
