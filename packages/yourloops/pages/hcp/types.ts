/**
 * Copyright (c) 2021, Diabeloop
 * Types definitions for Typescript
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

import { TypeTeamMemberRole } from "../../models/team";
import { Team, TeamMember } from "../../lib/team";

export enum SortDirection {
  asc = "asc",
  desc = "desc",
}
export enum SortFields {
  lastname = "lastname",
  firstname = "firstname",
}
export enum FilterType {
  all = "all",
  flagged = "flagged",
  pending = "pending",
  private = "private",
}

export interface SwitchRoleDialogContentProps {
  member: Readonly<TeamMember>;
  role: Exclude<TypeTeamMemberRole, "patient">;
  onDialogResult: (result: boolean) => void;
}

export interface TeamLeaveDialogContentProps {
  team: Readonly<Team>;
  onDialogResult: (result: boolean) => void;
}

export interface AddMemberDialogContentProps {
  team: Readonly<Team>;
  onDialogResult: (result: { email: string | null; role: Exclude<TypeTeamMemberRole, "patient"> }) => void;
}

export interface RemoveMemberDialogContentProps {
  member: Readonly<TeamMember>;
  onDialogResult: (result: boolean) => void;
}

export interface TeamEditModalContentProps {
  team: Readonly<Team> | null;
  /** Promise callback for the modal. null means cancel edit */
  onSaveTeam: (team: Partial<Team> | null) => void;
}
