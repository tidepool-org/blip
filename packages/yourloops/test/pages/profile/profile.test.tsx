/**
 * Copyright (c) 2021-2022, Diabeloop
 * Profile page tests
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
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate, SyntheticEventData } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { expect } from "chai";
import * as sinon from "sinon";

import { Units } from "../../../models/generic";
import { AuthContextProvider, Session } from "../../../lib/auth";
import { loggedInUsers } from "../../common";
import { createAuthHookStubs } from "../../lib/auth/hook.test";
import { NotificationContextProvider } from "../../../lib/notifications";
import { stubNotificationContextValue } from "../../lib/notifications/hook.test";
import ProfilePage from "../../../pages/profile";
import { Preferences, Profile, Settings } from "../../../models/shoreline";

function testProfile(): void {
  let container: HTMLElement | null = null;
  let updatePreferences: sinon.SinonStub<[Preferences,boolean|undefined], Promise<Preferences>>;
  let updateProfile: sinon.SinonStub<[Profile, boolean | undefined], Promise<Profile>>;
  let updateSettings: sinon.SinonStub<[Settings,boolean|undefined], Promise<Settings>>;
  const defaultUrl = "/professional/patients";

  async function mountProfilePage(session: Session): Promise<void> {
    const context = createAuthHookStubs(session);
    updatePreferences = context.updatePreferences;
    updateProfile = context.updateProfile;
    updateSettings = context.updateSettings;

    await act(() => {
      return new Promise((resolve) => {
        render(
          <BrowserRouter>
            <AuthContextProvider value={context}>
              <NotificationContextProvider value={stubNotificationContextValue}>
                <ProfilePage defaultURL={defaultUrl} />
              </NotificationContextProvider>
            </AuthContextProvider>
          </BrowserRouter>, container, resolve);
      });
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
    }
  });

  it("should be able to render", async () => {
    await mountProfilePage(loggedInUsers.hcpSession);
    expect(container.querySelector("#profile-textfield-firstname").id).to.be.equal("profile-textfield-firstname");
    expect(container.querySelector("#profile-button-save").id).to.be.equal("profile-button-save");
  });

  it("should display mg/dL Units by default if not specified", async () => {
    const session = loggedInUsers.hcpSession;
    delete session.user?.settings?.units?.bg;
    await mountProfilePage(session);
    const selectValue = container.querySelector("#profile-units-selector").innerHTML;
    expect(selectValue).to.be.equal(Units.gram);
  });

  it("should display birthdate if user is a patient", async () => {
    const session = loggedInUsers.patientSession;
    await mountProfilePage(session);
    const birthDateInput = container.querySelector("#profile-textfield-birthdate") as HTMLInputElement;
    expect(birthDateInput?.value).to.be.equal(session.user.profile?.patient?.birthday);
  });

  it("should not display profession if user is a patient", async () => {
    const session = loggedInUsers.patientSession;
    await mountProfilePage(session);
    const hcpProfessionSelectInput = container.querySelector("#profile-hcp-profession-selector + input");
    expect(hcpProfessionSelectInput).to.be.null;
  });

  it("should not display pro sante connect button if user is not a french hcp", async () => {
    const session = loggedInUsers.hcpSession;
    session.user.settings.country = "EN";
    await mountProfilePage(session);
    const proSanteConnectButton = container.querySelector("#pro-sante-connect-button");
    expect(proSanteConnectButton).to.be.null;
  });

  it("should display pro sante connect button if user is a french hcp and his account is not certified", async () => {
    const session = loggedInUsers.hcpSession;
    await mountProfilePage(session);
    const proSanteConnectButton = container.querySelector("#pro-sante-connect-button");
    expect(proSanteConnectButton).to.be.not.null;
  });

  it("should display eCPS number if user is a french hcp and his account is certified", async () => {
    const session = loggedInUsers.hcpSession;
    session.user.frProId = "ANS12345789";
    await mountProfilePage(session);
    const textField = container.querySelector("#professional-account-number-text-field");
    expect(textField).to.be.not.null;
  });

  it("should update profile when saving after changing firstname", async () => {
    const session = loggedInUsers.hcpSession;
    await mountProfilePage(session);

    const saveButton: HTMLButtonElement = container.querySelector("#profile-button-save");
    const firstnameInput: HTMLInputElement = container.querySelector("#profile-textfield-firstname");

    expect(saveButton.disabled, "button is disabled").to.be.true;
    Simulate.change(firstnameInput, { target: { value: "Chandler" } } as unknown as SyntheticEventData);
    expect(saveButton.disabled, "button is enabled").to.be.false;
    Simulate.click(saveButton);
    expect(updateProfile.calledOnce, "call to method").to.be.true;
  });

  it("should update settings when saving after changing units", async () => {
    const session = loggedInUsers.hcpSession;
    await mountProfilePage(session);

    const saveButton: HTMLButtonElement = container.querySelector("#profile-button-save");
    const unitSelectInput = container?.querySelector("#profile-units-selector + input");

    expect(saveButton.disabled, "button is disabled").to.be.true;
    Simulate.change(unitSelectInput, { target: { value: Units.mole } } as unknown as SyntheticEventData);
    expect(saveButton.disabled, "button is enabled").to.be.false;
    Simulate.click(saveButton);
    expect(updateSettings.calledOnce, "call to method").to.be.true;
  });

  it("should update preferences when saving after changing language", async () => {
    const session = loggedInUsers.hcpSession;
    await mountProfilePage(session);

    const saveButton: HTMLButtonElement = container.querySelector("#profile-button-save");
    const languageSelectInput = container.querySelector("#profile-locale-selector + input");

    expect(saveButton.disabled, "button is disabled").to.be.true;
    Simulate.change(languageSelectInput, { target: { value: "es" } } as unknown as SyntheticEventData);
    expect(saveButton.disabled, "button is enabled").to.be.false;
    Simulate.click(saveButton);
    expect(updatePreferences.calledOnce, "call to method").to.be.true;
  });
}

export default testProfile;
