/**
 * Copyright (c) 2021, Diabeloop
 * Patient list for HCPs
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
import { useHistory } from "react-router-dom";

import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import { FilterType, SortDirection, SortFields } from "../../../models/generic";
import sendMetrics from "../../../lib/metrics";
import { AlertSeverity, useSnackbar } from "../../../lib/useSnackbar";
import { Snackbar } from "../../../components/utils/snackbar";
import { useAuth } from "../../../lib/auth";
import { errorTextFromException, getUserFirstName, getUserLastName, getUserEmail } from "../../../lib/utils";
import { Team, TeamContext, TeamUser, useTeam } from "../../../lib/team";
import { AddPatientDialogResult, AddPatientDialogContentProps } from "../types";
import PatientsSecondaryBar from "./secondary-bar";
import PatientListTable from "./table";
import AddPatientDialog from "./add-dialog";
import TeamCodeDialog from "./team-code-dialog";

const log = bows("PatientListPage");

/**
 * Compare two patient for sorting the patient table
 * @param a A patient
 * @param b A patient
 * @param orderBy Sort field
 */
function doCompare(a: TeamUser, b: TeamUser, orderBy: SortFields): number {
  let aValue: string;
  let bValue: string;
  switch (orderBy) {
  case SortFields.firstname:
    aValue = getUserFirstName(a);
    bValue = getUserFirstName(b);
    break;
  case SortFields.lastname:
    aValue = getUserLastName(a);
    bValue = getUserLastName(b);
    break;
  case SortFields.email: // Not used for HCP, but to make typescript happy
    aValue = getUserEmail(a);
    bValue = getUserEmail(b);
    break;
  }

  return aValue.localeCompare(bValue);
}

function updatePatientList(
  teamHook: TeamContext,
  flagged: string[],
  filter: string,
  filterType: FilterType | string,
  orderBy: SortFields,
  order: SortDirection,
  sortFlaggedFirst: boolean
): TeamUser[] {
  const allPatients = teamHook.getPatients();

  let patients: Readonly<TeamUser>[];
  if (filterType !== FilterType.pending) {
    // Do not display pending invitation if not requested
    patients = allPatients.filter((patient) => !teamHook.isOnlyPendingInvitation(patient));
  } else {
    patients = allPatients.filter((patient) => teamHook.isOnlyPendingInvitation(patient));
  }

  if (filter.length > 0) {
    const searchText = filter.toLocaleLowerCase();
    patients = patients.filter((patient: TeamUser): boolean => {
      switch (filterType) {
      case FilterType.all:
      case FilterType.pending:
        break;
      case FilterType.flagged:
        if (!flagged.includes(patient.userid)) {
          return false;
        }
        break;
      default:
        if (!teamHook.isInTeam(patient, filterType)) {
          return false;
        }
        break;
      }

      const firstName = getUserFirstName(patient);
      if (firstName.toLocaleLowerCase().includes(searchText)) {
        return true;
      }
      const lastName = getUserLastName(patient);
      if (lastName.toLocaleLowerCase().includes(searchText)) {
        return true;
      }
      return false;
    });
  } else if (filterType === FilterType.flagged) {
    patients = patients.filter((patient: TeamUser): boolean => flagged.includes(patient.userid));
  } else if (filterType !== FilterType.all && filterType !== FilterType.pending) {
    patients = patients.filter((patient: TeamUser): boolean => teamHook.isInTeam(patient, filterType));
  }

  // Sort the patients
  patients.sort((a: TeamUser, b: TeamUser): number => {
    if (sortFlaggedFirst) {
      const aFlagged = flagged.includes(a.userid);
      const bFlagged = flagged.includes(b.userid);
      // Flagged: always first
      if (aFlagged && !bFlagged) {
        return -1;
      }
      if (!aFlagged && bFlagged) {
        return 1;
      }
    }

    let c = doCompare(a, b, orderBy);
    if (c === 0) {
      // In case of equality: choose another field
      if (orderBy === SortFields.lastname) {
        c = doCompare(a, b, SortFields.lastname);
      } else {
        c = doCompare(a, b, SortFields.firstname);
      }
    }
    return order === SortDirection.asc ? c : -c;
  });

  return patients;
}

function PatientListPage(): JSX.Element {
  const historyHook = useHistory();
  const { t } = useTranslation("yourloops");
  const authHook = useAuth();
  const teamHook = useTeam();
  const { openSnackbar, snackbarParams } = useSnackbar();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<SortDirection>(SortDirection.asc);
  const [orderBy, setOrderBy] = React.useState<SortFields>(SortFields.lastname);
  const [filter, setFilter] = React.useState<string>("");
  const [filterType, setFilterType] = React.useState<FilterType | string>(FilterType.all);
  const [sortFlaggedFirst, setSortFlaggedFirst] = React.useState<boolean>(true);
  const [patientToAdd, setPatientToAdd] = React.useState<AddPatientDialogContentProps | null>(null);
  const [teamCodeToDisplay, setTeamCodeToDisplay] = React.useState<Team | null>(null);

  const flagged = authHook.getFlagPatients();

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
    setLoading(false);
  };

  const handleSelectPatient = (user: TeamUser): void => {
    sendMetrics("hcp-select-patient");
    historyHook.push(`/hcp/patient/${user.userid}`);
  };

  const handleFlagPatient = async (userId: string): Promise<void> => {
    await authHook.flagPatient(userId);
  };

  const handleInvitePatient = async (): Promise<void> => {
    const getPatientEmailAndTeam = (): Promise<AddPatientDialogResult | null> => {
      const teams = teamHook.getMedicalTeams();
      return new Promise((resolve: (value: AddPatientDialogResult | null) => void) => {
        setPatientToAdd({ onDialogResult: resolve, teams });
      });
    };

    const result = await getPatientEmailAndTeam();
    setPatientToAdd(null); // Close the dialog

    if (result !== null) {
      try {
        const { email, teamId } = result;
        const team = teamHook.getTeam(teamId);
        await teamHook.invitePatient(team as Team, email);
        openSnackbar({ message: t("modal-hcp-add-patient-success"), severity: AlertSeverity.success });
        sendMetrics("hcp-add-patient", { added: true });
        setTeamCodeToDisplay(team);
      } catch (reason) {
        log.error(reason);
        // TODO Errors:
        // - "modal-hcp-add-patient-failure-already-in-team"
        // - "modal-hcp-add-patient-failure-already-invited"
        openSnackbar({ message: t("modal-hcp-add-patient-failure"), severity: AlertSeverity.error });
        sendMetrics("hcp-add-patient", { added: true, failed: errorTextFromException(reason) });
      }
    } else {
      sendMetrics("hcp-add-patient", { added: false });
    }
  };

  const handleSortList = (orderBy: SortFields, order: SortDirection): void => {
    log.info("Sort patients", orderBy, order);
    setSortFlaggedFirst(false);
    setOrder(order);
    setOrderBy(orderBy);
  };

  const handleFilter = (filter: string): void => {
    log.info("Filter patients name", filter);
    setFilter(filter);
  };

  const handleFilterType = (filterType: FilterType | string): void => {
    log.info("Filter patients with", filterType);
    setFilterType(filterType);
  };

  const handleCloseTeamCodeDialog = (): void => {
    setTeamCodeToDisplay(null);
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
  }, [teamHook.initialized, teamHook.errorMessage, errorMessage, loading, t]);

  if (loading) {
    return (
      <CircularProgress disableShrink style={{ position: "absolute", top: "calc(50vh - 20px)", left: "calc(50vw - 20px)" }} />
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

  const patients = updatePatientList(teamHook, flagged, filter, filterType, orderBy, order, sortFlaggedFirst);

  return (
    <React.Fragment>
      <Snackbar params={snackbarParams} />
      <PatientsSecondaryBar
        filter={filter}
        filterType={filterType}
        onFilter={handleFilter}
        onFilterType={handleFilterType}
        onInvitePatient={handleInvitePatient}
      />
      <Grid container direction="row" justify="center" alignItems="center" style={{ marginTop: "1.5em", marginBottom: "1.5em" }}>
        <Alert severity="info">{t("alert-patient-list-data-computed")}</Alert>
      </Grid>
      <Container id="patient-list-container" maxWidth="lg">
        <PatientListTable
          patients={patients}
          flagged={flagged}
          order={order}
          orderBy={orderBy}
          onClickPatient={handleSelectPatient}
          onFlagPatient={handleFlagPatient}
          onSortList={handleSortList}
        />
      </Container>
      <AddPatientDialog actions={patientToAdd} />
      <TeamCodeDialog
        onClose={handleCloseTeamCodeDialog}
        code={teamCodeToDisplay?.code ?? ""}
        name={teamCodeToDisplay?.name ?? ""}
      />
    </React.Fragment>
  );
}

export default PatientListPage;
