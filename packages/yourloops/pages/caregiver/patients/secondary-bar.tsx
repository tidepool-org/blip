/**
 * Copyright (c) 2021, Diabeloop
 * Patient list bar for Caregivers
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
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import HomeIcon from "@material-ui/icons/Home";
import FlagIcon from "@material-ui/icons/Flag";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import { FilterType } from "../../../models/generic";
import SecondaryHeaderBar from "../../../components/header-bars/secondary";
import PatientFilters from "../../../components/header-bars/patient-filters";

export interface PatientListBarProps {
  filter: string;
  filterType: FilterType | string;
  onFilter: (text: string) => void;
  onFilterType: (filterType: FilterType | string) => void;
  onInvitePatient: () => Promise<void>;
}

const pageBarStyles = makeStyles((theme: Theme) => {
  return {
    toolBarLeft: {
      [theme.breakpoints.down("sm")]: {
        order: 1,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
    },
    toolBarMiddle: {
      display: "flex",
      flexDirection: "row",
      marginRight: "auto",
      marginLeft: "auto",
      [theme.breakpoints.down("sm")]: {
        width: "50%",
        order: 3,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(2),
      },
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
      },
    },
    toolBarRight: {
      display: "flex",
      [theme.breakpoints.down("sm")]: {
        order: 2,
        marginLeft: "auto",
      },
      [theme.breakpoints.down("xs")]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
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
      display: "none", // For now caregivers can't invite a patient
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
}, { name: "ylp-caregiver-patients-secondarybar" });

function PatientsSecondaryBar(props: PatientListBarProps): JSX.Element {
  const { filter, filterType, onFilter, onFilterType, onInvitePatient } = props;
  const { t } = useTranslation("yourloops");
  const classes = pageBarStyles();

  const selectFilterValues = [
    { value: "all", label: t("select-all-patients"), icon: null },
    {
      value: "flagged",
      label: t("select-flagged-patients"),
      icon: <FlagIcon color="primary" className={classes.selectFilterIcon} />,
    },
    {
      value: "pending",
      label: t("select-pending-invitation-patients"),
      icon: <AccessTimeIcon color="primary" className={classes.selectFilterIcon} />,
    },
  ];

  const handleOpenModalAddPatient = (): void => {
    onInvitePatient();
  };

  const optionsFilterElements: JSX.Element[] = [];
  for (const sfv of selectFilterValues) {
    optionsFilterElements.push(
      <MenuItem value={sfv.value} key={sfv.value} aria-label={sfv.label}>
        {sfv.icon}
        {sfv.label}
      </MenuItem>
    );
  }

  return (
    <SecondaryHeaderBar>
      <div id="patients-list-toolbar-item-left" className={classes.toolBarLeft}>
        <Breadcrumbs id="caregiver-navbar-breadcrumbs" className="secondary-navbar-breadcrumbs" aria-label={t("aria-breadcrumbs")}>
          <Typography id="caregiver-navbar-breadcrumbs-mypatients" color="textPrimary" className={classes.breadcrumbText}>
            <HomeIcon id="caregiver-navbar-breadcrumbs-homeicon" className={classes.homeIcon} />
            {t("my-patients-title")}
          </Typography>
        </Breadcrumbs>
      </div>
      <div id="patients-list-toolbar-item-middle" className={classes.toolBarMiddle}>
        <PatientFilters
          filter={filter}
          filterType={filterType}
          onFilter={onFilter}
          onFilterType={onFilterType}
          noFilter={true}
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
