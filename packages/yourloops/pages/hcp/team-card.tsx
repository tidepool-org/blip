/**
 * Copyright (c) 2021, Diabeloop
 * Team card for HCPs
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

import { makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PhoneIcon from '@material-ui/icons/Phone';

import { Team } from "../../models/team";
import { t } from "../../lib/language";

interface TeamCardProps {
  team: Team;
}

interface TeamInfoProps {
  label: string;
  value?: string;
  icon: JSX.Element;
}

const teamCardStyles = makeStyles((theme: Theme) => {
  return {
    paper: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.primary.light,
    },
    paperRoot: {
      padding: "1em",
    },
    firstRow: {
      display: "flex",
      flexDirection: "row",
      marginBottom: theme.spacing(2), // eslint-disable-line no-magic-numbers
    },
    secondRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    teamName: {
      minWidth: "8em",
    },
    buttonActionFirstRow: {
      alignSelf: "center",
      marginRight: "1em",
    },
    divActions: {
      marginLeft: "2em",
      display: "flex",
      flexGrow: 1,
      justifyContent: "flex-start",
    },
  };
});

const teamInfoStyles = makeStyles((theme: Theme) => {
  return {
    card: {
      display: "flex",
      flexDirection:  "row",
    },
    divLabelValue: {
      display: "flex",
      flexDirection: "column",
      marginLeft: theme.spacing(2),
      fontSize: theme.typography.fontSize,
    },
    spanValue: {
      fontWeight: "bold",
    },
  };
});

function TeamInfo(props: TeamInfoProps): JSX.Element | null {
  const { label, value, icon } = props;
  const classes = teamInfoStyles();

  if (typeof value !== "string") {
    return null;
  }

  return (
    <div className={classes.card}>
      <Avatar>{icon}</Avatar>
      <div className={classes.divLabelValue}>
        <span>{t(label)}</span>
        <span className={classes.spanValue}>{value}</span>
      </div>
    </div>
  );
}

function TeamCard(props: TeamCardProps): JSX.Element {
  const { team } = props;
  const classes = teamCardStyles();

  // FIXME: if (team.isAdmin(currentUser)) { ... show buttons }
  const buttonEdit = (
    <Button id={`team-card-${team.id}-button-edit`} className={classes.buttonActionFirstRow} startIcon={<EditIcon color="primary" />}>
      {t("button-team-edit")}
    </Button>
  );
  const buttonAddMember = (
    <Button id={`team-card-${team.id}-button-add-member`} className={classes.buttonActionFirstRow} startIcon={<PersonAddIcon color="primary" />}>
      {t("button-team-add-member")}
    </Button>
  );

  return (
    <Paper className={classes.paper} classes={{ root: classes.paperRoot }}>
      <div id={`team-card-${team.id}-actions`} className={classes.firstRow}>
        <h2 id={`team-card-${team.id}-name`} className={classes.teamName}>{team.name}</h2>
        <div className={classes.divActions}>
          {buttonEdit}
          {buttonAddMember}
        </div>
      </div>
      <div id={`team-card-${team.id}-infos`} className={classes.secondRow}>
        <TeamInfo label="label-team-card-code" value={team.code} icon={<FingerprintIcon />} />
        <TeamInfo label="label-team-card-phone" value={team.phone} icon={<PhoneIcon />} />
        <TeamInfo label="label-team-card-address" value={team.address} icon={<LocationOnIcon />} />
        <TeamInfo label="label-team-card-email" value={team.email} icon={<EmailIcon />} />
      </div>
    </Paper>
  );
}

export default TeamCard;
