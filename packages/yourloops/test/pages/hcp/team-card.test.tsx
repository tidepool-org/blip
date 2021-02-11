/**
 * Copyright (c) 2021, Diabeloop
 * HCP team card tests
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
import { mount, shallow, ReactWrapper, ShallowWrapper } from "enzyme";
import sinon from "sinon";

import { Team, loadTeams } from "../../../lib/team";
import TeamCard, { TeamCardProps, TeamInfo } from "../../../pages/hcp/team-card";
import { authHcp } from "../../lib/auth/hook.test";
import { teamAPI, resetTeamAPIStubs } from "../../lib/team/hook.test";

function testTeamCard(): void {
  let teams: Team[] = [];
  const defaultProps: TeamCardProps = {
    team: {} as Team,
    onShowAddMemberDialog: sinon.spy(),
    onShowEditTeamDialog: sinon.spy(),
    onShowLeaveTeamDialog: sinon.spy(),
  };

  let component: ReactWrapper | ShallowWrapper | null = null;

  const resetSpys = () => {
    resetTeamAPIStubs();
    (defaultProps.onShowEditTeamDialog as sinon.SinonSpy).resetHistory();
    (defaultProps.onShowLeaveTeamDialog as sinon.SinonSpy).resetHistory();
    (defaultProps.onShowAddMemberDialog as sinon.SinonSpy).resetHistory();
  };

  before(async () => {
    resetSpys();
    const result = await loadTeams(authHcp, teamAPI.fetchTeams, teamAPI.fetchPatients);
    teams = result.teams;
    defaultProps.team = teams[1];
  });

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component = null;
    }
    resetSpys();
  });

  it("should be able to render - TeamCard", () => {
    component = shallow(<TeamCard {...defaultProps} />);
    expect(component.find(`#team-card-${defaultProps.team.id}-actions`).length).to.be.equal(1);
    expect(component.find(`#team-card-${defaultProps.team.id}-name`).length).to.be.equal(1);
    expect(component.find(`#team-card-${defaultProps.team.id}-infos`).length).to.be.equal(1);
  });

  it("should render the 2nd addr line if present", () => {
    component = mount(<TeamCard {...defaultProps} />);
    expect(component.find(`#team-card-info-${defaultProps.team.id}-address-value`).find("br").length).to.be.equal(2);
  });

  it("should not render the 2nd addr line if not present", () => {
    const props: TeamCardProps = {
      ...defaultProps,
      team: teams[2],
    };
    component = mount(<TeamCard {...props} />);
    expect(component.find(`#team-card-info-${props.team.id}-address-value`).find("br").length).to.be.equal(1);
  });

  it("should call onShowAddMemberDialog prop function when clicking on the button", () => {
    component = shallow(<TeamCard {...defaultProps} />);
    const btn = component.find(`#team-card-${defaultProps.team.id}-button-add-member`);
    expect(btn.length).to.be.equal(1);
    btn.at(0).simulate("click");
    expect((defaultProps.onShowAddMemberDialog as sinon.SinonSpy).calledOnce).to.be.true;
  });

  it("should call onShowEditTeamDialog prop function when clicking on the button", () => {
    component = shallow(<TeamCard {...defaultProps} />);
    const btn = component.find(`#team-card-${defaultProps.team.id}-button-edit`);
    expect(btn.length).to.be.equal(1);
    btn.at(0).simulate("click");
    expect((defaultProps.onShowEditTeamDialog as sinon.SinonSpy).calledOnce).to.be.true;
  });

  it("should call onShowLeaveTeamDialog prop function when clicking on the button", () => {
    component = shallow(<TeamCard {...defaultProps} />);
    const btn = component.find(`#team-card-${defaultProps.team.id}-button-leave-team`);
    expect(btn.length).to.be.equal(1);
    btn.at(0).simulate("click");
    expect((defaultProps.onShowLeaveTeamDialog as sinon.SinonSpy).calledOnce).to.be.true;
  });

  describe("Info", () => {
    it("should be able to render", () => {
      component = shallow(<TeamInfo id="test" label="label" value="value" icon={<div id="icon" />} />);
      expect(component.find(`#team-card-info-test-label`).length).to.be.equal(1);
      expect(component.find("#icon").length).to.be.equal(1);
    });

    it("should not render if value is not net", () => {
      component = shallow(<TeamInfo id="test" label="label" value={null} icon={<div id="icon" />} />);
      expect(component.find(`#team-card-info-test-label`).length).to.be.equal(0);
      expect(component.find("#icon").length).to.be.equal(0);
      expect(component.html()).to.be.null;
    });
  });
}

export default testTeamCard;
