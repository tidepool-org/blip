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

import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";

import { MedicalServiceIcon } from "../../../components/icons/MedicalServiceIcon";

import { INotification, Notification, NotificationType } from "../../../pages/notifications/notification";
import { UserRoles } from "../../../models/shoreline";

export const testNotification = (): void => {
  const notif: INotification = {
    date: "2021-02-18T10:00:00",
    emitter: { firstName: "Jeanne", lastName: "Dubois", role: UserRoles.patient },
    type: NotificationType.dataShare,
  };

  const fakeNotification = (role: UserRoles, { date, emitter, type, target }: INotification = notif): JSX.Element => (
    <Notification date={date} emitter={emitter} type={type} target={target} userRole={role} />
  );

  it("should be exported as a function", () => {
    expect(Notification).to.be.a("function");
  });

  it("should render", () => {
    const wrapper = shallow(fakeNotification(UserRoles.caregiver));

    expect(wrapper.find("div").length).to.be.ok;
  });

  it("should display the user firstname and lastname", () => {
    const wrapper = mount(fakeNotification(UserRoles.hcp));
    const expected = notif.emitter.firstName + " " + notif.emitter.lastName;

    expect(wrapper.text().includes(expected)).to.be.true;
  });

  it("should display datashare", () => {
    const wrapper = mount(fakeNotification(UserRoles.hcp));

    expect(wrapper.text().includes("datashare")).to.be.true;
  });

  it("should display join-group", () => {
    const wrapper = mount(fakeNotification(UserRoles.hcp, { ...notif, type: NotificationType.joinGroup, target: "target" }));

    expect(wrapper.text().includes(" join-group target.")).to.be.true;
  });

  describe("getIconToDisplay", () => {
    it("should display a PersonIcon", () => {
      const wrapper = mount(fakeNotification(UserRoles.caregiver));

      expect(wrapper.find(PersonIcon).length).to.equal(1);
      expect(wrapper.find(GroupIcon).length).to.equal(0);
      expect(wrapper.find(MedicalServiceIcon).length).to.equal(0);
    });

    it("should display a GroupIcon", () => {
      const wrapper = mount(fakeNotification(UserRoles.hcp, { ...notif, emitter: { ...notif.emitter, role: UserRoles.hcp } }));

      expect(wrapper.find(PersonIcon).length).to.equal(0);
      expect(wrapper.find(GroupIcon).length).to.equal(1);
      expect(wrapper.find(MedicalServiceIcon).length).to.equal(0);
    });

    it("should display a MedicalServiceIcon", () => {
      const wrapper = mount(fakeNotification(UserRoles.hcp));

      expect(wrapper.find(PersonIcon).length).to.equal(0);
      expect(wrapper.find(GroupIcon).length).to.equal(0);
      expect(wrapper.find(MedicalServiceIcon).length).to.equal(1);
    });
  });

  describe("getDateToDisplay", () => {
    it("should display the given date", () => {
      const wrapper = mount(fakeNotification(UserRoles.hcp));
      const expectedDate = moment(notif.date).utc().format("L");

      expect(wrapper.text().includes(expectedDate)).to.be.true;
    });

    it("should display today", () => {
      const wrapper = mount(fakeNotification(UserRoles.hcp, { ...notif, date: new Date().toISOString() }));

      expect(wrapper.text().includes("today")).to.be.true;
    });

    it("should display yesterday", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const wrapper = mount(fakeNotification(UserRoles.hcp, { ...notif, date: yesterday }));

      expect(wrapper.text().includes("yesterday")).to.be.true;
    });
  });
};
