/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client type definition for teams
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

/*
 * TODO: Review me when we have the team API
 */

import { Profile, Settings, Preferences } from "./shoreline";
import { UserInvitationStatus, PostalAddress } from "./generic";

export enum TeamType {
  medical = "medical",
  /** A team for patient: to whom the patient share his data */
  caregiver = "caregiver",
  /** Virtual team for hcp & caregiver mostly: share 1 to 1 -> which patients share with me */
  private = "private",
}

export enum TeamMemberRole {
  admin = "admin",
  member = "member",
  patient = "patient",
}

export type TypeTeamMemberRole = keyof typeof TeamMemberRole;

/**
 * Team member (API view)
 */
export interface ITeamMember {
  userId: string;
  teamId: "private" | string;
  email: string;
  role: TeamMemberRole;
  invitationStatus: UserInvitationStatus;
  profile?: Profile | null;
  settings?: Settings | null;
  preferences?: Preferences | null;
  idVerified: boolean;
}

/**
 * Team interface (API view)
 */
export interface ITeam {
  readonly id: string;
  name: string;
  readonly code: string;
  readonly type: TeamType;
  readonly owner: string;
  phone?: string;
  email?: string;
  address?: PostalAddress;
  description?: string;
  members: ITeamMember[];
}
