/**
 * Copyright (c) 2021, Diabeloop
 * Generic Primary Header Bar
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
import React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { makeStyles, withStyles, Theme } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Toolbar from "@material-ui/core/Toolbar";
import Badge from "@material-ui/core/Badge";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import brandingLogoFull from "branding/logo-full.svg";
import brandingLogoIcon from "branding/logo-icon.svg";

import metrics from "../../lib/metrics";
import { useNotification } from "../../lib/notifications/hook";
import config from "../../lib/config";
import { User, useAuth } from "../../lib/auth";

type CloseMenuCallback = () => void;
export interface HeaderActions {
  closeMenu: CloseMenuCallback;
}

interface HeaderProps {
  children?: JSX.Element | JSX.Element[];
  /** Additional menu items */
  menuItems?: JSX.Element | JSX.Element[];
  /**
   * Custom actions callbacks (React.useRef())
   *
   * Not sure with this constructions, I was trying to do a ref like action
   * we had with class components, but I wasn't able to use the "ref" props for it.
   */
  actions?: {
    current: null | HeaderActions;
  };
  /** Redirect route when clicking on the logo */
  headerLogoURL?: string;
}

const toolbarStyles = makeStyles((theme: Theme) => ({
  toolBar: {
    backgroundColor: "var(--mdc-theme-surface, white)",
    display: "grid",
    gridTemplateRows: "3.5em",
    gridTemplateColumns: (props: HeaderProps) => _.isEmpty(props.children) ? "1fr 1fr" : "1fr auto 1fr",
    paddingLeft: theme.spacing(12), // eslint-disable-line no-magic-numbers
    paddingRight: theme.spacing(12), // eslint-disable-line no-magic-numbers
    paddingBottom: "0.7em",
    paddingTop: "0.7em",
    justifyItems: "stretch",
    alignItems: "center",
    [theme.breakpoints.down("lg")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: (props: HeaderProps) => _.isEmpty(props.children) ? "auto auto" : "auto auto auto",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      display: "flex",
      flexWrap: "wrap",
    },
  },
  toolbarLeft: {
    height: "100%",
    [theme.breakpoints.down("xs")]: {
      order: 1,
      width: "3em",
    },
  },
  toolbarMiddle: {
    [theme.breakpoints.down("xs")]: {
      order: 3,
      width: "100%",
    },
  },
  toolbarRight: {
    display: "flex",
    justifyContent: "flex-end",
    [theme.breakpoints.down("xs")]: {
      order: 2,
      marginLeft: "auto",
    },
  },
  accountType: {
    fontWeight: "lighter",
  },
  toolbarLogoFull: {
    height: "100%",
    cursor: "pointer",
    outline: "none",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  toolbarLogoIcon: {
    height: "100%",
    cursor: "pointer",
    outline: "none",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  accountMenuIcon: { color: theme.palette.primary.main },
}));

/**
 * Create a custom account button.
 *
 * With a CSS style named "ylp-button-account"
 */
const AccountButton = withStyles(
  (/* theme: Theme */) => ({
    root: {
      display: "flex",
      flexDirection: "row",
      color: "var(--mdc-theme-on-surface, black)",
      textTransform: "none",
      fontWeight: "bold",
    },
  }),
  { name: "ylp-button-account" }
)(Button);

function HeaderBar(props: HeaderProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = toolbarStyles(props);
  const auth = useAuth();
  const history = useHistory();
  const notificationHook = useNotification();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);

  const handleOpenAccountMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onLogoClick = (): void => {
    if (props.headerLogoURL) {
      history.push(props.headerLogoURL);
    } else {
      history.push(auth.user?.getHomePage() ?? "/");
    }
  };

  const handleCloseAccountMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProfilePage = () => {
    setAnchorEl(null);
    history.push(auth.user?.getHomePage("/preferences") ?? "/");
  };

  const handleOpenNotifications = () => {
    setAnchorEl(null);
    history.push(auth.user?.getHomePage("/notifications") ?? "/");
  };

  const handleOpenSupport = () => {
    window.open(config.SUPPORT_WEB_ADDRESS, "_blank");
    setAnchorEl(null);
    metrics.send("support", "click_customer_service");
  };

  const handleLogout = () => {
    setAnchorEl(null);
    auth.logout().catch((reason) => console.error("logout", reason));
  };

  if (_.isObject(props.actions)) {
    // We must refresh this callback at every render
    // or we end up calling a function from a previous render
    props.actions.current = {
      closeMenu: handleCloseAccountMenu,
    };
  }

  let accountMenu = null;
  if (auth.isLoggedIn) {
    const user = auth.user as User;
    const name = t("user-name", { firstName: user.getFirstName(), lastName: user.getLastName() });
    const { menuItems } = props;

    accountMenu = (
      <React.Fragment>
        <AccountButton
          id="button-user-account-menu-appbar"
          aria-label={t("aria-current-user-account")}
          aria-controls="menu-user-account-appbar"
          aria-haspopup="true"
          endIcon={<ArrowDropDown className={classes.accountMenuIcon} />}
          onClick={handleOpenAccountMenu}>
          {name}
        </AccountButton>
        <Menu
          id="menu-user-account-appbar"
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted={false}
          open={userMenuOpen}
          onClose={handleCloseAccountMenu}>
          {menuItems}
          {_.isObject(menuItems) ? <hr id="menu-user-account-separator" /> : null}
          <MenuItem id="menu-user-account-profile" onClick={handleOpenProfilePage} disabled={history.location.pathname.endsWith("/preferences")}>
            {t("account-preferences")}
          </MenuItem>
          <MenuItem id="menu-user-account-support" onClick={handleOpenSupport}>
            {t("menu-contact-support")}
          </MenuItem>
          <MenuItem id="menu-user-account-logout" onClick={handleLogout}>
            {t("menu-logout")}
          </MenuItem>
        </Menu>
      </React.Fragment>
    );
  }

  const numInvitations = notificationHook.receivedInvitations.length;
  return (
    <AppBar id="primary-appbar" position="relative">
      <Toolbar id="primary-toolbar" className={classes.toolBar}>
        <div id="primary-toolbar-left" className={classes.toolbarLeft}>
          <input id="branding-logo-full" type="image" className={classes.toolbarLogoFull} alt={t("alt-img-logo")} src={brandingLogoFull} onClick={onLogoClick} />
          <input id="branding-logo-icon" type="image" className={classes.toolbarLogoIcon} alt={t("alt-img-logo")} src={brandingLogoIcon} onClick={onLogoClick} />
        </div>
        {
          _.isNil(props.children) ? null : (
            <div id="primary-toolbar-middle" className={classes.toolbarMiddle}>
              {props.children}
            </div>
          )
        }
        <div id="primary-toolbar-right" className={classes.toolbarRight}>
          <IconButton id="primary-toolbar-button-notifications" onClick={handleOpenNotifications}>
            <Badge id="primary-toolbar-button-notifications-badge" data-num-invites={numInvitations} color="error" badgeContent={numInvitations}>
              <NotificationsIcon id="primary-toolbar-button-notifications-badgeicon" />
            </Badge>
          </IconButton>
          {accountMenu}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderBar;
