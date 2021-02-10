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

import { User } from "./shoreline";

export enum TeamType {
  medical = "medical",
  personal = "personal",
}

export enum TeamMemberRole {
  admin = "admin",
  viewer = "viewer",
  patient = "patient"
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: TeamMemberRole;
  user?: User;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  type: TeamType;
  ownerId: string;
  phone?: string;
  email?: string;
  address?: {
    line1: string;
    line2?: string;
    zip: string;
    city: string;
    country: string;
  };
  description?: string;
  members?: TeamMember[];
}
