/**
 * Copyright (c) 2021, Diabeloop
 * Auth API tests
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

/* eslint-disable max-lines */

import sinon from "sinon";
import { expect } from "chai";

import HttpStatus from "../../../lib/http-status-codes";
import { HttpHeaderKeys, HttpHeaderValues } from "../../../models/api";
import { IUser, UserRoles, Profile, Settings, Preferences } from "../../../models/shoreline";
import config from "../../../lib/config";
import { Session } from "../../../lib/auth/models";
import api from "../../../lib/auth/api";
import User from "../../../lib/auth/user";

function testAPI(): void {
  let fetchMock: sinon.SinonStub<[input: RequestInfo, init?: RequestInit], Promise<Response>>;
  before(() => {
    fetchMock = sinon.stub(window, 'fetch');
  });

  after(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    fetchMock.reset();
  });

  describe("Login", () => {
    it("should throw if username is empty", async () => {
      let error: Error | null = null;
      try {
        await api.login("", "abcd", "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.be.equals("no-username");
    });

    it("should throw if password is empty", async () => {
      let error: Error | null = null;
      try {
        await api.login("abcd", "", "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.be.equals("no-password");
    });

    it("should call fetch to /auth/login with login & password", async () => {
      fetchMock.rejects(new Error("test-reject-message"));
      let error: Error | null = null;
      try {
        await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }
      expect(fetchMock.calledOnce, "calledOnce").to.be.true;
      const fetchArg = fetchMock.getCall(0).args;
      expect(fetchArg, "fetch args length").to.be.lengthOf(2);
      expect(fetchArg[0]).to.be.equals("http://localhost:8009/auth/login");
      expect(fetchArg[1]).to.be.deep.equals({
        method: "POST",
        cache: "no-store",
        headers: {
          "x-tidepool-trace-session": "abcd",
          Authorization: `Basic ${btoa("abcd:abcd")}`,
        },
      });
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should allow special username and password characters", async () => {
      fetchMock.rejects(new Error("test-reject-message"));
      let error: Error | null = null;
      const userName = "アキラ@test.co.jp";
      const password = "黒澤";
      try {
        await api.login(userName, password, "abcd");
      } catch (err) {
        error = err;
      }
      expect(fetchMock.calledOnce, "calledOnce").to.be.true;
      const fetchArg = fetchMock.getCall(0).args;
      expect(fetchArg, "fetch args length").to.be.lengthOf(2);
      expect(fetchArg[0]).to.be.equals("http://localhost:8009/auth/login");
      expect(fetchArg[1]).to.be.deep.equals({
        method: "POST",
        cache: "no-store",
        headers: {
          "x-tidepool-trace-session": "abcd",
          Authorization: `Basic 44Ki44Kt44OpQHRlc3QuY28uanA66buS5r6k`,
        },
      });
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should reject the login if the return code is forbidden", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusForbidden,
        ok: false,
        statusText: "StatusForbidden",
        type: "error",
        redirected: false,
      } as Response;
      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }

      expect(fetchMock.calledOnce, "calledOnce").to.be.true;
      const fetchArg = fetchMock.getCall(0).args;
      expect(fetchArg[1]).to.be.deep.equals({
        method: "POST",
        cache: "no-store",
        headers: {
          "x-tidepool-trace-session": "abcd",
          Authorization: `Basic ${btoa("abcd:abcd")}`,
        },
      });
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("email-not-verified");
    });

    it("should reject the login if the return code is not 200", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusNotImplemented,
        ok: false,
        statusText: "StatusNotImplemented",
        type: "error",
        redirected: false,
      } as Response;
      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }

      expect(fetchMock.calledOnce, "calledOnce").to.be.true;
      const fetchArg = fetchMock.getCall(0).args;
      expect(fetchArg[1]).to.be.deep.equals({
        method: "POST",
        cache: "no-store",
        headers: {
          "x-tidepool-trace-session": "abcd",
          Authorization: `Basic ${btoa("abcd:abcd")}`,
        },
      });
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should count the number of failed login and return a message if the account may be locked", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusUnauthorized,
        ok: false,
        statusText: "StatusUnauthorized",
        type: "error",
        redirected: false,
      } as Response;
      fetchMock.resolves(resolveError);
      let error: Error | null = null;

      for (let i=0; i<config.MAX_FAILED_LOGIN_ATTEMPTS - 1; i++) {
        try {
          await api.login("abcd", "abcd", "abcd");
        } catch (err) {
          error = err;
        }
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equals("error-invalid-credentials");
        expect(fetchMock.callCount, "callCount").to.be.equals(i + 1);
        const fetchArg = fetchMock.getCall(i).args;
        expect(fetchArg[1]).to.be.deep.equals({
          method: "POST",
          cache: "no-store",
          headers: {
            "x-tidepool-trace-session": "abcd",
            Authorization: `Basic ${btoa("abcd:abcd")}`,
          },
        });
      }

      try {
        await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equals("error-account-lock");
      expect(fetchMock.callCount, "callCount").to.be.equals(config.MAX_FAILED_LOGIN_ATTEMPTS);
    });

    it("should resolve if there is no profile/settings/preferences", async () => {
      const user: IUser = {
        userid: "abcd",
        username: "abcd@example.com",
        roles: [UserRoles.hcp],
        emails: ["abcd@example.com"],
        emailVerified: true,
      } as IUser;
      const resolveUser: Response = {
        ok: true,
        status: HttpStatus.StatusOK,
        statusText: "OK",
        type: "basic",
        redirected: false,
        headers: new Headers({
          [HttpHeaderKeys.sessionToken]: "the-token",
          [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
        }),
        json: sinon.stub().resolves(user),
      } as unknown as Response;
      const resolveError: Response = {
        status: HttpStatus.StatusNotFound,
        ok: false,
        statusText: "StatusNotFound",
        type: "error",
        redirected: false,
      } as Response;
      fetchMock.resolves(resolveError);
      fetchMock.onFirstCall().resolves(resolveUser);

      let error: Error | null = null;
      let session: Session | null = null;
      try {
        session = await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }

      expect(error).to.be.null;
      expect((resolveUser.json as sinon.SinonStub).calledOnce).to.be.true;
      expect(session).to.be.not.null;
      expect(session.sessionToken).to.be.equals("the-token");
      expect(session.traceToken).to.be.equals("abcd");
      expect(session.user).to.be.an("object");
      expect(session.user).to.deep.include({
        userid: "abcd",
        username: "abcd@example.com",
        emails: ["abcd@example.com"],
        emailVerified: true,
      });
    });

    it("should resolve with profile/settings/preferences is available", async () => {
      const user: IUser = {
        userid: "abcd",
        username: "abcd@example.com",
        roles: [UserRoles.hcp],
        emails: ["abcd@example.com"],
        emailVerified: true,
      } as IUser;
      const profile: Profile = {
        firstName: "Test",
        lastName: "Example",
        fullName: "Test Example",
      };
      const settings: Settings = { country: "DE" };
      const preferences: Preferences = { displayLanguageCode: "de" };

      const resolveUser: Response = {
        ok: true,
        status: HttpStatus.StatusOK,
        statusText: "OK",
        type: "basic",
        redirected: false,
        headers: new Headers({
          [HttpHeaderKeys.sessionToken]: "the-token",
          [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
        }),
        json: sinon.stub().resolves(user),
      } as unknown as Response;

      const resolveSeagull = (r: Profile | Settings | Preferences): Response => ({
        ok: true,
        status: HttpStatus.StatusOK,
        statusText: "OK",
        type: "default",
        redirected: false,
        headers: new Headers({
          [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
        }),
        json: sinon.stub().resolves(r),
      } as unknown as Response);

      fetchMock.onFirstCall().resolves(resolveUser);
      fetchMock.onCall(1).resolves(resolveSeagull(profile));
      fetchMock.onCall(2).resolves(resolveSeagull(preferences));
      fetchMock.onCall(3).resolves(resolveSeagull(settings));

      let error: Error | null = null;
      let session: Session | null = null;
      try {
        session = await api.login("abcd", "abcd", "abcd");
      } catch (err) {
        error = err;
      }

      expect(error).to.be.null;
      expect((resolveUser.json as sinon.SinonStub).calledOnce).to.be.true;
      expect(session).to.be.not.null;
      expect(session.sessionToken).to.be.equals("the-token");
      expect(session.traceToken).to.be.equals("abcd");
      expect(session.user).to.be.an("object");
      expect(session.user).to.deep.include({
        userid: "abcd",
        username: "abcd@example.com",
        emails: ["abcd@example.com"],
        emailVerified: true,
        profile,
        settings,
        preferences,
      });
    });
  });

  describe("signup", () => {
    it("should throw if username is empty", async () => {
      let error: Error | null = null;
      try {
        await api.signup("", "abcd", UserRoles.caregiver, "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.be.equals("no-username");
    });

    it("should throw if password is empty", async () => {
      let error: Error | null = null;
      try {
        await api.signup("abcd", "", UserRoles.hcp, "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.be.equals("no-password");
    });

    it("should throw if the API response is not ok", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.signup("abcd", "abcd", UserRoles.hcp, "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceof(Error);
    });

    it("should return the created user if ok", async () => {
      const user: IUser = {
        userid: "abcd",
        username: "abcd@example.com",
        roles: [UserRoles.caregiver],
        emails: ["abcd@example.com"],
        emailVerified: false,
      } as IUser;
      const resolveSignup: Response = {
        ok: true,
        status: HttpStatus.StatusOK,
        statusText: "OK",
        type: "basic",
        redirected: false,
        headers: new Headers({
          [HttpHeaderKeys.sessionToken]: "the-token",
          [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
        }),
        json: sinon.stub().resolves(user),
      } as unknown as Response;

      fetchMock.resolves(resolveSignup);
      let error: Error | null = null;
      let session: Session | null = null;
      try {
        session = await api.signup(user.username, "abcd", user.roles[0], "abcd");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(session).to.be.not.null;
      expect(session.sessionToken).to.be.equals("the-token");
      expect(session.traceToken).to.be.equals("abcd");
      expect(session.user).to.be.an("object");
      const expected = {
        ...user,
      };
      delete expected.roles;
      expect(session.user, JSON.stringify({ expected, having: session.user })).to.deep.includes(expected);
    });
  });

  describe("resendSignup", () => {
    it("should throw an error if no username", async () => {
      let error: Error | null = null;
      try {
        await api.resendSignup("", "trace-token");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceOf(Error);
    });

    it("should return false if the reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;
      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        const result = await api.resendSignup("abcd", "trace-token");
        expect(result).to.be.false;
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/resend/signup/abcd",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.language]: "en",
          },
        },
      ]);
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      try {
        const result = await api.resendSignup("abcd", "trace-token", "fr");
        expect(result).to.be.true;
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/resend/signup/abcd",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.language]: "fr",
          },
        },
      ]);
    });
  });

  describe("requestPasswordReset", () => {
    it("should throw an error if no username", async () => {
      let error: Error | null = null;
      try {
        await api.requestPasswordReset("", "abcd", "fr", false);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceOf(Error);
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.requestPasswordReset("abcd", "trace-token", "fr", false);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/send/forgot/abcd",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.language]: "fr",
          },
        },
      ]);
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      try {
        await api.requestPasswordReset("abcd", "trace-token");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/send/forgot/abcd?info=ok",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.language]: "en",
          },
        },
      ]);
    });
  });

  describe("sendAccountValidation", () => {
    let unvalidatedUser: User;
    before(() => {
      unvalidatedUser = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.unverified,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(unvalidatedUser),
      };
      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.sendAccountValidation(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/send/signup/abcd",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
            [HttpHeaderKeys.language]: "en",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;
      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(unvalidatedUser),
      };

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      try {
        await api.sendAccountValidation(session, "fr");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/send/signup/abcd",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
            [HttpHeaderKeys.language]: "fr",
          },
        },
      ]);
    });
  });

  describe("confirmAccount", () => {
    it("should throw an error if the key is missing", async () => {
      let error: Error | null = null;
      try {
        await api.accountConfirmed("", "abcd");
      } catch (err) {
        error = err;
      }
      expect(error).to.be.not.null;
      expect(error.message).to.be.equals("error-http-40x");
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.accountConfirmed("abcd", "trace-token");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/accept/signup/abcd",
        {
          method: "PUT",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let result: boolean | null = null;
      try {
        result = await api.accountConfirmed("abcd", "trace-token");
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
      expect(result).to.be.true;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/accept/signup/abcd",
        {
          method: "PUT",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: "trace-token",
          },
        },
      ]);
    });
  });

  describe("resetPassword", () => {
    it("should throw an error if the key is missing", async () => {
      let error: Error | null = null;
      try {
        await api.resetPassword("", "abcd", "abcd", "");
      } catch (err) {
        error = err;
      }
      expect(error).to.be.not.null;
      expect(error.message).to.be.equals("error-http-40x");
    });

    it("should throw an error if the username is missing", async () => {
      let error: Error | null = null;
      try {
        await api.resetPassword("abcd", "", "abcd", "");
      } catch (err) {
        error = err;
      }
      expect(error).to.be.not.null;
      expect(error.message).to.be.equals("error-http-40x");
    });

    it("should throw an error if the password is missing", async () => {
      let error: Error | null = null;
      try {
        await api.resetPassword("abcd", "abcd", "", "");
      } catch (err) {
        error = err;
      }
      expect(error).to.be.not.null;
      expect(error.message).to.be.equals("error-http-40x");
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.resetPassword("the-key", "the-username", "the-password", "trace-token");
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/accept/forgot",
        {
          method: "PUT",
          cache: "no-store",
          body: '{"key":"the-key","email":"the-username","password":"the-password"}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let result: boolean | null = null;
      try {
        result = await api.resetPassword("the-key", "the-username", "the-password", "trace-token");
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
      expect(result).to.be.true;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/confirm/accept/forgot",
        {
          method: "PUT",
          cache: "no-store",
          body: '{"key":"the-key","email":"the-username","password":"the-password"}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
          },
        },
      ]);
    });
  });

  describe("updateProfile", () => {
    let userToUpdate: User;
    before(() => {
      userToUpdate = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.caregiver,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("Not a JSON"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updateProfile(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/profile",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should throw the reason if the update from seagull failed", async () => {
      const jsonResponse = sinon.stub().resolves({ code: 1, reason: "Invalid input JSON" });
      const resolveError: Response = {
        status: HttpStatus.StatusBadRequest,
        ok: false,
        statusText: "BadRequest",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updateProfile(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/profile",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("Invalid input JSON");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should return the updated profile on success", async () => {
      const profile: Profile = {
        fullName: "Test Example",
        firstName: "Text",
        lastName: "Example",
      };
      const jsonResponse = sinon.stub().resolves(profile);
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      session.user.profile = profile;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let updatedProfile: Profile | null = null;
      try {
        updatedProfile = await api.updateProfile(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(updatedProfile).to.be.deep.equals(profile);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/profile",
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify(profile),
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
    });
  });

  describe("updatePreferences", () => {
    let userToUpdate: User;
    before(() => {
      userToUpdate = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.hcp,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("Not a JSON"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updatePreferences(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/preferences",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should throw the reason if the update from seagull failed", async () => {
      const jsonResponse = sinon.stub().resolves({ code: 1, reason: "Invalid input JSON" });
      const resolveError: Response = {
        status: HttpStatus.StatusBadRequest,
        ok: false,
        statusText: "BadRequest",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updatePreferences(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/preferences",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("Invalid input JSON");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should return the updated preferences on success", async () => {
      const preferences: Preferences = {
        displayLanguageCode: "de",
      };
      const jsonResponse = sinon.stub().resolves(preferences);
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      session.user.preferences = preferences;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let updatedPreferences: Preferences | null = null;
      try {
        updatedPreferences = await api.updatePreferences(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(updatedPreferences).to.be.deep.equals(preferences);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/preferences",
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify(preferences),
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
    });
  });

  describe("updateSettings", () => {
    let userToUpdate: User;
    before(() => {
      userToUpdate = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.patient,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("Not a JSON"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updateSettings(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/settings",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should throw the reason if the update from seagull failed", async () => {
      const jsonResponse = sinon.stub().resolves({ code: 1, reason: "Invalid input JSON" });
      const resolveError: Response = {
        status: HttpStatus.StatusBadRequest,
        ok: false,
        statusText: "BadRequest",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updateSettings(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/settings",
        {
          method: "PUT",
          cache: "no-store",
          body: '{}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
      expect(error.message).to.be.equals("Invalid input JSON");
      expect(jsonResponse.callCount).to.be.equals(1);
    });

    it("should return the updated settings on success", async () => {
      const settings: Settings = {
        country: "FR",
      };
      const jsonResponse = sinon.stub().resolves(settings);
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      session.user.settings = settings;

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let updatedSettings: Settings | null = null;
      try {
        updatedSettings = await api.updateSettings(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.null;
      expect(updatedSettings).to.be.deep.equals(settings);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/metadata/abcd/settings",
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify(settings),
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: "trace-token",
            [HttpHeaderKeys.sessionToken]: "session-token",
          },
        },
      ]);
    });
  });

  describe("updateUser", () => {
    let userToUpdate: User;
    before(() => {
      userToUpdate = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.hcp,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.updateUser(session, {});
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/auth/user",
        {
          method: "PUT",
          cache: "no-store",
          body: '{"updates":{}}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
      } as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      try {
        await api.updateUser(session, { roles: [UserRoles.hcp] });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/auth/user",
        {
          method: "PUT",
          cache: "no-store",
          body: '{"updates":{"roles":["hcp"]}}',
          headers: {
            [HttpHeaderKeys.contentType]: HttpHeaderValues.json,
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
          },
        },
      ]);
    });
  });

  describe("refreshToken", () => {
    let userToUpdate: User;
    before(() => {
      userToUpdate = new User({
        userid: "abcd",
        username: "abcd@example.com",
        role: UserRoles.caregiver,
      });
    });

    it("should throw an error if the API reply is not OK", async () => {
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveError);
      let error: Error | null = null;
      try {
        await api.refreshToken(session);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.not.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/auth/login",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
          },
        },
      ]);
      expect(error.message).to.be.equals("error-http-500");
    });

    it("should throw an error if the reply do not have a token", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        headers: new Headers({}),
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let newToken: string | null = null;
      try {
        newToken = await api.refreshToken(session);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.not.null;
      expect(error.message).to.be.equals("missing-token");
      expect(newToken).to.be.null;
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/auth/login",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
          },
        },
      ]);
    });

    it("should resolve with no error when the API reply OK", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        headers: new Headers({
          [HttpHeaderKeys.sessionToken]: "updated-token",
        }),
      } as unknown as Response;

      const session: Session = {
        sessionToken: "session-token",
        traceToken: "trace-token",
        user: new User(userToUpdate),
      };

      fetchMock.resolves(resolveOK);
      let error: Error | null = null;
      let newToken: string | null = null;
      try {
        newToken = await api.refreshToken(session);
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
      expect(newToken).to.be.equals("updated-token");
      expect(fetchMock.callCount).to.be.equals(1);
      expect(fetchMock.getCall(0).args).to.be.deep.equals([
        "http://localhost:8009/auth/login",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            [HttpHeaderKeys.traceToken]: session.traceToken,
            [HttpHeaderKeys.sessionToken]: session.sessionToken,
          },
        },
      ]);
    });
  });
}

export default testAPI;
