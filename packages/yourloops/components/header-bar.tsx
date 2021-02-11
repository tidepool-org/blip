/**
 * Copyright (c) 2021, Diabeloop
 * Generic Header Bar
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
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Toolbar from "@material-ui/core/Toolbar";

import AccountCircle from "@material-ui/icons/AccountCircle";

import brandingLogo from "branding/logo.png";
import { useAuth } from "../lib/auth";

interface HeaderProps extends RouteComponentProps {
  children?: JSX.Element | JSX.Element[];
}

const toolbarStyles = makeStyles({
  toolBar: {
    backgroundColor: "var(--mdc-theme-surface, white)",
    display: "grid",
    gridTemplateRows: "auto",
    gridTemplateColumns: (props: HeaderProps) => (_.isEmpty(props.children) ? "auto auto" : "auto auto auto"),
    paddingLeft: "6em",
    paddingRight: "6em",
  },
  accountMenu: {
    marginLeft: "auto",
    display: "flex",
    flexDirection: "row",
    color: "var(--mdc-theme-on-surface, black)",
  },
  accountInfos: {
    textAlign: "center",
  },
  accountName: {
    fontWeight: "bold",
  },
  accountType: {
    fontWeight: "lighter",
  },
  toolbarLogo: {
    height: "45px",
  },
});

function HeaderBar(props: HeaderProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = toolbarStyles(props);
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const history = useHistory();
  const handleOpenProfilePage = () => {
    history.push("/account-preferences");
  };

  const handleLogout = () => {
    const { history } = props;
    setAnchorEl(null);
    auth.logout();
    history.push("/");
  };

  let accountMenu = null;
  if (auth.isLoggedIn()) {
    const user = auth.user;
    const role = user?.roles ? user.roles[0] : "unknown";
    accountMenu = (
      <div className={classes.accountMenu}>
        <div className={classes.accountInfos}>
          <div className={classes.accountName}>{`${user?.profile?.firstName} ${user?.profile?.lastName}`}</div>
          <div className={classes.accountType}>{role}</div>
        </div>
        <IconButton
          aria-label={t("aria-current-user-account")}
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit">
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={open}
          onClose={handleClose}>
          <MenuItem onClick={handleOpenProfilePage}>{t("menu-account-preferences")}</MenuItem>
          <MenuItem onClick={handleLogout}>{t("Logout")}</MenuItem>
        </Menu>
      </div>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolBar}>
        <img className={classes.toolbarLogo} alt={t("alt-img-logo")} src={brandingLogo} />
        {props.children}
        {accountMenu}
      </Toolbar>
    </AppBar>
  );
}

export default withRouter(HeaderBar);
