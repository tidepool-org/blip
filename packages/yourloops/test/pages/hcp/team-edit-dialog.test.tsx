/**
 * Copyright (c) 2021, Diabeloop
 * HCP team edit dialog tests
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

import _ from "lodash";
import * as React from "react";
import { expect } from "chai";
import { mount, ReactWrapper, MountRendererProps } from "enzyme";
import sinon from "sinon";

import { Team, loadTeams } from "../../../lib/team";
import TeamEditDialog from "../../../pages/hcp/team-edit-dialog";
import { TeamEditModalContentProps } from "../../../pages/hcp/types";
import { authHcp } from "../../lib/auth/hook.test";
import { teamAPI, resetTeamAPIStubs } from "../../lib/team/hook.test";

function testTeamEditDialog(): void {
  const defaultProps: TeamEditModalContentProps = {
    team: {} as Team,
    onSaveTeam: sinon.spy(),
  };
  const textFieldIds = [
    "team-edit-dialog-field-name",
    "team-edit-dialog-field-line1",
    "team-edit-dialog-field-line2",
    "team-edit-dialog-field-zip",
    "team-edit-dialog-field-city",
    "team-edit-dialog-field-phone",
    "team-edit-dialog-field-email",
  ];
  /** paths to be used with lodash.get(...) */
  const textFieldTeamPath = ["name", "address.line1", "address.line2", "address.zip", "address.city", "phone", "email"];

  let component: ReactWrapper | null = null;
  const mountOptions: MountRendererProps = {
    attachTo: null,
  };

  before(async () => {
    mountOptions.attachTo = document.getElementById("app");
    if (mountOptions.attachTo === null) {
      mountOptions.attachTo = document.createElement("div");
      mountOptions.attachTo.id = "app";
      document.body.appendChild(mountOptions.attachTo);
    }
    const { teams } = await loadTeams(authHcp, teamAPI.fetchTeams, teamAPI.fetchPatients);
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
      expect(document.getElementById("team-edit-dialog")).to.be.null;
      component = null;
    }
    (defaultProps.onSaveTeam as sinon.SinonSpy).resetHistory();
    resetTeamAPIStubs();
  });

  it("should be closed if teamToEdit is null", () => {
    component = mount(<TeamEditDialog teamToEdit={null} />, mountOptions);
    expect(component.exists("#team-edit-dialog")).to.be.true;
    expect(component.html()).to.be.a("string").empty;
  });

  it("should not be closed if teamToEdit exists", () => {
    component = mount(<TeamEditDialog teamToEdit={defaultProps} />, mountOptions);
    expect(component.exists("#team-edit-dialog")).to.be.true;
    expect(component.html()).to.be.a("string").not.empty;
  });

  it("should preset fields when editing a team", () => {
    component = mount(<TeamEditDialog teamToEdit={defaultProps} />, mountOptions);
    expect(component.html()).to.be.a("string").not.empty;

    textFieldIds.forEach((id: string, index: number) => {
      if (component === null) throw new Error("silent typescript");
      const field = component.find(`#${id}`);
      expect(field.get(0).props.value, id).to.be.equal(_.get(defaultProps.team, textFieldTeamPath[index], "wrong value"));
    });
    expect(component.find("#team-edit-dialog-button-validate").at(0).prop("disabled")).to.be.false;
  });

  it("should have empty fields when creating a new team", () => {
    component = mount(<TeamEditDialog teamToEdit={{ ...defaultProps, team: null }} />, mountOptions);
    textFieldIds.forEach((id: string) => {
      if (component === null) throw new Error("silent typescript");
      const field = component.find(`#${id}`);
      expect(field.get(0).props.value, id).to.be.equal("");
    });
  });

  it("should not allow to validate if a require info is missing", () => {
    component = mount(<TeamEditDialog teamToEdit={defaultProps} />, mountOptions);
    const event = {
      target: {
        name: "name",
        value: "",
      },
    };
    component.find("input").find("#team-edit-dialog-field-name").at(0).simulate("change", event);
    expect(component.find("#team-edit-dialog-button-validate").at(0).prop("disabled")).to.be.true;
  });

  it("should call the onSaveTeam callback method with null if cancel", () => {
    component = mount(<TeamEditDialog teamToEdit={defaultProps} />, mountOptions);
    component.find("#team-edit-dialog-button-close").at(0).simulate("click");

    expect((defaultProps.onSaveTeam as sinon.SinonSpy).calledOnce, "calledOnce").to.be.true;
    expect((defaultProps.onSaveTeam as sinon.SinonSpy).calledWith(null), "calledWith null").to.be.true;
  });

  it("should call the onSaveTeam callback method with the changes if validated", () => {
    component = mount(<TeamEditDialog teamToEdit={defaultProps} />, mountOptions);

    const event = {
      target: {
        name: "name",
        value: "Updated name",
      },
    };
    const updatedTeam = { ...defaultProps.team, members: [], name: event.target.value };

    component.find("input").find("#team-edit-dialog-field-name").at(0).simulate("change", event);
    expect(component.find("#team-edit-dialog-button-validate").at(0).prop("disabled")).to.be.false;

    component.find("#team-edit-dialog-button-validate").at(0).simulate("click");

    const spy = defaultProps.onSaveTeam as sinon.SinonSpy;
    expect(spy.calledOnce, "calledOnce").to.be.true;

    const message = {
      test: "calledWith updatedTeam",
      expected: updatedTeam,
      having: spy.getCall(0).firstArg,
    };
    expect(spy.calledWith(updatedTeam), JSON.stringify(message, null, 2)).to.be.true;
  });
}

export default testTeamEditDialog;
