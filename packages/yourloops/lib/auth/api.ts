/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client
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

import { v4 as uuidv4, validate as validateUuid } from "uuid";
import bows from "bows";
import _ from "lodash";

import { User, Profile } from "models/shoreline";
import { Team, TeamMember } from "models/team";
import { PatientData } from "models/device-data";
import { APIErrorResponse } from "models/error";
import { MessageNote } from "models/message";

import { defer, waitTimeout } from "../utils";
import appConfig from "../config";
import { t } from "../language";
import http from "../http-status-codes";
import { TeamMemberRole } from "../../models/team";

const SESSION_TOKEN_KEY = "session-token";
const TRACE_TOKEN_KEY = "trace-token";
const LOGGED_IN_USER = "logged-in-user";
const SESSION_TOKEN_HEADER = "x-tidepool-session-token";
const TRACE_SESSION_HEADER = "x-tidepool-trace-session";

export class PatientDataLoadedEvent extends Event {
  public user: User;
  public patientData: PatientData;

  constructor(user: User, patientData: PatientData) {
    super("patient-data-loaded");
    this.user = user;
    this.patientData = patientData;
  }
}

class AuthApi extends EventTarget {
  /** JWT token as a string */
  private sessionToken: string | null;
  /** Trace token is used to trace the calls betweens different microservices API calls for debug purpose. */
  private traceToken: string | null;
  /** Logged-in user information */
  private user: User | null;
  private log: Console;
  private loginLock: boolean;
  /** number of wrong tentative connection */
  private wrongCredentialCount: number;
  /** patients list */
  private patients: User[] | null;
  private teams: Team[] | null;

  constructor() {
    super();

    this.user = null;
    this.patients = null;
    this.log = bows("API");
    this.loginLock = false;
    this.wrongCredentialCount = 0;

    this.sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    this.traceToken = sessionStorage.getItem(TRACE_TOKEN_KEY);
    const loggedInUser = sessionStorage.getItem(LOGGED_IN_USER);

    if (this.sessionToken !== null && this.sessionToken.length < 1) {
      this.sessionToken = null;
      this.log.warn("Invalid session token in session storage");
    }
    if (this.traceToken !== null && validateUuid(this.traceToken) === false) {
      this.traceToken = null;
      this.log.warn("Invalid trace token in session storage");
    }
    if (loggedInUser !== null) {
      try {
        this.user = JSON.parse(loggedInUser);
      } catch (e) {
        this.log.warn("Invalid user in session storage", e);
      }
    }

    if (!this.isLoggedIn) {
      this.removeAuthInfoFromSessionStorage();
    }

    this.teams = [
      {
        // FIXME
        id: "team-1",
        name: "CHU Grenoble",
        code: "123456789",
        ownerId: "abcdef",
        type: "medical",
        address: {
          line1: "Boulevard de la Chantourne",
          zip: "38700",
          city: "La Tronche",
          country: "FR",
        },
        phone: "+33 (0)4 76 76 75 75",
        email: "secretariat-diabethologie@chu-grenoble.fr",
        members: [
          {
            teamId: "team-1",
            userId: "132abc",
            role: "viewer",
            user: {
              userid: "132abc",
              username: "a@b.fr",
              profile: { firstName: "A", lastName: "B", fullName: "A B" },
            },
          },
        ],
      },
      {
        id: "team-2",
        name: "Clinique Nantes",
        code: "987654321",
        phone: "00-00-00-00-00",
        ownerId: "abcdef",
        type: "medical",
        members: [
          {
            teamId: "team-2",
            userId: "132abc",
            role: "viewer",
            user: {
              userid: "132abc",
              username: "a@b.fr",
              profile: { firstName: "A", lastName: "B", fullName: "A B" },
            },
          },
        ],
      },
    ];

    if (this.user !== null) {
      this.teams[0].members?.push({
        teamId: "team-1",
        userId: this.user.userid,
        role: "admin",
        user: this.user,
      });
      this.teams[1].members?.push({
        teamId: "team-2",
        userId: this.user.userid,
        role: "admin",
        user: this.user,
      });
    }

    // Listen to storage events, to be able to monitor
    // logout on others tabs.
    window.addEventListener("storage", this.onStorageChange.bind(this));

    this.log.info("Auth API initialized");
  }

  /**
   * @returns {string|null} the session token or null
   */
  public get token(): string | null {
    return this.sessionToken;
  }

  public get whoami(): User | null {
    return _.cloneDeep(this.user);
  }

  /**
   * @returns {boolean} true if the user is logged in.
   */
  public get isLoggedIn(): boolean {
    return (
      this.sessionToken !== null &&
      this.traceToken !== null &&
      this.user !== null
    );
  }

  public get userIsPatient(): boolean {
    return this.isLoggedIn && !_.isEmpty(this.user?.profile?.patient);
  }

  public get havePatientsShare(): boolean {
    return !_.isEmpty(this.patients);
  }

  /**
   * Listen to session storage events, to know if another tab is logged out.
   * @param {StorageEvent} ev A change in the storage
   */
  private onStorageChange(ev: StorageEvent): void {
    this.log.debug("onStorageChange", ev);
    if (!this.loginLock && ev.storageArea === sessionStorage) {
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (token === null) {
        this.logout();
      } else if (token !== this.token) {
        // We should not see this
      }
    }
  }

  /**
   * Perform a login.
   * @param {string} username Generally an email
   * @param {string} password The account password
   * @return {Promise<User>} Return the logged-in user or a promise rejection.
   */
  private async authenticate(
    username: string,
    password: string
  ): Promise<User> {
    let reason: string | null = null;
    this.logout(); // To be sure to reset the values

    if (!_.isString(username) || _.isEmpty(username)) {
      reason = t("Must specify a username") as string;
      return Promise.reject(new Error(reason));
    }

    if (!_.isString(password) || _.isEmpty(password)) {
      reason = t("Must specify a password") as string;
      return Promise.reject(new Error(reason));
    }

    this.traceToken = uuidv4();
    sessionStorage.setItem(TRACE_TOKEN_KEY, this.traceToken);

    this.log.debug("login: /auth/login", appConfig.API_HOST);
    const authURL = new URL("/auth/login", appConfig.API_HOST);

    const response = await fetch(authURL.toString(), {
      method: "POST",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken,
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
    });

    if (!response.ok || response.status !== http.StatusOK) {
      switch (response.status) {
        case http.StatusUnauthorized:
          if (_.isNumber(appConfig.MAX_FAILED_LOGIN_ATTEMPTS)) {
            if (
              ++this.wrongCredentialCount >= appConfig.MAX_FAILED_LOGIN_ATTEMPTS
            ) {
              reason = t(
                "Your account has been locked for {{numMinutes}} minutes. You have reached the maximum number of login attempts.",
                { numMinutes: appConfig.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT }
              );
            } else {
              reason = t("Wrong username or password");
            }
          }
          break;
        // missing handling 403 status => email not verified
        default:
          reason = t("An error occurred while logging in.");
          break;
      }

      if (reason === null) {
        reason = t("Login Failed");
      }

      this.sendMetrics("Login failed", reason);
      return Promise.reject(new Error(reason as string));
    }

    this.wrongCredentialCount = 0;
    this.sessionToken = response.headers.get(SESSION_TOKEN_HEADER);
    this.user = (await response.json()) as User;

    if (!Array.isArray(this.user.roles)) {
      this.user.roles = ["patient"];
    }

    // ???
    if (this.sessionToken !== null) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, this.sessionToken);
    }
    sessionStorage.setItem(LOGGED_IN_USER, JSON.stringify(this.user));

    this.sendMetrics("setUserId", this.user.userid);

    // FIXME: Remove me!
    if (this.teams !== null) {
      this.teams[0].members?.push({
        teamId: "team-1",
        userId: this.user.userid,
        role: "admin",
        user: this.user,
      });
      this.teams[1].members?.push({
        teamId: "team-2",
        userId: this.user.userid,
        role: "admin",
        user: this.user,
      });
    }
    // END FIXME

    return this.user;
  }

  /**
   * Perform a login.
   * @param {string} username Generally an email
   * @param {string} password The account password
   * @return {Promise<User>} Return the logged-in user or a promise rejection.
   */
  async login(username: string, password: string): Promise<User> {
    this.loginLock = true;
    return this.authenticate(username, password)
      .then((user: User) => {
        return this.getUserProfile(user);
      })
      .finally(() => {
        this.loginLock = false;
      });
  }

  /**
   * Logout the user => Clear the session & trace tokens
   */
  logout(): void {
    this.log.debug("debug logout");
    if (this.loginLock && this.isLoggedIn) {
      this.log.debug("logout with a loginlock ");
      this.removeAuthInfoFromSessionStorage();
    } else if (this.isLoggedIn) {
      this.log.debug("logout with no loginlock");
      this.loginLock = true;
      this.sendMetrics("resetUserId");
      this.removeAuthInfoFromSessionStorage();
      this.dispatchEvent(new Event("logout"));
      this.loginLock = false;
    }
  }

  /**
   * Clear the session & trace tokens
   */
  private removeAuthInfoFromSessionStorage() {
    this.sessionToken = null;
    this.traceToken = null;
    this.user = null;
    this.patients = null;
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(TRACE_TOKEN_KEY);
    sessionStorage.removeItem(LOGGED_IN_USER);
  }

  public async getUserShares(): Promise<User[]> {
    if (!this.isLoggedIn) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }

    const seagullURL = new URL(
      `/metadata/users/${this.user?.userid}/users`,
      appConfig.API_HOST
    );
    const response = await fetch(seagullURL.toString(), {
      method: "GET",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
    });

    if (response.ok) {
      this.patients = (await response.json()) as User[];
      return this.patients;
    }

    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  public async getUserProfile(user: User): Promise<User> {
    if (!this.isLoggedIn) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }

    const seagullURL = new URL(
      `/metadata/${user.userid}/profile`,
      appConfig.API_HOST
    );

    const response = await fetch(seagullURL.toString(), {
      method: "GET",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
    });

    if (response.ok) {
      user.profile = (await response.json()) as Profile;
    } else {
      const responseBody = (await response.json()) as APIErrorResponse;
      throw new Error(t(responseBody.reason));
    }

    if (this.user?.userid === user.userid) {
      sessionStorage.setItem(LOGGED_IN_USER, JSON.stringify(this.user));
    }
    return user;
  }

  public async flagPatient(userId: string): Promise<string[]> {
    if (!this.isLoggedIn || this.user === null) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }
    if (
      typeof this.user.preferences !== "object" ||
      this.user.preferences === null
    ) {
      this.user.preferences = {
        patientsStarred: [],
      };
    }
    if (!Array.isArray(this.user.preferences.patientsStarred)) {
      this.user.preferences.patientsStarred = [];
    }
    const userIdIdx = this.user.preferences.patientsStarred.indexOf(userId);
    if (userIdIdx > -1) {
      this.user.preferences.patientsStarred.splice(userIdIdx, 1);
      this.log.info("Unflag patient", userId);
    } else {
      this.user.preferences.patientsStarred.push(userId);
      this.log.info("Flag patient", userId);
    }

    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(50 + Math.random() * 100);

    return this.user.preferences.patientsStarred;
  }

  public async loadPatientData(userID: string): Promise<PatientData> {
    let patient: User | null | undefined = null;

    if (this.userIsPatient) {
      patient = this.user;
    } else if (this.isLoggedIn && this.patients !== null) {
      patient = this.patients.find((user: User) => user.userid === userID);
    }

    if (_.isEmpty(patient)) {
      throw new Error(`Missing patient ${userID}`);
    }

    this.dispatchEvent(new Event("patient-data-loading"));

    const dataURL = new URL(`/data/${userID}`, appConfig.API_HOST);
    const response = await fetch(dataURL.toString(), {
      method: "GET",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
    });

    if (response.ok) {
      const patientData = (await response.json()) as PatientData;

      defer(() => {
        this.dispatchEvent(
          new PatientDataLoadedEvent(patient as User, patientData)
        );
      });

      return patientData;
    }

    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  /**
   * Create a new note
   * @param message The note to send
   */
  public async startMessageThread(message: MessageNote): Promise<string> {
    if (!this.isLoggedIn) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }

    const messageURL = new URL(
      `/message/send/${message.groupid}`,
      appConfig.API_HOST
    );
    const response = await fetch(messageURL.toString(), {
      method: "POST",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
      body: JSON.stringify({
        message: {
          ...message,
          guid: uuidv4(),
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.id as string;
    }

    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  public async fetchTeams(): Promise<Team[]> {
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random() * 200);
    return _.cloneDeep(this.teams ?? []);
  }

  public async createTeam(team: Partial<Team>): Promise<Team[]> {
    if (this.teams === null) {
      this.teams = [];
    }

    // id, code, owner fields will be set by the back-end API

    // eslint-disable-next-line no-magic-numbers
    team.id = `team-${Math.round(Math.random() * 1000)}`;
    team.code = "123-456-789";
    team.ownerId = this.user?.userid as string;
    this.teams.push(team as Team);
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random() * 200);
    return _.cloneDeep(this.teams);
  }

  public async editTeam(editedTeam: Team): Promise<Team[]> {
    if (this.teams === null || this.teams.length < 1) {
      throw new Error("Empty team list!");
    }
    const nTeams = this.teams.length;
    for (let i = 0; i < nTeams; i++) {
      const team = this.teams[i];
      if (editedTeam.id === team.id) {
        this.teams[i] = editedTeam;
        break;
      }
    }
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random() * 200);
    return _.cloneDeep(this.teams);
  }

  public async leaveTeam(team: Team): Promise<Team[]> {
    if (this.teams === null || this.teams.length < 1) {
      throw new Error("Empty team list !");
    }
    if (this.user === null) {
      throw new Error("Not logged-in !");
    }

    // eslint-disable-next-line no-magic-numbers
    if (Math.random() < 0.2) {
      // eslint-disable-next-line no-magic-numbers
      await waitTimeout(500 + Math.random()*200);
      throw new Error("A random error");
    }

    const nTeams = this.teams.length;
    for (let i = 0; i < nTeams; i++) {
      const thisTeam = this.teams[i];
      if (thisTeam.id === team.id && Array.isArray(thisTeam.members)) {
        const userId = this.user.userid;
        const idx = thisTeam.members.findIndex((tm: TeamMember) => tm.userId === userId);
        if (idx > -1) {
          this.teams.splice(i, 1);
        }
        break;
      }
    }

    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random()*200);
    return _.cloneDeep(this.teams);
  }

  public async removeTeamMember(team: Team, userId: string): Promise<Team[]> {
    if (this.teams === null || this.teams.length < 1) {
      throw new Error("Empty team list!");
    }

    // eslint-disable-next-line no-magic-numbers
    if (Math.random() < 0.2) {
      // eslint-disable-next-line no-magic-numbers
      await waitTimeout(500 + Math.random() * 200);
      throw new Error("A random error");
    }

    const nTeams = this.teams.length;
    for (let i = 0; i < nTeams; i++) {
      const thisTeam = this.teams[i];
      if (thisTeam.id === team.id) {
        if (Array.isArray(thisTeam.members)) {
          const idx = thisTeam.members.findIndex(
            (tm: TeamMember): boolean => tm.userId === userId
          );
          if (idx > -1) {
            thisTeam.members.splice(idx, 1);
          }
        }
        break;
      }
    }
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random() * 200);
    return _.cloneDeep(this.teams);
  }

  public async changeTeamUserRole(
    team: Team,
    userId: string,
    admin: boolean
  ): Promise<Team[]> {
    if (this.teams === null || this.teams.length < 1) {
      throw new Error("Empty team list!");
    }

    // eslint-disable-next-line no-magic-numbers
    if (Math.random() < 0.2) {
      // eslint-disable-next-line no-magic-numbers
      await waitTimeout(500 + Math.random() * 200);
      throw new Error("A random error");
    }

    const nTeams = this.teams.length;
    for (let i = 0; i < nTeams; i++) {
      const thisTeam = this.teams[i];
      if (thisTeam.id === team.id) {
        if (!Array.isArray(thisTeam.members)) {
          throw new Error("No member for this team !");
        }
        for (const member of thisTeam.members) {
          if (member.userId === userId) {
            member.role = admin ? "admin" : "viewer";
            break;
          }
        }
        break;
      }
    }
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random() * 200);
    return _.cloneDeep(this.teams);
  }

  public async inviteHcpTeamMember(team: Team, email: string, role: TeamMemberRole): Promise<void> {
    if (this.teams === null || this.teams.length < 1) {
      throw new Error("Empty team list!");
    }

    // eslint-disable-next-line no-magic-numbers
    if (Math.random() < 0.2) {
      // eslint-disable-next-line no-magic-numbers
      await waitTimeout(500 + Math.random()*200);
      throw new Error("A random error");
    }

    this.log.info(`Invite ${email} to ${team.name} with role ${role}`);
    // eslint-disable-next-line no-magic-numbers
    await waitTimeout(500 + Math.random()*200);
  }

  /**
   * Record something for the tracking metrics
   * @param {string} eventName the text to send
   * @param {any=} properties optional parameter
   */
  sendMetrics(eventName: string, properties?: unknown): void {
    /** @type {any[]|null} */
    let matomoPaq = null;
    this.log.info("Metrics:", eventName, properties);
    switch (appConfig.METRICS_SERVICE) {
      case "matomo":
        matomoPaq = window._paq;
        if (!_.isObject(matomoPaq)) {
          this.log.error(
            "Matomo do not seems to be available, wrong configuration"
          );
        }
        if (eventName === "CookieConsent") {
          matomoPaq.push(["setConsentGiven", properties]);
        } else if (eventName === "setCustomUrl") {
          matomoPaq.push(["setCustomUrl", properties]);
        } else if (eventName === "setUserId") {
          matomoPaq.push(["setUserId", properties]);
        } else if (eventName === "resetUserId") {
          matomoPaq.push(["resetUserId"]);
        } else if (
          eventName === "setDocumentTitle" &&
          typeof properties === "string"
        ) {
          matomoPaq.push(["setDocumentTitle", properties]);
        } else if (typeof properties === "undefined") {
          matomoPaq.push(["trackEvent", eventName]);
        } else {
          matomoPaq.push(["trackEvent", eventName, JSON.stringify(properties)]);
        }
        break;
    }
  }
}

const apiClient = new AuthApi();

export default apiClient;
export { AuthApi as API, apiClient };
