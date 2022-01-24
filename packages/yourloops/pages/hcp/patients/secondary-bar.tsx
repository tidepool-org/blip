/**
 * Copyright (c) 2021, Diabeloop
 * Patient list bar for HCPs
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

import { Theme, makeStyles } from "@material-ui/core/styles";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import ListSubheader from "@material-ui/core/ListSubheader";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import HomeIcon from "@material-ui/icons/Home";
import FlagIcon from "@material-ui/icons/Flag";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import { FilterType } from "../../../models/generic";
import { TeamType } from "../../../models/team";
import { useTeam } from "../../../lib/team";

import MedicalServiceIcon from "../../../components/icons/MedicalServiceIcon";
import SecondaryHeaderBar from "../../../components/header-bars/secondary";
import PatientFilters from "../../../components/header-bars/patient-filters";

export interface PatientListBarProps {
  filter: string;
  filterType: FilterType | string;
  onFilter: (text: string) => void;
  onFilterType: (filterType: FilterType | string) => void;
  onInvitePatient: () => Promise<void>;
}

const pageBarStyles = makeStyles(
  (theme: Theme) => {
    return {
      toolBarLeft: {
        [theme.breakpoints.down("sm")]: {
          order: 1,
        },
      },
      toolBarMiddle: {
        display: "flex",
        flexDirection: "row",
        marginRight: "auto",
        marginLeft: "auto",
        [theme.breakpoints.down("sm")]: {
          order: 3,
          width: "100%",
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        },
        [theme.breakpoints.down("xs")]: {
          flexWrap: "wrap",
        },
      },
      toolBarRight: {
        display: "flex",
        [theme.breakpoints.down("sm")]: {
          order: 2,
          marginLeft: "auto",
        },
      },
      homeIcon: {
        marginRight: "0.5em",
      },
      breadcrumbText: {
        display: "flex",
        cursor: "default",
      },
      selectFilterIcon: {
        margin: "0 .5em 0 0",
      },
      buttonAddPatient: {
        marginLeft: "auto",
      },
      buttonAddPatientText: {
        [theme.breakpoints.down("xs")]: {
          display: "none",
        },
      },
      modalAddPatient: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      divModal: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[5], // eslint-disable-line no-magic-numbers
        padding: theme.spacing(2, 4, 3), // eslint-disable-line no-magic-numbers
        width: "25em",
      },
      formModal: {
        display: "flex",
        flexDirection: "column",
      },
      divModalButtons: {
        display: "inline-flex",
        flexDirection: "row",
        marginTop: "2.5em",
      },
      divModalButtonCancel: {
        marginLeft: "auto",
        marginRight: theme.spacing(1),
      },
    };
  },
  { name: "ylp-hcp-patients-secondary-bar" }
);

function PatientsSecondaryBar(props: PatientListBarProps): JSX.Element {
  const { filter, filterType, onFilter, onFilterType, onInvitePatient } = props;
  const { t } = useTranslation("yourloops");
  const classes = pageBarStyles();
  const teamHook = useTeam();
  const selectFilterValues = [
    { value: "all", label: t("select-all-patients"), icon: null, id: "menuitem-filter-patients-all" },
    {
      value: "flagged",
      label: t("select-flagged-patients"),
      icon: <FlagIcon color="primary" className={classes.selectFilterIcon} />,
      id: "menuitem-filter-patients-flagged",
    },
    {
      value: TeamType.private,
      label: t("private-practice"),
      icon: <MedicalServiceIcon color="primary" className={classes.selectFilterIcon} />,
      id: "menuitem-filter-patients-private-practice",
    },
    {
      value: "pending",
      label: t("select-pending-invitation-patients"),
      icon: <AccessTimeIcon color="primary" className={classes.selectFilterIcon} />,
      id: "menuitem-filter-patients-pending-invitation",
    },
  ];

  const handleOpenModalAddPatient = (): void => {
    onInvitePatient();
  };

  const optionsFilterElements: JSX.Element[] = [];
  for (const sfv of selectFilterValues) {
    optionsFilterElements.push(
      <MenuItem value={sfv.value} key={sfv.value} aria-label={sfv.label} id={sfv.id} className="menuitem-filter-patients">
        {sfv.icon}
        {sfv.label}
      </MenuItem>
    );
  }

  const teams = teamHook.getMedicalTeams();
  if (teams.length > 0) {
    optionsFilterElements.push(<ListSubheader key="team-sub-header">{t("teams")}</ListSubheader>);
    for (const team of teams) {
      optionsFilterElements.push(
        <MenuItem value={team.id} key={team.id} aria-label={team.name} id={`menuitem-filter-patients-team-${team.id}`} className="menuitem-filter-patients">
          {team.name}
        </MenuItem>
      );
    }
  }

  return (
    <SecondaryHeaderBar>
      <div id="patients-list-toolbar-item-left" className={classes.toolBarLeft}>
        <Breadcrumbs id="team-navbar-breadcrumbs" className="secondary-navbar-breadcrumbs" aria-label={t("aria-breadcrumbs")}>
          <Typography id="team-navbar-breadcrumbs-mypatients" color="textPrimary" className={classes.breadcrumbText}>
            <HomeIcon id="team-navbar-breadcrumbs-homeicon" className={classes.homeIcon} />
            <span>{t("my-patients-title")}</span>
          </Typography>
        </Breadcrumbs>
      </div>
      <div id="patients-list-toolbar-item-middle" className={classes.toolBarMiddle}>
        <PatientFilters
          filter={filter}
          filterType={filterType}
          onFilter={onFilter}
          onFilterType={onFilterType}
          optionsFilterElements={optionsFilterElements}
        />
      </div>
      <div id="patients-list-toolbar-item-right" className={classes.toolBarRight}>
        <Button
          id="patient-list-toolbar-add-patient"
          color="primary"
          variant="contained"
          className={classes.buttonAddPatient}
          onClick={handleOpenModalAddPatient}>
          <PersonAddIcon />
          <span className={classes.buttonAddPatientText}>&nbsp;{t("add-patient")}</span>
        </Button>
      </div>
    </SecondaryHeaderBar>
  );
}

export default PatientsSecondaryBar;
