/**
 * Copyright (c) 2021, Diabeloop
 * Profile - Second app bar
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
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import HomeIcon from "@material-ui/icons/Home";

import SecondaryHeaderBar from "../../components/header-bars/secondary";

interface SecondaryBarProps {
  defaultURL: string;
}

const pageBarStyles = makeStyles(
  (theme: Theme) => {
    return {
      toolBarRight: {
        display: "flex",
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
      buttonAddTeam: {
        marginLeft: "auto",
      },
    };
  },
  { name: "ylp-profile-secondary-bar" }
);

function SecondaryBar(props: SecondaryBarProps): JSX.Element {
  const classes = pageBarStyles();
  const { t } = useTranslation("yourloops");

  return (
    <SecondaryHeaderBar>
      <div id="profile-navbar-item-left">
        <Breadcrumbs aria-label={t("aria-breadcrumbs")}>
          <Link component={RouterLink} to={props.defaultURL} className={classes.breadcrumbLink}>
            <HomeIcon className={classes.homeIcon} />
            {t("breadcrumb-home")}
          </Link>
          <Typography className={classes.breadcrumbText}>{t("menu-account-preferences")}</Typography>
        </Breadcrumbs>
      </div>
      <div id="profile-navbar-item-middle"></div>
      <div id="profile-navbar-item-right" className={classes.toolBarRight} />
    </SecondaryHeaderBar>
  );
}

export default SecondaryBar;
