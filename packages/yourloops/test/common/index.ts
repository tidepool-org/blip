/**
 * Copyright (c) 2021, Diabeloop
 * Commons data for all tests
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

import { v4 as uuidv4 } from "uuid";

import { Session, User } from "../../lib/auth";
import { Units, UserInvitationStatus } from "../../models/generic";
import { UserRoles } from "../../models/shoreline";
import { ITeam, ITeamMember, TeamMemberRole, TeamType } from "../../models/team";
import { createSessionToken } from "./utils";
import { HcpProfession } from "../../models/hcp-profession";

export { createSessionToken, refreshToken } from "./utils";

const userCaregiver = new User({
  userid: "b0000000",
  username: "caregiver@example.com",
  role: UserRoles.caregiver,
  emailVerified: true,
  preferences: { displayLanguageCode: "de" },
  profile: { firstName: "Caregiver", lastName: "Example", fullName: "Caregiver Example" },
  settings: { country: "DE", units: { bg: Units.mole } },
});

const userHCP: User = new User({
  userid: "a0000000",
  username: "john.doe@example.com",
  role: UserRoles.hcp,
  emailVerified: true,
  profile: { firstName: "John", lastName: "Doe", fullName: "John Doe", hcpProfession: HcpProfession.diabeto },
  preferences: { displayLanguageCode: "en" },
  settings: { units: { bg: Units.gram }, country: "FR" },
});

const userPatient = new User({
  userid: "a0a0a0b0",
  username: "josephine.dupuis@example.com",
  role: UserRoles.patient,
  preferences: { displayLanguageCode: "fr" },
  profile: {
    firstName: "Josephine",
    lastName: "Dupuis",
    fullName: "Josephine D.",
    patient: {
      birthday: "1964-12-01",
      diagnosisDate: "2020-12-02",
      diagnosisType: "1",
    },
  },
  settings: { a1c: { date: "2020-01-01", value: "7.5" } },
});

/**
 * Logged in users for test, choose one suitable
 */
export const loggedInUsers = {
  hcp: userHCP,
  patient: userPatient,
  caregiver: userCaregiver,
  get hcpSession(): Session {
    const user = new User(userHCP);
    return {
      user,
      sessionToken: createSessionToken(user),
      traceToken: uuidv4(),
    };
  },
  get patientSession(): Session {
    const user = new User(userPatient);
    return {
      user,
      sessionToken: createSessionToken(user),
      traceToken: uuidv4(),
    };
  },
  get caregiverSession(): Session {
    const user = new User(userCaregiver);
    return {
      user,
      sessionToken: createSessionToken(user),
      traceToken: uuidv4(),
    };
  },
};

/**
 * An example list of teams for the unit tests
 */
export const teams: ITeam[] = [
  {
    // FIXME
    id: "team-0",
    name: "CHU Grenoble",
    code: "123456789",
    owner: "abcdef",
    type: TeamType.medical,
    address: {
      line1: "Boulevard de la Chantourne",
      line2: "Cedex 38703",
      zip: "38700",
      city: "La Tronche",
      country: "FR",
    },
    phone: "+33 (0)4 76 76 75 75",
    email: "secretariat-diabethologie@chu-grenoble.fr",
    members: [
      {
        teamId: "team-0",
        userId: loggedInUsers.hcp.userid,
        role: TeamMemberRole.admin,
        invitationStatus: UserInvitationStatus.accepted,
        email: loggedInUsers.hcp.username,
        preferences: loggedInUsers.hcp.preferences,
        profile: loggedInUsers.hcp.profile,
        settings: loggedInUsers.hcp.settings,
      },
      {
        teamId: "team-0",
        userId: "a0a1a2a3",
        role: TeamMemberRole.member,
        invitationStatus: UserInvitationStatus.accepted,
        email: "jean.dupont@chu-grenoble.fr",
        preferences: null,
        profile: { firstName: "Jean", lastName: "Dupont", fullName: "Jean Dupont" },
        settings: null,
      },
    ],
  },
  {
    id: "team-1",
    name: "Charité – Universitätsmedizin Berlin",
    code: "987654321",
    phone: "+49 30 450 - 50",
    address: {
      line1: "Charitéplatz 1",
      city: "Berlin",
      zip: "10117",
      country: "DE",
    },
    owner: "abcdef",
    type: TeamType.medical,
    members: [
      {
        teamId: "team-1",
        userId: loggedInUsers.hcp.userid,
        role: TeamMemberRole.member,
        invitationStatus: UserInvitationStatus.accepted,
        email: loggedInUsers.hcp.username,
        preferences: loggedInUsers.hcp.preferences,
        profile: loggedInUsers.hcp.profile,
        settings: loggedInUsers.hcp.settings,
      },
      {
        teamId: "team-1",
        userId: "b0b1b2b3",
        role: TeamMemberRole.admin,
        invitationStatus: UserInvitationStatus.accepted,
        email: "adelheide.alvar@charite.de",
        preferences: null,
        profile: { firstName: "Adelheide", lastName: "Alvar", fullName: "Adelheide Alvar" },
        settings: null,
      },
    ],
  },
  {
    id: "team-2-empty",
    name: "Empty Team 2",
    code: "123654789",
    phone: "0000",
    address: {
      line1: "Test",
      city: "Test",
      zip: "00000",
      country: "FR",
    },
    owner: loggedInUsers.hcp.userid,
    type: TeamType.medical,
    members: [
      {
        teamId: "team-2-empty",
        userId: loggedInUsers.hcp.userid,
        role: TeamMemberRole.admin,
        invitationStatus: UserInvitationStatus.accepted,
        email: loggedInUsers.hcp.username,
        preferences: loggedInUsers.hcp.preferences,
        profile: loggedInUsers.hcp.profile,
        settings: loggedInUsers.hcp.settings,
      },
    ],
  },
];

export const emptyTeam3: ITeam = {
  id: "team-3-empty",
  name: "Empty Team 3",
  phone: "33 33 33 33",
  code: "333333333",
  address: {
    line1: "Empty street 3",
    city: "City Three",
    zip: "33333",
    country: "FR",
  },
  owner: "33333333",
  type: TeamType.medical,
  members: [],
};

export const members: ITeamMember[] = [
  {
    teamId: "team-0",
    userId: "b0b1b2b4",
    role: TeamMemberRole.admin,
    invitationStatus: UserInvitationStatus.pending,
    email: "michelle.dufour@chu-grenoble.fr",
    preferences: null,
    profile: { firstName: "Michelle", lastName: "Dufour", fullName: "Michelle Dufour" },
    settings: null,
  },
];

export const patients: ITeamMember[] = [
  {
    invitationStatus: UserInvitationStatus.accepted,
    role: TeamMemberRole.patient,
    teamId: "team-0",
    userId: userPatient.userid,
    email: userPatient.username,
    preferences: userPatient.preferences,
    profile: userPatient.profile,
    settings: userPatient.settings,
  },
  {
    invitationStatus: UserInvitationStatus.accepted,
    role: TeamMemberRole.patient,
    teamId: "team-1",
    userId: userPatient.userid,
    email: userPatient.username,
    preferences: userPatient.preferences,
    profile: userPatient.profile,
    settings: userPatient.settings,
  },
  {
    invitationStatus: UserInvitationStatus.accepted,
    role: TeamMemberRole.patient,
    teamId: "team-1",
    userId: "a0a0a0b1",
    email: "michel.dupont@example.com",
    profile: { firstName: "Michel", lastName: "Dupont", fullName: "Michel D." },
  },
  {
    invitationStatus: UserInvitationStatus.accepted,
    role: TeamMemberRole.patient,
    teamId: TeamType.private,
    userId: "a0a0a0b2",
    email: "marivone.duplessie@example.com",
    profile: { firstName: "Marivone", lastName: "Duplessie", fullName: "Marivone Duplessie" },
  },
  {
    invitationStatus: UserInvitationStatus.accepted,
    role: TeamMemberRole.patient,
    teamId: "team-1",
    userId: "a0a0a0b2",
    email: "marivone.duplessie@example.com",
    profile: { firstName: "Marivone", lastName: "Duplessie", fullName: "Marivone Duplessie" },
  },
  {
    invitationStatus: UserInvitationStatus.pending,
    role: TeamMemberRole.patient,
    teamId: "team-0",
    userId: "a0a0a0b3",
    email: "gerard.dumoulin@example.com",
    profile: { firstName: "Gerard", lastName: "Dumoulin", fullName: "Gerard D." },
  },
];
