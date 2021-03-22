/**
 * Copyright (c) 2021, Diabeloop
 * Patient list table for HCPs
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
import _ from "lodash";
import moment from "moment-timezone"; // TODO: Change moment-timezone lib with something else
import { useTranslation } from "react-i18next";
import bows from "bows";

import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import { makeStyles, Theme } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";

import FlagIcon from "@material-ui/icons/Flag";
import FlagOutlineIcon from "@material-ui/icons/FlagOutlined";

import { MS_IN_DAY } from "../../models/generic";
import { MedicalData } from "../../models/device-data";
import { UserRoles } from "../../models/shoreline";
import sendMetrics from "../../lib/metrics";
import { getUserFirstName, getUserLastName } from "../../lib/utils";
import { Session, useAuth } from "../../lib/auth";
import { TeamUser, useTeam } from "../../lib/team";
import { getPatientsDataSummary, getPatientDataRange } from "../../lib/data/api";
import { SortDirection, SortFields } from "./types";

export interface PatientListTableProps {
  patients: TeamUser[];
  flagged: string[];
  order: SortDirection;
  orderBy: SortFields;
  onClickPatient: (user: TeamUser) => void;
  onFlagPatient: (userId: string) => Promise<void>;
  onSortList: (field: SortFields, direction: SortDirection) => void;
}

export interface PatientTableRowProps {
  na: string;
  patient: TeamUser;
  flagged: string[];
  onClickPatient: (user: TeamUser) => void;
  onFlagPatient: (userId: string) => Promise<void>;
}

const log = bows("PatientListTable");

async function fetchSummary(session: Session, patient: TeamUser): Promise<MedicalData | null> {
  let range: string[] | null = null;

  try {
    range = await getPatientDataRange(session, patient);
  } catch (reason) {
    log.info("fetchSummary:getPatientDataRange", patient.userid, { reason });
  }
  if (range === null) {
    // TODO with API v0
    return null;
  }

  const medicalData: MedicalData = {
    range: {
      startDate: range[0],
      endDate: range[1],
    },
  };
  const endDate = range[1];
  const startDate = new Date(Date.parse(range[1]) - MS_IN_DAY).toISOString();

  try {
    const tir = await getPatientsDataSummary(session, patient.userid, { startDate, endDate });
    medicalData.computedTir = tir;
  } catch (reason) {
    log.info("fetchSummary:getPatientsDataSummary", patient.userid, { reason });
  }

  // patient.medicalData = medicalData;
  return medicalData;
}

// ******
// Summary fetch: Done in sequence for only the displayed rows
//
// Use the IntersectionObserver API to know of a row is displayed on screen
// If so call a promise which may resolve with the wanted value, or cancelled
// when if row is no longer displayed.
// If a fetch is in progress, it can't be cancelled,
// The result can be discarded in that case.
// ******

type PendingSummaryFetchPromiseFuncs = { resolve: (data: MedicalData | null | undefined) => void, reject: (reason: Error) => void };
interface PendingSummaryFetch {
  /** To know the patient we need data */
  patient: TeamUser;
  /** Our sessions infos for the API call */
  session: Session;
  /** To know if we are processing this patient -> API call in progress */
  inProgress: boolean;
  /**
   * Array of promise callbacks, normally one should be enough, but if the users do lots
   * of quick scrolling back & forth, we may ends up with more than one entry here.
   */
  promisesCallbacks: PendingSummaryFetchPromiseFuncs[];
}

/** Map of wanted data summary (TIR, last upload) we need to fetch */
const mapPendingFetch = new Map<string, PendingSummaryFetch>();
/**
 * We want do to them in sequence, to not mobilize too much the server.
 *
 * This boolean is used here as a lock.
 */
let fetchingSummaries = false;
function startFetchSummary() {
  if (fetchingSummaries) {
    return;
  }
  fetchingSummaries = true;

  const values = mapPendingFetch.values();
  const { done, value } = values.next();
  if (done === false && value !== undefined) {
    const psf = value as PendingSummaryFetch;
    psf.inProgress = true;
    fetchSummary(psf.session, psf.patient).then((result: MedicalData | null) => {
      psf.promisesCallbacks.forEach((promiseCallback) => {
        promiseCallback.resolve(result);
      });
    }).catch((reason: Error) => {
      psf.promisesCallbacks.forEach((promiseCallback) => {
        promiseCallback.reject(reason);
      });
    }).finally(() => {
      mapPendingFetch.delete(psf.patient.userid);
      fetchingSummaries = false;
      setTimeout(startFetchSummary, 1);
    });
  } else {
    fetchingSummaries = false;
  }
}

/**
 * Promise to get the medical summary data.
 * May be resolved early with undefined if cancelled.
 * @param session Auth session
 * @param patient Patient infos
 * @returns The medical data (TIR/last upload data), or null if theses infos are not available, or undefined, if cancelled
 */
function addPendingFetch(session: Session, patient: TeamUser): Promise<MedicalData | null | undefined> {
  if (patient.role !== UserRoles.patient) {
    return Promise.reject(new Error("invalid-user"));
  }
  if (patient.medicalData) {
    return Promise.resolve(patient.medicalData);
  }

  return new Promise((resolve: (data: MedicalData | null | undefined) => void, reject: (reason: Error) => void) => {
    const psf = mapPendingFetch.get(patient.userid);
    if (psf) {
      psf.promisesCallbacks.push({ resolve, reject });
    } else {
      mapPendingFetch.set(patient.userid, {
        patient,
        session,
        inProgress: false,
        promisesCallbacks: [{ resolve, reject }],
      });
    }
    setTimeout(startFetchSummary, 1);
  });
}

/**
 * Cancel a pending summary fetch
 * @param patient Patient infos
 */
function removePendingFetch(patient: TeamUser): void {
  const psf = mapPendingFetch.get(patient.userid);
  if (psf !== undefined && psf.inProgress === false) {
    mapPendingFetch.delete(patient.userid);
    psf.promisesCallbacks.forEach((pc) => {
      pc.resolve(undefined);
    });
  }
}

const patientListStyle = makeStyles((theme: Theme) => {
  return {
    table: {
      width: "100%",
    },
    tableRow: {
      cursor: "pointer",
    },
    tableRowPending: {
      cursor: "pointer",
      backgroundColor: "grey",
    },
    tableRowHeader: {
      textTransform: "uppercase",
    },
    tableCellHeader: {
      fontSize: "14px",
    },
    flag: {
      color: theme.palette.primary.main,
    },
  };
});

function PatientRow(props: PatientTableRowProps): JSX.Element {
  const { na, patient, flagged, onClickPatient, onFlagPatient } = props;
  const { t } = useTranslation("yourloops");
  const authHook = useAuth();
  const teamHook = useTeam();
  const classes = patientListStyle();
  const [medicalData, setMedicalData] = React.useState<MedicalData | null | undefined>(patient.medicalData);
  const rowRef = React.createRef<HTMLTableRowElement>();

  const userId = patient.userid;
  const isFlagged = flagged.includes(userId);
  const firstName = getUserFirstName(patient);
  const lastName = getUserLastName(patient);

  const onClickFlag = (e: React.MouseEvent): void => {
    e.stopPropagation();
    sendMetrics("flag-patient", { flagged: !isFlagged });
    onFlagPatient(userId);
  };
  const onRowClick = (/* e: React.MouseEvent */): void => {
    sendMetrics("show-patient-data", { flagged: isFlagged });
    onClickPatient(patient);
  };

  let tir = "-";
  let tbr = "-";
  let lastUpload = "-";
  if (medicalData === null) {
    tir = na;
    tbr = na;
    lastUpload = na;
  } else if (medicalData) {
    if (medicalData.range?.endDate) {
      lastUpload = moment.utc(medicalData.range.endDate).format("llll");
    }
    if (medicalData.computedTir?.count) {
      const { high, low, target, veryHigh, veryLow } = medicalData.computedTir.count;
      const total = high + low + target + veryHigh + veryLow;
      tir = Math.round((100 * target) / total).toString(10);
      tbr = Math.round((100 * (low + veryLow)) / total).toString(10);
    } else {
      tir = na;
      tbr = na;
    }
  }

  const rowId = `patients-list-row-${userId}`;
  const session = authHook.session();
  React.useEffect(() => {
    const observedElement = rowRef.current;
    if (session !== null && observedElement !== null && typeof medicalData === "undefined") {
      /** If unmounted, we want to discard the result, react don't like to udated an unmounted component */
      let componentMounted = true;
      const observer = new IntersectionObserver((entries) => {
        const rowDisplayed = entries[0];
        if (rowDisplayed.intersectionRatio > 0) {
          // Displayed: queue the fetch
          addPendingFetch(session, patient).then((md) => {
            if (typeof md !== "undefined") {
              teamHook.setPatientMedicalData(patient.userid, md);
              if (componentMounted) setMedicalData(md);
            }
          }).catch(() => {
            teamHook.setPatientMedicalData(patient.userid, null);
            if (componentMounted) setMedicalData(null);
          });
        } else {
          // No longer displayed, cancel the fetch
          removePendingFetch(patient);
        }
      });

      observer.observe(observedElement);

      return (): void => {
        // Effect callback -> cancel subscriptions to the observer
        // and the API fetch
        observer.disconnect();
        removePendingFetch(patient);
        componentMounted = false;
      };
    }
    return _.noop;
  }, [medicalData, patient, session, teamHook, rowRef]);

  return (
    <TableRow id={rowId} tabIndex={-1} hover onClick={onRowClick} className={classes.tableRow} ref={rowRef}>
      <TableCell id={`patients-list-row-flag-${userId}`}>
        <IconButton className={classes.flag} aria-label={t("aria-flag-patient")} size="small" onClick={onClickFlag}>
          {isFlagged ? <FlagIcon /> : <FlagOutlineIcon />}
        </IconButton>
      </TableCell>
      <TableCell id={`patients-list-row-lastname-${userId}`}>{lastName}</TableCell>
      <TableCell id={`patients-list-row-firstname-${userId}`}>{firstName}</TableCell>
      <TableCell id={`patients-list-row-tir-${userId}`}>{tir}</TableCell>
      <TableCell id={`patients-list-row-tbr-${userId}`}>{tbr}</TableCell>
      <TableCell id={`patients-list-row-upload-${userId}`}>{lastUpload}</TableCell>
    </TableRow>
  );
}

function PatientListTable(props: PatientListTableProps): JSX.Element {
  const { patients, flagged, order, orderBy, onClickPatient, onFlagPatient, onSortList } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();

  const na = t("N/A");

  const patientsRows = patients.map(
    (patient: TeamUser): JSX.Element => (
      <PatientRow
        key={patient.userid}
        na={na}
        patient={patient}
        flagged={flagged}
        onClickPatient={onClickPatient}
        onFlagPatient={onFlagPatient}
      />
    )
  );

  const createSortHandler = (property: SortFields): (() => void) => {
    return (/* event: React.MouseEvent */): void => {
      onSortList(property, order === SortDirection.asc ? SortDirection.desc : SortDirection.asc);
    };
  };

  return (
    <TableContainer style={{ marginBottom: "5em" }} component={Paper}>
      <Table className={classes.table} aria-label={t("aria-table-list-patient")} stickyHeader>
        <TableHead>
          <TableRow className={classes.tableRowHeader}>
            <TableCell id="patients-list-header-flag" className={classes.tableCellHeader} />
            <TableCell id="patients-list-header-lastname" className={classes.tableCellHeader}>
              <TableSortLabel active={orderBy === "lastname"} direction={order} onClick={createSortHandler(SortFields.lastname)}>
                {t("lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-firstname" className={classes.tableCellHeader}>
              <TableSortLabel
                active={orderBy === "firstname"}
                direction={order}
                onClick={createSortHandler(SortFields.firstname)}>
                {t("firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-tir" className={classes.tableCellHeader}>{t("list-patient-tir")}</TableCell>
            <TableCell id="patients-list-header-tbr" className={classes.tableCellHeader}>{t("list-patient-tbr")}</TableCell>
            <TableCell id="patients-list-header-upload" className={classes.tableCellHeader}>{t("list-patient-upload")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{patientsRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatientListTable;
