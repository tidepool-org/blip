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

import React from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
// import bows from "bows";

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
import Tooltip from "@material-ui/core/Tooltip";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import FlagIcon from "@material-ui/icons/Flag";
import FlagOutlineIcon from "@material-ui/icons/FlagOutlined";

import { SortDirection, SortFields } from "../../../models/generic";
import { MedicalData } from "../../../models/device-data";
import metrics from "../../../lib/metrics";
import { getUserFirstName, getUserLastName } from "../../../lib/utils";
import { useAuth } from "../../../lib/auth";
import { TeamUser, useTeam } from "../../../lib/team";
import { addPendingFetch, removePendingFetch } from "../../../lib/data";
import { PatientListProps, PatientElementProps } from "./models";
import { getMedicalValues } from "./utils";

// const log = bows("PatientListTable");

const patientListStyle = makeStyles(
  (theme: Theme) => {
    return {
      table: {
        width: "100%",
      },
      tableRow: {
        cursor: "pointer",
      },
      tableRowPending: {
        cursor: "default",
        backgroundColor: theme.palette.primary.light,
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
  },
  { name: "ylp-hcp-patients-table" }
);

function PatientRow(props: PatientElementProps): JSX.Element {
  const { trNA, patient, flagged, onClickPatient, onFlagPatient } = props;
  const { t } = useTranslation("yourloops");
  const authHook = useAuth();
  const teamHook = useTeam();
  const classes = patientListStyle();
  const [medicalData, setMedicalData] = React.useState<MedicalData | null | undefined>(patient.medicalData);
  const rowRef = React.createRef<HTMLTableRowElement>();

  const userId = patient.userid;
  const email = patient.username;
  const isFlagged = flagged.includes(userId);
  const firstName = getUserFirstName(patient);
  const lastName = getUserLastName(patient);

  const onClickFlag = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onFlagPatient(userId);
    metrics.send("patient_selection", "flag_patient", isFlagged ? "un-flagged" : "flagged");
  };
  const onRowClick = (/* e: React.MouseEvent */): void => {
    onClickPatient(patient);
    metrics.send("patient_selection", "select_patient", isFlagged ? "flagged" : "un-flagged");
  };

  const { tir, tbr, lastUpload } = React.useMemo(() => getMedicalValues(medicalData, trNA), [medicalData, trNA]);
  // Replace the "@" if the userid is the email (status pending)
  // wdio used in the system tests do not accept "@"" in selectors
  // Theses ids should be the same as in pages/caregiver/patients/table.tsx to ease the tests
  const rowId = `patients-list-row-${userId.replace(/@/g, "_")}`;
  const session = authHook.session();
  const isPendingInvitation = teamHook.isOnlyPendingInvitation(patient);
  React.useEffect(() => {
    const observedElement = rowRef.current;
    if (session !== null && observedElement !== null && typeof medicalData === "undefined" && !isPendingInvitation) {
      /** If unmounted, we want to discard the result, react don't like to update an unmounted component */
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
  }, [medicalData, patient, session, isPendingInvitation, teamHook, rowRef]);

  if (isPendingInvitation) {
    return (
      <TableRow id={rowId} tabIndex={-1} hover className={`${classes.tableRow} ${classes.tableRowPending} patients-list-row`} data-userid={userId} data-email={email} ref={rowRef}>
        <TableCell id={`${rowId}-icon`}>
          <Tooltip id={`${rowId}-tooltip-pending`} title={t("pending-invitation") as string} aria-label={t("pending-invitation")} placement="bottom">
            <AccessTimeIcon id={`${rowId}-pendingicon`} />
          </Tooltip>
        </TableCell>
        <TableCell id={`${rowId}-lastname`}>{lastName}</TableCell>
        <TableCell id={`${rowId}-firstname`}>{firstName}</TableCell>
        <TableCell id={`${rowId}-tir`}>{tir}</TableCell>
        <TableCell id={`${rowId}-tbr`}>{tbr}</TableCell>
        <TableCell id={`${rowId}-upload`}>{lastUpload}</TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow id={rowId} tabIndex={-1} hover onClick={onRowClick} className={`${classes.tableRow} patients-list-row`} data-userid={userId} data-email={email} ref={rowRef}>
      <TableCell id={`${rowId}-icon`}>
        <IconButton id={`${rowId}-icon-button-flag`} className={classes.flag} aria-label={t("aria-flag-patient")} size="small" onClick={onClickFlag}>
          {isFlagged ? <FlagIcon id={`${rowId}-flagged`} /> : <FlagOutlineIcon id={`${rowId}-un-flagged`} />}
        </IconButton>
      </TableCell>
      <TableCell id={`${rowId}-lastname`}>{lastName}</TableCell>
      <TableCell id={`${rowId}-firstname`}>{firstName}</TableCell>
      <TableCell id={`${rowId}-tir`}>{tir}</TableCell>
      <TableCell id={`${rowId}-tbr`}>{tbr}</TableCell>
      <TableCell id={`${rowId}-upload`}>{lastUpload}</TableCell>
    </TableRow>
  );
}

function PatientListTable(props: PatientListProps): JSX.Element {
  const { patients, flagged, order, orderBy, onClickPatient, onFlagPatient, onSortList } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();

  const trNA = t("N/A");

  const patientsRows = patients.map(
    (patient: TeamUser): JSX.Element => (
      <PatientRow
        key={patient.userid}
        trNA={trNA}
        patient={patient}
        flagged={flagged}
        onClickPatient={onClickPatient}
        onFlagPatient={onFlagPatient}
      />
    )
  );

  const createSortHandler = (property: SortFields): (() => void) => {
    return (/* event: React.MouseEvent */): void => {
      let newOrder = order;
      if (property === orderBy) {
        newOrder = order === SortDirection.asc ? SortDirection.desc : SortDirection.asc;
      }
      onSortList(property, newOrder);
    };
  };

  return (
    <TableContainer component={Paper}>
      <Table id="patients-list-table" className={classes.table} aria-label={t("aria-table-list-patient")} stickyHeader>
        <TableHead>
          <TableRow className={classes.tableRowHeader}>
            <TableCell id="patients-list-header-icon" className={classes.tableCellHeader} />
            <TableCell id="patients-list-header-lastname" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-lastname-label${orderBy === SortFields.lastname ? `-${order}` : ""}`}
                active={orderBy === SortFields.lastname}
                direction={order}
                onClick={createSortHandler(SortFields.lastname)}>
                {t("lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-firstname" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-firstname-label${orderBy === SortFields.firstname ? `-${order}` : ""}`}
                active={orderBy === SortFields.firstname}
                direction={order}
                onClick={createSortHandler(SortFields.firstname)}>
                {t("firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-tir" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-tir-label${orderBy === SortFields.tir ? `-${order}` : ""}`}
                active={orderBy === SortFields.tir}
                direction={order}
                onClick={createSortHandler(SortFields.tir)}>
                {t("list-patient-tir")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-tbr" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-tbr-label${orderBy === SortFields.tbr ? `-${order}` : ""}`}
                active={orderBy === SortFields.tbr}
                direction={order}
                onClick={createSortHandler(SortFields.tbr)}>
                {t("list-patient-tbr")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-upload" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-upload-label${orderBy === SortFields.upload ? `-${order}` : ""}`}
                active={orderBy === SortFields.upload}
                direction={order}
                onClick={createSortHandler(SortFields.upload)}>
                {t("list-patient-upload")}
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{patientsRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatientListTable;
