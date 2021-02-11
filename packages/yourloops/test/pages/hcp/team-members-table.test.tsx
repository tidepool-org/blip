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
import { AuthContextProvider } from "../../../lib/auth";
import { Team, TeamContextProvider, loadTeams } from "../../../lib/team";
import TeamMembers, { TeamMembersProps } from "../../../pages/hcp/team-members-table";

import { loggedInUsers } from "../../common";
import { authHookHcp, authHcp } from "../../lib/auth/hook.test";
import { teamAPI, resetTeamAPIStubs } from "../../lib/team/hook.test";
import { TeamMemberRole } from "../../../models/team";

function testTeamMembersTable(): void {
  const apiTimeout = 50;
  const defaultProps: TeamMembersProps = {
    team: {} as Team,
    onShowRemoveTeamMemberDialog: sinon.stub().returns(waitTimeout(apiTimeout)),
    onSwitchAdminRole: sinon.stub().returns(waitTimeout(apiTimeout)),
  };
  let teams: Team[] = [];
  let component: ReactWrapper | null = null;
  const mountOptions: MountRendererProps = {
    attachTo: null,
  };

  function TestTeamMembersComponent(props: TeamMembersProps): JSX.Element {
    return (
      <AuthContextProvider value={authHookHcp}>
        <TeamContextProvider api={teamAPI}>
          <TeamMembers {...props} />
        </TeamContextProvider>
      </AuthContextProvider>
    );
  }

  before(async () => {
    mountOptions.attachTo = document.getElementById("app");
    if (mountOptions.attachTo === null) {
      mountOptions.attachTo = document.createElement("div");
      mountOptions.attachTo.id = "app";
      document.body.appendChild(mountOptions.attachTo);
    }
    const result = await loadTeams(authHcp, teamAPI.fetchTeams, teamAPI.fetchPatients);
    teams = result.teams;
    defaultProps.team = teams[1];
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
    resetTeamAPIStubs();
  });

  async function displayDefaultTable(): Promise<ReactWrapper> {
    component = mount(<TestTeamMembersComponent {...defaultProps} />, mountOptions);
    component.find(`#team-members-list-${defaultProps.team.id}-header`).last().simulate("click");
    component.update();
    await waitTimeout(apiTimeout);
    return component;
  }

  it("should display a collapse accordion by default", async () => {
    component = mount(<TestTeamMembersComponent {...defaultProps} />, mountOptions);
    await waitTimeout(apiTimeout);
    expect(component.exists(`#team-members-list-${defaultProps.team.id}`)).to.be.true;
    expect(component.exists(`team-members-list-${defaultProps.team.id}-table`)).to.be.false;
  });

  it("should display the member table when clicking on the accordion", async () => {
    component = await displayDefaultTable();
    expect(component.exists(`#team-members-list-${defaultProps.team.id}-table`)).to.be.true;
  });

  it("should display all the team members", async () => {
    component = await displayDefaultTable();
    const teamId = defaultProps.team.id;
    const { members } = defaultProps.team;
    expect(members.length, `expect nMembers ${members.length} > 0`).to.be.above(0);
    for (const member of members) {
      const rowId = `#team-members-list-${teamId}-row-${member.user.userid}`;
      expect(component.exists(rowId), rowId).to.be.equal(member.role !== TeamMemberRole.patient);
    }
  });

  describe("Admin", () => {
    it("should display the remove button for others team members", async () => {
      component = await displayDefaultTable();

      const teamId = defaultProps.team.id;
      const { members } = defaultProps.team;
      expect(members.length, `expect nMembers ${members.length} > 0`).to.be.above(0);
      for (const member of members) {
        const rowId = `#team-members-list-${teamId}-row-${member.user.userid}-action-remove`;
        if (member.role === TeamMemberRole.patient) {
          expect(component.exists(rowId), member.user.userid).to.be.false;
        } else if (member.user.userid === loggedInUsers.hcp.userid) {
          expect(component.exists(rowId), member.user.userid).to.be.false;
        } else {
          expect(component.exists(rowId), member.user.userid).to.be.true;
        }
      }
    });

    it("should call onSwitchAdminRole when clicking on the checkbox", async () => {
      component = await displayDefaultTable();

      const teamId = defaultProps.team.id;
      const member = teams[1].members[0];
      const memberId = member.user.userid;
      const event = { target: { name: memberId, checked: true } };
      component.find(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`).last().simulate("change", event);
      // Add a wait here to make react happy, not sure to fully understand why
      component.update();
      await waitTimeout(apiTimeout);

      const spy = defaultProps.onSwitchAdminRole as sinon.SinonSpy;
      expect(spy.calledOnce, "calledOnce").to.be.true;
      expect(spy.calledWith(member, TeamMemberRole.admin), `calledWith(${spy.getCall(0).args})`).to.be.true;
    });

    it("should call onShowRemoveTeamMemberDialog when clicking on the button", async () => {
      component = await displayDefaultTable();
      const teamId = defaultProps.team.id;
      const member = teams[1].members[1];
      const memberId = member.user.userid;
      component.find(`#team-members-list-${teamId}-row-${memberId}-action-remove`).last().simulate("click");
      component.update();

      const spy = defaultProps.onShowRemoveTeamMemberDialog as sinon.SinonSpy;
      expect(spy.calledOnce, "calledOnce").to.be.true;
      expect(spy.calledWith(member), `calledWith(${spy.getCall(0).args})`).to.be.true;
    });
  });

  describe("Viewer", () => {
    it("should not display the remove team member button and switch role checkbox must be disabled", async () => {
      const props: TeamMembersProps = {
        ...defaultProps,
        team: teams[2],
      };
      component = mount(<TestTeamMembersComponent {...props} />, mountOptions);
      const teamId = props.team.id;
      component.find(`#team-members-list-${teamId}-header`).last().simulate("click");
      component.update();
      await waitTimeout(apiTimeout);

      const { members } = props.team;
      expect(members.length).to.be.above(0);
      for (const member of members) {
        if (member.role === TeamMemberRole.patient) {
          continue;
        }
        const memberId = member.user.userid;
        expect(component.exists(`#team-members-list-${teamId}-row-${memberId}-action-remove`), "button exists").to.be.false;
        expect(component.exists(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`), "checkbox exists").to.be.true;
        const checkBox = component.find(`#team-members-list-${teamId}-row-${memberId}-role-checkbox`).last();
        expect(checkBox.prop("disabled"), "checkbox disabled").to.be.true;
      }
    });
  });
}

export default testTeamMembersTable;
