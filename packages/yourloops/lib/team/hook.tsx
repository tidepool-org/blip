/**
 * Copyright (c) 2021, Diabeloop
 * Teams management & helpers - hook version
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

import * as React from "react";
import bows from "bows";

import { ITeam, TeamType, TeamMemberRole, TypeTeamMemberRole, TeamMemberStatus, ITeamMember } from "../../models/team";

import { errorTextFromException } from "../utils";
import { useAuth, Session } from "../auth";
import { LoadTeams, Team, TeamAPI, TeamContext, TeamMember, TeamProvider, TeamUser } from "./models";
import TeamAPIImpl from "./api";

const log = bows("TeamHook");
const ReactTeamContext = React.createContext<TeamContext>({} as TeamContext);
/** hackish way to prevent 2 or more consecutive loading */
let lock = false;

export function iMemberToMember(iTeamMember: ITeamMember, team: Team, users: Map<string, TeamUser>): TeamMember {
  const userId = iTeamMember.userId;

  let teamUser = users.get(userId);
  if (typeof teamUser === "undefined") {
    teamUser = {
      ...iTeamMember.user,
      members: [],
    };
    users.set(userId, teamUser);
  }

  const teamMember: TeamMember = {
    team,
    role: iTeamMember.role,
    status: iTeamMember.invitationStatus,
    user: teamUser,
  };
  teamUser.members.push(teamMember);
  team.members.push(teamMember);
  return teamMember;
}

export function iTeamToTeam(iTeam: ITeam, users: Map<string, TeamUser>): Team {
  const team: Team = {
    ...iTeam,
    members: [],
  };

  // Detect duplicate users, and update the member if needed
  iTeam.members.forEach((iTeamMember) => {
    iMemberToMember(iTeamMember, team, users);
  });

  return team;
}

export async function loadTeams(
  session: Session,
  // Default API promise calls (here for the unit tests)
  fetchTeams: TeamAPI["fetchTeams"],
  fetchPatients: TeamAPI["fetchPatients"]
): Promise<LoadTeams> {
  const getFlagPatients = (): string[] => {
    const flagged = session.user.preferences?.patientsStarred;
    if (Array.isArray(flagged)) {
      return Array.from(flagged);
    }
    return [];
  };

  const users = new Map<string, TeamUser>();
  const [apiTeams, apiPatients] = await Promise.all([fetchTeams(session), fetchPatients(session)]);
  const nPatients = apiPatients.length;

  log.debug("loadTeams", { nPatients, nTeams: apiTeams.length });

  const privateTeam: Team = {
    code: TeamType.private,
    id: TeamType.private,
    members: [],
    name: TeamType.private,
    ownerId: session.user.userid,
    type: TeamType.private,
  };

  const teams: Team[] = [privateTeam];
  apiTeams.forEach((apiTeam: ITeam) => {
    const team = iTeamToTeam(apiTeam, users);
    teams.push(team);
  });

  const flaggedNotInResult = getFlagPatients();

  // Merge patients
  for (let i = 0; i < nPatients; i++) {
    const apiPatient = apiPatients[i];
    const userId = apiPatient.userId;

    if (flaggedNotInResult.includes(userId)) {
      flaggedNotInResult.splice(flaggedNotInResult.indexOf(userId), 1);
    }

    let team = teams.find((t) => t.id === apiPatient.teamId);
    if (typeof team === "undefined") {
      log.error(`Missing teamId ${apiPatient.teamId} for patient member`, apiPatient);
      // Use the private team
      team = privateTeam;
    }

    let user = users.get(userId);
    if (typeof user === "undefined") {
      user = {
        ...apiPatient.user,
        members: [],
      };
      users.set(userId, user);
    }
    const member: TeamMember = {
      role: apiPatient.role,
      status: apiPatient.invitationStatus,
      team,
      user,
    };
    user.members.push(member);
    team.members.push(member);
  }

  // End, cleanup to help the garbage collector
  users.clear();
  return { teams, flaggedNotInResult };
}

function TeamContextImpl(api: TeamAPI): TeamContext {
  // hooks (private or public variables)

  const [teams, setTeams] = React.useState<Team[]>([]);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const authHook = useAuth();

  const authInitialized = authHook.initialized();
  const isLoggedIn = authHook.isLoggedIn();

  // public methods

  const getTeam = (teamId: string): Team | null => {
    return teams.find((t) => t.id === teamId) ?? null;
  };

  const getUser = (userId: string): TeamUser | null => {
    // Sorry for the "for", I know it's now forbidden
    // But today it's too late for me to think how to use a magic function
    // to have this info.
    for (const team of teams) {
      for (const member of team.members) {
        if (member.user.userid === userId) {
          return member.user;
        }
      }
    }
    return null;
  };

  const getMapUsers = (): Map<string, TeamUser> => {
    const users = new Map<string, TeamUser>();
    for (const team of teams) {
      for (const member of team.members) {
        if (!users.has(member.user.userid)) {
          users.set(member.user.userid, member.user);
        }
      }
    }
    return users;
  };

  const refresh = (forceRefresh: boolean): void => {
    if (initialized || forceRefresh) {
      setInitialized(false);
    }
  };

  const getMedicalTeams = (): Team[] => {
    return teams.filter((team: Team): boolean => team.type === TeamType.medical);
  };

  const getPatients = (): TeamUser[] => {
    const patients = new Map<string, TeamUser>();
    const nTeams = teams.length;
    for (let i = 0; i < nTeams; i++) {
      const team = teams[i];
      const members = team.members;
      const nMembers = members.length;
      for (let j = 0; j < nMembers; j++) {
        const member = members[j];
        if (member.role === TeamMemberRole.patient && !patients.has(member.user.userid)) {
          patients.set(member.user.userid, member.user);
        }
      }
    }
    return Array.from(patients.values());
  };

  const getMedicalMembers = (team: Team): TeamMember[] => {
    return team.members.filter((member) => member.role !== TeamMemberRole.patient);
  };

  const getNumMedicalMembers = (team: Team): number => {
    return team.members.reduce<number>((num, member) => {
      return member.role === TeamMemberRole.patient ? num : num + 1;
    }, 0);
  };

  const isUserAdministrator = (team: Team, userId: string): boolean => {
    const result = team.members.find((member) => member.role === TeamMemberRole.admin && member.user.userid === userId);
    return typeof result === "object";
  };

  const isUserTheOnlyAdministrator = (team: Team, userId: string): boolean => {
    const admins = team.members.filter((member) => member.role === TeamMemberRole.admin);
    return admins.length === 1 && admins[0].user.userid === userId;
  };

  const isInvitationPending = (user: TeamUser): boolean => {
    const tm = user.members.find((tm) => tm.status === TeamMemberStatus.pending);
    return typeof tm === "object";
  };

  const isInTeam = (user: TeamUser, teamId: string): boolean => {
    const tm = user.members.find((tm) => tm.team.id === teamId);
    return typeof tm === "object";
  };

  const invitePatient = async (team: Team, username: string): Promise<void> => {
    const session = authHook.session() as Session;
    const iTeamMember = await api.invitePatient(session, team.id, username);
    const users = getMapUsers();
    iMemberToMember(iTeamMember, team, users);
    setTeams(teams);
  };

  const inviteMember = async (team: Team, username: string, role: Exclude<TypeTeamMemberRole, "patient">): Promise<void> => {
    const session = authHook.session() as Session;
    const iTeamMember = await api.inviteMember(session, team.id, username, role);
    const users = getMapUsers();
    iMemberToMember(iTeamMember, team, users);
    setTeams(teams);
  };

  const createTeam = async (team: Partial<Team>): Promise<void> => {
    const session = authHook.session() as Session;
    const apiTeam: Partial<ITeam> = {
      address: team.address,
      description: team.description,
      email: team.email,
      name: team.name,
      phone: team.phone,
      type: team.type,
    };
    const iTeam = await api.createTeam(session, apiTeam);
    const users = getMapUsers();
    const newTeam = iTeamToTeam(iTeam, users);
    teams.push(newTeam);
    setTeams(teams);
  };

  const editTeam = async (team: Team): Promise<void> => {
    const session = authHook.session() as Session;
    const apiTeam: ITeam = {
      ...team,
      members: [],
    };
    await api.editTeam(session, apiTeam);
    const cachedTeam = teams.find((t: Team) => t.id === team.id);
    if (typeof cachedTeam === "object") {
      cachedTeam.name = team.name;
      cachedTeam.phone = team.phone;
      cachedTeam.address = team.address;
      if (typeof team.email === "string") {
        cachedTeam.email = team.email;
      }
      setTeams(teams);
    } else {
      log.warn('editTeam(): Team not found', team);
    }
  };

  const leaveTeam = async (team: Team): Promise<void> => {
    const session = authHook.session() as Session;
    await api.leaveTeam(session, team.id);
    const idx = teams.findIndex((t: Team) => t.id === team.id);
    if (idx > -1) {
      teams.splice(idx, 1);
      setTeams(teams);
    } else {
      log.warn('leaveTeam(): Team not found', team);
    }
  };

  const removeMember = async (member: TeamMember): Promise<void> => {
    const session = authHook.session() as Session;
    await api.removeMember(session, member.team.id, member.user.userid);
    const { team } = member;
    const idx = team.members.findIndex((m: TeamMember) => m.user.userid === member.user.userid);
    if (idx > -1) {
      team.members.splice(idx, 1);
      setTeams(teams);
    } else {
      log.warn('removeMember(): Member not found', member);
    }
  };

  const changeMemberRole = async (member: TeamMember, role: Exclude<TypeTeamMemberRole, "patient">): Promise<void> => {
    const session = authHook.session() as Session;
    await api.changeMemberRole(session, member.team.id, member.user.userid, role);
    member.role = role as TeamMemberRole;
    setTeams(teams);
  };

  const initHook = () => {
    if (!authInitialized) {
      if (teams.length > 0) {
        setTeams([]);
      }
      if (errorMessage !== null) {
        setErrorMessage(null);
      }
      return;
    }

    if (initialized === false && lock === false) {
      log.info("init");
      lock = true;

      if (isLoggedIn) {
        const session = authHook.session() as Session;

        loadTeams(session, api.fetchTeams, api.fetchPatients)
          .then(({ teams, flaggedNotInResult }: LoadTeams) => {
            setTeams(teams);
            if (errorMessage !== null) {
              setErrorMessage(null);
            }

            if (flaggedNotInResult.length > 0) {
              // For some reason, the flagged list is not accurate - update it
              log.warn("Missing patients in team list", flaggedNotInResult);
              const validUserIds = authHook.getFlagPatients().filter((userId: string) => !flaggedNotInResult.includes(userId));
              authHook.setFlagPatients(validUserIds);
            }
          })
          .catch((reason: unknown) => {
            const message = errorTextFromException(reason);
            if (message !== errorMessage) {
              setErrorMessage(message);
            }
          })
          .finally(() => {
            setInitialized(true);
            // Clear the lock
            lock = false;
          });
      } else {
        if (teams.length > 0) {
          setTeams([]);
        }
        setInitialized(true);
        // Clear the lock
        lock = false;
      }
    }
  };

  React.useEffect(initHook, [initialized, errorMessage, teams, authInitialized, isLoggedIn, authHook, api]);

  return {
    teams,
    initialized,
    errorMessage,
    refresh,
    getTeam,
    getUser,
    getMedicalTeams,
    getPatients,
    getMedicalMembers,
    getNumMedicalMembers,
    isUserAdministrator,
    isUserTheOnlyAdministrator,
    isInvitationPending,
    isInTeam,
    invitePatient,
    inviteMember,
    createTeam,
    editTeam,
    leaveTeam,
    removeMember,
    changeMemberRole,
  };
}

/**
 * Provider component that wraps your app and makes auth object available to any child component that calls useTeam().
 * @param props for team provider & children
 */
export function TeamContextProvider(props: TeamProvider): JSX.Element {
  const { children, api } = props;
  const context = TeamContextImpl(api ?? TeamAPIImpl); // eslint-disable-line new-cap
  return <ReactTeamContext.Provider value={context}>{children}</ReactTeamContext.Provider>;
}

/**
 * Hook for child components to get the teams functionalities
 *
 * Trigger a re-render when it change.
 */
export function useTeam(): TeamContext {
  return React.useContext(ReactTeamContext);
}
