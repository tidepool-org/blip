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

import React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import EditIcon from "@material-ui/icons/Edit";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import { UserInvitationStatus } from "../../models/generic";
import { TeamMemberRole } from "../../models/team";
import { Team } from "../../lib/team";
import GenericTeamCard from "../../components/team-card";

export interface TeamCardProps {
  team: Readonly<Team>;
  memberRole: TeamMemberRole;
  memberStatus: UserInvitationStatus;
  onShowEditTeamDialog: (team: Team | null) => Promise<void>;
  onShowLeaveTeamDialog: (team: Team) => Promise<boolean>;
  onShowAddMemberDialog: (team: Team) => Promise<void>;
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
    buttonActionFirstRow: {
      alignSelf: "center",
      marginRight: "1em",
      textTransform: "initial",
      [theme.breakpoints.down("sm")]: {
        marginRight: 0,
      },
    },
    buttonText: {
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
  };
}, { name: "ylp-team-card-hcp" });

function TeamCard(props: TeamCardProps): JSX.Element {
  const {
    team,
    memberRole,
    memberStatus,
    onShowEditTeamDialog,
    onShowLeaveTeamDialog,
    onShowAddMemberDialog,
    teamMembers,
  } = props;
  const classes = teamCardStyles();
  const { t } = useTranslation("yourloops");
  const [buttonsDisabled, setButtonsDisabled] = React.useState(false);

  const { id } = team;
  const isTeamMemberAdmin = memberRole === TeamMemberRole.admin && memberStatus === UserInvitationStatus.accepted;

  const handleClickLeaveTeam = async (): Promise<void> => {
    setButtonsDisabled(true);
    const result = await onShowLeaveTeamDialog(team);
    if (!result) {
      setButtonsDisabled(false);
    }
  };

  const handleClickEdit = async (): Promise<void> => {
    setButtonsDisabled(true);
    await onShowEditTeamDialog(team);
    setButtonsDisabled(false);
  };

  const handleClickAddMember = async (): Promise<void> => {
    setButtonsDisabled(true);
    await onShowAddMemberDialog(team);
    setButtonsDisabled(false);
  };

  return (
    <GenericTeamCard team={team} teamMembers={teamMembers}>
      <React.Fragment>
        {isTeamMemberAdmin &&
          <React.Fragment>
            <Button
              id={`team-card-${id}-button-edit`}
              className={classes.buttonActionFirstRow}
              startIcon={<EditIcon color="primary" />}
              onClick={handleClickEdit}
              disabled={buttonsDisabled}>
              <span className={classes.buttonText}>{t("button-team-edit")}</span>
            </Button>
            <Button
              id={`team-card-${id}-button-add-member`}
              className={classes.buttonActionFirstRow}
              startIcon={<PersonAddIcon color="primary" />}
              onClick={handleClickAddMember}
              disabled={buttonsDisabled}>
              <span className={classes.buttonText}>{t("button-team-add-member")}</span>
            </Button>
          </React.Fragment>
        }
      </React.Fragment>
      <Button
        id={`team-card-${id}-button-leave-team`}
        className={classes.buttonActionFirstRow}
        startIcon={<ExitToAppIcon color="primary" />}
        onClick={handleClickLeaveTeam}
        disabled={buttonsDisabled}>
        <span className={classes.buttonText}>{t("button-team-leave")}</span>
      </Button>
    </GenericTeamCard>
  );
}

export default TeamCard;
