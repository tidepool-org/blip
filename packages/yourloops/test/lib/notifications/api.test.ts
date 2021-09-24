/**
 * Copyright (c) 2021, Diabeloop
 * API Notification tests
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
import { v4 as uuidv4 } from "uuid";

import HttpStatus from "../../../lib/http-status-codes";
import { APINotificationType, INotificationAPI } from "../../../models/notification";
import { Session } from "../../../lib/auth";
import { NotificationType, INotification } from "../../../lib/notifications";
import api from "../../../lib/notifications/api";
import { loggedInUsers } from "../../common";

export interface NotificationAPIStub {
  getReceivedInvitations: sinon.SinonStub<[Readonly<Session>], Promise<INotification[]>>;
  getSentInvitations: sinon.SinonStub<[Readonly<Session>], Promise<INotification[]>>;
  acceptInvitation: sinon.SinonStub<[Readonly<Session>, INotification], Promise<void>>;
  declineInvitation: sinon.SinonStub<[Readonly<Session>, INotification], Promise<void>>;
  cancelInvitation: sinon.SinonStub<[Readonly<Session>, INotification], Promise<void>>;
}

export const notificationAPIStub: NotificationAPIStub = {
  getReceivedInvitations: sinon.stub<[Readonly<Session>], Promise<INotification[]>>().resolves([]),
  getSentInvitations: sinon.stub<[Readonly<Session>], Promise<INotification[]>>().resolves([]),
  acceptInvitation: sinon.stub<[Readonly<Session>, INotification], Promise<void>>().resolves(),
  declineInvitation: sinon.stub<[Readonly<Session>, INotification], Promise<void>>().resolves(),
  cancelInvitation: sinon.stub<[Readonly<Session>, INotification], Promise<void>>().resolves(),
};

export const resetNotificationAPIStub = (): void => {
  notificationAPIStub.getReceivedInvitations.reset();
  notificationAPIStub.getReceivedInvitations.resolves([]);
  notificationAPIStub.getSentInvitations.reset();
  notificationAPIStub.getSentInvitations.resolves([]);
  notificationAPIStub.acceptInvitation.reset();
  notificationAPIStub.acceptInvitation.resolves();
  notificationAPIStub.declineInvitation.reset();
  notificationAPIStub.declineInvitation.resolves();
  notificationAPIStub.cancelInvitation.reset();
  notificationAPIStub.cancelInvitation.resolves();
};

function testAPI(): void {
  let fetchMock: sinon.SinonStub<[input: RequestInfo, init?: RequestInit], Promise<Response>>;
  before(() => {
    fetchMock = sinon.stub(window, "fetch");
  });

  after(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    fetchMock.reset();
  });

  describe("getReceivedInvitations", () => {
    const session = loggedInUsers.caregiverSession;
    const fetchCallArgs = [
      `http://localhost:8009/confirm/invitations/${session.user.userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tidepool-session-token": session.sessionToken,
          "x-tidepool-trace-session": session.traceToken,
        },
        cache: "no-cache",
      },
    ];

    it("should throw an error if the response is not ok", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("Not a JSON"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      let error: Error | null = null;
      try {
        await api.getReceivedInvitations(session);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceof(Error);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });

    it("should return an empty array, if there is no invitation", async () => {
      const jsonResponse = sinon.stub().resolves([]);
      const resolveOK: Response = {
        status: HttpStatus.StatusNotFound,
        ok: false,
        statusText: "NotFound",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const result = await api.getReceivedInvitations(session);
      expect(result).to.be.deep.equals([]);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });

    it("should return the converted notifications", async () => {
      const apiNotifications: INotificationAPI[] = [
        {
          key: uuidv4(),
          type: APINotificationType.careTeamInvitation,
          creatorId: "abcd",
          created: new Date().toISOString(),
          creator: {
            userid: "abcd",
            profile: {
              fullName: "Test",
              firstName: "Test",
              lastName: "Test",
            },
          },
          shortKey: "abcdef",
          email: loggedInUsers.patient.username,
        },
      ];
      const jsonResponse = sinon.stub().resolves(apiNotifications);
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const result = await api.getReceivedInvitations(session);
      const expectedResult: INotification[] = [
        {
          id: apiNotifications[0].key,
          creatorId: apiNotifications[0].creatorId,
          date: apiNotifications[0].created,
          email: apiNotifications[0].email,
          type: NotificationType.directInvitation,
          creator: apiNotifications[0].creator,
          role: undefined,
          target: undefined,
        },
      ];

      expect(result).to.be.an("array").lengthOf(1);
      expect(result, JSON.stringify({ result, expectedResult })).to.be.deep.equals(expectedResult);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });
  });

  describe("getSentInvitations", () => {
    const session = loggedInUsers.caregiverSession;
    const fetchCallArgs = [
      `http://localhost:8009/confirm/invite/${session.user.userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tidepool-session-token": session.sessionToken,
          "x-tidepool-trace-session": session.traceToken,
        },
        cache: "no-cache",
      },
    ];

    it("should throw an error if the response is not ok", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("Not a JSON"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      let error: Error | null = null;
      try {
        await api.getSentInvitations(session);
      } catch (reason) {
        error = reason;
      }
      expect(error).to.be.instanceof(Error);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });

    it("should return an empty array, if there is no invitation", async () => {
      const jsonResponse = sinon.stub().resolves([]);
      const resolveOK: Response = {
        status: HttpStatus.StatusNotFound,
        ok: false,
        statusText: "NotFound",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const result = await api.getSentInvitations(session);
      expect(result).to.be.deep.equals([]);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });

    it("should return the converted notifications", async () => {
      const apiNotifications: INotificationAPI[] = [
        {
          key: uuidv4(),
          type: APINotificationType.careTeamInvitation,
          creatorId: session.user.userid,
          created: new Date().toISOString(),
          creator: {
            userid: "abcd",
            profile: {
              fullName: "Test",
              firstName: "Test",
              lastName: "Test",
            },
          },
          shortKey: "abcdef",
          email: "patient@yourloops.com",
        },
      ];
      const jsonResponse = sinon.stub().resolves(apiNotifications);
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const result = await api.getSentInvitations(session);
      const expectedResult: INotification[] = [
        {
          id: apiNotifications[0].key,
          creatorId: apiNotifications[0].creatorId,
          date: apiNotifications[0].created,
          email: apiNotifications[0].email,
          type: NotificationType.directInvitation,
          creator: apiNotifications[0].creator,
          role: undefined,
          target: undefined,
        },
      ];

      expect(result).to.be.an("array").lengthOf(1);
      expect(result, JSON.stringify({ result, expectedResult })).to.be.deep.equals(expectedResult);
      expect(fetchMock.calledOnce).to.be.true;
      expect(fetchMock.firstCall.args).to.be.deep.equals(fetchCallArgs);
    });
  });

  describe("acceptInvitation", () => {
    it("should throw an error if the invitation type is invalid", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("test"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const notificationTypes = [NotificationType.careTeamDoAdmin, NotificationType.careTeamRemoveMember];
      const session = loggedInUsers.hcpSession;
      const notification: INotification = {
        type: NotificationType.careTeamDoAdmin,
        creator: { userid: session.user.userid, profile: session.user.profile },
        creatorId: session.user.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        id: uuidv4(),
      };
      for (const notificationType of notificationTypes) {
        let err: Error | null = null;
        try {
          await api.acceptInvitation(session, { ...notification, type: notificationType });
        } catch (reason) {
          err = reason;
        }
        expect(err).to.be.not.null;
      }
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (directInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("directInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/accept/invite/${session.user.userid}/${patient.userid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (directInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/accept/invite/${session.user.userid}/${patient.userid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should throw an error if the reply is not ok (careTeamProInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamProInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/accept/team/invite",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (careTeamProInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/accept/team/invite",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should throw an error if the reply is not ok (careTeamPatientInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamPatientInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamPatientInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/accept/team/invite",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (careTeamPatientInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamPatientInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.acceptInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/accept/team/invite",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });
  });

  describe("declineInvitation", () => {
    it("should throw an error if the invitation type is invalid", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("test"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const notificationTypes = [NotificationType.careTeamDoAdmin, NotificationType.careTeamRemoveMember];
      const session = loggedInUsers.hcpSession;
      const notification: INotification = {
        type: NotificationType.careTeamDoAdmin,
        creator: { userid: session.user.userid, profile: session.user.profile },
        creatorId: session.user.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        id: uuidv4(),
      };
      for (const notificationType of notificationTypes) {
        let err: Error | null = null;
        try {
          await api.declineInvitation(session, { ...notification, type: notificationType });
        } catch (reason) {
          err = reason;
        }
        expect(err).to.be.not.null;
      }
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (directInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("directInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/invite/${session.user.userid}/${patient.userid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (directInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/invite/${session.user.userid}/${patient.userid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should throw an error if the teamId is not set (careTeamProInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamProInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (careTeamProInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamProInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/team/invite/${notification.target.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (careTeamProInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/team/invite/${notification.target.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should throw an error if the teamId is not set (careTeamPatientInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamPatientInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamPatientInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (careTeamPatientInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamPatientInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamPatientInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/team/invite/${notification.target.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (careTeamPatientInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamPatientInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.declineInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        `http://localhost:8009/confirm/dismiss/team/invite/${notification.target.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });
  });

  describe("cancelInvitation", () => {
    it("should throw an error if the invitation type is invalid", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("test"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const notificationTypes = [
        NotificationType.careTeamDoAdmin,
        NotificationType.careTeamRemoveMember,
        NotificationType.careTeamPatientInvitation,
      ];
      const session = loggedInUsers.hcpSession;
      const notification: INotification = {
        type: NotificationType.careTeamDoAdmin,
        creator: { userid: session.user.userid, profile: session.user.profile },
        creatorId: session.user.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        id: uuidv4(),
      };
      for (const notificationType of notificationTypes) {
        let err: Error | null = null;
        try {
          await api.cancelInvitation(session, { ...notification, type: notificationType });
        } catch (reason) {
          err = reason;
        }
        expect(err).to.be.not.null;
      }
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (directInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("directInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.cancelInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/cancel/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}","email":"${session.user.username}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (directInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const patient = loggedInUsers.patient;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.directInvitation,
        creator: patient,
        creatorId: patient.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.cancelInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/cancel/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: `{"key":"${notification.id}","email":"${session.user.username}"}`,
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should throw an error if the teamId is missing (careTeamProInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamProInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
      };

      let err: Error | null = null;
      try {
        await api.cancelInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.called).to.be.false;
    });

    it("should throw an error if the reply is not ok (careTeamProInvitation)", async () => {
      const jsonResponse = sinon.stub().rejects(new Error("careTeamProInvitation"));
      const resolveError: Response = {
        status: HttpStatus.StatusInternalServerError,
        ok: false,
        statusText: "InternalServerError",
        type: "error",
        redirected: false,
        json: jsonResponse,
      } as unknown as Response;
      fetchMock.resolves(resolveError);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.cancelInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.not.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/cancel/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: JSON.stringify({
            key: notification.id,
            target: notification.target,
          }),
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

    it("should resolve when the reply is ok (careTeamProInvitation)", async () => {
      const resolveOK: Response = {
        status: HttpStatus.StatusOK,
        ok: true,
        statusText: "OK",
        type: "basic",
        redirected: false,
        text: sinon.stub().resolves("OK"),
      } as unknown as Response;
      fetchMock.resolves(resolveOK);

      const session = loggedInUsers.hcpSession;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: session.user.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };

      let err: Error | null = null;
      try {
        await api.cancelInvitation(session, notification);
      } catch (reason) {
        err = reason;
      }
      expect(err).to.be.null;
      expect(fetchMock.calledOnce).to.be.true;
      const expectedArgs = [
        "http://localhost:8009/confirm/cancel/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tidepool-session-token": session.sessionToken,
            "x-tidepool-trace-session": session.traceToken,
          },
          cache: "no-cache",
          body: JSON.stringify({
            key: notification.id,
            target: notification.target,
          }),
        },
      ];
      expect(fetchMock.firstCall.args).to.be.deep.equals(expectedArgs);
    });

  });
}

export default testAPI;
