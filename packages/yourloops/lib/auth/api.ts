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

import bows from "bows";
import _ from "lodash";

import { APIErrorResponse } from "models/error";
import { User, UserRoles, Profile, Preferences, Settings } from "../../models/shoreline";
import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";

import appConfig from "../config";
import { t } from "../language";
import HttpStatus from "../http-status-codes";

import { Session } from "./models";

const log = bows("Auth API");
const failedLoginCounter = new Map<string, number>();

/**
 * Perform a login.
 * @param {string} username Generally an email
 * @param {string} password The account password
 * @param {string} traceToken A generated uuidv4 trace token
 * @return {Promise<User>} Return the logged-in user or a promise rejection.
 */
async function authenticate(username: string, password: string, traceToken: string): Promise<Session> {
  let reason: string | null = null;

  if (!_.isString(username) || _.isEmpty(username)) {
    reason = t("no-username") as string;
    return Promise.reject(new Error(reason));
  }

  if (!_.isString(password) || _.isEmpty(password)) {
    reason = t("no-password") as string;
    return Promise.reject(new Error(reason));
  }

  log.debug("login: /auth/login", appConfig.API_HOST);
  const authURL = new URL("/auth/login", appConfig.API_HOST);

  const response = await fetch(authURL.toString(), {
    method: "POST",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });

  if (!response.ok || response.status !== HttpStatus.StatusOK) {
    switch (response.status) {
    case HttpStatus.StatusUnauthorized:
      if (typeof appConfig.MAX_FAILED_LOGIN_ATTEMPTS === "number") {
        let wrongCredentialCount = failedLoginCounter.get(username) ?? 0;
        wrongCredentialCount += 1;
        failedLoginCounter.set(username, wrongCredentialCount);
        if (wrongCredentialCount >= appConfig.MAX_FAILED_LOGIN_ATTEMPTS) {
          reason = t(
            "Your account has been locked for {{numMinutes}} minutes. You have reached the maximum number of login attempts.",
            { numMinutes: appConfig.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT }
          );
        }
      }
      if (reason === null) {
        reason = t("Wrong username or password");
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

    // this.sendMetrics("Login failed", reason);
    return Promise.reject(new Error(reason as string));
  }

  // this.wrongCredentialCount = 0;
  const sessionToken = response.headers.get(HttpHeaderKeys.sessionToken);
  if (sessionToken === null) {
    reason = t("An error occurred while logging in.");
    return Promise.reject(new Error(reason as string));
  }

  const user = (await response.json()) as User;
  // FIXME will be sent correctly by the API
  if (!Array.isArray(user.roles)) {
    user.roles = [UserRoles.patient];
  } else {
    user.roles = [UserRoles.hcp];
  }

  // We may miss some case, but it's probably good enough:
  failedLoginCounter.clear();

  return { sessionToken, traceToken, user };
}

async function getProfile(auth: Readonly<Session>): Promise<Profile | null> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/profile`, appConfig.API_HOST);

  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
  });

  let profile: Profile | null = null;
  if (response.ok) {
    try {
      profile = (await response.json()) as Profile;
    } catch (e) {
      log.debug(e);
    }
  } else if (response.status === HttpStatus.StatusNotFound) {
    log.debug("Error : 404 not found");
  } else {
    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  return profile;
}

async function getPreferences(auth: Readonly<Session>): Promise<Preferences | null> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/preferences`, appConfig.API_HOST);
  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
  });

  let preferences: Preferences | null = null;
  if (response.ok) {
    try {
      preferences = (await response.json()) as Preferences;
    } catch (e) {
      log.debug(e);
    }
  } else if (response.status === HttpStatus.StatusNotFound) {
    log.debug("Error : 404 not found");
  } else {
    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  return preferences;
}

async function getSettings(auth: Readonly<Session>): Promise<Settings | null> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/settings`, appConfig.API_HOST);
  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    headers: {
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
  });

  let settings: Settings | null = null;
  if (response.ok) {
    try {
      settings = (await response.json()) as Settings;
    } catch (e) {
      log.debug(e);
    }
  } else if (response.status === HttpStatus.StatusNotFound) {
    log.debug("Error : 404 not found");
  } else {
    const responseBody = (await response.json()) as APIErrorResponse;
    throw new Error(t(responseBody.reason));
  }

  return settings;
}

/**
 * Perform a login.
 * @param {string} username Generally an email
 * @param {string} password The account password
 * @param {string} traceToken A generated uuidv4 trace token
 * @return {Promise<User>} Return the logged-in user or a promise rejection.
 */
async function login(username: string, password: string, traceToken: string): Promise<Session> {
  const auth = await authenticate(username, password, traceToken);
  const [profile, preferences, settings] = await Promise.all([getProfile(auth), getPreferences(auth), getSettings(auth)]);
  if (profile !== null) {
    auth.user.profile = profile;
  }
  if (preferences !== null) {
    auth.user.preferences = preferences;
  }
  if (settings !== null) {
    auth.user.settings = settings;
  }
  return auth;
}

async function updateProfile(auth: Readonly<Session>): Promise<Profile> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/profile`, appConfig.API_HOST);
  const profile = auth.user.profile ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
    body: JSON.stringify(profile),
  });

  if (response.ok) {
    return (await response.json()) as Profile;
  }
  const responseBody = (await response.json()) as APIErrorResponse;
  throw new Error(t(responseBody.reason));
}

async function updatePreferences(auth: Readonly<Session>): Promise<Preferences> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/preferences`, appConfig.API_HOST);
  const preferences = auth.user.preferences ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
    body: JSON.stringify(preferences),
  });

  if (response.ok) {
    return response.json() as Promise<Preferences>;
  }
  const responseBody = (await response.json()) as APIErrorResponse;
  throw new Error(t(responseBody.reason));
}

async function updateSettings(auth: Readonly<Session>): Promise<Settings> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/settings`, appConfig.API_HOST);
  const settings = auth.user.settings ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: auth.traceToken,
      [HttpHeaderKeys.sessionToken]: auth.sessionToken,
    },
    body: JSON.stringify(settings),
  });

  if (response.ok) {
    return (await response.json()) as Settings;
  }
  const responseBody = (await response.json()) as APIErrorResponse;
  throw new Error(t(responseBody.reason));
}

export default {
  login,
  updateProfile,
  updatePreferences,
  updateSettings,
};
