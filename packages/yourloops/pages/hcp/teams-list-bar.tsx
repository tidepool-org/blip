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

import AppBar from "@material-ui/core/AppBar";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import AddIcon from "@material-ui/icons/Add";
import HomeIcon from "@material-ui/icons/Home";

import { Team } from "../../models/team";
import TeamEditModal from "./team-edit-modal";

interface BarProps {
  onCreateTeam: (team: Partial<Team>) => Promise<void>;
}

const pageBarStyles = makeStyles((theme: Theme) => {
  /* eslint-disable no-magic-numbers */
  return {
    toolBar: {
      display: "grid",
      gridTemplateRows: "auto",
      gridTemplateColumns: "auto auto auto",
      paddingLeft: theme.spacing(12),
      paddingRight: theme.spacing(12),
    },
    toolBarRight: {
      display: "flex",
    },
    breadcrumbLink: {
      display: "flex",
    },
    homeIcon: {
      marginRight: "0.5em",
    },
    buttonAddTeam: {
      marginLeft: "auto",
    },
  };
});

function TeamsListBar(props: BarProps): JSX.Element {
  const classes = pageBarStyles();
  const { t } = useTranslation("yourloops");

  const [modalOpened, setModalOpen] = React.useState(false);

  const handleOpenModalAddTeam = (): void => {
    setModalOpen(true);
  };

  const fakeNewTeam: Partial<Team> = {
    type: "medical",
  };

  return (
    <React.Fragment>
      <AppBar position="static" color="secondary">
        <Toolbar className={classes.toolBar}>
          <div id="team-list-toolbar-item-left">
            <Breadcrumbs aria-label={t("aria-breadcrumbs")}>
              <Typography color="textPrimary" className={classes.breadcrumbLink}>
                <HomeIcon className={classes.homeIcon} />
                {t("team-list-breadcrumbs-title-my-teams")}
              </Typography>
            </Breadcrumbs>
          </div>
          <div id="team-list-toolbar-item-middle"></div>
          <div id="team-list-toolbar-item-right" className={classes.toolBarRight}>
            <Button
              id="team-list-toolbar-add-team"
              color="primary"
              variant="contained"
              className={classes.buttonAddTeam}
              onClick={handleOpenModalAddTeam}>
              <AddIcon />
              &nbsp;{t("button-add-team")}
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <TeamEditModal
        action="create"
        modalOpened={modalOpened}
        setModalOpen={setModalOpen}
        team={fakeNewTeam}
        onSaveTeam={props.onCreateTeam}
      />
    </React.Fragment>
  );
}

export default TeamsListBar;
