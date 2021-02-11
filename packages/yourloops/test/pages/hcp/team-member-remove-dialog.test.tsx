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

import { waitTimeout } from "../../../lib/utils";
import { AuthContextProvider } from "../../../lib/auth";
import { TeamMember, TeamContextProvider } from "../../../lib/team";
import { loadTeams } from "../../../lib/team/hook";
import RemoveMemberDialog, { RemoveMemberDialogProps } from "../../../pages/hcp/team-member-remove-dialog";
import { RemoveMemberDialogContentProps } from "../../../pages/hcp/types";

import { authHookHcp, authHcp } from "../../lib/auth/hook.test";
import { teamAPI, resetTeamAPIStubs } from "../../lib/team/hook.test";

function testTeamRemoveMemberDialog(): void {
  const apiTimeout = 50;
  const defaultProps: RemoveMemberDialogContentProps = {
    member: {} as TeamMember,
    onDialogResult: sinon.spy(),
  };

  let component: ReactWrapper | null = null;

  function TestComponent(props: RemoveMemberDialogProps): JSX.Element {
    return (
      <AuthContextProvider value={authHookHcp} >
        <TeamContextProvider api={teamAPI} >
          <RemoveMemberDialog userToBeRemoved={ props.userToBeRemoved } />
        </TeamContextProvider>
      </AuthContextProvider>
    );
  }

  before(async () => {
    const { teams } = await loadTeams(authHcp, teamAPI.fetchTeams, teamAPI.fetchPatients);
    defaultProps.member = teams[1].members[0];
  });

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component = null;
    }
    (defaultProps.onDialogResult as sinon.SinonSpy).resetHistory();
    resetTeamAPIStubs();
  });

  it("should be closed if addMember is null", async () => {
    component = mount(<TestComponent userToBeRemoved={null} />);
    await waitTimeout(apiTimeout);
    expect(component.exists("#team-members-dialog-rmmember")).to.be.true;
    expect(component.html()).to.be.a("string").empty;
  });

  it("should not be closed if addMember exists", async () => {
    component = mount(<TestComponent userToBeRemoved={defaultProps} />);
    await waitTimeout(apiTimeout);
    expect(component.exists("#team-members-dialog-rmmember")).to.be.true;
    expect(component.html()).to.be.a("string").not.empty;
    const { user } = defaultProps.member;
    const question = component.find("#team-members-dialog-rmmember-question").last();
    expect(question.text()).to.be.equal(`Are you sure you want to remove ${user.profile?.firstName} ${user.profile?.lastName} from this medical team?`);
  });

  it("should return false if the user click on the cancel button", async () => {
    component = mount(<TestComponent userToBeRemoved={defaultProps} />);
    component.find("#team-members-dialog-rmmember-button-cancel").last().simulate("click");
    await waitTimeout(apiTimeout);
    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.calledWith(false), "calledWith(false)").to.be.true;
  });

  it("should return true if the user click on the OK button", async () => {
    component = mount(<TestComponent userToBeRemoved={defaultProps} />);
    component.find("#team-members-dialog-rmmember-button-remove").last().simulate("click");
    await waitTimeout(apiTimeout);
    const spy = defaultProps.onDialogResult as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;
    expect(spy.calledWith(true), "calledWith(true)").to.be.true;
  });
}

export default testTeamRemoveMemberDialog;
