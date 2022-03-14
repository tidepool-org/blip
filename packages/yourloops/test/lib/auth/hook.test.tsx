/**
 * Copyright (c) 2021, Diabeloop
 * Auth hook tests
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

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { MemoryRouter, Route } from "react-router-dom";
import * as H from "history";
import * as sinon from "sinon";
import { expect } from "chai";

import { Preferences, Profile, Settings, UserRoles } from "../../../models/shoreline";
import config from "../../../lib/config";
import { waitTimeout } from "../../../lib/utils";
import { AuthAPI, User, Session, AuthContext, SignupUser } from "../../../lib/auth";
import { AuthContextImpl } from "../../../lib/auth/hook";
import { loggedInUsers } from "../../common";
import { AuthAPIStubs, createAuthAPIStubs, resetAuthAPIStubs } from "./api.test";
import { HcpProfession } from "../../../models/hcp-profession";
import { STORAGE_KEY_SESSION_TOKEN, STORAGE_KEY_TRACE_TOKEN, STORAGE_KEY_USER } from "../../../lib/auth/models";

/**
 * Auth hook stubs definitions
 */
export interface AuthContextStubs {
  certifyProfessionalAccount: sinon.SinonStub<null, Promise<void>>;
  flagPatient: sinon.SinonStub<[string], Promise<void>>;
  getFlagPatients: sinon.SinonStub<[], string[]>;
  isAuthHookInitialized: boolean;
  isAuthInProgress: boolean;
  isLoggedIn: boolean;
  login: sinon.SinonStub<[string, string, string | null], Promise<User>>;
  logout: sinon.SinonStub<[boolean | undefined], Promise<void>>;
  redirectToProfessionalAccountLogin: sinon.SinonStub<[], void>;
  resendSignup: sinon.SinonStub<[string], Promise<boolean>>;
  resetPassword: sinon.SinonStub<[string, string, string], Promise<boolean>>;
  sendPasswordResetEmail: sinon.SinonStub<[string, string], Promise<void>>;
  session: sinon.SinonStub<[], Session | null>;
  sessionToken: string | null;
  setFlagPatients: sinon.SinonStub<[string[]], Promise<void>>;
  setUser: sinon.SinonStub<[User], void>;
  signup: sinon.SinonStub<[SignupUser], Promise<void>>;
  switchRoleToHCP: sinon.SinonStub<[boolean, HcpProfession], Promise<void>>;
  traceToken: string | null;
  updatePassword: sinon.SinonStub<[string, string], Promise<void>>;
  updatePreferences: sinon.SinonStub<[Preferences, boolean | undefined], Promise<Preferences>>;
  updateProfile: sinon.SinonStub<[Profile, boolean | undefined], Promise<Profile>>;
  updateSettings: sinon.SinonStub<[Settings, boolean | undefined], Promise<Settings>>;
  user: Readonly<User> | null;
}

/**
 * Hook Stubs
 */
export const createAuthHookStubs = (session?: Session): AuthContextStubs => ({
  certifyProfessionalAccount: sinon.stub<null, Promise<void>>().resolves(),
  flagPatient: sinon.stub<[string], Promise<void>>().resolves(),
  getFlagPatients: sinon.stub<[], string[]>().returns([]),
  isAuthHookInitialized: true,
  isAuthInProgress: false,
  isLoggedIn: true,
  login: sinon.stub<[string, string, string | null], Promise<User>>().resolves(session.user),
  logout: sinon.stub<[boolean | undefined], Promise<void>>().resolves(),
  redirectToProfessionalAccountLogin: sinon.stub<[], void>().resolves(),
  resendSignup: sinon.stub<[string], Promise<boolean>>().resolves(true),
  resetPassword: sinon.stub<[string, string, string], Promise<boolean>>().resolves(true),
  sendPasswordResetEmail: sinon.stub<[string, string], Promise<void>>().resolves(),
  session: sinon.stub<[], Session | null>().returns(session),
  sessionToken: session.sessionToken,
  setFlagPatients: sinon.stub<[string[]], Promise<void>>().resolves(),
  setUser: sinon.stub<[User], void>(),
  signup: sinon.stub<[SignupUser], Promise<void>>().resolves(),
  switchRoleToHCP: sinon.stub<[boolean, HcpProfession], Promise<void>>().resolves(),
  traceToken: session.traceToken,
  updatePassword: sinon.stub<[string, string], Promise<void>>().resolves(),
  updatePreferences: sinon.stub<[Preferences, boolean | undefined], Promise<Preferences>>().resolves(session.user.preferences),
  updateProfile: sinon.stub<[Profile, boolean | undefined], Promise<Profile>>().resolves(session.user.profile),
  updateSettings: sinon.stub<[Settings, boolean | undefined], Promise<Settings>>().resolves(session.user.settings),
  user: session?.user ?? null,
});

/**
 * Reset stubs history & behavior
 *
 * TODO complete me
 */
export const resetAuthHookStubs = (hookStubs: AuthContextStubs, session?: Session): void => {
  hookStubs.user = session?.user ?? null;
  hookStubs.sessionToken = session.sessionToken;
  hookStubs.traceToken = session.traceToken;
  hookStubs.isLoggedIn = typeof session === "object";
  hookStubs.isAuthInProgress = false;
  hookStubs.isAuthHookInitialized = true;

  hookStubs.logout.resetHistory();
  hookStubs.logout.resetBehavior();
  hookStubs.logout.resolves();

  hookStubs.session.resetHistory();
  hookStubs.session.resetBehavior();
  hookStubs.session.returns(session);
};

// TODO Delete me: should be defined by in tests files
export const authCaregiver = loggedInUsers.caregiverSession;
export const authHcp = loggedInUsers.hcpSession;
export const authPatient = loggedInUsers.patientSession;
export const authHookHcp: AuthContext = createAuthHookStubs(authHcp);
export const authHookPatient: AuthContext = createAuthHookStubs(authPatient);
export const authHookCaregiver: AuthContext = createAuthHookStubs(authCaregiver);

describe("Auth hook", () => {

  /* eslint-disable new-cap */
  const ReactAuthContext = React.createContext({} as AuthContext);
  const authApiHcpStubs = createAuthAPIStubs(authHcp);
  let container: HTMLDivElement | null = null;
  let authContext: AuthContext | null = null;
  let testHistory: H.History<unknown> | null = null;
  let testLocation: H.Location<unknown> | null = null;

  const initAuthContext = async (session: Session | null, stubApi: AuthAPI | AuthAPIStubs): Promise<void> => {
    let initialRoute = "/";
    if (session !== null) {
      sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, session.sessionToken);
      sessionStorage.setItem(STORAGE_KEY_TRACE_TOKEN, session.traceToken);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session.user));
      initialRoute = session.user.getHomePage();
    }
    const AuthContextProvider = (): JSX.Element => {
      authContext = AuthContextImpl(stubApi as AuthAPI);
      return <ReactAuthContext.Provider value={authContext} />;
    };
    await act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <MemoryRouter initialEntries={[initialRoute]}>
            <AuthContextProvider />
            <Route
              path="*"
              render={({ history, location }) => {
                testHistory = history;
                testLocation = location;
                return null;
              }}
            />
          </MemoryRouter>,
          container,
          resolve
        );
      });
    });
    expect(authContext, "authContext").to.be.not.null;
    expect(authContext.isAuthHookInitialized, "initialized").to.be.true;
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    resetAuthAPIStubs(authApiHcpStubs, loggedInUsers.hcpSession);
    authContext = null;
  });

  after(() => {
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
  });

  describe("Initialization", () => {
    it("should initialize as logout state when no auth storage exists", async () => {
      await initAuthContext(null, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as logout state when trace token is not valid", async () => {
      await initAuthContext({ sessionToken: authHcp.sessionToken, traceToken: "abcd", user: authHcp.user }, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as logout state when session token has expired", async () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNyIjoiYTAwMDAwMDAiLCJuYW1lIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwic3ZyIjoibm8iLCJyb2xlIjoiaGNwIiwiaWF0IjoxNjI0OTU2MzA3LCJleHAiOjE2MjQ5NTYzMDZ9.fEaJHx1E53fh9m4DwNNXFm--iD6gEWJ0YmlsRVCOmog";
      await initAuthContext({ sessionToken: expiredToken, traceToken: authHcp.traceToken, user: authHcp.user }, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as login state when auth storage exists", async () => {
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.equals(authHcp.traceToken);
      expect(authContext.sessionToken, "sessionToken").to.be.equals(authHcp.sessionToken);
      expect(authContext.user, "user").to.be.not.null;
      expect(authContext.user.userid, "userid").to.be.equals(authHcp.user.userid);
    });
  });

  describe("Login", () => {
    before(() => {
      config.METRICS_SERVICE = "matomo";
      window._paq = [];
    });
    after(() => {
      delete window._paq;
      config.METRICS_SERVICE = "disabled";
    });

    it("should call the login api function and set the context values", async () => {
      const session = loggedInUsers.hcpSession;
      const stubs = createAuthAPIStubs(session);
      await initAuthContext(null, stubs);
      expect(authContext.session(), "authContext.session()").to.be.null;
      expect(authContext.isLoggedIn, "isLoggedIn false").to.be.false;

      const user = await authContext.login("abc", "abc", "abc");
      expect(stubs.login.calledOnce, "calledOnce").to.be.true;
      // session.user.settings.country = "FR";
      expect(user, JSON.stringify({ having: user, expected: session.user }, null, 2)).to.be.deep.equals(session.user);
      expect(authContext.traceToken, "traceToken").to.be.equals(session.traceToken);
      expect(authContext.sessionToken, "sessionToken").to.be.equals(session.sessionToken);
      expect(authContext.user, "user").to.be.not.null;
      expect(authContext.user.userid, "userid").to.be.equals(session.user.userid);
      expect(sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(session.sessionToken);
      expect(sessionStorage.getItem(STORAGE_KEY_TRACE_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(session.traceToken);
      expect(sessionStorage.getItem(STORAGE_KEY_USER), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(JSON.stringify(session.user));
      expect(window._paq, JSON.stringify(window._paq)).to.be.deep.equals([
        ["setUserId", session.user.userid],
        ["setCustomVariable", 1, "UserRole", "hcp", "page"],
        ["trackEvent", "registration", "login", "hcp"],
      ]);
      expect(authContext.session(), "authContext.session()").to.be.deep.equals(session);
      expect(authContext.isLoggedIn, "isLoggedIn true").to.be.true;
    });

    it("should throw an exception if the api call failed", async () => {
      await initAuthContext(null, authApiHcpStubs);
      authApiHcpStubs.login.rejects(new Error("wrong"));

      let user: User | null = null;
      let error: Error | null = null;
      try {
        user = await authContext.login("abc", "abc", "abc");
      } catch (reason) {
        error = reason;
      }
      expect(user).to.be.null;
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("wrong");
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
      expect(authContext.session()).to.be.null;
      expect(authContext.isLoggedIn).to.be.false;
    });
  });

  describe("Logout", () => {
    const cleanBlipReduxStore = sinon.spy();
    before(() => {
      config.METRICS_SERVICE = "matomo";
      window._paq = [];
      window.cleanBlipReduxStore = cleanBlipReduxStore;
    });
    after(() => {
      delete window.cleanBlipReduxStore;
      delete window._paq;
      config.METRICS_SERVICE = "disabled";
    });
    it("should logout the logged-in user", async () => {
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.session()).to.be.not.null;
      expect(authContext.isLoggedIn).to.be.true;

      window._paq = []; // Clear the login part
      await authContext.logout();
      await waitTimeout(10);
      expect(authApiHcpStubs.logout.calledOnce, "logout calledOnce").to.be.true;
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
      expect(sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.null;
      expect(sessionStorage.getItem(STORAGE_KEY_TRACE_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.null;
      expect(sessionStorage.getItem(STORAGE_KEY_USER), "STORAGE_KEY_SESSION_TOKEN").to.be.null;
      // The first entry is for the "fake" login at the init
      expect(window._paq, "_paq").to.be.lengthOf(4);
      expect(window._paq[0], "_paq[0]").to.be.deep.equals(["trackEvent", "registration", "logout"]);
      expect(window._paq[1], "_paq[1]").to.be.deep.equals(["deleteCustomVariable", 1, "page"]);
      expect(window._paq[2], "_paq[2]").to.be.deep.equals(["resetUserId"]);
      expect(window._paq[3], "_paq[3]").to.be.deep.equals(["deleteCookies"]);
      expect(cleanBlipReduxStore.calledOnce, "cleanBlipReduxStore").to.be.true;
      expect(authContext.session()).to.be.null;
      expect(authContext.isLoggedIn).to.be.false;
      expect(testLocation.pathname).to.be.equals("/");
      expect(testLocation.search).to.be.equals("");
      expect(testLocation.state).to.be.undefined;
      expect(testHistory.length).to.be.equals(2);
    });
    it("should not crash if the api call crash", async () => {
      authApiHcpStubs.logout.rejects();
      await initAuthContext(authHcp, authApiHcpStubs);
      await authContext.logout();
      await waitTimeout(10);
      expect(authApiHcpStubs.logout.calledOnce, "logout calledOnce").to.be.true;
      expect(authContext.session()).to.be.null;
      expect(authContext.isLoggedIn).to.be.false;
    });
    it("should correctly set the URL parameters when logout with session timeout set to true", async () => {
      const authApiCaregiverStubs = createAuthAPIStubs(authCaregiver);
      await initAuthContext(authCaregiver, authApiCaregiverStubs);
      expect(authContext.session()).to.be.not.null;
      expect(authContext.isLoggedIn).to.be.true;

      await authContext.logout(true);
      await waitTimeout(10);

      expect(testLocation.pathname).to.be.equals("/");
      expect(testLocation.search).to.be.equals("?login=caregiver%40example.com&sessionExpired=true");
      expect(testLocation.state).to.be.deep.equals({ from: { pathname: authCaregiver.user.getHomePage() } });
      expect(testHistory.length).to.be.equals(2);
    });
  });

  describe("Updates", () => {
    const updatedPreferences: Preferences = { displayLanguageCode: "fr" };
    const updatedProfile: Profile = { ...loggedInUsers.hcp.profile, privacyPolicy: { acceptanceTimestamp: new Date().toISOString(), isAccepted: true } };
    const updatedSettings: Settings = { ...loggedInUsers.hcp.settings, country: "FR" };

    it("updatePreferences should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updatePreferences.resolves(updatedPreferences);
      await initAuthContext(null, authApiHcpStubs);
      expect(authContext.user).to.be.null;

      let error: Error | null = null;
      let result: Preferences | null = null;
      try {
        result = await authContext.updatePreferences({ ...updatedPreferences });
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.updatePreferences.calledOnce, "calledOnce").to.be.false;
      expect(result).to.be.null;
      expect(error).to.be.not.null;
      expect(authContext.user).to.be.null;
    });
    it("updatePreferences should call the API with the good parameters", async () => {
      authApiHcpStubs.updatePreferences.resolves(updatedPreferences);
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.preferences).to.be.deep.equals({ displayLanguageCode: "en" });

      const result = await authContext.updatePreferences({ ...updatedPreferences });
      expect(authApiHcpStubs.updatePreferences.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedPreferences);
      expect(authContext.user.preferences).to.be.deep.equals(updatedPreferences);
    });

    it("updateProfile should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateProfile.resolves(updatedProfile);
      await initAuthContext(null, authApiHcpStubs);
      expect(authContext.user).to.be.null;

      let error: Error | null = null;
      let result: Profile | null = null;
      try {
        result = await authContext.updateProfile({ ...updatedProfile });
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.updateProfile.calledOnce, "calledOnce").to.be.false;
      expect(result).to.be.null;
      expect(error).to.be.not.null;
      expect(authContext.user).to.be.null;
    });
    it("updateProfile should call the API with the good parameters", async () => {
      authApiHcpStubs.updateProfile.resolves(updatedProfile);
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.profile).to.be.deep.equals(loggedInUsers.hcp.profile);

      const result = await authContext.updateProfile({ ...updatedProfile });
      expect(authApiHcpStubs.updateProfile.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedProfile);
      expect(authContext.user.profile).to.be.deep.equals(updatedProfile);
    });

    it("updateSettings should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateSettings.resolves(updatedSettings);
      await initAuthContext(null, authApiHcpStubs);
      expect(authContext.user).to.be.null;

      let error: Error | null = null;
      let result: Settings | null = null;
      try {
        result = await authContext.updateSettings({ ...updatedSettings });
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.updateSettings.calledOnce, "calledOnce").to.be.false;
      expect(result).to.be.null;
      expect(error).to.be.not.null;
      expect(authContext.user).to.be.null;
    });
    it("updateSettings should call the API with the good parameters", async () => {
      authApiHcpStubs.updateSettings.resolves(updatedSettings);
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.settings).to.be.deep.equals(loggedInUsers.hcp.settings);

      const result = await authContext.updateSettings({ ...updatedSettings });
      expect(authApiHcpStubs.updateSettings.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedSettings);
      expect(authContext.user.settings).to.be.deep.equals(updatedSettings);
    });

    it("updatePassword should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateUser.resolves();
      await initAuthContext(null, authApiHcpStubs);
      expect(authContext.user).to.be.null;

      let error: Error | null = null;
      try {
        await authContext.updatePassword("abcd", "1234");
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.updateUser.calledOnce, "calledOnce").to.be.false;
      expect(error).to.be.not.null;
      expect(authContext.user).to.be.null;
    });
    it("updatePassword should not call the API if the user is a patient", async () => {
      const authApiStubs = createAuthAPIStubs(authPatient);
      authApiStubs.updateUser.resolves();
      await initAuthContext(authPatient, authApiStubs);
      expect(authContext.user).to.be.not.null;

      let error: Error | null = null;
      try {
        await authContext.updatePassword("abcd", "1234");
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.updateUser.calledOnce, "calledOnce").to.be.false;
      expect(error, "exception").to.be.instanceOf(Error);
      expect(error.message).to.be.equals("invalid-user-role");
    });
    it("updatePassword should call the API with the good parameters", async () => {
      authApiHcpStubs.updateUser.resolves();
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.settings).to.be.deep.equals(loggedInUsers.hcp.settings);

      await authContext.updatePassword("abcd", "1234");
      expect(authApiHcpStubs.updateUser.calledOnce, "calledOnce").to.be.true;
    });

    it("switchRoleToHCP should failed for hcp users", async () => {
      await initAuthContext(authHcp, authApiHcpStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      } catch (reason) {
        error = reason;
      }
      expect(error, "exception").to.be.instanceOf(Error);
      expect(error.message).to.be.equals("invalid-user-role");
    });
    it("switchRoleToHCP should failed for patient users", async () => {
      const authApiStubs = createAuthAPIStubs(authPatient);
      await initAuthContext(authPatient, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      } catch (reason) {
        error = reason;
      }
      expect(error, "exception").to.be.instanceOf(Error);
      expect(error.message).to.be.equals("invalid-user-role");
    });
    it("switchRoleToHCP should not call updateProfile if updateUser failed", async () => {
      const authApiStubs = createAuthAPIStubs(authCaregiver);
      authApiStubs.updateUser.rejects();
      await initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceOf(Error);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      const updateArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      expect(updateArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.called).to.be.false;
    });
    it("switchRoleToHCP should call updateProfile after updateUser", async () => {
      const now = Date.now();
      const authApiStubs = createAuthAPIStubs(authCaregiver);
      authApiStubs.updateProfile.rejects();
      await initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceOf(Error);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      const updateUserArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateUserArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateUserArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      const updateProfileArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateProfileArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = updateProfileArgs[0].user.profile;
      expect(profile, JSON.stringify(profile)).to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy");
      expect(profile.termsOfUse.isAccepted, "termsOfUse.isAccepted").to.be.true;
      expect(profile.privacyPolicy.isAccepted, "privacyPolicy.isAccepted").to.be.true;
      expect(Date.parse(profile.termsOfUse.acceptanceTimestamp), "termsOfUse").to.be.above(now);
      expect(Date.parse(profile.privacyPolicy.acceptanceTimestamp), "privacyPolicy").to.be.above(now);
      expect(authContext.user.profile, "hook profile not updated").to.be.an("object").and.not.have.any.keys("termsOfUse", "privacyPolicy");
    });
    it("switchRoleToHCP should call refreshToken after updateUser, and verify the received token", async () => {
      const invalidUpdatedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNyIjoiYTBhMGEwYjAiLCJuYW1lIjoiY2FyZWdpdmVyQGV4YW1wbGUuY29tIiwiZW1haWwiOiJjYXJlZ2l2ZXJAZXhhbXBsZS5jb20iLCJzdnIiOiJubyIsInJvbGUiOiJjYXJlZ2l2ZXIiLCJpYXQiOjE2MjUwNjQxNTgsImV4cCI6NTYyNDk1NjMwNn0.MlWX87m5QdZSi2gYO22hfSvR3wZaoFZlTTLlU6dk_FY";
      const now = new Date();
      const authApiStubs = createAuthAPIStubs(authCaregiver);
      const accepts = {
        acceptanceTimestamp: now.toISOString(),
        isAccepted: true,
      };
      authApiStubs.updateProfile.resolves({ ...authCaregiver.user.profile, termsOfUse: accepts, privacyPolicy: accepts });
      authApiStubs.refreshToken.resolves(invalidUpdatedToken);
      await initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("Role change is not effective");
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      const updateUserArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateUserArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateUserArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      const updateProfileArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateProfileArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = updateProfileArgs[0].user.profile;
      expect(profile, JSON.stringify(profile)).to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy");
      expect(profile.termsOfUse.isAccepted, "termsOfUse.isAccepted").to.be.true;
      expect(profile.privacyPolicy.isAccepted, "privacyPolicy.isAccepted").to.be.true;
      expect(Date.parse(profile.termsOfUse.acceptanceTimestamp), "termsOfUse").to.be.greaterThanOrEqual(now.valueOf());
      expect(Date.parse(profile.privacyPolicy.acceptanceTimestamp), "privacyPolicy").to.be.greaterThanOrEqual(now.valueOf());
      expect(authContext.user.profile, "hook profile not updated").to.be.an("object").and.not.have.any.keys("termsOfUse", "privacyPolicy");
    });
    it("switchRoleToHCP should succeed (accept feedback)", async () => {
      const updatedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNyIjoiYTBhMGEwYjAiLCJuYW1lIjoiY2FyZWdpdmVyQGV4YW1wbGUuY29tIiwiZW1haWwiOiJjYXJlZ2l2ZXJAZXhhbXBsZS5jb20iLCJzdnIiOiJubyIsInJvbGUiOiJoY3AiLCJpYXQiOjE2MjUwNjQxNTgsImV4cCI6NTYyNDk1NjMwNn0._PK65sdZ_o11nZtJBTILxcS9f9HhRLfAmYsn3Us4s7o";
      const now = new Date();
      const authApiStubs = createAuthAPIStubs(authCaregiver);
      const accepts = {
        acceptanceTimestamp: now.toISOString(),
        isAccepted: true,
      };
      authApiStubs.updateProfile.resolves({ ...authCaregiver.user.profile, termsOfUse: accepts, privacyPolicy: accepts, contactConsent: accepts });
      authApiStubs.refreshToken.resolves(updatedToken);
      await initAuthContext(authCaregiver, authApiStubs);

      await authContext.switchRoleToHCP(true, HcpProfession.diabeto);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      const updateUserArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateUserArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateUserArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      const updateProfileArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateProfileArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = updateProfileArgs[0].user.profile;
      expect(profile, JSON.stringify(profile)).to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(profile.termsOfUse.isAccepted, "termsOfUse.isAccepted").to.be.true;
      expect(profile.privacyPolicy.isAccepted, "privacyPolicy.isAccepted").to.be.true;
      expect(profile.contactConsent.isAccepted, "contactConsent.isAccepted").to.be.true;
      expect(Date.parse(profile.termsOfUse.acceptanceTimestamp), "termsOfUse").to.be.greaterThanOrEqual(now.valueOf());
      expect(Date.parse(profile.privacyPolicy.acceptanceTimestamp), "privacyPolicy").to.be.greaterThanOrEqual(now.valueOf());
      expect(Date.parse(profile.contactConsent.acceptanceTimestamp), "contactConsent").to.be.greaterThanOrEqual(now.valueOf());
      expect(authContext.user.profile, "hook profile updated").to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(authContext.user.role).to.be.equals(UserRoles.hcp);
      expect(sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN), "sessionStorage token").to.be.equals(updatedToken);
      expect(authContext.sessionToken, "authContext.sessionToken").to.be.equals(updatedToken);
      const storageUser = JSON.parse(sessionStorage.getItem(STORAGE_KEY_USER)) as User;
      expect(storageUser.role, "sessionStorage user role").to.be.equals(UserRoles.hcp);
      expect(storageUser.profile, "sessionStorage user profile").to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(storageUser.profile.termsOfUse, "sessionStorage user termsOfUse").to.be.deep.equals(accepts);
      expect(storageUser.profile.privacyPolicy, "sessionStorage user privacyPolicy").to.be.deep.equals(accepts);
      expect(storageUser.profile.contactConsent, "sessionStorage user contactConsent").to.be.deep.equals(accepts);
    });
    it("switchRoleToHCP should succeed (decline feedback)", async () => {
      const updatedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNyIjoiYTBhMGEwYjAiLCJuYW1lIjoiY2FyZWdpdmVyQGV4YW1wbGUuY29tIiwiZW1haWwiOiJjYXJlZ2l2ZXJAZXhhbXBsZS5jb20iLCJzdnIiOiJubyIsInJvbGUiOiJoY3AiLCJpYXQiOjE2MjUwNjQxNTgsImV4cCI6NTYyNDk1NjMwNn0._PK65sdZ_o11nZtJBTILxcS9f9HhRLfAmYsn3Us4s7o";
      const now = new Date();
      const authApiStubs = createAuthAPIStubs(authCaregiver);
      const accepts = {
        acceptanceTimestamp: now.toISOString(),
        isAccepted: true,
      };
      const decline = {
        acceptanceTimestamp: accepts.acceptanceTimestamp,
        isAccepted: false,
      };
      authApiStubs.updateProfile.resolves({ ...authCaregiver.user.profile, termsOfUse: accepts, privacyPolicy: accepts, contactConsent: decline });
      authApiStubs.refreshToken.resolves(updatedToken);
      await initAuthContext(authCaregiver, authApiStubs);

      await authContext.switchRoleToHCP(false, HcpProfession.diabeto);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      const updateUserArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateUserArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateUserArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      const updateProfileArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateProfileArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = updateProfileArgs[0].user.profile;
      expect(profile, JSON.stringify(profile)).to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(profile.termsOfUse.isAccepted, "termsOfUse.isAccepted").to.be.true;
      expect(profile.privacyPolicy.isAccepted, "privacyPolicy.isAccepted").to.be.true;
      expect(profile.contactConsent.isAccepted, "contactConsent.isAccepted").to.be.false;
      expect(Date.parse(profile.termsOfUse.acceptanceTimestamp), "termsOfUse").to.be.greaterThanOrEqual(now.valueOf());
      expect(Date.parse(profile.privacyPolicy.acceptanceTimestamp), "privacyPolicy").to.be.greaterThanOrEqual(now.valueOf());
      expect(Date.parse(profile.contactConsent.acceptanceTimestamp), "privacyPolicy").to.be.greaterThanOrEqual(now.valueOf());
      expect(authContext.user.profile, "hook profile updated").to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(authContext.user.role).to.be.equals(UserRoles.hcp);
      expect(sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN), "sessionStorage token").to.be.equals(updatedToken);
      expect(authContext.sessionToken, "authContext.sessionToken").to.be.equals(updatedToken);
      const storageUser = JSON.parse(sessionStorage.getItem(STORAGE_KEY_USER)) as User;
      expect(storageUser.role, "sessionStorage user role").to.be.equals(UserRoles.hcp);
      expect(storageUser.profile, "sessionStorage user profile").to.be.an("object").and.have.any.keys("termsOfUse", "privacyPolicy", "contactConsent");
      expect(storageUser.profile.termsOfUse, "sessionStorage user termsOfUse").to.be.deep.equals(accepts);
      expect(storageUser.profile.privacyPolicy, "sessionStorage user privacyPolicy").to.be.deep.equals(accepts);
      expect(storageUser.profile.contactConsent, "sessionStorage user contactConsent").to.be.deep.equals(decline);
    });
  });

  describe("Signup", () => {
    it("should call the API with all the good parameters", async () => {
      const infos: SignupUser = {
        accountPassword: "abcd",
        accountRole: UserRoles.caregiver,
        accountUsername: loggedInUsers.caregiver.username,
        preferencesLanguage: loggedInUsers.caregiver.preferences.displayLanguageCode,
        privacyPolicy: true,
        profileCountry: loggedInUsers.caregiver.settings.country,
        profileFirstname: loggedInUsers.caregiver.profile.firstName,
        profileLastname: loggedInUsers.caregiver.profile.lastName,
        profilePhone: "+0000000",
        hcpProfession: HcpProfession.empty,
        terms: true,
        feedback: false,
      };
      await initAuthContext(null, authApiHcpStubs);
      const signupResolve: Session = {
        user: _.cloneDeep(authCaregiver.user),
        sessionToken: authCaregiver.sessionToken,
        traceToken: authContext.traceToken,
      };
      delete signupResolve.user.preferences;
      delete signupResolve.user.profile;
      delete signupResolve.user.settings;
      authApiHcpStubs.signup.resolves(signupResolve);

      let error: Error | null = null;
      try {
        await authContext.signup(infos);
      } catch (reason) {
        error = reason;
      }
      expect(authApiHcpStubs.signup.calledOnce, "signup calledOnce").to.be.true;
      expect(authApiHcpStubs.signup.getCall(0).args).to.be.deep.equals([
        infos.accountUsername,
        infos.accountPassword,
        infos.accountRole,
        authContext.traceToken,
      ]);
      expect(authApiHcpStubs.updateProfile.calledOnce, "updateProfile calledOnce").to.be.true;
      const sentProfile = authApiHcpStubs.updateProfile.firstCall.args[0].user.profile;
      expect(sentProfile).to.be.an("object").not.null;
      expect(sentProfile.contactConsent.isAccepted).to.be.false;
      expect(sentProfile.contactConsent.acceptanceTimestamp).to.be.a("string");
      expect(sentProfile.hcpProfession).to.be.equal("");
      expect(authApiHcpStubs.updateSettings.calledOnce, "updateSettings calledOnce").to.be.true;
      expect(authApiHcpStubs.updateSettings.calledAfter(authApiHcpStubs.updateProfile), "settings after profile").to.be.true;
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      expect(authApiHcpStubs.updatePreferences.calledAfter(authApiHcpStubs.updateSettings), "preferences after settings").to.be.true;
      expect(authApiHcpStubs.sendAccountValidation.calledOnce, "sendAccountValidation calledOnce").to.be.true;
      expect(authApiHcpStubs.sendAccountValidation.getCall(0).args[1]).to.be.equals(infos.preferencesLanguage);
      expect(error).to.be.null;
      expect(authContext.user).to.be.null;
    });
  });

  describe("Resend sign-up", () => {
    it("should call the resend sign-up api", async () => {
      await initAuthContext(authHcp, authApiHcpStubs);
      const result = await authContext.resendSignup("abcd");
      expect(authApiHcpStubs.resendSignup.calledOnce, "resendSignup.calledOnce").to.be.true;
      expect(authApiHcpStubs.resendSignup.firstCall.args, "resendSignup args").to.be.deep.equals(["abcd", authHcp.traceToken, "en"]);
      expect(result, "result").to.be.true;
    });
  });

  describe("Flag patient", () => {
    it("should flag a un-flagged patient", async () => {
      const userId = uuidv4();
      authApiHcpStubs.updatePreferences.resolves({ patientsStarred: [userId] });
      delete authHcp.user.preferences;
      await initAuthContext(authHcp, authApiHcpStubs);
      await authContext.flagPatient(userId);
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      const apiCall = authApiHcpStubs.updatePreferences.getCall(0).args;
      expect((apiCall[0] as Session).user.preferences.patientsStarred, "apiCall patientsStarred").deep.equals([userId]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred").to.be.an("array").deep.equals([userId]);
    });
    it("should un-flag a flagged patient", async () => {
      const userId = uuidv4();
      const otherUserId = uuidv4();
      authHcp.user.preferences = { patientsStarred: [userId, otherUserId] };
      authApiHcpStubs.updatePreferences.resolves({ patientsStarred: [otherUserId] });
      await initAuthContext(authHcp, authApiHcpStubs);
      await authContext.flagPatient(userId);
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      const apiCall = authApiHcpStubs.updatePreferences.getCall(0).args;
      expect((apiCall[0] as Session).user.preferences.patientsStarred, "apiCall patientsStarred").deep.equals([otherUserId]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred").to.be.an("array").deep.equals([otherUserId]);
    });
    it("should add another user to an existing list", async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();
      const session = loggedInUsers.hcpSession;
      const stubs = createAuthAPIStubs(session);

      stubs.updatePreferences.onFirstCall().resolves({ patientsStarred: [userId1] });
      stubs.updatePreferences.onSecondCall().resolves({ patientsStarred: [userId1, userId2] });
      await initAuthContext(session, stubs);
      expect(authContext.getFlagPatients(), "authContext getFlagPatients()").to.be.an("array").empty;

      await authContext.flagPatient(userId1);
      expect(stubs.updatePreferences.calledOnce, "updatePreferences calledOnce (0)").to.be.true;
      let apiCall = stubs.updatePreferences.getCall(0).args[0] as Session;
      expect(apiCall.user.preferences.patientsStarred, "apiCall patientsStarred (0)").deep.equals([userId1]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred (0)").to.be.an("array").deep.equals([userId1]);

      await authContext.flagPatient(userId2);
      expect(stubs.updatePreferences.calledTwice, "updatePreferences calledTwice (1)").to.be.true;
      apiCall = stubs.updatePreferences.getCall(1).args[0] as Session;
      expect(apiCall.user.preferences.patientsStarred, "apiCall patientsStarred (1)").deep.equals([userId1, userId2]);
      expect(authContext.getFlagPatients(), "authContext getFlagPatients()").to.be.an("array").deep.equals([userId1, userId2]);
    });
    it("setFlagPatients should replace the currently flagged patient", async () => {
      const userId = uuidv4();
      authApiHcpStubs.updatePreferences.resolves({ displayLanguageCode: "fr", patientsStarred: [userId] });
      authHcp.user.preferences.patientsStarred = ["old"];
      await initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.getFlagPatients(), "authContext getFlagPatients() before").to.be.an("array").deep.equals(["old"]);
      await authContext.setFlagPatients([userId]);
      const after = authContext.getFlagPatients();
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      const apiCall = authApiHcpStubs.updatePreferences.getCall(0).args;
      expect((apiCall[0] as Session).user.preferences.patientsStarred, "apiCall patientsStarred").deep.equals([userId]);
      expect(after, "authContext getFlagPatients() after").to.be.an("array").deep.equals([userId]);
    });
  });

  describe("Password", () => {
    it("sendPasswordResetEmail should call the API", async () => {
      await initAuthContext(null, authApiHcpStubs);
      const username = loggedInUsers.caregiver.username;
      const language = loggedInUsers.caregiver.preferences.displayLanguageCode;
      await authContext.sendPasswordResetEmail(username, language);
      const apiCall = authApiHcpStubs.requestPasswordReset.getCall(0).args;
      expect(apiCall).to.be.deep.equals([username, authContext.traceToken, language]);
    });
    it("resetPassword should call the API", async () => {
      authApiHcpStubs.resetPassword.resolves(true);
      await initAuthContext(null, authApiHcpStubs);
      const key = uuidv4();
      const username = loggedInUsers.caregiver.username;
      const password = "abcd";
      const result = await authContext.resetPassword(key, username, password);
      expect(result).to.be.true;
      const apiCall = authApiHcpStubs.resetPassword.getCall(0).args;
      expect(apiCall).to.be.deep.equals([key, username, password, authContext.traceToken]);
    });
  });
});


