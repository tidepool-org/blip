/**
 * Copyright (c) 2021, Diabeloop
 * HCP team members table tests
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
import { mount, ReactWrapper, MountRendererProps } from "enzyme";
import sinon from "sinon";

import { waitTimeout } from "../../../lib/utils";
import AuthProvider from "../../../lib/auth/hook/use-auth";
import TeamMembers, { TeamMembersProps } from "../../../pages/hcp/team-members-table";
import { teams, TestAuthProviderHCP, loggedInUsers } from "../../common";

function testTeamMembersTable(): void {
  const apiTimeout = 50;
  const defaultProps: TeamMembersProps = {
    team: teams[0],
    onShowRemoveTeamMemberDialog: sinon.stub().returns(waitTimeout(apiTimeout)),
    onSwitchAdminRole: sinon.stub().returns(waitTimeout(apiTimeout)),
  };
  let component: ReactWrapper | null = null;
  const mountOptions: MountRendererProps = {
    attachTo: null,
  };

  before(() => {
    mountOptions.attachTo = document.getElementById("app");
    if (mountOptions.attachTo === null) {
      mountOptions.attachTo = document.createElement("div");
      mountOptions.attachTo.id = "app";
      document.body.appendChild(mountOptions.attachTo);
    }
  });

  after(() => {
    const { attachTo } = mountOptions;
    if (attachTo instanceof HTMLElement) {
      document.body.removeChild(attachTo);
    }
  });

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component.detach();
      component = null;
    }
    (defaultProps.onShowRemoveTeamMemberDialog as sinon.SinonSpy).resetHistory();
    (defaultProps.onSwitchAdminRole as sinon.SinonSpy).resetHistory();
  });

  function displayDefaultTable(): ReactWrapper {
    component = mount(
      <AuthProvider provider={TestAuthProviderHCP}>
        <TeamMembers {...defaultProps} />
      </AuthProvider>,
      mountOptions
    );
    component.find(`#team-members-list-${defaultProps.team.id}-header`).last().simulate("click");
    component.update();
    return component;
  }

  it("should display a collapse accordion by default", () => {
    component = mount(
      <AuthProvider provider={TestAuthProviderHCP}>
        <TeamMembers {...defaultProps} />
      </AuthProvider>,
      mountOptions
    );
    expect(component.exists(`#team-members-list-${defaultProps.team.id}`)).to.be.true;
    expect(component.exists(`team-members-list-${defaultProps.team.id}-table`)).to.be.false;
  });

  it("should display the member table when clicking on the accordion", () => {
    component = displayDefaultTable();
    expect(component.exists(`#team-members-list-${defaultProps.team.id}-table`)).to.be.true;
  });

  it("should display all the team members", () => {
    component = displayDefaultTable();
    const teamId = defaultProps.team.id;
    const members = defaultProps.team.members ?? []; // Make typescript happy
    expect(members.length).to.be.above(0);
    for (const member of members) {
      expect(component.exists(`#team-members-list-${teamId}-row-${member.userId}`)).to.be.true;
    }
  });

  describe("Admin", () => {
    it("should display the remove button for others team members", () => {
      component = displayDefaultTable();

      const teamId = defaultProps.team.id;
      const members = defaultProps.team.members ?? []; // Make typescript happy
      expect(members.length).to.be.above(0);
      for (const member of members) {
        if (member.userId === loggedInUsers.hcp.userid) {
          expect(component.exists(`#team-members-list-${teamId}-row-${member.userId}-action-remove`)).to.be.false;
        } else {
          expect(component.exists(`#team-members-list-${teamId}-row-${member.userId}-action-remove`)).to.be.true;
        }
      }
    });

    it("should call onSwitchAdminRole when clicking on the checkbox", async () => {
      component = displayDefaultTable();

      const teamId = defaultProps.team.id;
      const memberId = teams[0].members[0].userId;
      const event = { target: { name: memberId, checked: true } };
      component.find(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`).last().simulate("change", event);
      // Add a wait here to make react happy, not sure to fully understand why
      await waitTimeout(apiTimeout);
      component.update();

      const spy = defaultProps.onSwitchAdminRole as sinon.SinonSpy;
      expect(spy.calledOnce, "calledOnce").to.be.true;
      expect(spy.calledWith(defaultProps.team, memberId, true), `calledWith(${spy.getCall(0).args})`).to.be.true;
    });

    it("should call onShowRemoveTeamMemberDialog when clicking on the button", () => {
      component = displayDefaultTable();
      const teamId = defaultProps.team.id;
      const memberId = teams[0].members[1].userId;
      component.find(`#team-members-list-${teamId}-row-${memberId}-action-remove`).last().simulate("click");
      component.update();

      const spy = defaultProps.onShowRemoveTeamMemberDialog as sinon.SinonSpy;
      expect(spy.calledOnce, "calledOnce").to.be.true;
      expect(spy.calledWith(defaultProps.team, memberId), `calledWith(${spy.getCall(0).args})`).to.be.true;
    });
  });

  describe("Viewer", () => {
    it("should not display the remove team member button and switch role checkbox must be disabled", () => {
      const props: TeamMembersProps = {
        ...defaultProps,
        team: teams[1],
      };
      component = mount(
        <AuthProvider provider={TestAuthProviderHCP}>
          <TeamMembers {...props} />
        </AuthProvider>,
        mountOptions
      );
      const teamId = props.team.id;
      component.find(`#team-members-list-${teamId}-header`).last().simulate("click");
      component.update();

      const members = props.team.members ?? []; // Make typescript happy
      expect(members.length).to.be.above(0);
      for (const member of members) {
        const memberId = member.userId;
        expect(component.exists(`#team-members-list-${teamId}-row-${memberId}-action-remove`), "button exists").to.be.false;
        expect(component.exists(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`), "checkbox exists").to.be.true;
        const checkBox = component.find(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`).last();
        expect(checkBox.prop("disabled"), "checkbox disabled").to.be.true;
      }
    });
  });
}

export default testTeamMembersTable;
