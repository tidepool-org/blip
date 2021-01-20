/**
 * Copyright (c) 2021, Diabeloop
 * Patient list table for HCPs
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import * as React from "react";

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

import { t } from "../../lib/language";
import { User } from "../../models/shoreline";
import { SortDirection, SortFields } from "./types";

export interface PatientListTableProps {
  patients: User[];
  flagged: string[];
  order: SortDirection;
  orderBy: SortFields;
  log: Console;
  onClickPatient: (user: User) => void;
  onFlagPatient: (userId: string) => void;
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
    tableRowHeader: {
      fontVariant: "small-caps",
    },
    flag: {
      color: theme.palette.primary.main,
    },
  };
});

function PatientListTable(props: PatientListTableProps): JSX.Element {
  const { patients, flagged, order, orderBy, onClickPatient, onFlagPatient, onSortList, log } = props;
  const classes = patientListStyle();
  const elems = [];
  const nPatients = patients.length;

  for (let i = 0; i < nPatients; i++) {
    const patient = patients[i];
    const userId = patient.userid;
    const firstName = patient.profile?.firstName ?? "";
    const lastName = patient.profile?.lastName ?? patient.profile?.fullName ?? patient.username;
    const isFlagged = flagged.includes(userId);
    const onClickFlag = (e: React.MouseEvent): void => {
      e.stopPropagation();
      log.debug("onClickFlag", e);
      onFlagPatient(userId);
    };
    const onRowClick = (e: React.MouseEvent): void => {
      log.debug("onRowClick", patient, e);
      onClickPatient(patient);
    };
    elems.push(
      <TableRow id={`patients-list-row-${userId}`} key={userId} tabIndex={-1} hover onClick={onRowClick} className={classes.tableRow}>
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
  }

  const createSortHandler = (property: SortFields): () => void => {
    return (/* event: React.MouseEvent */): void => {
      onSortList(property, order === "asc" ? "desc" : "asc");
    };
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label={t("aria-table-list-patient")} stickyHeader>
        <TableHead>
          <TableRow className={classes.tableRowHeader}>
            <TableCell id="patients-list-header-flag" />
            <TableCell id="patients-list-header-lastname">
              <TableSortLabel active={orderBy === "lastname"} direction={order} onClick={createSortHandler("lastname")}>
                {t("list-patient-lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-firstname">
              <TableSortLabel active={orderBy === "firstname"} direction={order} onClick={createSortHandler("firstname")}>
                {t("list-patient-firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-tir">{t("list-patient-tir")}</TableCell>
            <TableCell id="patients-list-header-avg-glucose">{t("list-patient-avg-glucose")}</TableCell>
            <TableCell id="patients-list-header-tbr">{t("list-patient-tbr")}</TableCell>
            <TableCell id="patients-list-header-upload">{t("list-patient-upload")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {elems}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatientListTable;
