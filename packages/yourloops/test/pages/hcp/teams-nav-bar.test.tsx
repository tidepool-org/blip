/**
 * Copyright (c) 2021, Diabeloop
 * HCP team 2nd nav bar tests
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
import TeamsNavBar from "../../../pages/hcp/teams-nav-bar";

function testTeamNavBar(): void {
  const apiTimeout = 50;
  const onShowEditTeamDialog = sinon.stub().resolves();
  let component: ReactWrapper | null = null;

  afterEach(() => {
    if (component !== null) {
      component.unmount();
      component = null;
    }
    onShowEditTeamDialog.resetHistory();
  });

  it("should display the nav bar", () => {
    component = mount(<TeamsNavBar onShowEditTeamDialog={onShowEditTeamDialog} />);
    expect(component.exists("#teams-navbar-item-left"), "left").to.be.true;
    expect(component.exists("#teams-navbar-item-middle"), "middle").to.be.true;
    expect(component.exists("#teams-navbar-item-right"), "right").to.be.true;
  });

  it("should call onShowEditTeamDialog when clicking on the button", async () => {
    component = mount(<TeamsNavBar onShowEditTeamDialog={onShowEditTeamDialog} />);

    expect(component.exists("#teams-navbar-add-team"), "button exists").to.be.true;
    component.find("#teams-navbar-add-team").last().simulate("click");
    await waitTimeout(apiTimeout);
    expect(onShowEditTeamDialog.calledOnce, "calledOnce").to.be.true;
    expect(onShowEditTeamDialog.calledWith(null), "calledWith(null)").to.be.true;
  });
}

export default testTeamNavBar;
