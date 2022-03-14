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
import { BrowserRouter } from "react-router-dom";
import * as sinon from "sinon";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";

import { waitTimeout } from "../../../lib/utils";
import { AuthContextProvider } from "../../../lib/auth";
import { NotificationContext, INotification } from "../../../lib/notifications/models";
import { NotificationContextProvider, useNotification, NotificationType } from "../../../lib/notifications";
import { loggedInUsers } from "../../common";
import { authHookHcp } from "../auth/hook.test";
import { notificationAPIStub, resetNotificationAPIStub } from "./api.test";

const stubNotificationContextValueInternal = {
  accept: sinon.stub().resolves(),
  cancel: sinon.stub().resolves(),
  decline: sinon.stub().resolves(),
  update: sinon.stub(),
  initialized: true,
  receivedInvitations: [] as INotification[],
  sentInvitations: [] as INotification[],
};

export const stubNotificationContextValue = stubNotificationContextValueInternal as NotificationContext;

export function resetNotificationContextValueStubs(): void {
  stubNotificationContextValueInternal.accept.resetHistory();
  stubNotificationContextValueInternal.cancel.resetHistory();
  stubNotificationContextValueInternal.decline.resetHistory();
  stubNotificationContextValueInternal.update.resetHistory();
  stubNotificationContextValueInternal.initialized = true;
  stubNotificationContextValueInternal.receivedInvitations = [];
  stubNotificationContextValueInternal.sentInvitations = [];
}

describe("Notification hook", () => {

  let container: HTMLDivElement | null = null;
  let notifications: NotificationContext | null = null;

  const initNotificationContext = async (): Promise<void> => {
    const DummyComponent = (): JSX.Element => {
      notifications = useNotification();
      return (<div />);
    };
    act(() => {
      ReactDOM.render(
        <BrowserRouter>
          <AuthContextProvider value={authHookHcp}>
            <NotificationContextProvider api={notificationAPIStub}>
              <DummyComponent />
            </NotificationContextProvider>
          </AuthContextProvider>
        </BrowserRouter>, container);
    });

    let i = 0;
    // Wait max 1s
    while (i < 100 && !notifications.initialized) {
      await waitTimeout(10);
      i++;
    }
    expect(notifications.initialized, "initialized").to.be.true;
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    resetNotificationAPIStub();
  });

  describe("Initialization", () => {
    it("should initialize", async () => {
      await initNotificationContext();
      expect(notifications.initialized, "initialized").to.be.true;
      expect(notificationAPIStub.getReceivedInvitations.calledOnce, "getReceivedInvitations").to.be.true;
      expect(notificationAPIStub.getSentInvitations.calledOnce, "getSentInvitations").to.be.true;
    });
  });

  describe("Update", () => {
    it("should re-fetch invitations from the api", async () => {
      await initNotificationContext();
      expect(notificationAPIStub.getReceivedInvitations.calledOnce, "getReceivedInvitations").to.be.true;
      expect(notificationAPIStub.getSentInvitations.calledOnce, "getSentInvitations").to.be.true;
      notifications.update();
      await waitTimeout(100);
      expect(notificationAPIStub.getReceivedInvitations.calledTwice, "getReceivedInvitations").to.be.true;
      expect(notificationAPIStub.getSentInvitations.calledTwice, "getSentInvitations").to.be.true;
    });
  });

  describe("Accept", () => {
    it("should call the api to accept the invitation and refresh", async () => {
      await initNotificationContext();
      const currentUser = loggedInUsers.hcp;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        metricsType: "join_team",
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: currentUser.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };
      await notifications.accept(notification);
      await waitTimeout(100);
      expect(notificationAPIStub.acceptInvitation.calledOnce, "acceptInvitation").to.be.true;
      // Called 2x -> init + accept
      expect(notificationAPIStub.getReceivedInvitations.calledTwice, "getReceivedInvitations").to.be.true;
      expect(notificationAPIStub.getSentInvitations.calledOnce, "getSentInvitations").to.be.true;
    });
  });

  describe("Decline", () => {
    it("should call the api to decline the invitation and refresh", async () => {
      await initNotificationContext();
      const currentUser = loggedInUsers.hcp;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        metricsType: "join_team",
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: currentUser.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };
      await notifications.decline(notification);
      await waitTimeout(100);
      expect(notificationAPIStub.declineInvitation.calledOnce, "declineInvitation").to.be.true;
      // Called 2x -> init + decline
      expect(notificationAPIStub.getReceivedInvitations.calledTwice, "getReceivedInvitations").to.be.true;
      expect(notificationAPIStub.getSentInvitations.calledOnce, "getSentInvitations").to.be.true;
    });
  });

  describe("Cancel", () => {
    it("should call the api to decline the invitation and refresh", async () => {
      await initNotificationContext();
      const currentUser = loggedInUsers.hcp;
      const caregiver = loggedInUsers.caregiver;
      const notification: INotification = {
        id: uuidv4(),
        metricsType: "join_team",
        type: NotificationType.careTeamProInvitation,
        creator: caregiver,
        creatorId: caregiver.userid,
        date: new Date().toISOString(),
        email: currentUser.username,
        target: {
          id: uuidv4(),
          name: "A team",
        },
      };
      await notifications.cancel(notification);
      await waitTimeout(100);
      expect(notificationAPIStub.cancelInvitation.calledOnce, "cancelInvitation").to.be.true;
      expect(notificationAPIStub.getReceivedInvitations.calledOnce, "getReceivedInvitations").to.be.true;
      // Called 2x -> init + cancel
      expect(notificationAPIStub.getSentInvitations.calledTwice, "getSentInvitations").to.be.true;
    });
  });
});

