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

import _ from "lodash";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";

import EditIcon from "@material-ui/icons/Edit";
import EmailIcon from "@material-ui/icons/Email";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PhoneIcon from "@material-ui/icons/Phone";

import locales from "../../../../locales/languages.json";
import { Team } from "../../models/team";

export interface TeamCardProps {
  team: Team;
  onShowEditTeamDialog: (team: Team | null) => Promise<void>;
  onShowLeaveTeamDialog: (team: Team) => Promise<void>;
  onShowAddMemberDialog: (team: Team) => Promise<void>;
}

export interface TeamInfoProps {
  id: string;
  label: string;
  value?: string | JSX.Element;
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
      justifyContent: "flex-start",
    },
    teamName: {
      minWidth: "8em",
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
    },
  };
});

const teamInfoStyles = makeStyles((theme: Theme) => {
  return {
    card: {
      display: "flex",
      flexDirection: "row",
      marginRight: theme.spacing(3), // eslint-disable-line no-magic-numbers
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
  };
});

function VerifiedIcon(props: SvgIconProps): JSX.Element {
  // For some reason this icon is not available with material-ui
  // This one come directly from material-design
  // Source: https://material.io/resources/icons/?icon=verified&style=baseline
  // prettier-ignore
  return (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" width="24px" height="24px" {...props}>
      <g><rect fill="none" height="24" width="24"/></g>
      <g><path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z"/></g>
    </SvgIcon>
  );
}

export function TeamInfo(props: TeamInfoProps): JSX.Element | null {
  const { id, label, value, icon } = props;
  const classes = teamInfoStyles();
  const { t } = useTranslation("yourloops");

  if (typeof value === "undefined") {
    return null;
  }

  return (
    <div id={`team-card-info-${id}-${label}`} className={classes.card}>
      <Avatar className={classes.avatar}>{icon}</Avatar>
      <div className={classes.divLabelValue}>
        <span id={`team-card-info-${id}-${label}-label`}>{t(`team-card-label-${label}`)}</span>
        <span id={`team-card-info-${id}-${label}-value`} className={classes.spanValue}>{value}</span>
      </div>
    </div>
  );
}

function TeamCard(props: TeamCardProps): JSX.Element {
  const { team, onShowEditTeamDialog, onShowLeaveTeamDialog, onShowAddMemberDialog } = props;
  const classes = teamCardStyles();
  const { t } = useTranslation("yourloops");
  const [buttonsDisabled, setButtonsDisabled] = React.useState(false);

  const handleClickEdit = async (): Promise<void> => {
    setButtonsDisabled(true);
    await onShowEditTeamDialog(team);
    setButtonsDisabled(false);
  };
  const handleClickLeaveTeam = async (): Promise<void> => {
    setButtonsDisabled(true);
    await onShowLeaveTeamDialog(team);
    setButtonsDisabled(false);
  };
  const handleClickAddMember = async (): Promise<void> => {
    setButtonsDisabled(true);
    await onShowAddMemberDialog(team);
    setButtonsDisabled(false);
  };

  const { id } = team;

  // FIXME: if (team.isAdmin(currentUser)) { ... show buttons }
  const buttonEdit = (
    <Button
      id={`team-card-${id}-button-edit`}
      className={classes.buttonActionFirstRow}
      startIcon={<EditIcon color="primary" />}
      onClick={handleClickEdit}
      disabled={buttonsDisabled}>
      {t("button-team-edit")}
    </Button>
  );
  const buttonAddMember = (
    <Button
      id={`team-card-${id}-button-add-member`}
      className={classes.buttonActionFirstRow}
      startIcon={<PersonAddIcon color="primary" />}
      onClick={handleClickAddMember}
      disabled={buttonsDisabled}>
      {t("button-team-add-member")}
    </Button>
  );
  const buttonLeaveTeam = (
    <Button
      id={`team-card-${id}-button-leave-team`}
      className={classes.buttonActionFirstRow}
      startIcon={<ExitToAppIcon color="primary" />}
      onClick={handleClickLeaveTeam}
      disabled={buttonsDisabled}>
      {t("button-team-leave")}
    </Button>
  );

  let address: JSX.Element | undefined = undefined;
  if (typeof team.address === "object") {
    const { line1, line2, zip, city, country } = team.address;
    const countryName = _.get(locales, `countries.${country}.name`, country) as string;
    address = (
      <React.Fragment>
        {line1}
        {_.isString(line2) ? (
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

  return (
    <Paper className={classes.paper} classes={{ root: classes.paperRoot }}>
      <div id={`team-card-${id}-actions`} className={classes.firstRow}>
        <h2 id={`team-card-${id}-name`} className={classes.teamName}>
          {team.name}
        </h2>
        <div className={classes.divActions}>
          {buttonEdit}
          {buttonAddMember}
          {buttonLeaveTeam}
        </div>
      </div>
      <div id={`team-card-${id}-infos`} className={classes.secondRow}>
        <TeamInfo id={id} label="code" value={team.code} icon={<VerifiedIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="phone" value={team.phone} icon={<PhoneIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="address" value={address} icon={<LocationOnIcon className={classes.teamInfoIcon} />} />
        <TeamInfo id={id} label="email" value={team.email} icon={<EmailIcon className={classes.teamInfoIcon} />} />
      </div>
    </Paper>
  );
}

export default TeamCard;
