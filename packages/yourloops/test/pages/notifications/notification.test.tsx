/**
 * Copyright (c) 2021, Diabeloop
 * Notification tests
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
import { expect } from "chai";
import { mount, shallow } from "enzyme";
import moment from "moment-timezone";
import _ from "lodash";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-test-renderer";

import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import HelpIcon from "@material-ui/icons/Help";

import { UserRoles } from "../../../models/shoreline";
import MedicalServiceIcon from "../../../components/icons/MedicalServiceIcon";
import { Notification } from "../../../pages/notifications/notification";
import { INotification, NotificationType } from "../../../lib/notifications/models";

export const testNotification = (): void => {
  const notif: INotification = {
    id: "11",
    metricsType: "share_data",
    date: "2021-02-18T10:00:00",
    creator: {
      userid: "1",
      profile: {
        fullName: "Jeanne Dubois",
      },
    },
    creatorId: "a",
    email: "a@example.com",
    type: NotificationType.directInvitation,
  };

  const teamNotif: INotification = {
    id: "12",
    metricsType: "share_data",
    date: "2021-02-18T10:00:00",
    creator: {
      userid: "1",
      profile: {
        fullName: "Jeanne Dubois",
      },
    },
    creatorId: "a",
    email: "a@example.com",
    type: NotificationType.careTeamPatientInvitation,
    target: {
      id: "fakeTeamId",
      name: "fakeTeamName",

    },
  };

  const fakeNotification = (
    notification: INotification = notif,
    role: UserRoles = UserRoles.hcp,
    onHelp = () => _.noop
  ): JSX.Element => (
    <Notification
      notification={notification}
      userRole={role}
      onHelp={onHelp}
    />
  );

  describe("wrapped notification", () => {

    it("should be exported as a function", () => {
      expect(Notification).to.be.a("function");
    });

    it("should render", () => {
      const wrapper = shallow(fakeNotification());

      expect(wrapper.find("div").length).to.be.ok;
    });

    it("should display the user firstname and lastname", () => {
      const wrapper = mount(fakeNotification());
      expect(wrapper.text().includes("Jeanne Dubois")).to.be.true;
    });

    it("should display direct share", () => {
      const wrapper = mount(fakeNotification());

      expect(
        wrapper.text().includes("wants to share their diabetes data with you")
      ).to.be.true;
    });

    it("should display medical team join invitation for a member", () => {
      const wrapper = mount(
        fakeNotification({
          ...notif,
          type: NotificationType.careTeamProInvitation,
          target: { id: "0", name: "target" },
        })
      );
      expect(wrapper.text().includes("invites you to join")).to.be.true;
    });

    it("should display medical team join invitation with more info button for a member having a caregiver role", () => {
      const wrapper = mount(
        fakeNotification({
          ...notif,
          type: NotificationType.careTeamProInvitation,
          target: { id: "0", name: "target" },
        },
        UserRoles.caregiver,
        )
      );

      expect(wrapper.text().includes(" invites you to join")).to.be.true;
      expect(wrapper.find(HelpIcon).length).to.equal(1);
    });

    it("should display medical team join invitation for a patient", () => {
      const wrapper = mount(
        fakeNotification({
          ...notif,
          type: NotificationType.careTeamPatientInvitation,
          target: { id: "0", name: "grenoble DIAB service" },
        },
        UserRoles.patient
        )
      );

      expect(
        wrapper
          .text()
          .includes(
            "You're invited to share your diabetes data with grenoble DIAB service"
          )
      ).to.be.true;
      expect(wrapper.find(HelpIcon).length).to.equal(0);
    });

    describe("getIconToDisplay", () => {
      it("should display a PersonIcon", () => {
        const wrapper = mount(fakeNotification());

        expect(wrapper.find(PersonIcon).length).to.equal(1);
        expect(wrapper.find(GroupIcon).length).to.equal(0);
        expect(wrapper.find(MedicalServiceIcon).length).to.equal(0);
      });

      it("should display a GroupIcon", () => {
        const wrapper = mount(fakeNotification({ ...teamNotif, type: NotificationType.careTeamProInvitation }));

        expect(wrapper.find(PersonIcon).length).to.equal(0);
        expect(wrapper.find(GroupIcon).length).to.equal(1);
        expect(wrapper.find(MedicalServiceIcon).length).to.equal(0);
      });

      it("should display a MedicalServiceIcon", () => {
        const wrapper = mount(fakeNotification({ ...teamNotif, type: NotificationType.careTeamPatientInvitation }));

        expect(wrapper.find(PersonIcon).length).to.equal(0);
        expect(wrapper.find(GroupIcon).length).to.equal(0);
        expect(wrapper.find(MedicalServiceIcon).length).to.equal(1);
      });
    });

    describe("getDateToDisplay", () => {
      it("should display the given date", () => {
        const wrapper = mount(fakeNotification());
        const expectedDate = moment.utc(notif.date).utc().format("L");

        expect(wrapper.text().includes(expectedDate)).to.be.true;
      });

      it("should display today", () => {
        const wrapper = mount(fakeNotification({ ...notif, date: new Date().toISOString() }));

        expect(wrapper.text().includes("today")).to.be.true;
      });

      it("should display yesterday", () => {
        // eslint-disable-next-line no-magic-numbers
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const wrapper = mount(fakeNotification({ ...notif, date: yesterday }));

        expect(wrapper.text().includes("yesterday")).to.be.true;
      });
    });
  });

  describe("instanciated notification", () => {

    let container: HTMLElement | null = null;

    const NotificationComponent = (props: { notif: INotification }): JSX.Element => {
      return (
        <Notification
          notification={props.notif}
          userRole={UserRoles.hcp}
          onHelp={_.noop}
        />
      );
    };

    async function mountComponent(notif: INotification): Promise<void> {
      await act(() => {
        return new Promise((resolve) => {
          render(
            <NotificationComponent notif={notif} />, container, resolve);
        });
      });
    }

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container) {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
      }
    });

    it("should be able to render", async () => {
      await mountComponent(notif);
      const component = document.getElementById(`notification-line-${notif.id}`);
      expect(component).to.be.not.null;
    });

    it("should show team code dialog when accepting team invitation", async () => {
      await mountComponent(teamNotif);
      const acceptButton: HTMLButtonElement = document.getElementById(`notification-button-accept-${teamNotif.id}`) as HTMLButtonElement;
      acceptButton.click();
      const dialog = document.getElementById("team-add-dialog-title");
      expect(dialog).to.be.not.null;
    });


    it("should not show team code dialog when accepting non team invitation", async () => {
      await mountComponent(notif);
      const acceptButton: HTMLButtonElement = document.getElementById(`notification-button-accept-${notif.id}`) as HTMLButtonElement;
      acceptButton.click();
      const dialog = document.getElementById("team-add-dialog-title");
      expect(dialog).to.be.null;
    });
  });
};
