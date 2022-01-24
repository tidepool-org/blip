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

import React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, withStyles, useTheme, Theme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Avatar from "@material-ui/core/Avatar";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PersonRemoveIcon from "../../components/icons/PersonRemoveIcon";
import IconActionButton from "../../components/buttons/icon-action";

import { UserInvitationStatus } from "../../models/generic";
import { TeamMemberRole, TypeTeamMemberRole } from "../../models/team";
import { getUserFirstName, getUserLastName, getUserFirstLastName, getUserInitials } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import { Team, TeamMember, useTeam } from "../../lib/team";

export interface TeamMembersProps {
  team: Team;
  onSwitchAdminRole: (member: TeamMember, role: Exclude<TypeTeamMemberRole, "patient">) => Promise<void>;
  onShowRemoveTeamMemberDialog: (member: TeamMember) => Promise<void>;
}

const teamMembersStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: "100%",
    },
    listTitle: {
      textTransform: "uppercase",
      fontWeight: "bold",
      color: theme.palette.primary.main,
    },
    accordionMembersList: {
      flexDirection: "column",
      padding: 0,
    },
    tableRowHeader: {
      textTransform: "uppercase",
      fontSize: "16px",
    },
    paperMember: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing(2),
      padding: theme.spacing(1),
    },
    paperMemberBreak: {
      flexBasis: "100%",
      height: 0,
    },
    paperMemberPending: {
      width: 32,
      height: 32,
      marginLeft: 0,
      marginRight: 0,
    },
    paperMemberAvatar: {
      width: 40,
      height: 40,
    },
    paperMemberName: {
      marginTop: "auto",
      marginBottom: "auto",
      marginLeft: theme.spacing(1),
    },
    paperMemberRemove: {
      marginLeft: "auto",
      paddingTop: 0,
      paddingBottom: 0,
    },
    paperMemberChip: {
      display: "inline-flex",
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  };
});

const teamMembersTableStyles = makeStyles(() => ({
  root: {
    color: "black",
  },
}));

/**
 * Create a custom accordion summary.
 *
 * With a CSS style named "ylp-member-accordion-summary"
 */
const MembersAccordionSummary = withStyles(
  (theme: Theme) => ({
    root: {
      justifyContent: "left",
      transition: theme.transitions.create(["background-color", "min-height"]),
    },
    content: {
      "flexGrow": 0,
      "margin": 0,
      "display": "inline",
      "transition": undefined,
      "&$expanded": {
        margin: 0,
      },
    },
    expanded: {},
  }),
  { name: "ylp-member-accordion-summary" }
)(AccordionSummary);

function sortTeamMembers(a: Readonly<TeamMember>, b: Readonly<TeamMember>): number {
  let ret = 0;
  if (a.status !== b.status) {
    ret = a.status === UserInvitationStatus.pending ? 1 : -1;
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
}

function MembersTableBody(props: TeamMembersProps): JSX.Element {
  const { team, onSwitchAdminRole, onShowRemoveTeamMemberDialog } = props;

  // Hooks
  const classes = teamMembersTableStyles();
  const authContext = useAuth();
  const teamHook = useTeam();
  const { t } = useTranslation("yourloops");
  const [updatingUser, setUpdatingUser] = React.useState("");

  // Local variables
  const currentUserId = authContext.user?.userid as string;
  const userIsAdmin = teamHook.isUserAdministrator(team, currentUserId);
  const userIsTheOnlyAdministrator = teamHook.isUserTheOnlyAdministrator(team, currentUserId);

  const members = teamHook.getMedicalMembers(team);
  members.sort(sortTeamMembers);

  const rows: JSX.Element[] = members.map((member: Readonly<TeamMember>): JSX.Element => {
    const userId = member.user.userid;
    const email = member.user.username;
    // Dash: U+2014
    const firstName = member.status === UserInvitationStatus.pending ? "—" : getUserFirstName(member.user);
    const lastName = member.status === UserInvitationStatus.pending ? "—" : getUserLastName(member.user);
    const isAdmin = member.role === TeamMemberRole.admin;

    let checkboxElement: JSX.Element | null = null;
    let icon: JSX.Element | null = null;

    if (member.status === UserInvitationStatus.accepted) {
      // Determine if the current user can change the admin role for this member
      // - Must be an admin
      // - Mustn't be the only admin for it's own entry
      // - An update mustn't be in progress
      const checkboxAdminDisabled =
        !userIsAdmin || (userIsTheOnlyAdministrator && userId === currentUserId) || updatingUser.length > 0;
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
          await onSwitchAdminRole(member, isAdmin ? TeamMemberRole.admin : TeamMemberRole.member);
          setUpdatingUser("");
        };
        checkboxElement = (
          <Checkbox
            disabled={checkboxAdminDisabled}
            id={`team-members-list-${team.id}-row-${userId}-role-checkbox`}
            className="team-members-list-role-checkbox"
            color="primary"
            name={userId}
            checked={isAdmin}
            onChange={handleSwitchRole}
          />
        );
      }
    } else {
      icon = (
        <Tooltip title={t("pending-invitation") as string} aria-label={t("pending-invitation")} placement="bottom">
          <AccessTimeIcon
            id={`team-members-list-${team.id}-row-${userId}-pending-icon`}
            className="team-members-list-row-pending"
          />
        </Tooltip>
      );
    }

    const handleClickRemoveMember = async (): Promise<void> => {
      await onShowRemoveTeamMemberDialog(member);
    };

    return (
      <TableRow
        id={`team-members-list-${team.id}-row-${userId}`}
        className={"team-members-list-row"}
        key={email}
        data-email={email}
        data-userid={userId}
        data-teamid={team.id}
        data-role={member.role}
        data-status={member.status}
      >
        <TableCell id={`team-members-list-${team.id}-row-${userId}-icon`}>{icon}</TableCell>
        <TableCell style={{ fontWeight: "bold" }} id={`team-members-list-${team.id}-row-${userId}-lastname`}>
          {lastName}
        </TableCell>
        <TableCell style={{ fontWeight: "bold" }} id={`team-members-list-${team.id}-row-${userId}-firstname`}>
          {firstName}
        </TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-email`}>
          <Link
            classes={{ root: classes.root }}
            id={`team-members-list-${team.id}-row-${userId}-email-link`}
            className="team-members-list-email-link"
            href={`mailto:${email}`}
            target="_blank"
            rel="noreferrer">
            {email}
          </Link>
        </TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-role`}>{checkboxElement}</TableCell>
        <TableCell id={`team-members-list-${team.id}-row-${userId}-actions`} align="right">
          {userIsAdmin && (userId !== currentUserId) &&
          <IconActionButton
            tooltip={t("team-member-remove")}
            icon={<PersonRemoveIcon />}
            id={`team-members-list-${team.id}-row-${userId}-action-remove`}
            onClick={handleClickRemoveMember}
            className="team-members-list-action-remove"
          />
          }
        </TableCell>
      </TableRow>
    );
  });

  return <React.Fragment>{rows}</React.Fragment>;
}

function TeamMemberTable(props: TeamMembersProps): JSX.Element {
  const { team } = props;
  const classes = teamMembersStyles();
  const { t } = useTranslation("yourloops");

  return (
    <Table id={`team-members-list-${team.id}-table`}>
      <TableHead className={classes.tableRowHeader}>
        <TableRow>
          <TableCell id={`team-members-list-${team.id}-cellheader-icon`} />
          <TableCell id={`team-members-list-${team.id}-cellheader-lastname`}>
            {t("lastname")}
          </TableCell>
          <TableCell id={`team-members-list-${team.id}-cellheader-firstname`}>
            {t("firstname")}
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
      <TableBody>
        <MembersTableBody {...props} />
      </TableBody>
    </Table>
  );
}

function TeamMembersCards(props: TeamMembersProps): JSX.Element {
  const { team /*, onSwitchAdminRole*/, onShowRemoveTeamMemberDialog } = props;
  const { t } = useTranslation("yourloops");
  const authContext = useAuth();
  const teamHook = useTeam();
  const classes = teamMembersStyles();

  const currentUserId = authContext.user?.userid as string;
  const userIsAdmin = teamHook.isUserAdministrator(team, currentUserId);
  const members = teamHook.getMedicalMembers(team);
  members.sort(sortTeamMembers);

  const papers = members.map((member: TeamMember): JSX.Element | null => {
    const userId = member.user.userid;
    const email = member.user.username;

    // TODO onSwitchAdminRole

    let removeMemberButton: JSX.Element;
    if (userIsAdmin && userId !== currentUserId) {
      const handleClickRemoveMember = async (): Promise<void> => {
        await onShowRemoveTeamMemberDialog(member);
      };
      removeMemberButton = (
        <IconActionButton
          icon={<PersonRemoveIcon />}
          id={`team-members-list-${team.id}-paper-${email}-action-remove`}
          onClick={handleClickRemoveMember}
          className={classes.paperMemberRemove}
        />
      );
    } else {
      removeMemberButton = <div id={`team-members-list-${team.id}-paper-${email}-action-remove-empty`} />;
    }

    let content: JSX.Element;
    if (member.status === UserInvitationStatus.pending) {
      content = (
        <React.Fragment>
          <AccessTimeIcon className={classes.paperMemberPending} />
          <Link
            id={`team-members-list-${team.id}-link-${email}`}
            className={classes.paperMemberName}
            href={`mailto:${email}`}
            color="textPrimary"
            target="_blank"
            rel="noreferrer"
          >
            {email}
          </Link>
          {removeMemberButton}
          <div className={classes.paperMemberBreak} />
          {member.role === TeamMemberRole.admin &&
          <div className={classes.paperMemberChip}>
            <Chip size="small" label={t("team-member-admin")} />
          </div>
          }
          <div className={classes.paperMemberChip}>
            <Chip
              id={`team-members-list-${team.id}-badge-admin-${email}`}
              size="small"
              label={t("pending-invitation")}
            />
          </div>
        </React.Fragment>
      );
    } else if (member.status === UserInvitationStatus.accepted) {
      content = (
        <React.Fragment>
          <Avatar>{getUserInitials(member.user)}</Avatar>
          <Link
            id={`team-members-list-${team.id}-username-${userId}`}
            className={classes.paperMemberName}
            href={`mailto:${email}`}
            color="textPrimary"
            target="_blank"
            rel="noreferrer">
            {t("user-name", getUserFirstLastName(member.user))}
          </Link>
          {removeMemberButton}
          <div className={classes.paperMemberBreak} />
          {member.role === TeamMemberRole.admin &&
          <div className={classes.paperMemberChip}>
            <Chip
              id={`team-members-list-${team.id}-badge-admin-${userId}`}
              size="small"
              label={t("team-member-admin")}
            />
          </div>
          }
        </React.Fragment>
      );
    } else {
      return null;
    }

    return (
      <Paper
        key={email}
        id={`team-members-list-${team.id}-paper-${userId}`}
        className={classes.paperMember}
      >
        {content}
      </Paper>
    );
  });

  return <React.Fragment>{papers}</React.Fragment>;
}

function TeamMembers(props: TeamMembersProps): JSX.Element {
  const { team } = props;

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = teamMembersStyles();
  const { t } = useTranslation("yourloops");
  const teamHook = useTeam();
  const nMembers = teamHook.getNumMedicalMembers(team);

  return (
    <div id={`team-members-list-${team.id}`} className={classes.root}>
      <Accordion elevation={0} TransitionProps={{ unmountOnExit: true }}>
        <MembersAccordionSummary
          id={`team-members-list-${team.id}-header`}
          expandIcon={<ExpandMoreIcon />}
          aria-label={t("aria-expand-team-members")}
          aria-controls={`team-members-list-${team.id}-content`}
        >
          <Typography className={classes.listTitle}>{t("team-members-list-header", { nMembers })}</Typography>
        </MembersAccordionSummary>

        <AccordionDetails className={classes.accordionMembersList}>
          {matches ? <TeamMembersCards {...props} /> : <TeamMemberTable {...props} />}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default TeamMembers;
