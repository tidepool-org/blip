/**
 * Copyright (c) 2021, Diabeloop
 * Web HCP page tests
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

import testPatientsListAppBar from "./patients-list-bar.test";
import testPatientListTable from "./patients-list-table.test";
import testTeamCard from "./team-card.test";
import testTeamEditDialog from "./team-edit-dialog.test";
import testTeamAddMemberDialog from "./team-member-add-dialog.test";
import testTeamRemoveMemberDialog from "./team-member-remove-dialog.test";
import testTeamSwitchRoleDialog from "./team-member-switch-role-dialog.test";
import testTeamMembersTable from "./team-members-table.test";
import testTeamNavBar from "./teams-nav-bar.test";
import testTeamPage from "./teams-page.test";

function testHCPPage(): void {
  describe("Patient List", () => {
    describe("AppBar", testPatientsListAppBar);
    describe("Table", testPatientListTable);
  });
  describe("Teams", () => {
    describe("Card", testTeamCard);
    describe("Edit dialog", testTeamEditDialog);
    describe("Add member dialog", testTeamAddMemberDialog);
    describe("Remove member dialog", testTeamRemoveMemberDialog);
    describe("Switch role dialog", testTeamSwitchRoleDialog);
    describe("Members Table", testTeamMembersTable);
    describe("Nav bar", testTeamNavBar);
    describe("Page", testTeamPage);
  });
}

export default testHCPPage;
