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
import { useTranslation } from "react-i18next";

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

import sendMetrics from "../../lib/metrics";
import { getUserFirstName, getUserLastName } from "../../lib/utils";
import { TeamUser } from "../../lib/team";
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
      fontVariant: "small-caps",
    },
    flag: {
      color: theme.palette.primary.main,
    },
  };
});

function PatientListTable(props: PatientListTableProps): JSX.Element {
  const { patients, flagged, order, orderBy, onClickPatient, onFlagPatient, onSortList } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();

  const patientsRows = patients.map((patient: TeamUser): JSX.Element => {
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
    return (
      <TableRow
        id={`patients-list-row-${userId}`}
        key={userId}
        tabIndex={-1}
        hover
        onClick={onRowClick}
        className={classes.tableRow}>
        <TableCell id={`patients-list-row-flag-${userId}`}>
          <IconButton className={classes.flag} aria-label={t("aria-flag-patient")} size="small" onClick={onClickFlag}>
            {isFlagged ? <FlagIcon /> : <FlagOutlineIcon />}
          </IconButton>
        </TableCell>
        <TableCell id={`patients-list-row-lastname-${userId}`}>{lastName}</TableCell>
        <TableCell id={`patients-list-row-firstname-${userId}`}>{firstName}</TableCell>
        <TableCell id={`patients-list-row-tir-${userId}`}>{t("N/A")}</TableCell>
        <TableCell id={`patients-list-row-avg-glucose-${userId}`}>{t("N/A")}</TableCell>
        <TableCell id={`patients-list-row-tbr-${userId}`}>{t("N/A")}</TableCell>
        <TableCell id={`patients-list-row-upload-${userId}`}>{t("N/A")}</TableCell>
      </TableRow>
    );
  });

  const createSortHandler = (property: SortFields): (() => void) => {
    return (/* event: React.MouseEvent */): void => {
      onSortList(property, order === SortDirection.asc ? SortDirection.desc : SortDirection.asc);
    };
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label={t("aria-table-list-patient")} stickyHeader>
        <TableHead>
          <TableRow className={classes.tableRowHeader}>
            <TableCell id="patients-list-header-flag" />
            <TableCell id="patients-list-header-lastname">
              <TableSortLabel active={orderBy === "lastname"} direction={order} onClick={createSortHandler(SortFields.lastname)}>
                {t("lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-firstname">
              <TableSortLabel active={orderBy === "firstname"} direction={order} onClick={createSortHandler(SortFields.firstname)}>
                {t("firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-tir">{t("list-patient-tir")}</TableCell>
            <TableCell id="patients-list-header-avg-glucose">{t("list-patient-avg-glucose")}</TableCell>
            <TableCell id="patients-list-header-tbr">{t("list-patient-tbr")}</TableCell>
            <TableCell id="patients-list-header-upload">{t("list-patient-upload")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{patientsRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatientListTable;
