/**
 * Copyright (c) 2021, Diabeloop
 * Teams list for HCPs
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
import bows from "bows";
import { RouteComponentProps } from "react-router-dom";

import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";

import { Team, TeamMemberRole, TeamType } from "../../models/team";
import { t } from "../../lib/language";
import { errorTextFromException } from "../../lib/utils";
import apiClient from "../../lib/auth/api";

import {
  SwitchRoleDialogContentProps,
  AddMemberDialogContentProps,
  RemoveMemberDialogContentProps,
  TeamEditModalContentProps,
  TeamLeaveDialogContentProps,
} from "./types";

import TeamsNavBar from "./teams-nav-bar";
import TeamCard from "./team-card";
import TeamMembers from "./team-members-table";

import TeamEditDialog from "./team-edit-dialog";
import AddMemberDialog from "./team-member-add-dialog";
import RemoveMemberDialog from "./team-member-remove-dialog";
import LeaveTeamDialog from "./team-leave-dialog";
import SwitchRoleDialog from "./team-member-switch-role-dialog";

interface TeamsListPageState {
  loading: boolean;
  errorMessage: string | null;
  teams: Team[];
  apiReturnAlert: null | {
    message: string;
    severity: "error" | "warning" | "info" | "success";
  };
  userToBeRemoved: RemoveMemberDialogContentProps | null;
  addMember: AddMemberDialogContentProps | null;
  switchAdminRole: SwitchRoleDialogContentProps | null;
  teamToLeave: TeamLeaveDialogContentProps | null;
  teamToEdit: TeamEditModalContentProps | null;
}

/**
 * HCP page to manage teams
 */
class TeamsPage extends React.Component<RouteComponentProps, TeamsListPageState> {
  private log: Console;

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = TeamsPage.initialState();

    this.log = bows("TeamsListPage");

    this.onCloseAlert = this.onCloseAlert.bind(this);
    this.onShowAddMemberDialog = this.onShowAddMemberDialog.bind(this);
    this.onShowLeaveTeamDialog = this.onShowLeaveTeamDialog.bind(this);
    this.onShowRemoveTeamMemberDialog = this.onShowRemoveTeamMemberDialog.bind(this);
    this.onShowEditTeamDialog = this.onShowEditTeamDialog.bind(this);
    this.onSwitchAdminRole = this.onSwitchAdminRole.bind(this);
  }

  private static initialState(): TeamsListPageState {
    return {
      loading: true,
      errorMessage: null,
      teams: [],
      userToBeRemoved: null,
      apiReturnAlert: null,
      addMember: null,
      switchAdminRole: null,
      teamToLeave: null,
      teamToEdit: null,
    };
  }

  componentDidMount(): void {
    this.onRefresh();
  }

  render(): JSX.Element {
    const {
      loading,
      errorMessage,
      teams,
      apiReturnAlert,
      userToBeRemoved,
      teamToLeave,
      switchAdminRole,
      addMember,
      teamToEdit,
    } = this.state;

    if (loading) {
      return (
        <CircularProgress
          id="team-page-loading-progress"
          disableShrink
          style={{ position: "absolute", top: "calc(50vh - 20px)", left: "calc(50vw - 20px)" }}
        />
      );
    }
    if (errorMessage !== null) {
      return (
        <div id="div-api-error-message" className="api-error-message">
          <Alert id="alert-api-error-message" severity="error" style={{ marginBottom: "1em" }}>
            {errorMessage}
          </Alert>
          <Button id="button-api-error-message" variant="contained" color="secondary" onClick={this.onRefresh}>
            {t("button-refresh-page-on-error")}
          </Button>
        </div>
      );
    }

    const teamsItems: JSX.Element[] = [];
    for (const team of teams) {
      teamsItems.push(
        <Grid item xs={12} key={team.id}>
          <TeamCard
            team={team}
            onShowEditTeamDialog={this.onShowEditTeamDialog}
            onShowLeaveTeamDialog={this.onShowLeaveTeamDialog}
            onShowAddMemberDialog={this.onShowAddMemberDialog}
          />
          <TeamMembers
            team={team}
            onSwitchAdminRole={this.onSwitchAdminRole}
            onShowRemoveTeamMemberDialog={this.onShowRemoveTeamMemberDialog}
          />
        </Grid>
      );
    }

    return (
      <React.Fragment>
        <TeamsNavBar onShowEditTeamDialog={this.onShowEditTeamDialog} />
        <Container maxWidth="lg" style={{ marginTop: "4em", marginBottom: "2em" }}>
          <Grid id="team-page-grid-list" container spacing={3}>
            {teamsItems}
          </Grid>
        </Container>

        <TeamEditDialog teamToEdit={teamToEdit} />
        <RemoveMemberDialog userToBeRemoved={userToBeRemoved} />
        <LeaveTeamDialog teamToLeave={teamToLeave} />
        <SwitchRoleDialog switchAdminRole={switchAdminRole} />
        <AddMemberDialog addMember={addMember} />

        <Snackbar
          open={apiReturnAlert !== null}
          autoHideDuration={6000}
          onClose={this.onCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert id="team-page-alert" onClose={this.onCloseAlert} severity={apiReturnAlert?.severity}>
            {apiReturnAlert?.message}
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }

  onRefresh(): void {
    this.log.info("Refreshing the page");
    this.setState(TeamsPage.initialState(), async () => {
      try {
        const teams = await apiClient.fetchTeams();
        this.setState({ teams, loading: false });
      } catch (reason: unknown) {
        this.log.error("onRefresh", reason);
        const errorMessage = t("error-failed-display-teams", { errorMessage: errorTextFromException(reason) });
        this.setState({ loading: false, errorMessage });
      }
    });
  }

  onCloseAlert(): void {
    this.setState({ apiReturnAlert: null });
  }

  async onShowLeaveTeamDialog(team: Team): Promise<void> {
    this.log.debug("onShowLeaveTeamDialog", { team });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void) => {
        const teamToLeave = { team, onDialogResult: resolve };
        this.setState({ teamToLeave });
      });
    };

    const isConfirmed = await getConfirmation();
    this.setState({ teamToLeave: null }); // Hide the dialog

    if (isConfirmed) {
      try {
        const onlyMember = !((team.members?.length ?? 0) > 1);
        const teams = await apiClient.leaveTeam(team);
        const message = onlyMember ? t("team-page-success-deleted") : t("team-page-success-leave");
        this.setState({ teams, apiReturnAlert: { message, severity: "success" } });
      } catch (reason: unknown) {
        this.log.error("onShowLeaveTeamDialog", reason);
        const errorMessage = errorTextFromException(reason);
        const message = t("team-page-failed-leave", { errorMessage });
        this.setState({ apiReturnAlert: { message, severity: "error" } });
      }
    }
  }

  async onShowRemoveTeamMemberDialog(team: Team, userId: string): Promise<void> {
    this.log.info("onShowRemoveTeamMemberDialog", { team, userId });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void): void => {
        const userToBeRemoved = { team, userId, onDialogResult: resolve };
        this.setState({ userToBeRemoved });
      });
    };

    const isConfirmed = await getConfirmation();
    this.setState({ userToBeRemoved: null }); // Hide the dialog

    if (isConfirmed) {
      try {
        const teams = await apiClient.removeTeamMember(team, userId);
        const message = t("team-page-success-remove-member");
        this.setState({ teams, apiReturnAlert: { message, severity: "success" } });
      } catch (reason: unknown) {
        this.log.error("onShowRemoveTeamMemberDialog", reason);
        const errorMessage = errorTextFromException(reason);
        const message = t("team-page-failed-remove-member", { errorMessage });
        this.setState({ apiReturnAlert: { message, severity: "error" } });
      }
    }
  }

  async onShowEditTeamDialog(team: Team | null): Promise<void> {
    this.log.debug("onShowEditTeamDialog:", team);

    // Promise which show the modal to edit a team, and return the edited team infos
    const getEditedTeamInfo = () =>
      new Promise((resolve: (result: Partial<Team> | null) => void) => {
        const teamToEdit = { team: team ?? {}, onSaveTeam: resolve };
        this.setState({ teamToEdit });
      });

    const editedTeam = await getEditedTeamInfo();
    this.setState({ teamToEdit: null });
    apiClient.sendMetrics("edit-medical-team", { cancel: editedTeam === null, mode: team === null ? "create" : "edit" });

    if (editedTeam === null) {
      // Edit cancelled
      return;
    }

    try {
      let teams: Team[] = [];
      if (team === null) {
        editedTeam.type = TeamType.medical;
        teams = await apiClient.createTeam(editedTeam);
      } else {
        teams = await apiClient.editTeam(editedTeam as Team);
      }
      this.setState({ teams, apiReturnAlert: { message: t("team-page-success-edit"), severity: "success" } });
    } catch (reason: unknown) {
      this.log.error("onShowEditTeamDialog", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-edit", { errorMessage });
      this.setState({ apiReturnAlert: { message, severity: "error" } });
    }
  }

  async onShowAddMemberDialog(team: Team): Promise<void> {
    this.log.debug("onShowAddMemberDialog:", team);

    const getMemberEmail = () =>
      new Promise((resolve: (result: { email: string | null; role: TeamMemberRole }) => void): void => {
        const addMember = { team, onDialogResult: resolve };
        this.setState({ addMember });
      });

    const { email, role } = await getMemberEmail();
    this.setState({ addMember: null });
    if (email === null) {
      return;
    }

    try {
      await apiClient.inviteHcpTeamMember(team, email, role);
      this.setState({ apiReturnAlert: { message: t("team-page-success-invite-hcp", { email }), severity: "success" } });
    } catch (reason: unknown) {
      this.log.error("onShowAddMemberDialog", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-invite-hcp", { errorMessage });
      this.setState({ apiReturnAlert: { message, severity: "error" } });
    }
  }

  async onSwitchAdminRole(team: Team, userId: string, admin: boolean): Promise<void> {
    this.log.info("onSwitchAdminRole", { team, userId, admin });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void): void => {
        const switchAdminRole = { team, userId, admin, onDialogResult: resolve };
        this.setState({ switchAdminRole });
      });
    };

    const isConfirmed = await getConfirmation();
    this.setState({ switchAdminRole: null }); // Hide the dialog
    if (!isConfirmed) {
      this.log.info("Change not confirmed");
      return;
    }

    try {
      const teams = await apiClient.changeTeamUserRole(team, userId, admin);
      this.setState({ teams });
    } catch (reason: unknown) {
      this.log.error("onSwitchAdminRole", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-update-role", { errorMessage });
      this.setState({ apiReturnAlert: { message, severity: "error" } });
    }
  }
}

export default TeamsPage;
