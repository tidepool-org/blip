/**
 * Copyright (c) 2021, Diabeloop
 * HCP team add dialog member
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
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";
import sinon from "sinon";

import AddMemberDialog from "../../../pages/hcp/team-member-add-dialog";
import { AddMemberDialogContentProps } from "../../../pages/hcp/types";
import { teams } from "../../common";

function testTeamAddMemberDialog(): void {
  const defaultProps: AddMemberDialogContentProps = {
    team: teams[0],
    onDialogResult: sinon.spy(),
  };

  let component: ReactWrapper | null = null;

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component = null;
    }
    (defaultProps.onDialogResult as sinon.SinonSpy).resetHistory();
  });

  it("should be closed if addMember is null", () => {
    component = mount(<AddMemberDialog addMember={null} />);
    expect(component.exists("#team-add-member-dialog")).to.be.true;
    expect(component.html()).to.be.a("string").empty;
  });

  it("should not be closed if addMember exists", () => {
    component = mount(<AddMemberDialog addMember={defaultProps} />);
    expect(component.exists("#team-add-member-dialog")).to.be.true;
    expect(component.html()).to.be.a("string").not.empty;
    expect(component.find("#team-add-member-dialog-title-team-name").text()).to.be.equal(defaultProps.team.name);
  });

  it("should return an empty email if cancel", () => {
    component = mount(<AddMemberDialog addMember={defaultProps} />);
    const event = {
      target: {
        name: "email",
        value: "test@example.com",
      },
    };
    component.find("input").find("#team-add-member-dialog-field-email").at(0).simulate("change", event);
    expect(component.find("#team-add-member-dialog-button-add").at(0).prop("disabled"), "btn add disabled").to.be.false;
    component.find("#team-add-member-dialog-button-cancel").at(0).simulate("click");
    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.getCall(0).args[0]).to.deep.equal({ email: null, role: "viewer" });
  });

  it("should return the email if validated", () => {
    component = mount(<AddMemberDialog addMember={defaultProps} />);
    const changeEmailEvent = {
      target: {
        name: "email",
        value: "test@example.com",
      },
    };
    const changeRoleEvent = {
      target: {
        name: "role",
        checked: true,
      },
    };
    component.find("input").find("#team-add-member-dialog-field-email").last().simulate("change", changeEmailEvent);
    expect(component.find("#team-add-member-dialog-button-add").last().prop("disabled"), "btn add disabled").to.be.false;

    component.find("#team-add-member-dialog-checkbox-admin").last().simulate("change", changeRoleEvent, true);
    component.find("#team-add-member-dialog-button-add").last().simulate("click");

    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.getCall(0).args.length).to.be.equal(1);
    const argReveived = spy.getCall(0).args[0];
    const argExpected = { email: changeEmailEvent.target.value, role: "admin" };
    expect(argReveived, JSON.stringify({ argReveived, argExpected })).to.deep.equal(argExpected);
  });
}

export default testTeamAddMemberDialog;
