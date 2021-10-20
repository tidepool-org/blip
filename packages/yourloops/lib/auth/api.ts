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

import { APIErrorResponse } from "../../models/error";
import { Profile, Preferences, Settings, UserRoles, IUser } from "../../models/shoreline";
import { HttpHeaderKeys, HttpHeaderValues } from "../../models/api";

import { errorFromHttpStatus } from "../utils";
import appConfig from "../config";
import { t } from "../language";
import HttpStatus from "../http-status-codes";

import { Session, UpdateUser } from "./models";
import User from "./user";

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
  if (!_.isString(username) || _.isEmpty(username)) {
    return Promise.reject(new Error("no-username"));
  }

  if (!_.isString(password) || _.isEmpty(password)) {
    return Promise.reject(new Error("no-password"));
  }

  log.debug("login: /auth/login", appConfig.API_HOST);
  const authURL = new URL("/auth/login", appConfig.API_HOST);

  try {
    // Allow username / password with non ASCII characters
    // Endode the string to UTF-8 first
    const encoder = new TextEncoder();
    const utf8 = encoder.encode(`${username}:${password}`);
    const basicAuth = btoa(String.fromCharCode.apply(null, utf8 as unknown as number[]));

    const response = await fetch(authURL.toString(), {
      method: "POST",
      cache: "no-store",
      headers: {
        [HttpHeaderKeys.traceToken]: traceToken,
        Authorization: `Basic ${basicAuth}`,
      },
    });

    if (!response.ok || response.status !== HttpStatus.StatusOK) {
      let reason: string | null = null;
      switch (response.status) {
      case HttpStatus.StatusUnauthorized:
        if (typeof appConfig.MAX_FAILED_LOGIN_ATTEMPTS === "number") {
          let wrongCredentialCount = failedLoginCounter.get(username) ?? 0;
          wrongCredentialCount += 1;
          failedLoginCounter.set(username, wrongCredentialCount);
          if (wrongCredentialCount >= appConfig.MAX_FAILED_LOGIN_ATTEMPTS) {
            reason = "error-account-lock";
          }
        }
        break;
      case HttpStatus.StatusForbidden:
        reason = "email-not-verified";
        break;
      default:
        reason = "error-http-500";
        break;
      }

      if (reason === null) {
        reason = "error-invalid-credentials";
      }

      return Promise.reject(new Error(reason));
    }

    const sessionToken = response.headers.get(HttpHeaderKeys.sessionToken);
    if (sessionToken === null) {
      return Promise.reject(new Error("error-http-40x"));
    }

    const user = await response
      .json()
      .then((res: IUser) => new User(res));

    // We may miss some case, but it's probably good enough:
    failedLoginCounter.clear();

    return { sessionToken, traceToken, user };
  } catch (reason) {
    return Promise.reject(new Error("error-http-500"));
  }
}


/**
 * Perform a signup.
 * @param {string} username Generally an email
 * @param {string} password The account password
 * @param {string} traceToken A generated uuidv4 trace token
 * @return {Promise<User>} Return the logged-in user or a promise rejection.
 */
async function signup(username: string, password: string, role: UserRoles, traceToken: string): Promise<Session> {
  if (!_.isString(username) || _.isEmpty(username)) {
    return Promise.reject(new Error("no-username"));
  }

  if (!_.isString(password) || _.isEmpty(password)) {
    return Promise.reject(new Error("no-password"));
  }

  log.debug("signup", username, role);
  const authURL = new URL("/auth/user", appConfig.API_HOST);

  try {
    const response = await fetch(authURL.toString(), {
      cache: "no-store",
      method: "POST",
      headers: {
        [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
        [HttpHeaderKeys.traceToken]: traceToken,
      },
      body: JSON.stringify({
        username,
        password,
        emails: [username],
        roles: [role],
      }),
    });

    if (response.ok) {
      const sessionToken = response.headers.get(HttpHeaderKeys.sessionToken);
      if (sessionToken === null) {
        return Promise.reject(new Error("error-http-40x"));
      }

      const user = await response
        .json()
        .then((res: IUser) => new User(res));

      return Promise.resolve({
        sessionToken,
        traceToken,
        user,
      });
    }

    return Promise.reject(errorFromHttpStatus(response, log));
  } catch (reason) {
    return Promise.reject(new Error("error-http-500"));
  }
}

async function resendSignup(username: string, traceToken: string, language = "en"): Promise<boolean> {
  if (!_.isString(username) || _.isEmpty(username)) {
    return Promise.reject(new Error("no-username"));
  }

  log.debug("resendSignup", username);
  const resendURL = new URL(`/confirm/resend/signup/${username}`, appConfig.API_HOST);
  const response = await fetch(resendURL.toString(), {
    method: "POST",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.language]: language,
    },
  });

  return response.ok;
}

async function getProfile(session: Readonly<Session>, userId?: string): Promise<Profile | null> {
  const seagullURL = new URL(`/metadata/${userId ?? session.user.userid}/profile`, appConfig.API_HOST);

  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
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
    log.debug(`No profile for ${userId ?? session.user.userid}`);
  } else {
    return Promise.reject(errorFromHttpStatus(response, log));
  }

  return profile;
}

async function getPreferences(session: Readonly<Session>, userId?: string): Promise<Preferences | null> {
  const seagullURL = new URL(`/metadata/${userId ?? session.user.userid}/preferences`, appConfig.API_HOST);
  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
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
    log.debug(`No preferences for ${userId ?? session.user.userid}`);
  } else {
    return Promise.reject(errorFromHttpStatus(response, log));
  }

  return preferences;
}

async function getSettings(session: Readonly<Session>, userId?: string): Promise<Settings | null> {
  const seagullURL = new URL(`/metadata/${userId ?? session.user.userid}/settings`, appConfig.API_HOST);
  const response = await fetch(seagullURL.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
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
    log.debug(`No settings for ${userId ?? session.user.userid}`);
  } else {
    return Promise.reject(errorFromHttpStatus(response, log));
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

async function requestPasswordReset(username: string, traceToken: string, language = "en", info = true): Promise<void> {
  if (_.isEmpty(username)) {
    log.error("forbidden call to request password api, username is missing");
    throw new Error("error-http-40x");
  }

  const confirmURL = new URL(
    `/confirm/send/forgot/${username}${info ? "?info=ok" : ""}`,
    appConfig.API_HOST
  );
  const response = await fetch(confirmURL.toString(), {
    method: "POST",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
      [HttpHeaderKeys.language]: language,
    },
  });

  if (response.ok) {
    return Promise.resolve();
  }
  return Promise.reject(errorFromHttpStatus(response, log));
}

async function sendAccountValidation(session: Readonly<Session>, language = "en"): Promise<boolean> {
  const confirmURL = new URL(`/confirm/send/signup/${session.user.userid}`, appConfig.API_HOST);

  const response = await fetch(confirmURL.toString(), {
    method: "POST",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.language]: language,
    },
  });

  if (response.ok) {
    return Promise.resolve(true);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function accountConfirmed(key: string, traceToken: string): Promise<boolean> {
  if (_.isEmpty(key)) {
    log.error("forbidden call to Account confirmation api, key is missing");
    throw new Error("error-http-40x");
  }

  const confirmURL = new URL(`/confirm/accept/signup/${key}`, appConfig.API_HOST);
  const response = await fetch(confirmURL.toString(), {
    method: "PUT",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: traceToken,
    },
  });

  if (response.ok) {
    return Promise.resolve(true);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function resetPassword(key: string, username: string, password: string, traceToken: string): Promise<boolean> {
  if (_.isEmpty(key) || _.isEmpty(username) || _.isEmpty(password)) {
    log.error("forbidden call to reset password api, one of the required parameters is missing");
    throw new Error("error-http-40x");
  }

  const confirmURL = new URL("/confirm/accept/forgot", appConfig.API_HOST);
  const response = await fetch(confirmURL.toString(), {
    method: "PUT",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: traceToken,
    },
    body: JSON.stringify({ key, email: username, password }),
  });

  if (response.ok) {
    return Promise.resolve(true);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function updateProfile(session: Readonly<Session>): Promise<Profile> {
  const seagullURL = new URL(`/metadata/${session.user.userid}/profile`, appConfig.API_HOST);
  const profile = session.user.profile ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
    },
    body: JSON.stringify(profile),
  });

  if (response.ok) {
    return (await response.json()) as Profile;
  }

  try {
    const responseBody = (await response.json()) as APIErrorResponse;
    return Promise.reject(new Error(t(responseBody.reason)));
  } catch (e) {
    log.error(e);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function updatePreferences(session: Readonly<Session>): Promise<Preferences> {
  const seagullURL = new URL(`/metadata/${session.user.userid}/preferences`, appConfig.API_HOST);
  const preferences = session.user.preferences ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
    },
    body: JSON.stringify(preferences),
  });

  if (response.ok) {
    return response.json() as Promise<Preferences>;
  }

  try {
    const responseBody = (await response.json()) as APIErrorResponse;
    return Promise.reject(new Error(t(responseBody.reason)));
  } catch (e) {
    log.error(e);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function updateSettings(auth: Readonly<Session>): Promise<Settings> {
  const seagullURL = new URL(`/metadata/${auth.user.userid}/settings`, appConfig.API_HOST);
  const settings = auth.user.settings ?? {};

  const response = await fetch(seagullURL.toString(), {
    method: "PUT",
    cache: "no-store",
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

  try {
    const responseBody = (await response.json()) as APIErrorResponse;
    return Promise.reject(new Error(t(responseBody.reason)));
  } catch (e) {
    log.error(e);
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function updateUser(session: Readonly<Session>, updates: UpdateUser): Promise<void> {
  const updateURL = new URL("/auth/user", appConfig.API_HOST);

  log.debug("updateUser:", updateURL.toString());
  const response = await fetch(updateURL.toString(), {
    method: "PUT",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
    },
    body: JSON.stringify({ updates }),
  });

  if (response.ok) {
    return Promise.resolve();
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function refreshToken(session: Readonly<Session>): Promise<string> {
  const refreshURL = new URL("/auth/login", appConfig.API_HOST);

  log.debug("refreshToken", refreshURL.toString());
  const response = await fetch(refreshURL.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
    },
  });

  if (response.ok) {
    const sessionToken = response.headers.get(HttpHeaderKeys.sessionToken);
    if (sessionToken === null) {
      log.error("Token not found in response header!");
      return Promise.reject(new Error("missing-token"));
    }
    return sessionToken;
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

async function logout(session: Readonly<Session>): Promise<void> {
  const refreshURL = new URL("/auth/logout", appConfig.API_HOST);

  log.debug("logout", refreshURL.toString());
  const response = await fetch(refreshURL.toString(), {
    method: "POST",
    cache: "no-store",
    headers: {
      [HttpHeaderKeys.traceToken]: session.traceToken,
      [HttpHeaderKeys.sessionToken]: session.sessionToken,
    },
  });

  if (response.ok) {
    return Promise.resolve();
  }

  return Promise.reject(errorFromHttpStatus(response, log));
}

export default {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
  resendSignup,
  sendAccountValidation,
  accountConfirmed,
  updateProfile,
  updatePreferences,
  updateSettings,
  updateUser,
  refreshToken,
  logout,
};
