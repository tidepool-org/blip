/**
 * Copyright (c) 2021, Diabeloop
 * Generic Team card
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
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";

import EmailIcon from "@material-ui/icons/Email";
import Link from "@material-ui/core/Link";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import PhoneIcon from "@material-ui/icons/Phone";

import VerifiedIcon from "./icons/VerifiedIcon";

import locales from "../../../locales/languages.json";
import { Team, getDisplayTeamCode } from "../lib/team";

export interface TeamCardProps {
  team: Readonly<Team>;
  children?: JSX.Element | JSX.Element[] | null;
  teamMembers?: JSX.Element;
}

export interface TeamInfoProps {
  id: string;
  label: string;
  value?: null | string | JSX.Element;
  icon: JSX.Element;
}

const teamCardStyles = makeStyles((theme: Theme) => {
  return {
    paper: {
      display: "flex",
      flexDirection: "column",
    },
    paperRoot: {
      padding: "1em 3em",
    },
    firstRow: {
      display: "flex",
      flexDirection: "row",
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        flexWrap: "wrap",
      },
    },
    secondRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        flexWrap: "wrap",
      },
      [theme.breakpoints.down("xs")]: {
        flexDirection: "column",
      },
    },
    teamName: {
      minWidth: "8em",
      marginTop: "auto",
      marginBottom: "auto",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        textAlign: "center",
        marginTop: 0,
        marginBottom: theme.spacing(1),
      },
    },
    teamInfoIcon: {
      fill: "#2e2e2e",
    },
    buttonActionFirstRow: {
      alignSelf: "center",
      marginRight: "1em",
      textTransform: "initial",
    },
    divActions: {
      marginLeft: "2em",
      display: "flex",
      flexGrow: 1,
      justifyContent: "flex-start",
      [theme.breakpoints.down("sm")]: {
        marginLeft: "0px",
        justifyContent: "center",
      },
    },
  };
}, { name: "ylp-team-card" });

const teamInfoStyles = makeStyles((theme: Theme) => {
  return {
    card: {
      display: "flex",
      flexDirection: "row",
      marginRight: theme.spacing(3),
      [theme.breakpoints.down("sm")]: {
        marginRight: 0,
        width: "50%",
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
      [theme.breakpoints.down("xs")]: {
        width: "100%",
      },
    },
    avatar: {
      backgroundColor: "#e4e4e5",
    },
    divLabelValue: {
      display: "flex",
      flexDirection: "column",
      marginLeft: theme.spacing(2),
      fontSize: theme.typography.fontSize,
    },
    spanValue: {
      fontWeight: 500,
    },
    linkValue: {
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
  };
}, { name: "ylp-team-card-info" });

export function TeamInfo(props: TeamInfoProps): JSX.Element | null {
  const { id, label, value, icon } = props;
  const classes = teamInfoStyles();
  const { t } = useTranslation("yourloops");

  if (_.isNil(value) || _.isEmpty(value)) {
    return null;
  }

  let infoLabel: string;
  let elemValue: JSX.Element;
  switch (label) {
  case "email":
    infoLabel = t("email");
    elemValue = (
      <Link id={`team-card-info-${id}-${label}-value`} className={classes.linkValue} href={`mailto:${value}`} target="_blank" rel="noreferrer">
        {value}
      </Link>
    );
    break;
  case "phone":
    infoLabel = t("phone-number");
    elemValue = (
      <Link id={`team-card-info-${id}-${label}-value`} className={classes.linkValue} href={`tel:${value}`} target="_blank" rel="noreferrer">
        {value}
      </Link>
    );
    break;
  default:
    infoLabel = t(`team-card-label-${label}`);
    elemValue = <span id={`team-card-info-${id}-${label}-value`} className={classes.spanValue}>{value}</span>;
    break;
  }

  return (
    <div id={`team-card-info-${id}-${label}`} className={classes.card}>
      <Avatar className={classes.avatar}>{icon}</Avatar>
      <div className={classes.divLabelValue}>
        <span id={`team-card-info-${id}-${label}-label`}>{infoLabel}</span>
        {elemValue}
      </div>
    </div>
  );
}

function TeamCard(props: TeamCardProps): JSX.Element {
  const { team, children, teamMembers } = props;
  const classes = teamCardStyles();
  const { id } = team;

  let address: JSX.Element | null = null;
  const teamAddress = team.address ?? null;
  if (teamAddress !== null) {
    const { line1, line2, zip, city, country } = teamAddress;
    const countryName = _.get(locales, `countries.${country}.name`, country) as string;
    address = (
      <React.Fragment>
        {line1}
        {_.isString(line2) && line2.length > 0 ? (
          <React.Fragment>
            <br />
            {line2}
          </React.Fragment>
        ) : null}
        <br />
        {`${zip} ${city} ${countryName}`}
      </React.Fragment>
    );
  }

  const teamCode = getDisplayTeamCode(team.code);

  return (
    <Paper
      id={`team-card-${id}`}
      variant="outlined"
      className={`${classes.paper} team-card`}
      classes={{ root: classes.paperRoot }}
      data-teamid={id}
    >
      <div id={`team-card-${id}-actions`} className={classes.firstRow}>
        <h2 id={`team-card-${id}-name`} className={classes.teamName}>
          {team.name}
        </h2>
        <div className={classes.divActions}>
          {children}
        </div>
      </div>
      <div id={`team-card-${id}-infos`} className={classes.secondRow}>
        <TeamInfo id={id} label="code" value={teamCode} icon={<VerifiedIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="phone" value={team.phone} icon={<PhoneIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="address" value={address} icon={<LocationOnIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="email" value={team.email} icon={<EmailIcon className={classes.teamInfoIcon} />} />
      </div>
      {teamMembers}
    </Paper>
  );
}

export default TeamCard;
