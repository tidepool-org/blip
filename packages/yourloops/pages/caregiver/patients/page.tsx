/**
 * Copyright (c) 2021, Diabeloop
 * Patient list for caregivers
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

import _ from "lodash";
import React from "react";
import bows from "bows";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Container from "@material-ui/core/Container";

import { FilterType, SortDirection, SortFields, UserInvitationStatus } from "../../../models/generic";
import { IUser, UserRoles } from "../../../models/shoreline";
import { getUserFirstName, getUserLastName, getUserEmail, errorTextFromException, setPageTitle } from "../../../lib/utils";
import metrics from "../../../lib/metrics";
import { useAuth } from "../../../lib/auth";
import { useSharedUser, ShareUser, addDirectShare, removeDirectShare } from "../../../lib/share";
import { useAlert } from "../../../components/utils/snackbar";
import RemovePatientDialog, { RemovePatientDialogContentProps } from "../../../components/remove-patient-dialog";
import { AddPatientDialogContentProps, AddPatientDialogResult } from "./types";
import PatientsSecondaryBar from "./secondary-bar";
import PatientListTable from "./table";
import AddPatientDialog from "./add-dialog";

const log = bows("PatientListPage");

// eslint-disable-next-line no-magic-numbers
const throttledMetrics = _.throttle(metrics.send, 60000); // No more than one per minute
// eslint-disable-next-line no-magic-numbers
const throttleSearchMetrics = _.throttle(metrics.send, 10000, { trailing: true });

/**
 * Compare two patient for sorting the patient table
 * @param a A patient
 * @param b A patient
 * @param orderBy Sort field
 */
function doCompare(a: ShareUser, b: ShareUser, orderBy: SortFields): number {
  let aValue: string;
  let bValue: string;
  switch (orderBy) {
  case SortFields.firstname:
    aValue = getUserFirstName(a.user);
    bValue = getUserFirstName(b.user);
    break;
  case SortFields.lastname:
    aValue = getUserLastName(a.user);
    bValue = getUserLastName(b.user);
    break;
  case SortFields.email:
    aValue = getUserEmail(a.user);
    bValue = getUserEmail(b.user);
    break;
  case SortFields.tir:
  case SortFields.tbr:
  case SortFields.upload:
    // Not used for caregiver
    // Here to make typescript happy
    aValue = "";
    bValue = "";
    break;
  }

  return aValue.localeCompare(bValue);
}

function updatePatientList(
  shares: ShareUser[],
  flagged: string[],
  filter: string,
  filterType: FilterType | string,
  orderBy: SortFields,
  order: SortDirection,
  sortFlaggedFirst: boolean
): ShareUser[] {

  log.info("update-patient-list", { filter, filterType, orderBy, order, sortFlaggedFirst });

  let patients = shares;
  if (filterType === FilterType.pending) {
    patients = shares.filter((p) => p.status === UserInvitationStatus.pending && p.user.role === UserRoles.patient);
  } else if (filterType === FilterType.flagged) {
    patients = shares.filter(
      (p) => p.status !== UserInvitationStatus.pending && p.user.role === UserRoles.patient && flagged.includes(p.user.userid)
    );
  } else {
    patients = shares.filter((p) => p.status !== UserInvitationStatus.pending && p.user.role === UserRoles.patient);
  }

  const searchByName = filter.length > 0;
  if (searchByName) {
    const searchText = filter.toLocaleLowerCase();
    patients = patients.filter((patient) => {
      const firstName = getUserFirstName(patient.user);
      if (firstName.toLocaleLowerCase().includes(searchText)) {
        return true;
      }
      const lastName = getUserLastName(patient.user);
      if (lastName.toLocaleLowerCase().includes(searchText)) {
        return true;
      }
      return false;
    });
  }

  // Sort the patients
  patients.sort((a: ShareUser, b: ShareUser): number => {
    if (sortFlaggedFirst) {
      const aFlagged = flagged.includes(a.user.userid);
      const bFlagged = flagged.includes(b.user.userid);
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

  if (searchByName) {
    throttleSearchMetrics("trackSiteSearch", "patient_name", "caregiver", patients.length);
  }

  return patients;
}

function PatientListPage(): JSX.Element {
  const historyHook = useHistory();
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const authHook = useAuth();
  const [sharedUsersContext, sharedUsersDispatch] = useSharedUser();
  const [sortFlaggedFirst, setSortFlaggedFirst] = React.useState<boolean>(true);
  const [order, setOrder] = React.useState<SortDirection>(SortDirection.asc);
  const [orderBy, setOrderBy] = React.useState<SortFields>(SortFields.lastname);
  const [filter, setFilter] = React.useState<string>("");
  const [filterType, setFilterType] = React.useState<FilterType | string>(FilterType.all);
  const [patientToAdd, setPatientToAdd] = React.useState<AddPatientDialogContentProps | null>(null);
  const [patientToRemove, setPatientToRemove] = React.useState<RemovePatientDialogContentProps | null>(null);

  const flagged = authHook.getFlagPatients();
  const session = authHook.session();
  const shares = sharedUsersContext.sharedUsers ?? [];

  const handleSortList = (orderBy: SortFields, order: SortDirection): void => {
    metrics.send("patient_selection", "sort_patients", orderBy, order === SortDirection.asc ? 1 : -1);
    setSortFlaggedFirst(false);
    setOrder(order);
    setOrderBy(orderBy);
  };
  const handleSelectPatient = (user: IUser, flagged: boolean): void => {
    metrics.send("patient_selection", "select_patient", flagged ? "flagged" : "not_flagged");
    historyHook.push(`/caregiver/patient/${user.userid}`);
  };
  const handleFlagPatient = async (userId: string, flagged: boolean): Promise<void> => {
    try {
      await authHook.flagPatient(userId);
      metrics.send("patient_selection", "flag_patient", flagged ? "flagged" : "un-flagged");
    } catch (reason) {
      log.error(errorTextFromException(reason));
    }
  };
  const handleFilter = (filter: string): void => {
    log.info("Filter patients name", filter);
    throttledMetrics("patient_selection", "search_patient", "by_name");
    setFilter(filter);
  };
  const handleFilterType = (filterType: FilterType | string): void => {
    log.info("Filter patients with", filterType);
    setFilterType(filterType);
    if (!(filterType in FilterType)) {
      log.info("Replace", filterType, "with team"); // TODO Remove me if it works
      filterType = "team";
    }
    metrics.send("patient_selection", "filter_patient", filterType);
  };
  const handleInvitePatient = async (): Promise<void> => {
    const getPatientEmailAndTeam = (): Promise<AddPatientDialogResult | null> => {
      return new Promise((resolve: (value: AddPatientDialogResult | null) => void) => {
        setPatientToAdd({ onDialogResult: resolve });
      });
    };

    const result = await getPatientEmailAndTeam();
    setPatientToAdd(null); // Close the dialog

    if (result !== null && session !== null) {
      try {
        const { email } = result;
        await addDirectShare(session, email);
        setTimeout(() => sharedUsersDispatch({ type: "reset" }), 10);
        alert.success(t("alert-invitation-sent-success"));
        metrics.send("invitation", "send_invitation", "patient");
      } catch (reason) {
        log.error(reason);
        alert.error(t("alert-invitation-patient-failed"));
      }
    }
  };
  const handleRemovePatient = async (patient: IUser, flagged: boolean, isPendingInvitation: boolean): Promise<void> => {
    const getConfirmation = (): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void) => {
        setPatientToRemove({ onDialogResult: resolve, patient });
      });
    };

    const result = await getConfirmation();
    setPatientToRemove(null);

    if (result && session !== null) {
      try {
        await removeDirectShare(session, patient.userid);
        setTimeout(() => sharedUsersDispatch({ type: "reset" }), 10);
        alert.success(t("alert-remove-patient-success"));
      } catch (reason) {
        log.error(reason, { removed: result, flagged, isPendingInvitation });
        alert.error(t("alert-remove-patient-failure"));
      }
    } else {
      log.error("remove_patient", { removed: result, flagged, isPendingInvitation });
    }
    await Promise.resolve();
  };

  React.useEffect(() => {
    setPageTitle(t("my-patients-title"));
  }, [t]);

  // Here we can't have "shares" & "flagged" in the exhaustive deps,
  // because they change at every render, even if the content is the same.
  // This makes the useMemo() function useless.
  // As a workaround, we use the number of elements in each arrays
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const patients = React.useMemo(() => updatePatientList(shares, flagged, filter, filterType, orderBy, order, sortFlaggedFirst), [
    shares.length,
    flagged.length,
    filter,
    filterType,
    orderBy,
    order,
    sortFlaggedFirst,
  ]);

  return (
    <React.Fragment>
      <PatientsSecondaryBar
        filter={filter}
        filterType={filterType}
        onFilter={handleFilter}
        onFilterType={handleFilterType}
        onInvitePatient={handleInvitePatient}
      />
      <Container id="patient-list-container" maxWidth="lg" style={{ paddingTop: "2em" }}>
        <PatientListTable
          patients={patients}
          flagged={flagged}
          order={order}
          orderBy={orderBy}
          onClickPatient={handleSelectPatient}
          onFlagPatient={handleFlagPatient}
          onSortList={handleSortList}
          onRemovePatient={handleRemovePatient}
        />
      </Container>
      <AddPatientDialog actions={patientToAdd} />
      <RemovePatientDialog actions={patientToRemove} />
    </React.Fragment>
  );
}

export default PatientListPage;
