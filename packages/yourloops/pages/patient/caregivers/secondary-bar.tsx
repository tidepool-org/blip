/**
 * Copyright (c) 2021, Diabeloop
 * Caregivers list for Patients - Second app bar
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
import { Link as RouterLink } from "react-router-dom";

import { makeStyles, Theme } from "@material-ui/core/styles";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import AddIcon from "@material-ui/icons/Add";
import HomeIcon from "@material-ui/icons/Home";

import SecondaryHeaderBar from "../../../components/header-bars/secondary";

interface BarProps {
  defaultURL: string;
  /** Add a caregiver */
  onShowAddCaregiverDialog: () => Promise<void>;
}

const pageBarStyles = makeStyles(
  (theme: Theme) => {
    return {
      toolBarLeft: {
        [theme.breakpoints.down('sm')]: {
          order: 1,
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        },
      },
      toolBarRight: {
        display: "flex",
        [theme.breakpoints.down('sm')]: {
          order: 2,
          marginLeft: "auto",
        },
        [theme.breakpoints.down('xs')]: {
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        },
      },
      breadcrumbText: {
        display: "flex",
        cursor: "default",
        color: theme.palette.text.disabled,
      },
      breadcrumbLink: {
        display: "flex",
        color: theme.palette.text.primary,
      },
      homeIcon: {
        marginRight: "0.5em",
      },
      buttonAddCaregiver: {
        marginLeft: "auto",
      },
      buttonAddCaregiverText: {
        [theme.breakpoints.down('xs')]: {
          display: "none",
        },
      },
    };
  },
  { name: "ylp-patient-caregivers-secondary-bar" }
);

function SecondaryBar(props: BarProps): JSX.Element {
  const classes = pageBarStyles();
  const { t } = useTranslation("yourloops");

  const handleOpenAddCaregiverDialog = (): Promise<void> => {
    return props.onShowAddCaregiverDialog();
  };

  return (
    <SecondaryHeaderBar>
      <div id="patient-navbar-item-left" className={classes.toolBarLeft}>
        <Breadcrumbs aria-label={t("aria-breadcrumbs")}>
          <Link component={RouterLink} to={props.defaultURL} className={classes.breadcrumbLink}>
            <HomeIcon className={classes.homeIcon} />
            {t("breadcrumb-home")}
          </Link>
          <Typography className={classes.breadcrumbText}>{t("caregivers-title")}</Typography>
        </Breadcrumbs>
      </div>
      <div id="patient-navbar-item-middle"></div>
      <div id="patient-navbar-item-right" className={classes.toolBarRight}>
        <Button
          id="patient-navbar-add-caregiver"
          color="primary"
          variant="contained"
          className={classes.buttonAddCaregiver}
          onClick={handleOpenAddCaregiverDialog}>
          <AddIcon />
          <span className={classes.buttonAddCaregiverText}>&nbsp;{t("button-add-caregiver")}</span>
        </Button>
      </div>
    </SecondaryHeaderBar>
  );
}

export default SecondaryBar;
