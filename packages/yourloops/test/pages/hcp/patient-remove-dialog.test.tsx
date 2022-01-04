/**
 * Copyright (c) 2021, Diabeloop
 * HCP remove patient dialog tests
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
import { act, Simulate, SyntheticEventData } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { expect } from "chai";
import * as sinon from "sinon";

import { TeamContextProvider, TeamUser, useTeam } from "../../../lib/team";
import { AuthContextProvider } from "../../../lib/auth";
import { NotificationContextProvider } from "../../../lib/notifications";

import { authHookHcp } from "../../lib/auth/hook.test";
import { stubNotificationContextValue } from "../../lib/notifications/hook.test";
import { teamAPI } from "../../lib/team/hook.test";
import { directShareAPI } from "../../lib/direct-share/hook.test";

import RemoveDialog from "../../../pages/hcp/patients/remove-dialog";
import { waitTimeout } from "../../../lib/utils";


function testPatientRemoveDialog(): void {
  let container: HTMLElement | null = null;
  let patient: TeamUser | undefined;

  const onCloseStub = sinon.stub();

  const RemoveDialogComponent = (props: { dialogOpened: boolean }): JSX.Element => {
    const team = useTeam();
    patient = team.getPatients()[0];

    return (
      <RemoveDialog
        isOpen={props.dialogOpened}
        onClose={onCloseStub}
        patient={patient}
      />
    );
  };

  async function mountComponent(props: { dialogOpened: boolean }): Promise<void> {
    await act(() => {
      return new Promise(resolve => render(
        <AuthContextProvider value={authHookHcp}>
          <NotificationContextProvider value={stubNotificationContextValue}>
            <TeamContextProvider teamAPI={teamAPI} directShareAPI={directShareAPI}>
              <RemoveDialogComponent {...props} />
            </TeamContextProvider>
          </NotificationContextProvider>
        </AuthContextProvider>, container, resolve)
      );
    });
  }

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
      patient = undefined;
    }
  });

  it("should be closed if isOpen is false", async () => {
    await mountComponent({ dialogOpened: false });
    const dialog = document.getElementById("remove-hcp-patient-dialog");
    expect(dialog).to.be.null;
  });

  it("should be opened if isOpen is true", async () => {
    await mountComponent({ dialogOpened: true });
    const dialog = document.getElementById("remove-hcp-patient-dialog");
    expect(dialog).to.be.not.null;
  });

  it("should not allow to validate if no team is selected", async () => {
    await mountComponent({ dialogOpened: true });
    const validateButton: HTMLButtonElement = document.querySelector("#remove-patient-dialog-validate-button");
    expect(validateButton.disabled).to.be.true;
  });

  it("should be able to remove patient after selecting a team", async () => {
    await mountComponent({ dialogOpened: true });
    const validateButton: HTMLButtonElement = document.querySelector("#remove-patient-dialog-validate-button");
    const teamSelect = document.querySelector("#patient-team-selector + input");

    Simulate.change(teamSelect, { target: { value: "private" } } as unknown as SyntheticEventData);
    expect(validateButton.disabled).to.be.false;

    Simulate.click(validateButton);
    await waitTimeout(1);
    expect(onCloseStub.calledOnce, "click on validate button").to.be.true;
  });
}

export default testPatientRemoveDialog;
