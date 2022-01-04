/**
 * Copyright (c) 2021, Diabeloop
 * Pending patient card for HCPs (mobile display)
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

import { makeStyles } from "@material-ui/core/styles";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";

import { TeamUser } from "../../../lib/team";
import IconActionButton from "../../../components/buttons/icon-action";
import PersonRemoveIcon from "../../../components/icons/PersonRemoveIcon";

interface PendingPatientCardProps {
  patient: TeamUser;
  onClickRemovePatient: (patient: TeamUser) => void;
}

const style = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    paddingRight: theme.spacing(0.5),
  },
  pendingIconContainer: {
    display: "flex",
    marginRight: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
}));

function PendingPatientCard(props: PendingPatientCardProps): JSX.Element {
  const { patient, onClickRemovePatient } = props;
  const classes = style();
  const email = _.get(patient, "emails[0]", patient.username);
  const patientId = patient.userid;

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickRemovePatient(patient);
  };

  return (
    <Paper
      id={`pending-patient-list-card-${patientId}`}
      className={classes.container}
      data-userid={email}
    >
      <div className={classes.pendingIconContainer}>
        <AccessTimeIcon id={`pending-patient-list-card-pending-icon-${patientId}`} />
      </div>
      <Link
        color="textPrimary"
        className={classes.fullWidth}
        id={`pending-patient-list-card-email-link-${patientId}`}
        href={`mailto:${email}`}
        target="_blank"
        rel="noreferrer"
      >
        {email}
      </Link>
      <IconActionButton
        icon={<PersonRemoveIcon />}
        id={`pending-patient-list-card-remove-icon-${patientId}`}
        onClick={handleOnClick}
      />
    </Paper>
  );
}

export default PendingPatientCard;
