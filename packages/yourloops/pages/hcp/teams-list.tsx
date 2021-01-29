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

import { Team } from "../../models/team";
import { t } from "../../lib/language";
import { errorTextFromException } from "../../lib/utils";
import apiClient from "../../lib/auth/api";
import TeamCard from "./team-card";
import TeamsListBar from "./teams-list-bar";
import TeamMembers from "./team-members";
import RemoveMemberDialog from "./team-member-remove-dialog";

interface TeamsListPageState {
  loading: boolean;
  errorMessage: string | null;
  teams: Team[];
  apiReturnAlert: null | {
    message: string;
    severity: "error" | "warning" | "info" | "success";
  }
  userToBeRemoved: null | {
    team: Team;
    userId: string;
  };
}

/**
 * HCP page to manage teams
 */
class TeamsListPage extends React.Component<RouteComponentProps, TeamsListPageState> {
  private log: Console;

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      loading: true,
      errorMessage: null,
      teams: [],
      userToBeRemoved: null,
      apiReturnAlert: null,
    };

    this.log = bows("TeamsListPage");

    this.onCloseAlert = this.onCloseAlert.bind(this);
    this.onShowModalRemoveMember = this.onShowModalRemoveMember.bind(this);
    this.onHideModalRemoveMember = this.onHideModalRemoveMember.bind(this);
    this.onRemoveTeamMember = this.onRemoveTeamMember.bind(this);
    this.onCreateTeam = this.onCreateTeam.bind(this);
    this.onEditTeam = this.onEditTeam.bind(this);
    this.onSwitchAdminRole = this.onSwitchAdminRole.bind(this);
  }

  componentDidMount(): void {
    this.onRefresh();
  }

  render(): JSX.Element {
    const { loading, errorMessage, teams, apiReturnAlert, userToBeRemoved } = this.state;

    if (loading) {
      return (
        <CircularProgress disableShrink style={{ position: "absolute", top: "calc(50vh - 20px)", left: "calc(50vw - 20px)" }} />
      );
    }
    if (errorMessage !== null) {
      return (
        <div id="div-api-error-message" className="api-error-message">
          <Alert id="alert-api-error-message" severity="error" style={{ marginBottom: "1em" }}>{errorMessage}</Alert>
          <Button id="button-api-error-message" variant="contained" color="secondary" onClick={this.onRefresh}>{t("button-refresh-page-on-error")}</Button>
        </div>
      );
    }

    const teamsItems: JSX.Element[] = [];
    for (const team of teams) {
      teamsItems.push(
        <Grid item xs={12} key={team.id}>
          <TeamCard team={team} onEditTeam={this.onEditTeam} />
          <TeamMembers team={team} onSwitchAdminRole={this.onSwitchAdminRole} onShowModalRemoveMember={this.onShowModalRemoveMember} />
        </Grid>
      );
    }

    return (
      <React.Fragment>
        <TeamsListBar onCreateTeam={this.onCreateTeam} />
        <Container maxWidth="lg" style={{ marginTop: "4em", marginBottom: "2em" }}>
          <Grid container spacing={3}>
            {teamsItems}
          </Grid>
        </Container>
        <RemoveMemberDialog userToBeRemoved={userToBeRemoved} handleClose={this.onHideModalRemoveMember} handleRemoveTeamMember={this.onRemoveTeamMember} />
        <Snackbar open={apiReturnAlert !== null} autoHideDuration={6000} onClose={this.onCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={this.onCloseAlert} severity={apiReturnAlert?.severity}>
            {apiReturnAlert?.message}
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }

  onRefresh(): void {
    this.log.info("Refreshing the page");
    this.setState({ loading: true, errorMessage: null, teams: [] }, async () => {
      try {
        const teams = await apiClient.fetchTeams();
        this.setState({ teams, loading: false });
      } catch (reason: unknown) {
        this.log.error("onRefresh", reason);
        let errorMessage: string;
        if (reason instanceof Error) {
          errorMessage = reason.message;
        } else {
          const s = new String(reason);
          errorMessage = s.toString();
        }
        this.setState({ loading: false, errorMessage });
      }
    });
  }

  onCloseAlert(): void {
    this.setState({ apiReturnAlert: null });
  }

  onShowModalRemoveMember(team: Team, userId: string): void {
    this.log.debug("onShowModalRemoveMember", userId, team);
    this.setState({ userToBeRemoved: { team, userId } });
  }

  onHideModalRemoveMember(): void {
    this.log.debug("onHideModalRemoveMember");
    this.setState({ userToBeRemoved: null });
  }

  async onRemoveTeamMember(): Promise<void> {
    const { userToBeRemoved } = this.state;
    this.log.info("onRemoveTeamMember", userToBeRemoved);

    if (userToBeRemoved !== null) {
      try {
        const teams = await apiClient.removeTeamMember(userToBeRemoved.team, userToBeRemoved.userId);
        const message = t("team-list-success-remove-member");
        this.setState({ teams, apiReturnAlert: { message, severity: "success" } });
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        const message = t("team-list-failed-remove-member", { errorMessage });
        this.setState({ apiReturnAlert: { message, severity: "error" } });
      }
    }
    this.onHideModalRemoveMember();
  }

  async onCreateTeam(team: Partial<Team>): Promise<void> {
    this.log.info("onCreateTeam", team);
    const newTeams = await apiClient.createTeam(team);
    this.setState({ teams: newTeams });
  }

  async onEditTeam(team: Team): Promise<void> {
    this.log.info("onEditTeam", team);
    const teams = await apiClient.editTeam(team);
    this.setState({ teams });
  }

  async onSwitchAdminRole(team: Team, userId: string, admin: boolean): Promise<void> {
    this.log.info("onEditTeam", team);
    try {
      const teams = await apiClient.changeTeamUserRole(team, userId, admin);
      this.setState({ teams });
    } catch (reason: unknown) {
      const errorMessage = errorTextFromException(reason);
      const message = t("team-list-failed-update-role", { errorMessage });
      this.setState({ apiReturnAlert: { message, severity: "error" } });
    }
  }
}

export default TeamsListPage;
