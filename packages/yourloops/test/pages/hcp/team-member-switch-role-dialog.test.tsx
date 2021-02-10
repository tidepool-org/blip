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

import AuthProvider from "../../../lib/auth/hook/use-auth";
import SwitchRoleDialog from "../../../pages/hcp/team-member-switch-role-dialog";
import { SwitchRoleDialogContentProps } from "../../../pages/hcp/types";
import { teams, TestAuthProviderHCP, loggedInUsers } from "../../common";

function testTeamSwitchRoleDialog(): void {
  const defaultProps: SwitchRoleDialogContentProps = {
    team: teams[0],
    userId: loggedInUsers.hcp.userid,
    admin: true,
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

  it("should be closed if switchAdminRole is null", () => {
    component = mount(<SwitchRoleDialog switchAdminRole={null} />);
    expect(component.exists("#team-members-dialog-switch-role")).to.be.false;
    expect(component.html()).to.be.null;
  });

  it("should be closed if switchAdminRole is called with wrong user", () => {
    component = mount(<SwitchRoleDialog switchAdminRole={{ ...defaultProps, userId: "wrongId" }} />);
    expect(component.exists("#team-members-dialog-switch-role")).to.be.false;
    expect(component.html()).to.be.null;
  });

  it("should not be closed if switchAdminRole exists", () => {
    component = mount(
      <AuthProvider provider={TestAuthProviderHCP}>
        <SwitchRoleDialog switchAdminRole={defaultProps} />
      </AuthProvider>
    );
    expect(component.exists("#team-members-dialog-switch-role"), "dialog id found").to.be.true;
    expect(component.html(), "html not empty").to.be.a("string").not.empty;
  });

  it("should return false if click on the cancel button", () => {
    component = mount(
      <AuthProvider provider={TestAuthProviderHCP}>
        <SwitchRoleDialog switchAdminRole={defaultProps} />
      </AuthProvider>
    );
    component.find("#team-members-dialog-switch-role-button-cancel").last().simulate("click");
    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.calledWith(false), "calledWith(false)").to.be.true;
  });

  it("should return true if click on the ok button", () => {
    component = mount(
      <AuthProvider provider={TestAuthProviderHCP}>
        <SwitchRoleDialog switchAdminRole={defaultProps} />
      </AuthProvider>
    );
    component.find("#team-members-dialog-switch-role-button-ok").last().simulate("click");
    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.calledWith(true), "calledWith(true)").to.be.true;
  });
}

export default testTeamSwitchRoleDialog;
