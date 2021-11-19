/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import i18next from "i18next";

import Link from "@material-ui/core/Link";
import Timeline from "@material-ui/icons/Timeline";
import StayCurrentPortrait from "@material-ui/icons/StayCurrentPortrait";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

import personUtils from "../../core/personutils";

const t = i18next.t.bind(i18next);

class TidelineHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isDialogOpen: false };
  }

  static propTypes = {
    children: PropTypes.node,
    patient: PropTypes.object,
    chartType: PropTypes.string.isRequired,
    prefixURL: PropTypes.string,
    inTransition: PropTypes.bool,
    atMostRecent: PropTypes.bool,
    loading: PropTypes.bool,
    iconBack: PropTypes.string,
    iconNext: PropTypes.string,
    iconMostRecent: PropTypes.string,
    trackMetric: PropTypes.func.isRequired,
    canPrint: PropTypes.bool,
    permsOfLoggedInUser: PropTypes.object,
    onClickBack: PropTypes.func,
    onClickBasics: PropTypes.func,
    onClickTrends: PropTypes.func,
    onClickMostRecent: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickOneDay: PropTypes.func,
    onClickSettings: PropTypes.func,
    onClickPrint: PropTypes.func,
    profileDialog: PropTypes.func,
  };

  static defaultProps = {
    inTransition: false,
    atMostRecent: false,
    loading: false,
    canPrint: false,
    profileDialog: null,
    prefixURL: "",
  };

  renderStandard() {
    const { canPrint, chartType, atMostRecent, inTransition, loading, prefixURL } = this.props;
    const { profileDialog: ProfileDialog, children } = this.props;

    const printViews = ["basics", "daily", "bgLog", "settings"];
    const showPrintLink = _.includes(printViews, chartType);
    const showHome = _.has(this.props.permsOfLoggedInUser, "view");
    const homeValue = personUtils.fullName(this.props.patient);

    const home = cx({
      "js-home": true,
      "patient-data-subnav-hidden": !showHome,
    });

    const basicsLinkClass = cx({
      "js-basics": true,
      "patient-data-subnav-active": chartType === "basics",
      "patient-data-subnav-hidden": chartType === "no-data",
    });

    const dayLinkClass = cx({
      "js-daily": true,
      "patient-data-subnav-active": chartType === "daily",
      "patient-data-subnav-hidden": chartType === "no-data",
    });

    const trendsLinkClass = cx({
      "js-trends": true,
      "patient-data-subnav-active": chartType === "trends",
      "patient-data-subnav-hidden": chartType === "no-data",
    });

    const mostRecentDisabled = atMostRecent || inTransition || loading;
    const mostRecentClass = cx({
      "js-most-recent": true,
      "patient-data-icon": true,
      "patient-data-subnav-active": !mostRecentDisabled,
      "patient-data-subnav-hidden": chartType === "no-data",
    });

    const backDisabled = inTransition || loading;
    const backClass = cx({
      "js-back": true,
      "patient-data-icon": true,
      "patient-data-subnav-active": !backDisabled,
      "patient-data-subnav-hidden": chartType === "settings" || chartType === "no-data",
    });

    const nextDisabled = mostRecentDisabled;
    const nextClass = cx({
      "js-next": true,
      "patient-data-icon": true,
      "patient-data-subnav-active": !nextDisabled,
      "patient-data-subnav-hidden": chartType === "settings" || chartType === "no-data",
    });

    const settingsLinkClass = cx({
      "patient-data-subnav-button": true,
      "js-settings": true,
      "patient-data-subnav-active": chartType === "settings",
      "patient-data-subnav-hidden": chartType === "no-data",
    });

    let printLink = null;
    if (canPrint && showPrintLink) {
      const printLinkClass = cx({
        "patient-data-subnav-button": true,
        "printview-print-icon": true,
      });

      printLink = (
        <button className={printLinkClass} onClick={this.onClickPrint}>
          <Timeline className="print-icon" />
          {t("Print")}
        </button>
      );
    }

    /** @type {(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void} */
    const handleShowPatientProfile = (/* e */) => {
      this.props.trackMetric("data_visualization", "display_patient_profile");
      this.setState({ isDialogOpen: true });
    };

    const handleDialogClose = () => {
      this.setState({ isDialogOpen: false });
    };

    let profileDialog = null;
    if (_.isFunction(ProfileDialog)) {
      profileDialog = (
        <div className="app-no-print patient-data-subnav-left">
          <AccountCircleIcon className={home} />
          <Link className={home} onClick={handleShowPatientProfile} title={t("Profile")}>
            {homeValue}
          </Link>
          <ProfileDialog user={this.props.patient} isOpen={this.state.isDialogOpen} handleClose={handleDialogClose} />
        </div>
      );
    }

    return (
      <div className="grid patient-data-subnav">
        {profileDialog}
        <div className="app-no-print patient-data-subnav-left">
          <a href={`${prefixURL}/overview`} className={basicsLinkClass} onClick={this.props.onClickBasics}>
            {t("Basics")}
          </a>
          <a href={`${prefixURL}/daily`} className={dayLinkClass} onClick={this.props.onClickOneDay}>
            {t("Daily")}
          </a>
          <a href={`${prefixURL}/trends`} className={trendsLinkClass} onClick={this.props.onClickTrends}>
            {t("Trends")}
          </a>
        </div>
        <div className="patient-data-subnav-center" id="tidelineLabel">
          {this.renderNavButton(backClass, this.props.onClickBack, this.props.iconBack, backDisabled)}
          {children}
          {this.renderNavButton(nextClass, this.props.onClickNext, this.props.iconNext, nextDisabled)}
          {this.renderNavButton(mostRecentClass, this.props.onClickMostRecent, this.props.iconMostRecent, mostRecentDisabled)}
        </div>
        <div className="app-no-print patient-data-subnav-right">
          {printLink}
          <button className={settingsLinkClass} onClick={this.props.onClickSettings}>
            <StayCurrentPortrait />
            {t("Device settings")}
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">{this.renderStandard()}</div>
      </div>
    );
  }

  /**
   * Helper function for rendering the various navigation buttons in the header.
   * It accounts for the transition state and disables the button if it is currently processing.
   *
   * @param {string} buttonClass
   * @param {(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void} clickAction
   * @param {string} icon
   * @param {boolean} disabled true to disable the button
   *
   * @return {JSX.Element}
   */
  renderNavButton(buttonClass, clickAction, icon, disabled) {
    const nullAction = function (e) {
      if (e) {
        e.preventDefault();
      }
    };
    if (this.props.inTransition) {
      return (
        <button type="button" className={buttonClass} onClick={nullAction} disabled={disabled}>
          <i className={icon} />
        </button>
      );
    }
    return (
      <button type="button" className={buttonClass} onClick={clickAction} disabled={disabled}>
        <i className={icon} />
      </button>
    );
  }

  /**
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event The DOM/React event
   */
  onClickPrint = (event) => {
    event.preventDefault();
    this.props.onClickPrint();
  };
}

export default TidelineHeader;
