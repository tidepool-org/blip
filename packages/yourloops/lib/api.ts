/**
 * Copyright (c) 2020, Diabeloop
 * Yourloops API client
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
import { v4 as uuidv4 } from "uuid";
import bows from "bows";
import _ from "lodash";

import { User, Profile } from "models/shoreline";
import { PatientData } from "models/device-data";
import { APIErrorResponse } from "models/error";
import { MessageNote } from "models/message";

import { defer } from "./utils";
import appConfig from "./config";
import { t } from "./language";

import http from "./http-status-codes";

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

class API extends EventTarget {
  /** JWT token as a string */
  private sessionToken: string | null;
  /** Trace token is used to trace the calls betweens different microservices API calls for debug purpose. */
  private traceToken: string | null;
  /** Logged-in user information */
  private user: User | null;
  private log: Console;
  private loginLock: boolean;
  /** patients list */
  private patients: User[] | null;

  constructor() {
    super();
    this.sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    this.traceToken = sessionStorage.getItem(TRACE_TOKEN_KEY);

    this.user = null;
    this.patients = null;

    const loggedInUser = sessionStorage.getItem(LOGGED_IN_USER);
    if (loggedInUser !== null) {
      this.user = JSON.parse(loggedInUser);
    }

    this.log = bows("API");
    this.loginLock = false;

    // Listen to storage events, to be able to monitor
    // logout on others tabs.
    window.addEventListener("storage", this.onStorageChange.bind(this));

    this.log.info("API initialized");
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
    return this.sessionToken !== null && this.traceToken !== null && this.user !== null;
  }

  public get userIsPatient(): boolean {
    return this.isLoggedIn && !_.isEmpty(this.user?.profile?.patient);
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
  private async loginPrivate(username: string, password: string): Promise<User> {
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

    if (response.ok && response.status === http.StatusOK) {
      this.sessionToken = response.headers.get(SESSION_TOKEN_HEADER);
    } else {
      /** @type{APIErrorResponse} */
      const responseBody = await response.json() as APIErrorResponse;
      reason = t(responseBody.reason);
    }

    if (this.sessionToken === null) {
      reason = t("Invalid response from server");
    } else {
      this.user = await response.json() as User;
      if (!Array.isArray(this.user.roles)) {
        this.user.roles = ["patient"];
      }
      sessionStorage.setItem(SESSION_TOKEN_KEY, this.sessionToken);
      sessionStorage.setItem(LOGGED_IN_USER, JSON.stringify(this.user));

      this.sendMetrics("setUserId", this.user.userid);

      return this.user;
    }

    if (reason === null) {
      reason = "Internal error";
    }

    this.sendMetrics("Login failed", reason);
    return Promise.reject(new Error(reason));
  }

  /**
   * Perform a login.
   * @param {string} username Generally an email
   * @param {string} password The account password
   * @return {Promise<User>} Return the logged-in user or a promise rejection.
   */
  async login(username: string, password: string): Promise<User> {
    this.loginLock = true;
    return this.loginPrivate(username, password)
      .then((user: User) => {
        return this.getUserProfile(user);
      }).finally(() => {
        this.loginLock = false;
      });
  }

  /**
   * Logout the user => Clear the session & trace tokens
   */
  logout(): void {
    if (this.loginLock && this.isLoggedIn) {
      this.sessionToken = null;
      this.traceToken = null;
      this.user = null;
      this.patients = null;
      sessionStorage.removeItem(TRACE_TOKEN_KEY);
      sessionStorage.removeItem(TRACE_TOKEN_KEY);
      sessionStorage.removeItem(LOGGED_IN_USER);
    } else if (this.isLoggedIn) {
      this.loginLock = true;
      this.sendMetrics("resetUserId");
      this.sessionToken = null;
      this.traceToken = null;
      this.user = null;
      this.patients = null;
      sessionStorage.removeItem(TRACE_TOKEN_KEY);
      sessionStorage.removeItem(TRACE_TOKEN_KEY);
      sessionStorage.removeItem(LOGGED_IN_USER);
      this.dispatchEvent(new Event("logout"));
      this.loginLock = false;
    }
  }

  public async getUserShares(): Promise<User[]> {
    if (!this.isLoggedIn) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }

    const seagullURL = new URL(`/metadata/users/${this.user?.userid}/users`, appConfig.API_HOST);
    const response = await fetch(seagullURL.toString(), {
      method: "GET",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
    });
    if (response.ok) {
      this.patients = await response.json() as User[];
      return this.patients;
    }

    const responseBody = await response.json() as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  public async getUserProfile(user: User): Promise<User> {
    if (!this.isLoggedIn) {
      // Users should never see this:
      throw new Error(t("You are not logged-in"));
    }

    const seagullURL = new URL(`/metadata/${user.userid}/profile`, appConfig.API_HOST);

    const response = await fetch(seagullURL.toString(), {
      method: "GET",
      headers: {
        [TRACE_SESSION_HEADER]: this.traceToken as string,
        [SESSION_TOKEN_HEADER]: this.sessionToken as string,
      },
    });

    if (response.ok) {
      user.profile = await response.json() as Profile;
    } else {
      const responseBody = await response.json() as APIErrorResponse;
      throw new Error(t(responseBody.reason));
    }

    sessionStorage.setItem(LOGGED_IN_USER, JSON.stringify(this.user));
    return user;
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
      const patientData = await response.json() as PatientData;

      defer(() => {
        this.dispatchEvent(new PatientDataLoadedEvent(patient as User, patientData));
      });

      return patientData;
    }

    const responseBody = await response.json() as APIErrorResponse;
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

    const messageURL = new URL(`/message/send/${message.groupid}`, appConfig.API_HOST);
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

    const responseBody = await response.json() as APIErrorResponse;
    throw new Error(t(responseBody.reason));
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
        this.log.error("Matomo do not seems to be available, wrong configuration");
      } if (eventName === "CookieConsent") {
        matomoPaq.push(["setConsentGiven", properties]);
      } else if (eventName === "setCustomUrl") {
        matomoPaq.push(["setCustomUrl", properties]);
      } else if (eventName === "setUserId") {
        matomoPaq.push(["setUserId", properties]);
      } else if (eventName === "resetUserId") {
        matomoPaq.push(["resetUserId"]);
      } else if (eventName === "setDocumentTitle" && typeof properties === "string") {
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

const apiClient = new API();

export default apiClient;
export { API, apiClient };
