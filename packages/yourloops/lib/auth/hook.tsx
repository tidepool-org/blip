/**
 * Copyright (c) 2021, Diabeloop
 * Hook for auth API
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
import _ from "lodash";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { v4 as uuidv4, validate as validateUuid } from "uuid";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { User, Profile, Preferences, Settings } from "models/shoreline";
import sendMetrics from "../metrics";
import { Session, AuthAPI, AuthContext, AuthProvider } from "./models";
import AuthAPIImpl from "./api";

const STORAGE_KEY_SESSION_TOKEN = "session-token";
const STORAGE_KEY_TRACE_TOKEN = "trace-token";
const STORAGE_KEY_USER = "logged-in-user";

const ReactAuthContext = React.createContext({} as AuthContext);
const log = bows("AuthHook");

/**
 * Provider hook that creates auth object and handles state
 */
function AuthContextImpl(api: AuthAPI): AuthContext {
  const historyHook = useHistory();
  const { t } = useTranslation("yourloops");
  // Trace token is used to trace the calls betweens different microservices API calls for debug purpose.
  const [traceToken, setTraceToken] = React.useState<string | null>(null);
  // JWT token as a string.
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  // Current authenticated user
  const [user, setUser] = React.useState<User | null>(null);

  // Get the current location path, needed to redirect on refresh the page
  const pathname = historyHook.location.pathname;

  const initialized = (): boolean => traceToken !== null;
  const isLoggedIn = (): boolean => sessionToken !== null && traceToken !== null && user !== null;
  const session = (): Session | null => sessionToken !== null && traceToken !== null && user !== null ? { sessionToken, traceToken, user } : null;

  const getAuthInfos = (): Promise<Session> => {
    if (sessionToken !== null && traceToken !== null && user !== null) {
      return Promise.resolve({ sessionToken, traceToken, user });
    }
    return Promise.reject(new Error(t("not-logged-in")));
  };

  // Wrap any methods we want to use making sure
  // to save the user to state.
  const login = async (username: string, password: string): Promise<User> => {
    log.info("login", username);
    if (traceToken === null) {
      throw new Error("not-yet-initialized");
    }
    const auth = await api.login(username, password, traceToken);
    sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, auth.sessionToken);
    sessionStorage.setItem(STORAGE_KEY_TRACE_TOKEN, auth.traceToken);
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(auth.user));
    setUser(auth.user);
    setSessionToken(auth.sessionToken);
    // FIXME: Test if the user as consent
    sendMetrics("setUserId", auth.user.userid);
    return auth.user;
  };

  const updateProfile = async (roUser: Readonly<User>): Promise<Profile> => {
    log.info("updateProfile", roUser.userid);
    const authInfo = await getAuthInfos();
    const profile = await api.updateProfile({ ...authInfo, user: roUser });
    if (authInfo.user.userid === roUser.userid) {
      const updatedUser = _.cloneDeep(authInfo.user);
      updatedUser.profile = profile;
      setUser(updatedUser);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
    return profile;
  };

  const updatePreferences = async (roUser: Readonly<User>): Promise<Preferences> => {
    log.info("updatePreferences", roUser.userid);
    const authInfo = await getAuthInfos();
    const preferences = await api.updatePreferences({ ...authInfo, user: roUser });
    if (authInfo.user.userid === roUser.userid) {
      const updatedUser = _.cloneDeep(authInfo.user);
      updatedUser.preferences = preferences;
      setUser(updatedUser);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
    return preferences;
  };

  const updateSettings = async (roUser: Readonly<User>): Promise<Settings> => {
    log.info("updateSettings", roUser.userid);
    const authInfo = await getAuthInfos();
    const settings = await api.updateSettings({ ...authInfo, user: roUser });
    if (authInfo.user.userid === roUser.userid) {
      const updatedUser = _.cloneDeep(authInfo.user);
      updatedUser.settings = settings;
      setUser(updatedUser);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
    return settings;
  };

  const signup = (username: string, password: string): void => {
    log.info("signup", username, password);
  };

  const flagPatient = async (userId: string): Promise<void> => {
    log.info("flagPatient", userId);
    const authInfo = await getAuthInfos();
    const updatedUser = _.cloneDeep(authInfo.user);
    if (typeof updatedUser.preferences === "undefined") {
      updatedUser.preferences = {};
    }
    if (!Array.isArray(updatedUser.preferences.patientsStarred)) {
      updatedUser.preferences.patientsStarred = [userId];
    } else if (updatedUser.preferences.patientsStarred.includes(userId)) {
      const patientsStarred = updatedUser.preferences.patientsStarred.filter((id: string) => id !== userId);
      updatedUser.preferences.patientsStarred = patientsStarred;
    } else {
      updatedUser.preferences.patientsStarred.push(userId);
    }
    log.debug("starred", updatedUser.preferences.patientsStarred);
    updatedUser.preferences = await api.updatePreferences({ ...authInfo, user: updatedUser });
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const setFlagPatients = async (userIds: string[]): Promise<void> => {
    log.info("setFlagPatients", userIds);
    const authInfo = await getAuthInfos();
    const updatedUser = _.cloneDeep(authInfo.user);
    if (typeof updatedUser.preferences === "undefined") {
      updatedUser.preferences = {};
    }
    updatedUser.preferences.patientsStarred = userIds;
    log.debug("starred", updatedUser.preferences.patientsStarred);
    updatedUser.preferences = await api.updatePreferences({ ...authInfo, user: updatedUser });
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const getFlagPatients = (): string[] => {
    const flagged = user?.preferences?.patientsStarred;
    if (Array.isArray(flagged)) {
      return Array.from(flagged);
    }
    return [];
  };

  const logout = (): void => {
    log.info("logout");
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sendMetrics("resetUserId");

    setUser(null);
    setSessionToken(null);
    setTraceToken(null);
  };

  const sendPasswordResetEmail = (username: string): Promise<boolean> => {
    log.info("sendPasswordResetEmail", username);
    return Promise.resolve(true);
  };

  const initHook = () => {
    // const onStorageChange = (ev: StorageEvent) => {
    //   log.debug("onStorageChange");
    //   if (ev.storageArea === sessionStorage) {
    //     log.info("onStorageChange", ev.storageArea);
    //     // Not sure on this one
    //     window.removeEventListener("storage", onStorageChange);
    //     setInitialized(false);
    //   }
    // };

    const unmount = () => {
      log.debug("TODO useEffect unmount");
      // window.removeEventListener("storage", onStorageChange);
    };

    // Use traceToken to know if the API hook is initialized
    if (traceToken === null) {
      log.info("init");

      const sessionTokenStored = sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
      const traceTokenStored = sessionStorage.getItem(STORAGE_KEY_TRACE_TOKEN);
      const userStored = sessionStorage.getItem(STORAGE_KEY_USER);

      if (sessionTokenStored === null || traceTokenStored === null || userStored === null) {
        // Clear the storage if one is missing at this point
        sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_USER);
      } else {
        try {
          // FIXME check storage items validity
          const currentUser = JSON.parse(userStored) as User;
          if (!validateUuid(traceTokenStored)) {
            throw new Error("Invalid trace token uuid");
          }
          const decoded = jwtDecode<JwtPayload>(sessionTokenStored);
          if (typeof decoded.exp === "undefined") {
            throw new Error("Invalid session token");
          }
          if (decoded.exp < (Date.now() / 1000)) {
            throw new Error("Session token as expired");
          }

          log.info("Token expiration date:", new Date(decoded.exp * 1000).toISOString());

          setSessionToken(sessionTokenStored);
          setTraceToken(traceTokenStored);
          setUser(currentUser);

          if (pathname !== historyHook.location.pathname) {
            log.info("Reused session storage items, and redirect to", pathname);
            historyHook.push(pathname);
          }

        } catch (e) {
          log.warn("Invalid auth in session storage", e);
          sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY_USER);
        }
      }
      // window.addEventListener("storage", onStorageChange);
    }

    if (traceToken === null) {
      // Create a trace token since, we do not have one set in
      // the DOM storage
      setTraceToken(uuidv4());
    }

    return unmount;
  };

  React.useEffect(initHook, [historyHook, pathname, traceToken]);

  // Return the user object and auth methods
  return {
    user,
    sessionToken,
    traceToken,
    initialized,
    session,
    setUser,
    login,
    updateProfile,
    updatePreferences,
    updateSettings,
    logout,
    signup,
    isLoggedIn,
    sendPasswordResetEmail,
    flagPatient,
    setFlagPatients,
    getFlagPatients,
  };
}

// Hook for child components to get the auth object
// and re-render when it changes.
export function useAuth(): AuthContext {
  return React.useContext(ReactAuthContext);
}

/**
 * Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
 * @param props for auth provider & children
 */
export function AuthContextProvider(props: AuthProvider): JSX.Element {
  const { children, api, value } = props;
  const authValue = value ?? AuthContextImpl(api ?? AuthAPIImpl); // eslint-disable-line new-cap
  return <ReactAuthContext.Provider value={authValue}>{children}</ReactAuthContext.Provider>;
}
