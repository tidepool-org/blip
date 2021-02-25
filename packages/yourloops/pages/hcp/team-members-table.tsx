/**
 * Copyright (c) 2021, Diabeloop
 * Team members list for HCPs (below a team card)
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

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { TeamMemberRole, TypeTeamMemberRole, TeamMemberStatus } from "../../models/team";
import { getUserFirstName, getUserLastName } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import { Team, TeamMember, useTeam } from "../../lib/team";

export interface TeamMembersProps {
  team: Team;
  onSwitchAdminRole: (member: TeamMember, role: Exclude<TypeTeamMemberRole, "patient">) => Promise<void>;
  onShowRemoveTeamMemberDialog: (member: TeamMember) => Promise<void>;
  classes?: Record<"tableRowPending", string>;
}

const teamMembersStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: "100%",
      marginTop: theme.spacing(1),
    },
    tableRowHeader: {
      fontVariant: "small-caps",
    },
    tableRowPending: {
      backgroundColor: theme.palette.primary.light,
    },
  };
});

function PersonRemoveIcon(props: SvgIconProps): JSX.Element {
  // For some reason this icon is not available with material-ui
  // This one come directly from material-design
  // Source: https://material.io/resources/icons/?icon=person_remove&style=baseline
  // prettier-ignore
  return (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" {...props}>
      <g><rect fill="none" height="24" width="24"/></g>
      <g><path d="M14,8c0-2.21-1.79-4-4-4S6,5.79,6,8s1.79,4,4,4S14,10.21,14,8z M17,10v2h6v-2H17z M2,18v2h16v-2c0-2.66-5.33-4-8-4 S2,15.34,2,18z"/></g>
    </SvgIcon>
  );
}

function MembersTableBody(props: TeamMembersProps): JSX.Element {
  const { team, onSwitchAdminRole, onShowRemoveTeamMemberDialog } = props;

  // Hooks
  const authContext = useAuth();
  const teamHook = useTeam();
  const { t } = useTranslation("yourloops");
  const [updatingUser, setUpdatingUser] = React.useState("");

  // Local variables
  const currentUserId = authContext.user?.userid as string;
  const userIsAdmin = teamHook.isUserAdministrator(team, currentUserId);
  const userIsTheOnlyAdministrator = teamHook.isUserTheOnlyAdministrator(team, currentUserId);

  const members = teamHook.getMedicalMembers(team);
  members.sort((a: Readonly<TeamMember>, b: Readonly<TeamMember>): number => {
    let ret = 0;
    if (a.status !== b.status) {
      ret = a.status === TeamMemberStatus.pending ? 1 : -1;
    }
    if (ret === 0) {
      const aln = getUserLastName(a.user);
      const bln = getUserLastName(b.user);
      ret = aln.localeCompare(bln);
    }
    if (ret === 0) {
      const afn = getUserFirstName(a.user);
      const bfn = getUserFirstName(b.user);
      ret = afn.localeCompare(bfn);
    }
    return ret;
  });

  const rows: JSX.Element[] = members.map((member: Readonly<TeamMember>): JSX.Element => {
    const userId = member.user.userid;
    const email = member.user.username;
    // Dash: U+2014
    const firstName = member.status === TeamMemberStatus.pending ? "—" : getUserFirstName(member.user);
    const lastName = member.status === TeamMemberStatus.pending ? "—" : getUserLastName(member.user);
    const isAdmin = member.role === TeamMemberRole.admin;

    let checkboxElement: JSX.Element | null = null;
    let removeMemberButton: JSX.Element | null = null;
    let rowClassName = "";
    let icon: JSX.Element | null = null;

    if (member.status === TeamMemberStatus.accepted) {
      // Determine if the current user can change the admin role for this member
      // - Must be an admin
      // - Mustn't be the only admin for it's own entry
      // - An update mustn't be in progress
      const checkboxAdminDisabled = !userIsAdmin || (userIsTheOnlyAdministrator && userId === currentUserId) || updatingUser.length > 0;
      if (updatingUser === userId) {
        // Disabled while update in progress (backend api call in progress)
        checkboxElement = (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px" }}>
            <CircularProgress disableShrink size={17} />
          </div>
        );
      } else {
        const handleSwitchRole = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
          const userId = event.target.name;
          const isAdmin = event.target.checked;
          setUpdatingUser(userId);
          await onSwitchAdminRole(member, isAdmin ? TeamMemberRole.admin : TeamMemberRole.viewer);
          setUpdatingUser("");
        };
        checkboxElement = (
          <Checkbox
            disabled={checkboxAdminDisabled}
            id={`team-members-list-${team.id}-row-${userId}-role-checkbox`}
            color="primary"
            name={userId}
            checked={isAdmin}
            onChange={handleSwitchRole} />
        );
      }
    } else {
      rowClassName = props.classes?.tableRowPending ?? "";
      icon = (
        <Tooltip title={t("team-member-pending") as string} aria-label={t("team-member-pending")} placement="bottom">
          <AccessTimeIcon />
        </Tooltip>
      );
    }

    if (userIsAdmin && userId !== currentUserId) {
      const handleClickRemoveMember = async (): Promise<void> => {
        await onShowRemoveTeamMemberDialog(member);
      };
      const removeText = t("team-member-remove");
      removeMemberButton = (
        <Tooltip title={removeText} aria-label={removeText} placement="bottom">
          <IconButton
            id={`team-members-list-${team.id}-row-${userId}-action-remove`}
            color="primary"
            aria-label={removeText}
            component="span"
            onClick={handleClickRemoveMember}>
            <PersonRemoveIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <TableRow id={`team-members-list-${team.id}-row-${userId}`} className={rowClassName} key={userId}>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-icon`}>{icon}</TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-lastname`}>{lastName}</TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-firstname`}>{firstName}</TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-email`}>
          <Link id={`team-members-list-${team.id}-row-${userId}-email-link`} href={`mailto:${email}`}>{email}</Link>
        </TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-role`}>
          {checkboxElement}
        </TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-actions`} align="right">
          {removeMemberButton}
        </TableCell>
      </TableRow>
    );
  });

  return <TableBody>{rows}</TableBody>;
}

function TeamMembers(props: TeamMembersProps): JSX.Element {
  const { team } = props;

  const classes = teamMembersStyles();
  const { t } = useTranslation("yourloops");
  const teamHook = useTeam();
  const nMembers = teamHook.getNumMedicalMembers(team);

  return (
    <div id={`team-members-list-${team.id}`} className={classes.root}>
      <Accordion TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary
          id={`team-members-list-${team.id}-header`}
          expandIcon={<ExpandMoreIcon />}
          aria-label={t("aria-expand-team-members")}
          aria-controls={`team-members-list-${team.id}-content`}>
          <Typography>{t("team-members-list-header", { nMembers })}</Typography>
        </AccordionSummary>

        {/* prettier-ignore */}
        <AccordionDetails>
          <Table id={`team-members-list-${team.id}-table`}>
            <TableHead className={classes.tableRowHeader}>
              <TableRow>
                <TableCell id={`team-members-list-${team.id}-cellheader-icon`} />
                <TableCell id={`team-members-list-${team.id}-cellheader-lastname`}>
                  {t("lastName")}
                </TableCell>
                <TableCell id={`team-members-list-${team.id}-cellheader-firstname`}>
                  {t("firstName")}
                </TableCell>
                <TableCell id={`team-members-list-${team.id}-cellheader-email`}>
                  {t("email")}
                </TableCell>
                <TableCell id={`team-members-list-${team.id}-cellheader-role`}>
                  {t("team-member-admin")}
                </TableCell>
                <TableCell id={`team-members-list-${team.id}-cellheader-actions`} />
              </TableRow>
            </TableHead>
            <MembersTableBody {...props} classes={classes} />
          </Table>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default TeamMembers;
