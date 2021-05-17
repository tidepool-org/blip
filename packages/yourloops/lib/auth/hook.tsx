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

import { User, Profile, Preferences, Settings, UserRoles } from "../../models/shoreline";
import { availableLanguageCodes, getCurrentLang, changeLanguage } from "../language";
import sendMetrics from "../metrics";
import { zendeskLogin, zendeskLogout } from "../zendesk";
import { Session, AuthAPI, AuthContext, AuthProvider } from "./models";
import AuthAPIImpl from "./api";
import { SignUpFormState } from "pages/signup/signup-formstate-context";

interface JwtShorelinePayload extends JwtPayload {
  role: "hcp" | "patient" | "caregiver" | "clinic";
  /** username: an e-mail */
  name: string;
  email: string;
  /** userid */
  usr: string;
  /** yes for server token - we will never have that in Blip: always "no" */
  srv: "yes" | "no";
}

export const STORAGE_KEY_SESSION_TOKEN = "session-token";
export const STORAGE_KEY_TRACE_TOKEN = "trace-token";
export const STORAGE_KEY_USER = "logged-in-user";

const ReactAuthContext = React.createContext({} as AuthContext);
const log = bows("AuthHook");

const updateLanguageForUser = (user: User) => {
  const userLanguage = user.preferences?.displayLanguageCode;
  if (typeof userLanguage === "string" && availableLanguageCodes.includes(userLanguage) && userLanguage !== getCurrentLang()) {
    log.info("Update language to user preferences", { userLanguage, currentLanguage: getCurrentLang() });
    // Update the current UI language based on the user preferences
    changeLanguage(userLanguage);
  }
};

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
  const [user, setUserPrivate] = React.useState<User | null>(null);

  // Get the current location path, needed to redirect on refresh the page
  const pathname = historyHook.location.pathname;

  const initialized = (): boolean => traceToken !== null;
  const isLoggedIn = (): boolean => sessionToken !== null && traceToken !== null && user !== null;
  const session = (): Session | null => sessionToken !== null && traceToken !== null && user !== null ? { sessionToken, traceToken, user } : null;

  const getAuthInfos = (): Promise<Session> => {
    const s = session();
    if (s !== null) {
      return Promise.resolve(s);
    }
    return Promise.reject(new Error(t("not-logged-in")));
  };

  /**
   * Update hook users infos, perform zendesk & matomo login
   * @param session sessionToken
   * @param trace traceToken
   * @param usr user
   */
  const setAuthInfos = React.useCallback((session: string, trace: string, usr: User): void => {
    updateLanguageForUser(usr);
    setUserPrivate(usr);
    if (session !== sessionToken) {
      setSessionToken(session);
    }
    if (trace !== traceToken) {
      setTraceToken(trace);
    }
    zendeskLogin();
    sendMetrics("setUserId", usr.userid);
  }, [sessionToken, traceToken]);

  /**
   * - Update the hook user (no API call is performed with this function)
   * - Update the storage
   * @param u The user
   */
  const setUser = (u: User): void => {
    setUserPrivate(u);
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
  };

  // Wrap any methods we want to use making sure
  // to save the user to state.
  const login = async (username: string, password: string, key: string | null): Promise<User> => {
    log.info("login", username);
    if (traceToken === null) {
      throw new Error("not-yet-initialized");
    }

    if (key !== null) {
      await api.accountConfirmed(key, traceToken);
    }

    const auth = await api.login(username, password, traceToken);
    const tokenInfos = jwtDecode<JwtShorelinePayload>(auth.sessionToken);
    let loggedUser: User;
    if (!_.isString(tokenInfos.role)) {
      // old API support
      let role = _.get(auth.user, 'roles[0]', UserRoles.patient);
      if (role === "clinic") {
        role = UserRoles.caregiver;
      }
      loggedUser = { ...auth.user, role };
      log.warn("User as a clinic role");
    } else if (tokenInfos.role === "clinic") {
      // TODO After BDD migration this check will be useless
      loggedUser = { ...auth.user, role: UserRoles.caregiver };
    } else {
      loggedUser = { ...auth.user, role: tokenInfos.role as UserRoles };
    }

    const expirationDate = tokenInfos.exp;
    if (typeof expirationDate === "number" && Number.isSafeInteger(expirationDate)) {
      log.info("Authenticated until ", new Date(expirationDate * 1000).toISOString());
    }

    sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, auth.sessionToken);
    sessionStorage.setItem(STORAGE_KEY_TRACE_TOKEN, auth.traceToken);
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedUser));

    setAuthInfos(auth.sessionToken, auth.traceToken, loggedUser);
    return loggedUser;
  };

  const updatePreferences = async (preferences: Preferences, refresh = true): Promise<Preferences> => {
    const authInfo = await getAuthInfos();
    log.info("updatePreferences", authInfo.user.userid);
    const updatedUser = _.cloneDeep(authInfo.user);
    updatedUser.preferences = preferences;
    const updatedPreferences = await api.updatePreferences({ ...authInfo, user: updatedUser });
    if (refresh) {
      updatedUser.preferences = updatedPreferences;
      setUser(updatedUser);
    }
    return updatedPreferences;
  };

  const updateProfile = async (profile: Profile, refresh = true): Promise<Profile> => {
    const authInfo = await getAuthInfos();
    log.info("updateProfile", authInfo.user.userid);
    const updatedUser = _.cloneDeep(authInfo.user);
    updatedUser.profile = profile;
    const updatedProfile = await api.updateProfile({ ...authInfo, user: updatedUser });
    if (refresh) {
      updatedUser.profile = updatedProfile;
      setUser(updatedUser);
    }
    return updatedProfile;
  };

  const updateSettings = async (settings: Settings, refresh = true): Promise<Settings> => {
    const authInfo = await getAuthInfos();
    log.info("updateSettings", authInfo.user.userid);
    const updatedUser = _.cloneDeep(authInfo.user);
    updatedUser.settings = settings;
    const updatedSettings = await api.updateSettings({ ...authInfo, user: updatedUser });
    if (refresh) {
      updatedUser.settings = updatedSettings;
      setUser(updatedUser);
    }
    return settings;
  };

  const updatePassword = async (currentPassword: string, password: string): Promise<void> => {
    const authInfo = await getAuthInfos();
    if (authInfo.user.role === UserRoles.patient) {
      throw new Error("invalid-user-role");
    }

    return api.updateUser(authInfo, { currentPassword, password });
  };

  const signup = async (signup: SignUpFormState): Promise<void> => {
    log.info("signup", signup.formValues.accountUsername);
    const now = new Date().toISOString();
    if (traceToken === null) {
      throw new Error("not-yet-initialized");
    }
    const auth = await api.signup(
      signup.formValues.accountUsername,
      signup.formValues.accountPassword,
      signup.formValues.accountRole,
      traceToken
    );

    auth.user.profile = {
      fullName: `${signup.formValues.profileFirstname} ${signup.formValues.profileLastname}`,
      firstName: signup.formValues.profileFirstname,
      lastName: signup.formValues.profileLastname,
      job: signup.formValues.profileJob,
      termsOfUse: { AcceptanceDate: now, IsAccepted: signup.formValues.terms },
      privacyPolicy: { AcceptanceDate: now, IsAccepted: signup.formValues.privacyPolicy },
    };
    auth.user.settings = { country: signup.formValues.profileCountry };
    auth.user.preferences = { displayLanguageCode: signup.formValues.preferencesLanguage };

    // Cannot Use Promise.All as Backend do not handle parrellel call
    // correctly
    await api.updateProfile(auth);
    await api.updateSettings(auth);
    await api.updatePreferences(auth);

    // send confirmation signup mail
    await api.sendAccountValidation(auth, signup.formValues.preferencesLanguage);

    log.info("signup done", auth);
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
    if (typeof window.cleanBlipReduxStore === 'function') {
      window.cleanBlipReduxStore();
    }
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sendMetrics("resetUserId");
    zendeskLogout();

    setUserPrivate(null);
    setSessionToken(null);
    setTraceToken(null);
  };

  /**
   * @returns true if the email was sucessfully sent.
   */
  const sendPasswordResetEmail = async (username: string, language: string): Promise<boolean> => {
    log.info("sendPasswordResetEmail", username);
    if (traceToken === null) {
      throw new Error("not-yet-initialized");
    }
    const response = await api.requestPasswordReset(
      username,
      traceToken,
      language
    );

    return response;
  };

  const resetPassword = (key: string | null, username: string, password: string): Promise<boolean> => {
    if (traceToken === null) {
      throw new Error("not-yet-initialized");
    }
    return api.resetPassword(key, username, password, traceToken);
  };

  const switchRoleToHCP = async (): Promise<void> => {
    const authInfo = await getAuthInfos();
    if (authInfo.user.role !== UserRoles.caregiver) {
      throw new Error("invalid-user-role");
    }

    // Call first Update user as it is the most importat call
    // if it failed, for now we dont have compensation transaction that revert db change
    await api.updateUser(authInfo, { roles: [UserRoles.hcp] });

    // FIXME
    if (authInfo.user?.profile !== undefined) {
      const now = new Date().toISOString();
      authInfo.user.profile.termsOfUse = { AcceptanceDate: now, IsAccepted: true };
      authInfo.user.profile.privacyPolicy = { AcceptanceDate: now, IsAccepted: true };
      await api.updateProfile(authInfo);
    }

    // Ask for a new token with the updated role
    const newToken = await api.refreshToken(authInfo);
    const tokenInfos = jwtDecode<JwtShorelinePayload>(newToken);
    // Check we have the new role
    if (tokenInfos.role !== UserRoles.hcp) {
      throw new Error("Role change is not effective");
    }
    // Refresh our data:
    const updatedUser: User = { ...authInfo.user, role: UserRoles.hcp };
    sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, newToken);
    setSessionToken(newToken);
    setUser(updatedUser);
  };

  const initHook = () => {
    log.info("init");

    // TODO: Do not delete me yet
    // const onStorageChange = (ev: StorageEvent) => {
    //   log.debug("onStorageChange");
    //   if (ev.storageArea === sessionStorage) {
    //     log.info("onStorageChange", ev.storageArea);
    //     // Not sure on this one
    //     window.removeEventListener("storage", onStorageChange);
    //     setInitialized(false);
    //   }
    // };
    // const unmount = () => {
    //   window.removeEventListener("storage", onStorageChange);
    // };

    // Prevent to set two times the trace token, when we have found one in the storage.
    let initializedFromStorage = false;

    // Use traceToken to know if the API hook is initialized
    if (traceToken === null) {

      const sessionTokenStored = sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
      const traceTokenStored = sessionStorage.getItem(STORAGE_KEY_TRACE_TOKEN);
      const userStored = sessionStorage.getItem(STORAGE_KEY_USER);

      if (sessionTokenStored === null || traceTokenStored === null || userStored === null) {
        // Clear the storage if one is missing at this point
        sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_USER);
        zendeskLogout();
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

          initializedFromStorage = true;
          setAuthInfos(sessionTokenStored, traceTokenStored, currentUser);

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

    if (traceToken === null && !initializedFromStorage) {
      // Create a trace token since, we do not have one set in
      // the DOM storage
      setTraceToken(uuidv4());
    }

    // return unmount;
  };

  React.useEffect(initHook, [historyHook, pathname, traceToken, setAuthInfos]);

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
    updatePassword,
    logout,
    signup,
    isLoggedIn,
    sendPasswordResetEmail,
    resetPassword,
    flagPatient,
    setFlagPatients,
    getFlagPatients,
    switchRoleToHCP,
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
