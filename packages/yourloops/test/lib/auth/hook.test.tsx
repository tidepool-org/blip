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
import { BrowserRouter } from "react-router-dom";
import * as sinon from "sinon";
import { expect } from "chai";

import { Preferences, Profile, Settings, UserRoles } from "../../../models/shoreline";
import config from "../../../lib/config";
import { waitTimeout } from "../../../lib/utils";
import { User, AuthAPI, Session, AuthContext, SignupUser } from "../../../lib/auth";
import { AuthContextImpl, STORAGE_KEY_SESSION_TOKEN, STORAGE_KEY_TRACE_TOKEN, STORAGE_KEY_USER } from "../../../lib/auth/hook";
import { loggedInUsers } from "../../common";

export const authCaregiver = loggedInUsers.caregiverSession;
export const authHcp = loggedInUsers.hcpSession;
export const authPatient = loggedInUsers.patientSession;

/***** API Stubs *****/
/*********************/
interface AuthAPIStubs {
  login: sinon.SinonStub<string[], Promise<Session>>;
  requestPasswordReset: sinon.SinonStub<unknown[], Promise<void>>;
  resetPassword: sinon.SinonStub<string[], Promise<boolean>>;
  signup: sinon.SinonStub<string[], Promise<Session>>;
  resendSignup: sinon.SinonStub<string[], Promise<boolean>>;
  sendAccountValidation: sinon.SinonStub<unknown[], Promise<boolean>>;
  accountConfirmed: sinon.SinonStub<string[], Promise<boolean>>;
  updatePreferences: sinon.SinonStub<Session[], Promise<Preferences>>;
  updateProfile: sinon.SinonStub<Session[], Promise<Profile>>;
  updateSettings: sinon.SinonStub<Session[], Promise<Settings>>;
  updateUser: sinon.SinonStub<unknown[], Promise<void>>;
  refreshToken: sinon.SinonStub<Session[], Promise<string>>;
  logout: sinon.SinonStub<Session[], Promise<void>>;
}

export const createAuthApiStubs = (session: Session): AuthAPIStubs => ({
  login: sinon.stub().resolves(session),
  requestPasswordReset: sinon.stub().resolves(),
  resetPassword: sinon.stub().resolves(false),
  signup: sinon.stub().resolves(session),
  resendSignup: sinon.stub().resolves(true),
  sendAccountValidation: sinon.stub().resolves(false),
  accountConfirmed: sinon.stub().resolves(false),
  updatePreferences: sinon.stub().resolves(session.user.preferences),
  updateProfile: sinon.stub().resolves(session.user.profile),
  updateSettings: sinon.stub().resolves(session.user.settings),
  updateUser: sinon.stub().resolves(),
  refreshToken: sinon.stub().resolves(""),
  logout: sinon.stub().resolves(),
});

export const authApiHcpStubs = createAuthApiStubs(authHcp);

/***** Hook Stubs *****/
/*********************/
export const createAuthHookStubs = (authSession: Session): AuthContext => ({
  user: authSession.user,
  sessionToken: authSession.sessionToken,
  traceToken: authSession.traceToken,
  session: sinon.stub().returns(authSession),
  initialized: sinon.stub().returns(true),
  setUser: sinon.stub(),
  login: sinon.stub().resolves(authSession.user),
  logout: sinon.stub(),
  updateProfile: sinon.stub().resolves(authSession.user.profile),
  updatePreferences: sinon.stub().resolves(authSession.user.profile),
  updateSettings: sinon.stub().resolves(authSession.user.profile),
  updatePassword: sinon.stub().resolves(),
  signup: sinon.stub(),
  resendSignup: sinon.stub().resolves(true),
  isLoggedIn: sinon.stub().returns(true),
  sendPasswordResetEmail: sinon.stub().returns(true),
  resetPassword: sinon.stub().returns(true),
  flagPatient: sinon.stub().resolves(),
  setFlagPatients: sinon.stub().resolves(),
  getFlagPatients: sinon.stub().returns([]),
  switchRoleToHCP: sinon.stub().resolves(),
});

export const authHookHcp: AuthContext = createAuthHookStubs(authHcp);
export const authHookPatient: AuthContext = createAuthHookStubs(authPatient);
export const authHookCaregiver: AuthContext = createAuthHookStubs(authCaregiver);

export function resetStubs(user: Readonly<User>, api: AuthAPI | null = null, context: AuthContext | null = null): void {
  let stub: sinon.SinonStub;
  authHcp.user = _.cloneDeep(user);
  if (api !== null) {
    stub = api.login as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.resolves(authHcp);

    stub = api.updatePreferences as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.resolves(authHcp.user.preferences);

    stub = api.updateProfile as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.resolves(authHcp.user.profile);

    stub = api.updateSettings as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.resolves(authHcp.user.settings);

    stub = api.logout as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.resolves();
  }
  if (context !== null) {
    context.user = authHcp.user;
    stub = context.initialized as sinon.SinonStub;
    stub.resetHistory();
    stub.resetBehavior();
    stub.returns(true);
    // TODO the rest when needed
  }
}

function testHook(): void {
  /* eslint-disable new-cap */
  const ReactAuthContext = React.createContext({} as AuthContext);
  let container: HTMLDivElement | null = null;
  let authContext: AuthContext | null = null;

  const initAuthContext = (session: Session | null, stubApi: typeof authApiHcpStubs) => {
    if (session !== null) {
      sessionStorage.setItem(STORAGE_KEY_SESSION_TOKEN, session.sessionToken);
      sessionStorage.setItem(STORAGE_KEY_TRACE_TOKEN, session.traceToken);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session.user));
    }
    const AuthContextProvider = (): JSX.Element => {
      authContext = AuthContextImpl(stubApi);
      return <ReactAuthContext.Provider value={authContext} />;
    };
    act(() => {
      ReactDOM.render(<BrowserRouter><AuthContextProvider /></BrowserRouter>, container);
    });
    expect(authContext, "authContext").to.be.not.null;
    expect(authContext.initialized(), "initialized").to.be.true;
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
    resetStubs(loggedInUsers.hcp, authApiHcpStubs);
    authContext = null;
  });

  after(() => {
    sessionStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_TRACE_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
  });

  describe("Initialization", () => {
    it("should initialize as logout state when no auth storage exists", () => {
      initAuthContext(null, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as logout state when trace token is not valid", () => {
      initAuthContext({ sessionToken: authHcp.sessionToken, traceToken: "abcd", user: authHcp.user }, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as logout state when session token has expired", () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNyIjoiYTAwMDAwMDAiLCJuYW1lIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwic3ZyIjoibm8iLCJyb2xlIjoiaGNwIiwiaWF0IjoxNjI0OTU2MzA3LCJleHAiOjE2MjQ5NTYzMDZ9.fEaJHx1E53fh9m4DwNNXFm--iD6gEWJ0YmlsRVCOmog";
      initAuthContext({ sessionToken: expiredToken, traceToken: authHcp.traceToken, user: authHcp.user }, authApiHcpStubs);
      expect(authContext.traceToken, "traceToken").to.be.a("string").not.empty;
      expect(authContext.sessionToken, "sessionToken").to.be.null;
      expect(authContext.user, "user").to.be.null;
    });

    it("should initialized as login state when auth storage exists", () => {
      initAuthContext(authHcp, authApiHcpStubs);
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
      initAuthContext(null, authApiHcpStubs);
      expect(authContext.session()).to.be.null;
      expect(authContext.isLoggedIn()).to.be.false;

      const user = await authContext.login("abc", "abc", "abc");
      expect(authApiHcpStubs.login.calledOnce, "calledOnce").to.be.true;
      expect(user).to.be.deep.equals(authHcp.user);
      expect(authContext.traceToken, "traceToken").to.be.equals(authHcp.traceToken);
      expect(authContext.sessionToken, "sessionToken").to.be.equals(authHcp.sessionToken);
      expect(authContext.user, "user").to.be.not.null;
      expect(authContext.user.userid, "userid").to.be.equals(authHcp.user.userid);
      expect(sessionStorage.getItem(STORAGE_KEY_SESSION_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(authHcp.sessionToken);
      expect(sessionStorage.getItem(STORAGE_KEY_TRACE_TOKEN), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(authHcp.traceToken);
      expect(sessionStorage.getItem(STORAGE_KEY_USER), "STORAGE_KEY_SESSION_TOKEN").to.be.equals(JSON.stringify(authHcp.user));
      expect(window._paq, JSON.stringify(window._paq)).to.be.deep.equals([
        ["setUserId", authHcp.user.userid],
        ["setCustomVariable", 1, "UserRole", "hcp", "page"],
        ["trackEvent", "registration", "login", "hcp"],
      ]);
      expect(authContext.session()).to.be.deep.equals(authHcp);
      expect(authContext.isLoggedIn()).to.be.true;
    });

    it("should throw an exception if the api call failed", async () => {
      initAuthContext(null, authApiHcpStubs);
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
      expect(authContext.isLoggedIn()).to.be.false;
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
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.session()).to.be.not.null;
      expect(authContext.isLoggedIn()).to.be.true;

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
      expect(authContext.isLoggedIn()).to.be.false;
    });
    it("should not crash if the api call crash", async () => {
      authApiHcpStubs.logout.rejects();
      initAuthContext(authHcp, authApiHcpStubs);
      await authContext.logout();
      await waitTimeout(10);
      expect(authApiHcpStubs.logout.calledOnce, "logout calledOnce").to.be.true;
      expect(authContext.session()).to.be.null;
      expect(authContext.isLoggedIn()).to.be.false;
    });
  });

  describe("Updates", () => {
    const updatedPreferences: Preferences = { displayLanguageCode: "fr" };
    const updatedProfile: Profile = { ...loggedInUsers.hcp.profile, privacyPolicy: { acceptanceTimestamp: new Date().toISOString(), isAccepted: true } };
    const updatedSettings: Settings = { ...loggedInUsers.hcp.settings, country: "FR" };

    it("updatePreferences should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updatePreferences.resolves(updatedPreferences);
      initAuthContext(null, authApiHcpStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.preferences).to.be.deep.equals({ displayLanguageCode: "en" });

      const result = await authContext.updatePreferences({ ...updatedPreferences });
      expect(authApiHcpStubs.updatePreferences.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedPreferences);
      expect(authContext.user.preferences).to.be.deep.equals(updatedPreferences);
    });

    it("updateProfile should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateProfile.resolves(updatedProfile);
      initAuthContext(null, authApiHcpStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.profile).to.be.deep.equals(loggedInUsers.hcp.profile);

      const result = await authContext.updateProfile({ ...updatedProfile });
      expect(authApiHcpStubs.updateProfile.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedProfile);
      expect(authContext.user.profile).to.be.deep.equals(updatedProfile);
    });

    it("updateSettings should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateSettings.resolves(updatedSettings);
      initAuthContext(null, authApiHcpStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.settings).to.be.deep.equals(loggedInUsers.hcp.settings);

      const result = await authContext.updateSettings({ ...updatedSettings });
      expect(authApiHcpStubs.updateSettings.calledOnce, "calledOnce").to.be.true;
      expect(result).to.be.deep.equals(updatedSettings);
      expect(authContext.user.settings).to.be.deep.equals(updatedSettings);
    });

    it("updatePassword should not call the API if the user is not logged in", async () => {
      authApiHcpStubs.updateUser.resolves();
      initAuthContext(null, authApiHcpStubs);
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
      const authApiStubs = createAuthApiStubs(authPatient);
      authApiStubs.updateUser.resolves();
      initAuthContext(authPatient, authApiStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.user.settings).to.be.deep.equals(loggedInUsers.hcp.settings);

      await authContext.updatePassword("abcd", "1234");
      expect(authApiHcpStubs.updateUser.calledOnce, "calledOnce").to.be.true;
    });

    it("switchRoleToHCP should failed for hcp users", async () => {
      initAuthContext(authHcp, authApiHcpStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false);
      } catch (reason) {
        error = reason;
      }
      expect(error, "exception").to.be.instanceOf(Error);
      expect(error.message).to.be.equals("invalid-user-role");
    });
    it("switchRoleToHCP should failed for patient users", async () => {
      const authApiStubs = createAuthApiStubs(authPatient);
      initAuthContext(authPatient, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false);
      } catch (reason) {
        error = reason;
      }
      expect(error, "exception").to.be.instanceOf(Error);
      expect(error.message).to.be.equals("invalid-user-role");
    });
    it("switchRoleToHCP should not call updateProfile if updateUser failed", async () => {
      const authApiStubs = createAuthApiStubs(authCaregiver);
      authApiStubs.updateUser.rejects();
      initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false);
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
      const authApiStubs = createAuthApiStubs(authCaregiver);
      authApiStubs.updateProfile.rejects();
      initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceOf(Error);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      let updateArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      updateArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = (updateArgs[0] as Session).user.profile;
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
      const authApiStubs = createAuthApiStubs(authCaregiver);
      const accepts = {
        acceptanceTimestamp: now.toISOString(),
        isAccepted: true,
      };
      authApiStubs.updateProfile.resolves({ ...authCaregiver.user.profile, termsOfUse: accepts, privacyPolicy: accepts });
      authApiStubs.refreshToken.resolves(invalidUpdatedToken);
      initAuthContext(authCaregiver, authApiStubs);
      let error: Error | null = null;
      try {
        await authContext.switchRoleToHCP(false);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("Role change is not effective");
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      let updateArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      updateArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = (updateArgs[0] as Session).user.profile;
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
      const authApiStubs = createAuthApiStubs(authCaregiver);
      const accepts = {
        acceptanceTimestamp: now.toISOString(),
        isAccepted: true,
      };
      authApiStubs.updateProfile.resolves({ ...authCaregiver.user.profile, termsOfUse: accepts, privacyPolicy: accepts, contactConsent: accepts });
      authApiStubs.refreshToken.resolves(updatedToken);
      initAuthContext(authCaregiver, authApiStubs);

      await authContext.switchRoleToHCP(true);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      let updateArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      updateArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = (updateArgs[0] as Session).user.profile;
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
      const authApiStubs = createAuthApiStubs(authCaregiver);
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
      initAuthContext(authCaregiver, authApiStubs);

      await authContext.switchRoleToHCP(false);
      expect(authApiStubs.updateUser.calledOnce, "updateUser.calledOnce").to.be.true;
      let updateArgs = authApiStubs.updateUser.firstCall.args;
      expect(updateArgs[0]).to.have.keys(["user", "sessionToken", "traceToken"]);
      expect(updateArgs[1]).to.be.an("object").deep.equals({ roles: [UserRoles.hcp] });
      expect(authApiStubs.updateProfile.calledOnce, "updateProfile.calledOnce").to.be.true;
      updateArgs = authApiStubs.updateProfile.firstCall.args;
      expect(updateArgs[0]).to.have.all.keys("user", "sessionToken", "traceToken");
      const profile = (updateArgs[0] as Session).user.profile;
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
        terms: true,
        feedback: false,
      };
      initAuthContext(null, authApiHcpStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
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
      initAuthContext(authHcp, authApiHcpStubs);
      await authContext.flagPatient(userId);
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      const apiCall = authApiHcpStubs.updatePreferences.getCall(0).args;
      expect((apiCall[0] as Session).user.preferences.patientsStarred, "apiCall patientsStarred").deep.equals([userId]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred").to.be.an("array").deep.equals([userId]);
    });
    it("should un-flag a flagged patient", async () => {
      const userId = uuidv4();
      const otherUserId = uuidv4();
      authHcp.user.preferences = { displayLanguageCode: "fr", patientsStarred: [userId, otherUserId] };
      authApiHcpStubs.updatePreferences.resolves({ displayLanguageCode: "fr", patientsStarred: [otherUserId] });
      initAuthContext(authHcp, authApiHcpStubs);
      await authContext.flagPatient(userId);
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce").to.be.true;
      const apiCall = authApiHcpStubs.updatePreferences.getCall(0).args;
      expect((apiCall[0] as Session).user.preferences.patientsStarred, "apiCall patientsStarred").deep.equals([otherUserId]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred").to.be.an("array").deep.equals([otherUserId]);
    });
    it("should add another user to an existing list", async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();
      authApiHcpStubs.updatePreferences.onFirstCall().resolves({ patientsStarred: [userId1] });
      authApiHcpStubs.updatePreferences.onSecondCall().resolves({ patientsStarred: [userId1, userId2] });
      initAuthContext(authHcp, authApiHcpStubs);
      expect(authContext.getFlagPatients(), "authContext getFlagPatients()").to.be.an("array").empty;

      await authContext.flagPatient(userId1);
      expect(authApiHcpStubs.updatePreferences.calledOnce, "updatePreferences calledOnce (0)").to.be.true;
      let apiCall = authApiHcpStubs.updatePreferences.getCall(0).args[0] as Session;
      expect(apiCall.user.preferences.patientsStarred, "apiCall patientsStarred (0)").deep.equals([userId1]);
      expect(authContext.user.preferences.patientsStarred, "authContext patientsStarred (0)").to.be.an("array").deep.equals([userId1]);

      await authContext.flagPatient(userId2);
      expect(authApiHcpStubs.updatePreferences.calledTwice, "updatePreferences calledTwice (1)").to.be.true;
      apiCall = authApiHcpStubs.updatePreferences.getCall(1).args[0] as Session;
      expect(apiCall.user.preferences.patientsStarred, "apiCall patientsStarred (1)").deep.equals([userId1, userId2]);
      expect(authContext.getFlagPatients(), "authContext getFlagPatients()").to.be.an("array").deep.equals([userId1, userId2]);
    });
    it("setFlagPatients should replace the currently flagged patient", async () => {
      const userId = uuidv4();
      authApiHcpStubs.updatePreferences.resolves({ displayLanguageCode: "fr", patientsStarred: [userId] });
      authHcp.user.preferences.patientsStarred = ["old"];
      initAuthContext(authHcp, authApiHcpStubs);
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
      initAuthContext(null, authApiHcpStubs);
      const username = loggedInUsers.caregiver.username;
      const language = loggedInUsers.caregiver.preferences.displayLanguageCode;
      await authContext.sendPasswordResetEmail(username, language);
      const apiCall = authApiHcpStubs.requestPasswordReset.getCall(0).args;
      expect(apiCall).to.be.deep.equals([username, authContext.traceToken, language]);
    });
    it("resetPassword should call the API", async () => {
      authApiHcpStubs.resetPassword.resolves(true);
      initAuthContext(null, authApiHcpStubs);
      const key = uuidv4();
      const username = loggedInUsers.caregiver.username;
      const password = "abcd";
      const result = await authContext.resetPassword(key, username, password);
      expect(result).to.be.true;
      const apiCall = authApiHcpStubs.resetPassword.getCall(0).args;
      expect(apiCall).to.be.deep.equals([key, username, password, authContext.traceToken]);
    });
  });
}

export default testHook;
