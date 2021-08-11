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
import Tooltip from "@material-ui/core/Tooltip";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import PersonRemoveIcon from "../../../components/icons/PersonRemoveIcon";

import { SortDirection, SortFields, UserInvitationStatus } from "../../../models/generic";
import { IUser } from "../../../models/shoreline";
import { getUserFirstName, getUserLastName, getUserEmail } from "../../../lib/utils";
import { ShareUser } from "../../../lib/share";

export interface PatientListTableProps {
  patients: ShareUser[];
  flagged: string[];
  order: SortDirection;
  orderBy: SortFields;
  onClickPatient: (user: IUser, flagged: boolean) => void;
  onFlagPatient: (userId: string, flagged: boolean) => Promise<void>;
  onRemovePatient: (user: IUser, flagged: boolean, isPendingInvitation: boolean) => Promise<void>;
  onSortList: (field: SortFields, direction: SortDirection) => void;
}

export interface PatientTableRowProps {
  na: string;
  shareUser: ShareUser;
  flagged: string[];
  onClickPatient: (user: IUser, flagged: boolean) => void;
  onFlagPatient: (userId: string, flagged: boolean) => Promise<void>;
  onRemovePatient: (user: IUser, flagged: boolean, isPendingInvitation: boolean) => Promise<void>;
}

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
  { name: "ylp-caregiver-patients-table" }
);

function PatientRow(props: PatientTableRowProps): JSX.Element {
  const { shareUser, flagged, onClickPatient, onRemovePatient } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();
  const rowRef = React.createRef<HTMLTableRowElement>();

  const patient = shareUser.user;
  const userId = patient.userid;
  const isFlagged = flagged.includes(userId);
  const firstName = getUserFirstName(patient);
  const lastName = getUserLastName(patient);
  const email = getUserEmail(patient);
  // Replace the "@" if the userid is the email (status pending)
  // wdio used in the system tests do not accept "@"" in selectors
  // Theses ids should be the same as in pages/hcp/patients/table.tsx to ease the tests
  const rowId = `patients-list-row-${userId.replace(/@/g, "_")}`;
  const isPendingInvitation = shareUser.status === UserInvitationStatus.pending;

  const handleSelectPatient = (/* e: React.MouseEvent */): void => {
    onClickPatient(patient, isFlagged);
  };
  const handleClickRemoveMember = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onRemovePatient(patient, isFlagged, isPendingInvitation);
  };

  const removeText = t("remove-patient");
  const removeMemberButton = (
    <Tooltip title={removeText} aria-label={removeText} placement="bottom">
      <IconButton
        id={`${rowId}-button-remove`}
        color="primary"
        aria-label={removeText}
        onClick={handleClickRemoveMember}>
        <PersonRemoveIcon />
      </IconButton>
    </Tooltip>
  );

  if (isPendingInvitation) {
    return (
      <TableRow id={rowId} tabIndex={-1} hover className={`${classes.tableRow} ${classes.tableRowPending} patients-list-row`} ref={rowRef} data-userid={userId} data-email={email}>
        <TableCell id={`${rowId}-icon`}>
          <Tooltip title={t("team-member-pending") as string} aria-label={t("team-member-pending")} placement="bottom">
            <AccessTimeIcon id={`${rowId}-icon-pending`} />
          </Tooltip>
        </TableCell>
        <TableCell id={`${rowId}-lastname`}>{lastName}</TableCell>
        <TableCell id={`${rowId}-firstname`}>{firstName}</TableCell>
        <TableCell id={`${rowId}-email`}>{email}</TableCell>
        <TableCell id={`${rowId}-actions`}>{removeMemberButton}</TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow id={rowId} tabIndex={-1} hover onClick={handleSelectPatient} className={`${classes.tableRow} patients-list-row`} ref={rowRef} data-userid={userId} data-email={email}>
      <TableCell id={`${rowId}-icon`}></TableCell>
      <TableCell id={`${rowId}-lastname`}>{lastName}</TableCell>
      <TableCell id={`${rowId}-firstname`}>{firstName}</TableCell>
      <TableCell id={`${rowId}-email`}>{email}</TableCell>
      <TableCell id={`${rowId}-actions`}>{removeMemberButton}</TableCell>
    </TableRow>
  );
}

function PatientListTable(props: PatientListTableProps): JSX.Element {
  const { patients, flagged, order, orderBy, onClickPatient, onFlagPatient, onRemovePatient, onSortList } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();

  const na = t("N/A");

  const patientsRows = patients.map(
    (patient: ShareUser): JSX.Element => (
      <PatientRow
        key={patient.user.userid}
        na={na}
        shareUser={patient}
        flagged={flagged}
        onClickPatient={onClickPatient}
        onFlagPatient={onFlagPatient}
        onRemovePatient={onRemovePatient}
      />
    )
  );

  const createSortHandler = (property: SortFields): (() => void) => {
    return (/* event: React.MouseEvent */): void => {
      onSortList(property, order === SortDirection.asc ? SortDirection.desc : SortDirection.asc);
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
                active={orderBy === "lastname"}
                direction={order}
                onClick={createSortHandler(SortFields.lastname)}>
                {t("lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-firstname" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-firstname-label${orderBy === SortFields.firstname ? `-${order}` : ""}`}
                active={orderBy === "firstname"}
                direction={order}
                onClick={createSortHandler(SortFields.firstname)}>
                {t("firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-email" className={classes.tableCellHeader}>
              <TableSortLabel
                id={`patients-list-header-email-label${orderBy === SortFields.email ? `-${order}` : ""}`}
                active={orderBy === "email"}
                direction={order}
                onClick={createSortHandler(SortFields.email)}>
                {t("email")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patients-list-header-actions" className={classes.tableCellHeader} />
          </TableRow>
        </TableHead>
        <TableBody>{patientsRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatientListTable;
