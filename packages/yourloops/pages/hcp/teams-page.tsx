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

import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";

import { TypeTeamMemberRole } from "../../models/team";
import sendMetrics from "../../lib/metrics";
import { useTeam, Team, TeamMember } from "../../lib/team";
import { t } from "../../lib/language";
import { errorTextFromException } from "../../lib/utils";

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

interface ApiAlert {
  message: string;
  severity: "error" | "warning" | "info" | "success";
}

const log = bows("TeamsListPage");

/**
 * HCP page to manage teams
 */
function TeamsPage(): JSX.Element {
  const teamHook = useTeam(); // Captain
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [apiAlert, setApiAlert] = React.useState<ApiAlert | null>(null);
  const [teamToEdit, setTeamToEdit] = React.useState<TeamEditModalContentProps | null>(null);
  const [teamToLeave, setTeamToLeave] = React.useState<TeamLeaveDialogContentProps | null>(null);
  const [addMember, setAddMember] = React.useState<AddMemberDialogContentProps | null>(null);
  const [switchAdminRole, setSwitchAdminRole] = React.useState<SwitchRoleDialogContentProps | null>(null);
  const [userToBeRemoved, setUserToBeRemoved] = React.useState<RemoveMemberDialogContentProps | null>(null);

  log.debug("TeamsPage()", { loading, errorMessage });

  const handleRefresh = async (force = false) => {
    log.debug("handleRefresh:", { force });
    setLoading(true);
    setErrorMessage(null);
    try {
      await teamHook.refresh(force);
    } catch (reason: unknown) {
      log.error("handleRefresh", reason);
      const errorMessage = t("error-failed-display-teams", { errorMessage: errorTextFromException(reason) });
      setErrorMessage(errorMessage);
    }
  };

  const handleCloseAlert = () => {
    setApiAlert(null);
  };

  const handleShowEditTeamDialog = async (team: Team | null): Promise<void> => {
    log.debug("handleShowEditTeamDialog:", { team });

    // Promise which show the modal to edit a team, and return the edited team infos
    const getEditedTeamInfo = () =>
      new Promise((resolve: (result: Partial<Team> | null) => void) => {
        setTeamToEdit({ team, onSaveTeam: resolve });
      });

    const editedTeam = await getEditedTeamInfo();
    setTeamToEdit(null);
    sendMetrics("edit-medical-team", { cancel: editedTeam === null, mode: team === null ? "create" : "edit" });

    if (editedTeam === null) {
      // Edit cancelled
      return;
    }

    try {
      if (team === null) {
        await teamHook.createTeam(editedTeam);
      } else {
        await teamHook.editTeam(editedTeam as Team);
      }
      setApiAlert({ message: t("team-page-success-edit"), severity: "success" });
    } catch (reason: unknown) {
      log.error("onShowEditTeamDialog", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-edit", { errorMessage });
      setApiAlert({ message, severity: "error" });
    }
  };

  const handleShowLeaveTeamDialog = async (team: Team): Promise<boolean> => {
    log.debug("handleShowLeaveTeamDialog", { team });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void) => {
        setTeamToLeave({ team, onDialogResult: resolve });
      });
    };

    const isConfirmed = await getConfirmation();
    setTeamToLeave(null); // Hide the dialog

    if (isConfirmed) {
      try {
        const onlyMember = !((team.members.length ?? 0) > 1);
        await teamHook.leaveTeam(team);
        const message = onlyMember ? t("team-page-success-deleted") : t("team-page-leave-success");
        setApiAlert({ message, severity: "success" });
        return true;
      } catch (reason: unknown) {
        log.error("handleShowLeaveTeamDialog", reason);
        const errorMessage = errorTextFromException(reason);
        const message = t("team-page-failed-leave", { errorMessage });
        setApiAlert({ message, severity: "error" });
      }
    }
    return false;
  };

  const handleShowAddMemberDialog = async (team: Team): Promise<void> => {
    log.debug("handleShowAddMemberDialog:", { team });

    const getMemberEmail = () =>
      new Promise((resolve: (result: { email: string | null; role: Exclude<TypeTeamMemberRole, "patient"> }) => void): void => {
        setAddMember({ team, onDialogResult: resolve });
      });

    const { email, role } = await getMemberEmail();
    setAddMember(null);
    if (email === null) {
      return;
    }

    try {
      await teamHook.inviteMember(team, email, role);
      setApiAlert({ message: t("team-page-success-invite-hcp", { email }), severity: "success" });
    } catch (reason: unknown) {
      log.error("handleShowAddMemberDialog", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-invite-hcp", { errorMessage });
      setApiAlert({ message, severity: "error" });
    }
  };

  const handleSwitchAdminRole = async (member: TeamMember, role: Exclude<TypeTeamMemberRole, "patient">): Promise<void> => {
    log.info("handleSwitchAdminRole", { member, role });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void): void => {
        setSwitchAdminRole({ member, role, onDialogResult: resolve });
      });
    };

    const isConfirmed = await getConfirmation();
    setSwitchAdminRole(null); // Hide the dialog
    if (!isConfirmed) {
      log.info("handleSwitchAdminRole, Change not confirmed");
      return;
    }

    try {
      await teamHook.changeMemberRole(member, role);
    } catch (reason: unknown) {
      log.error("handleSwitchAdminRole", reason);
      const errorMessage = errorTextFromException(reason);
      const message = t("team-page-failed-update-role", { errorMessage });
      setApiAlert({ message, severity: "error" });
    }
  };

  const handleShowRemoveTeamMemberDialog = async (member: TeamMember): Promise<void> => {
    log.info("handleShowRemoveTeamMemberDialog", { member });

    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void): void => {
        setUserToBeRemoved({ member, onDialogResult: resolve });
      });
    };

    const isConfirmed = await getConfirmation();
    setUserToBeRemoved(null); // Hide the dialog

    if (isConfirmed) {
      try {
        await teamHook.removeMember(member);
        const message = t("team-page-success-remove-member");
        setApiAlert({ message, severity: "success" });
      } catch (reason: unknown) {
        log.error("handleShowRemoveTeamMemberDialog", reason);
        const errorMessage = errorTextFromException(reason);
        const message = t("team-page-failed-remove-member", { errorMessage });
        setApiAlert( { message, severity: "error" });
      }
    }
  };

  React.useEffect(() => {
    if (!teamHook.initialized) {
      if (!loading) {
        setLoading(true);
      }
      return;
    }

    if (teamHook.errorMessage !== null) {
      const message = t("error-failed-display-teams", { errorMessage: teamHook.errorMessage });
      if (message !== errorMessage) {
        log.error("errorMessage", message);
        setErrorMessage(message);
      }
    } else if (errorMessage !== null) {
      setErrorMessage(null);
    }

    if (loading) {
      setLoading(false);
    }

  }, [teamHook.initialized, teamHook.errorMessage, loading, errorMessage]);

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
        <Button id="button-api-error-message" variant="contained" color="secondary" onClick={() => handleRefresh(true)}>
          {t("button-refresh-page-on-error")}
        </Button>
      </div>
    );
  }

  const teamsItems = teamHook.getMedicalTeams().map<(JSX.Element | null)>((team: Readonly<Team>): JSX.Element | null => {
    return (
      <Grid item xs={12} key={team.id}>
        <TeamCard
          team={team}
          onShowEditTeamDialog={handleShowEditTeamDialog}
          onShowLeaveTeamDialog={handleShowLeaveTeamDialog}
          onShowAddMemberDialog={handleShowAddMemberDialog}
        />
        <TeamMembers
          team={team}
          onSwitchAdminRole={handleSwitchAdminRole}
          onShowRemoveTeamMemberDialog={handleShowRemoveTeamMemberDialog}
        />
      </Grid>
    );
  });

  return (
    <React.Fragment>
      <TeamsNavBar onShowEditTeamDialog={handleShowEditTeamDialog} />
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
        open={apiAlert !== null}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert id="team-page-alert" onClose={handleCloseAlert} severity={apiAlert?.severity}>
          {apiAlert?.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default TeamsPage;
