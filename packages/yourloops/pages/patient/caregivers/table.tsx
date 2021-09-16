/**
 * Copyright (c) 2021, Diabeloop
 * Patient care givers page - Table of caregivers
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

import { makeStyles, Theme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Tooltip from "@material-ui/core/Tooltip";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import PersonRemoveIcon from "../../../components/icons/PersonRemoveIcon";

import { UserInvitationStatus } from "../../../models/generic";
import { ShareUser } from "../../../lib/share";
import { getUserFirstName, getUserLastName } from "../../../lib/utils";

import { SortFields, SortDirection } from "./types";

export interface CaregiverTableProps {
  userShares: ShareUser[];
  onRemoveCaregiver: (user: ShareUser) => Promise<void>;
}

const tableStyles = makeStyles(
  (theme: Theme) => {
    return {
      table: {
        width: "100%",
      },
      tableRow: {
        cursor: "pointer",
      },
      tableRowPending: {
        cursor: "pointer",
        backgroundColor: theme.palette.primary.light,
      },
      tableRowHeader: {
        textTransform: "uppercase",
      },
      tableCellHeader: {
        fontSize: "14px",
      },
      tableCellHeaderPending: {
        width: "24px",
      },
      tableCellActions: {
        textAlign: "right",
      },
    };
  },
  { name: "ylp-patient-caregivers-table" }
);

function compareUserShare(orderBy: SortFields, order: SortDirection, a: ShareUser, b: ShareUser): number {
  let value = 0;

  if (a.status === UserInvitationStatus.pending && b.status === UserInvitationStatus.pending) {
    value = a.user.username.localeCompare(b.user.username);
    if (order === SortDirection.desc) {
      value = -value;
    }
  } else if (a.status === UserInvitationStatus.pending) {
    value = 1;
  } else if (b.status === UserInvitationStatus.pending) {
    value = -1;
  } else {
    switch (orderBy) {
    case SortFields.firstname:
      value = getUserFirstName(a.user).localeCompare(getUserFirstName(b.user));
      break;
    case SortFields.lastname:
      value = getUserLastName(a.user).localeCompare(getUserLastName(b.user));
      break;
    }
    if (order === SortDirection.desc) {
      value = -value;
    }
  }

  return value;
}

function CaregiverTable(props: CaregiverTableProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = tableStyles();
  const [orderBy, setOrderBy] = React.useState<SortFields>(SortFields.lastname);
  const [order, setOrder] = React.useState<SortDirection>(SortDirection.asc);

  const createSortHandler = (property: SortFields): (() => void) => {
    return (/* event: React.MouseEvent */): void => {
      if (orderBy === property) {
        setOrder(order === SortDirection.asc ? SortDirection.desc : SortDirection.asc);
      } else {
        setOrder(SortDirection.asc);
        setOrderBy(property);
      }
    };
  };

  props.userShares.sort((a: ShareUser, b: ShareUser) => {
    return compareUserShare(orderBy, order, a, b);
  });

  const tableRows = props.userShares.map((us) => {
    const userId = us.user.userid;
    const handleClickDelete = () => {
      props.onRemoveCaregiver(us);
    };
    const removeAction = t("modal-patient-remove-caregiver-remove");

    if (us.status === UserInvitationStatus.pending) {
      return (
        <TableRow key={userId} id={`patient-caregivers-table-row-${userId}`} data-userid={userId} data-status={us.status} className={classes.tableRowPending}>
          <TableCell id={`patient-caregivers-table-row-${userId}-status`}>
            <Tooltip title={t("pending-invitation") as string} aria-label={t("pending-invitation")} placement="bottom">
              <AccessTimeIcon id={`patient-caregivers-table-row-pendingicon-${userId}`} />
            </Tooltip>
          </TableCell>
          <TableCell id={`patient-caregivers-table-row-${userId}-lastname`}>-</TableCell>
          <TableCell id={`patient-caregivers-table-row-${userId}-firstname`}>{us.user.username}</TableCell>
          <TableCell id={`patient-caregivers-table-row-${userId}-actions`} className={classes.tableCellActions}>
            <Tooltip title={removeAction} aria-label={removeAction} placement="bottom">
              <IconButton id={`patient-caregivers-table-row-${userId}-button-remove`} aria-label={removeAction} size="small" onClick={handleClickDelete}>
                <PersonRemoveIcon color="primary" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow key={userId} id={`patient-caregivers-table-row-${userId}`} data-userid={userId} data-status={us.status}>
        <TableCell id={`patient-caregivers-table-row-${userId}-status`} />
        <TableCell id={`patient-caregivers-table-row-${userId}-lastname`}>{getUserLastName(us.user)}</TableCell>
        <TableCell id={`patient-caregivers-table-row-${userId}-firstname`}>{getUserFirstName(us.user)}</TableCell>
        <TableCell id={`patient-caregivers-table-row-${userId}-actions`} className={classes.tableCellActions}>
          <Tooltip title={removeAction} aria-label={removeAction} placement="bottom">
            <IconButton id={`patient-caregivers-table-row-${userId}-button-remove`} aria-label={removeAction} size="small" onClick={handleClickDelete}>
              <PersonRemoveIcon color="primary" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <TableContainer component={Paper}>
      <Table id="patient-caregivers-table" className={classes.table} aria-label={t("aria-table-list-caregivers")} stickyHeader>
        <TableHead id="patient-caregivers-table-header">
          <TableRow id="patient-caregivers-table-header-row" className={classes.tableRowHeader}>
            <TableCell
              id="patient-caregivers-table-header-status"
              className={`${classes.tableCellHeader} ${classes.tableCellHeaderPending}`}
            />
            <TableCell id="patient-caregivers-table-header-lastname" className={classes.tableCellHeader}>
              <TableSortLabel active={orderBy === "lastname"} direction={order} onClick={createSortHandler(SortFields.lastname)}>
                {t("lastname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patient-caregivers-table-header-firstname" className={classes.tableCellHeader}>
              <TableSortLabel
                active={orderBy === "firstname"}
                direction={order}
                onClick={createSortHandler(SortFields.firstname)}>
                {t("firstname")}
              </TableSortLabel>
            </TableCell>
            <TableCell id="patient-caregivers-table-header-actions" className={classes.tableCellHeader} />
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default CaregiverTable;
