/**
 * Copyright (c) 2021, Diabeloop
 * Patient care teams page
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
import { useTranslation } from "react-i18next";

import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import sendMetrics from "../../../lib/metrics";
import { useTeam, Team } from "../../../lib/team";
import { errorTextFromException, setPageTitle } from "../../../lib/utils";
import { useAlert } from "../../../components/utils/snackbar";

import { AddTeamDialogContentProps, LeaveTeamDialogContentProps } from "./types";

import SecondaryBar from "./secondary-bar";
import TeamCard from "./team-card";
import AddTeamDialog from "./add-dialog";
import LeaveTeamDialog from "./leave-dialog";

interface PatientTeamsPageProps {
  defaultURL: string;
}

const log = bows("PatientTeamsPage");

/**
 * Patient teams page
 */
function PatientTeamsPage(props: PatientTeamsPageProps): JSX.Element | null {
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const teamHook = useTeam();
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [teamToLeave, setTeamToLeave] = React.useState<LeaveTeamDialogContentProps | null>(null);
  const [teamToAdd, setTeamToAdd] = React.useState<AddTeamDialogContentProps | null>(null);

  log.debug("PatientTeamsPage()", { loading, errorMessage });

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
        await teamHook.leaveTeam(team);
        alert.success(t("modal-patient-remove-team-success"));
        return true;
      } catch (reason: unknown) {
        log.error("handleShowLeaveTeamDialog", reason);
        const errorMessage = errorTextFromException(reason);
        alert.error(t("modal-patient-remove-team-failure", { errorMessage }));
      }
    }
    return false;
  };

  const handleShowAddTeamDialog = async (): Promise<void> => {
    log.debug("handleShowAddTeamDialog");

    const getTeamId = (): Promise<string | null> => {
      return new Promise((resolve: (teamId: string | null) => void) => {
        setTeamToAdd({ onDialogResult: resolve });
      });
    };

    const teamId = await getTeamId();
    setTeamToAdd(null); // Close the dialog

    if (teamId === null) {
      return;
    }

    try {
      await teamHook.joinTeam(teamId);
      alert.success(t("modal-patient-add-team-success"));
      setTimeout(() => teamHook.refresh(true), 10);
      sendMetrics("invitation", "add_care_team");
    } catch (reason: unknown) {
      log.error("handleShowAddTeamDialog", reason);
      const errorMessage = errorTextFromException(reason);
      alert.error(t("modal-patient-add-team-failure", { errorMessage }));
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
  }, [teamHook.initialized, teamHook.errorMessage, loading, errorMessage, t]);

  React.useEffect(() => {
    setPageTitle(t("breadcrumb-patient-teams"));
  }, [t]);

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

  const teamsItems = teamHook.getMedicalTeams().map<JSX.Element | null>((team: Readonly<Team>): JSX.Element | null => {
    return (
      <Grid item xs={12} key={team.id}>
        <TeamCard team={team} onShowLeaveTeamDialog={handleShowLeaveTeamDialog} />
      </Grid>
    );
  });

  return (
    <React.Fragment>
      <SecondaryBar defaultURL={props.defaultURL} onShowAddTeamDialog={handleShowAddTeamDialog} />
      <Container maxWidth="lg" style={{ marginTop: "4em", marginBottom: "2em" }}>
        <Grid id="team-page-grid-list" container spacing={3}>
          {teamsItems}
        </Grid>
      </Container>

      <AddTeamDialog actions={teamToAdd} />
      <LeaveTeamDialog teamToLeave={teamToLeave} />
    </React.Fragment>
  );
}

export default PatientTeamsPage;
