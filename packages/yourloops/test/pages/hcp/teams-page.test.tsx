/**
 * Copyright (c) 2021, Diabeloop
 * HCP team page tests
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
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";
import sinon from "sinon";

import { t } from "../../../lib/language";
import apiClient from "../../../lib/auth/api";
import TeamsPage from "../../../pages/hcp/teams-page";

import { waitTimeout } from "../../../lib/utils";
import {
  teams,
  loggedInUsers,
} from "../../common";

function testTeamPage(): void {
  const apiTimeout = 50;
  let component: ReactWrapper | null = null;

  before(() => {
    sinon.stub(apiClient, "whoami").returns(loggedInUsers.hcp);
    sinon.stub(apiClient, "fetchTeams");
    sinon.stub(apiClient, "leaveTeam");
  });
  after(() => {
    sinon.restore();
  });

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component = null;
    }
    (apiClient.fetchTeams as sinon.SinonStub).resetHistory();
    (apiClient.fetchTeams as sinon.SinonStub).resolves(_.cloneDeep(teams));
    (apiClient.leaveTeam as sinon.SinonStub).resetHistory();
  });

  async function createComponent(): Promise<ReactWrapper> {
    const spy = apiClient.fetchTeams as sinon.SinonStub;
    const page = mount(
      <BrowserRouter>
        <Switch>
          <Route path="/" render={(props) => <TeamsPage {...props} />} />
        </Switch>
      </BrowserRouter>
    );

    expect(page.exists("#team-page-loading-progress"), "loading displayed").to.be.true;
    expect(spy.calledOnce).to.be.true;
    await waitTimeout(apiTimeout);
    page.update();
    return page;
  }

  it("should show the loading progress when mounting", async () => {
    const spy = apiClient.fetchTeams as sinon.SinonStub;
    spy.rejects(new Error("Test error"));

    component = await createComponent();
  });

  it("should display an error message if loading failed", async () => {
    const spy = apiClient.fetchTeams as sinon.SinonStub;
    spy.rejects(new Error("Test error"));

    component = await createComponent();
    expect(component.exists("#div-api-error-message"), "error displayed").to.be.true;
  });

  it("should display the team list on successful loading", async () => {
    component = await createComponent();
    expect(component.exists("#team-page-grid-list")).to.be.true;
  });

  describe("Alert", () => {
    it("should display an alert when apiReturnAlert state is set", async () => {
      component = await createComponent();
      component.find(TeamsPage).setState({ apiReturnAlert: { message: "test message", severity: "info" } });
      component.update();
      expect(component.exists("#team-page-alert"), "team-page-alert").to.be.true;
    });
  });

  describe("onShowLeaveTeamDialog", () => {
    it("should display the leave dialog, and not call the api on cancel", async () => {
      component = await createComponent();
      expect(component.exists("#team-leave-dialog-title"), "team-leave-dialog-title not exists").to.be.false;

      const teamPage = component.find(TeamsPage).instance() as TeamsPage;
      const showDialog = teamPage.onShowLeaveTeamDialog(teams[0]);

      await waitTimeout(apiTimeout);
      component.update();
      expect(teamPage.state.teamToLeave, "state.teamToLeave not null").to.be.not.null;

      expect(component.exists("#team-leave-dialog-title"), "team-leave-dialog-title exists").to.be.true;
      component.find("#team-leave-dialog-button-cancel").last().simulate("click");

      await showDialog;
      expect(teamPage.state.teamToLeave, "state.teamToLeave null").to.be.null;

      const leaveTeamStub = apiClient.leaveTeam as sinon.SinonStub;
      expect(leaveTeamStub.calledOnce, "calledOnce").to.be.false;
    });

    it("should display the leave dialog, and call the api on validate", async () => {
      const leaveTeamStub = apiClient.leaveTeam as sinon.SinonStub;
      const teamUpdates = _.cloneDeep(teams);
      teamUpdates.splice(0, 1);
      leaveTeamStub.resolves(teamUpdates);

      component = await createComponent();
      const teamPage = component.find(TeamsPage).instance() as TeamsPage;
      const showDialog = teamPage.onShowLeaveTeamDialog(teams[0]);
      await waitTimeout(apiTimeout);
      component.update();
      component.find("#team-leave-dialog-button-leave").last().simulate("click");

      await showDialog;
      expect(leaveTeamStub.calledOnce, "calledOnce").to.be.true;
      expect(leaveTeamStub.calledWith(teams[0]), "calledWith").to.be.true;

      expect(teamPage.state.apiReturnAlert).to.be.deep.equal({ message: t("team-page-leave-success"), severity: "success" });
    });

    it("should display an error alert if the api call failed", async () => {
      const errorMessage = "API error message";
      const leaveTeamStub = apiClient.leaveTeam as sinon.SinonStub;
      leaveTeamStub.rejects(new Error(errorMessage));

      component = await createComponent();
      const teamPage = component.find(TeamsPage).instance() as TeamsPage;
      const showDialog = teamPage.onShowLeaveTeamDialog(teams[0]);
      await waitTimeout(apiTimeout);
      component.update();
      component.find("#team-leave-dialog-button-leave").last().simulate("click");

      await showDialog;
      expect(leaveTeamStub.calledOnce, "calledOnce").to.be.true;
      expect(leaveTeamStub.calledWith(teams[0]), "calledWith").to.be.true;

      const apiReturnAlert = teamPage.state.apiReturnAlert;
      const apiReturnAlertExpected = {
        message: t("team-page-failed-leave", { errorMessage }),
        severity: "error",
      };
      expect(apiReturnAlert, JSON.stringify({ apiReturnAlert, apiReturnAlertExpected })).to.be.deep.equal(apiReturnAlertExpected);
    });
  });

  describe("onShowRemoveTeamMemberDialog", () => {
    it("TODO", undefined);
  });
  describe("onShowEditTeamDialog", () => {
    it("TODO", undefined);
  });
  describe("onShowAddMemberDialog", () => {
    it("TODO", undefined);
  });
  describe("onSwitchAdminRole", () => {
    it("TODO", undefined);
  });
}

export default testTeamPage;
