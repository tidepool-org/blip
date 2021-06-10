/**
 * Copyright (c) 2021, Diabeloop
 * Teams list for HCPs - Second app bar
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

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import AddIcon from "@material-ui/icons/Add";
import HomeIcon from "@material-ui/icons/Home";

import { Team } from "../../lib/team";
import SecondaryHeaderBar from "../../components/header-bars/secondary";

interface BarProps {
  onShowEditTeamDialog: (team: Team | null) => Promise<void>;
}

const pageBarStyles = makeStyles(
  (theme: Theme) => {
    return {
      toolBarRight: {
        display: "flex",
        [theme.breakpoints.down('sm')]: {
          marginLeft: "auto",
        },
      },
      breadcrumbText: {
        display: "flex",
        cursor: "default",
      },
      homeIcon: {
        marginRight: "0.5em",
      },
      buttonAddTeam: {
        marginLeft: "auto",
      },
      buttonAddTeamText: {
        [theme.breakpoints.down('xs')]: {
          display: "none",
        },
      },
    };
  },
  { name: "ylp-hcp-teams-secondary-bar" }
);

function TeamsSecondaryBar(props: BarProps): JSX.Element {
  const classes = pageBarStyles();
  const { t } = useTranslation("yourloops");

  const handleOpenModalAddTeam = async (): Promise<void> => {
    await props.onShowEditTeamDialog(null);
  };

  return (
    <SecondaryHeaderBar>
      <div id="teams-navbar-item-left">
        <Breadcrumbs aria-label={t("aria-breadcrumbs")}>
          <Typography color="textPrimary" className={classes.breadcrumbText}>
            <HomeIcon className={classes.homeIcon} />
            {t("teams-navbar-breadcrumbs-title-my-teams")}
          </Typography>
        </Breadcrumbs>
      </div>
      <div id="teams-navbar-item-middle"></div>
      <div id="teams-navbar-item-right" className={classes.toolBarRight}>
        <Button
          id="teams-navbar-add-team"
          color="primary"
          variant="contained"
          className={classes.buttonAddTeam}
          onClick={handleOpenModalAddTeam}>
          <AddIcon />
          <span className={classes.buttonAddTeamText}>&nbsp;{t("button-create-a-team")}</span>
        </Button>
      </div>
    </SecondaryHeaderBar>
  );
}

export default TeamsSecondaryBar;
