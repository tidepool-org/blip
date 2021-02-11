/**
 * Copyright (c) 2021, Diabeloop
 * Teams hook tests
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

import sinon from "sinon";
import { TeamAPI } from "../../../lib/team";
import {
  teams,
  members,
  patients,
} from "../../common";

export const teamAPI: TeamAPI = {
  fetchTeams: sinon.stub().resolves(teams),
  fetchPatients: sinon.stub().resolves(patients),
  changeMemberRole: sinon.stub().resolves(),
  createTeam: sinon.stub().resolves(teams[1]),
  editTeam: sinon.stub().resolves(),
  inviteMember: sinon.stub().resolves(members[0]),
  invitePatient: sinon.stub().resolves(patients[4]),
  leaveTeam: sinon.stub().resolves(),
  removeMember: sinon.stub().resolves(),
};

export function resetTeamAPIStubs(): void {
  (teamAPI.fetchTeams as sinon.SinonStub).resetHistory();
  (teamAPI.fetchPatients as sinon.SinonStub).resetHistory();
  (teamAPI.changeMemberRole as sinon.SinonStub).resetHistory();
  (teamAPI.createTeam as sinon.SinonStub).resetHistory();
  (teamAPI.editTeam as sinon.SinonStub).resetHistory();
  (teamAPI.inviteMember as sinon.SinonStub).resetHistory();
  (teamAPI.invitePatient as sinon.SinonStub).resetHistory();
  (teamAPI.leaveTeam as sinon.SinonStub).resetHistory();
  (teamAPI.removeMember as sinon.SinonStub).resetHistory();

  (teamAPI.fetchTeams as sinon.SinonStub).resolves(teams);
  (teamAPI.fetchPatients as sinon.SinonStub).resolves(patients);
}
