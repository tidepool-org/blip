/**
 * Copyright (c) 2022, Diabeloop
 * HCP patient list bar tests
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

import { expect } from "chai";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { AuthContextProvider } from "../../../lib/auth";
import { NotificationContextProvider } from "../../../lib/notifications";
import { TeamContext, TeamContextProvider, TeamUser, useTeam } from "../../../lib/team";
import { FilterType, SortDirection, SortFields, UserInvitationStatus } from "../../../models/generic";
import PatientListPage, { updatePatientList } from "../../../pages/hcp/patients/page";
import { authHookHcp } from "../../lib/auth/hook.test";
import { stubNotificationContextValue } from "../../lib/notifications/hook.test";
import { teamAPI } from "../../lib/team/hook.test";


function testPatientListPage(): void {
  let team: TeamContext;
  let patients: TeamUser[];

  let container: HTMLElement | null = null;

  const PatientListPageComponent = (): JSX.Element => {
    team = useTeam();
    patients = team.getPatients();

    return (
      <PatientListPage />
    );
  };

  async function mountComponent(): Promise<void> {
    await act(() => {
      return new Promise((resolve) => {
        render(
          <AuthContextProvider value={authHookHcp}>
            <NotificationContextProvider value={stubNotificationContextValue}>
              <TeamContextProvider teamAPI={teamAPI}>
                <PatientListPageComponent />
              </TeamContextProvider>
            </NotificationContextProvider>
          </AuthContextProvider>, container, resolve);
      });
    });
  }

  before(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    await mountComponent();
  });

  after(() => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
  });

  it("updatePatientList should return correct patients when filter is pending", () => {
    //given
    const patientExpected = patients.filter(patient => patient.members.find(member => member.status === UserInvitationStatus.pending) !== undefined);

    //when
    const patientReceived = updatePatientList(team, [], "", FilterType.pending, SortFields.lastname, SortDirection.asc, false);

    //then
    expect(patientReceived).to.eql(patientExpected);
  });

  it("updatePatientList should return correct patients when filter is team id", () => {
    //given
    const teamId = patients[0].members[0].team.id;
    const patientExpected = patients.filter(patient => patient.members.find(member => member.team.id === teamId && member.status !== UserInvitationStatus.pending) !== undefined);

    //when
    const patientReceived = updatePatientList(team, [], "", teamId, SortFields.lastname, SortDirection.asc, false);

    //then
    expect(patientReceived).to.eql(patientExpected);
  });
}

export default testPatientListPage;
