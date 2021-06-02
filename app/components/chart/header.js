import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { translate } from 'react-i18next';
import DateRangeRoundedIcon from '@material-ui/icons/DateRangeRounded';
import PrintRoundedIcon from '@material-ui/icons/PrintRounded';

import Icon from '../elements/Icon';

const Header = translate()(class Header extends Component {
  static propTypes = {
    patient: PropTypes.object,
    title: PropTypes.string.isRequired,
    chartType: PropTypes.string.isRequired,
    inTransition: PropTypes.bool.isRequired,
    atMostRecent: PropTypes.bool.isRequired,
    iconBack: PropTypes.string,
    iconNext: PropTypes.string,
    iconMostRecent: PropTypes.string,
    onClickBack: PropTypes.func,
    onClickBasics: PropTypes.func,
    onClickChartDates: PropTypes.func,
    onClickTrends: PropTypes.func,
    onClickMostRecent: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickOneDay: PropTypes.func,
    onClickBgLog: PropTypes.func,
    onClickSettings: PropTypes.func,
    onClickPrint: PropTypes.func,
  };

  static defaultProps = {
    onClickChartDates: _.noop,
  };

  renderStandard = () => {
    const { t } = this.props;

    const printViews = ['basics', 'daily', 'bgLog', 'settings'];
    const showPrintLink = _.includes(printViews, this.props.chartType);

    const basicsLinkClass = cx({
      'js-basics': true,
      'patient-data-subnav-active': this.props.chartType === 'basics',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const dayLinkClass = cx({
      'js-daily': true,
      'patient-data-subnav-active': this.props.chartType === 'daily',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const trendsLinkClass = cx({
      'js-trends': true,
      'patient-data-subnav-active': this.props.chartType === 'trends',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const bgLogLinkClass = cx({
      'js-bgLog': true,
      'patient-data-subnav-active': this.props.chartType === 'bgLog',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const dateLinkClass = cx({
      'js-date': true,
      'patient-data-subnav-text' : this.props.chartType === 'basics' ||
        this.props.chartType === 'daily' ||
        this.props.chartType === 'bgLog' ||
        this.props.chartType === 'trends',
      'patient-data-subnav-dates-basics': this.props.chartType === 'basics',
      'patient-data-subnav-dates-daily': this.props.chartType === 'daily',
      'patient-data-subnav-dates-bgLog': this.props.chartType === 'bgLog',
      'patient-data-subnav-dates-trends': this.props.chartType === 'trends',
    });

    const mostRecentClass = cx({
      'js-most-recent': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const backClass = cx({
      'js-back': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data',
    });

    const nextClass = cx({
      'js-next': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data',
    });

    const settingsLinkClass = cx({
      'js-settings': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': this.props.chartType === 'settings',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const printLinkClass = cx({
      'js-print-settings': this.props.chartType === 'settings',
      'printview-print-icon': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': false,
      'patient-data-subnav-hidden': !showPrintLink,
    });

    return (
      <div className="grid patient-data-subnav">
        <div className="app-no-print patient-data-subnav-left">
            <a href="" className={basicsLinkClass} onClick={this.props.onClickBasics}>{t('Basics')}</a>
            <a href="" className={dayLinkClass} onClick={this.props.onClickOneDay}>{t('Daily')}</a>
            <a href="" className={bgLogLinkClass} onClick={this.props.onClickBgLog}>{t('BG Log')}</a>
            <a href="" className={trendsLinkClass} onClick={this.props.onClickTrends}>{t('Trends')}</a>
        </div>
        <div className="patient-data-subnav-center" id="tidelineLabel">
          {this.renderNavButton(backClass, this.props.onClickBack, this.props.iconBack)}
          <div className={dateLinkClass}>
            {this.props.title}
            {this.props.chartType === 'basics' && (
              <Icon
                variant="default"
                sx={{
                  ml: 2,
                  mt: -1,
                  color: 'white',
                  outline: 'none',
                  '&:hover': { color: 'grays.6' },
                }}
                label="Choose custom date range"
                icon={DateRangeRoundedIcon}
                onClick={this.props.onClickChartDates}
              />
            )}
          </div>
          {this.renderNavButton(nextClass, this.props.onClickNext, this.props.iconNext)}
          {this.renderNavButton(mostRecentClass, this.props.onClickMostRecent, this.props.iconMostRecent)}
        </div>
        <div className="app-no-print patient-data-subnav-right">
          <a href="" className={printLinkClass} onClick={this.props.onClickPrint}>
            <Icon
              className="icon"
              variant="default"
              sx={{
                mr: 1,
                mt: '-2px',
                color: 'white',
                outline: 'none',
              }}
              label="Print PDF report"
              icon={PrintRoundedIcon}
            />
            {t('Print')}
          </a>
          <a href="" className={settingsLinkClass} onClick={this.props.onClickSettings}>{t('Device settings')}</a>
        </div>
      </div>
    );
  };

  printTitle = () => {
    const { t } = this.props;
    switch (this.props.chartType) {
      case 'basics':
        return t('Basics');
      case 'daily':
        return t('Daily');
      case 'bgLog':
        return t('BG Log');
      case 'trends':
        return t('Trends');
      case 'settings':
        return t('Pump Settings');
      case 'no-data':
      default:
        return '';
    }
  };

  render = () => {
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          {this.renderStandard()}
        </div>
      </div>
    );
  };

  /**
   * Helper function for rendering the various navigation buttons in the header.
   * It accounts for the transition state and disables the button if it is currently processing.
   *
   * @param  {String} buttonClass
   * @param  {Function} clickAction
   * @param  {String} icon
   *
   * @return {ReactElement}
   */
  renderNavButton = (buttonClass, clickAction, icon) => {
    const nullAction = function(e) {
      if (e) {
        e.preventDefault();
      }
    };
    if (this.props.inTransition) {
      return (<a href="" className={buttonClass} onClick={nullAction}><i className={icon}/></a>);
    } else {
      return (<a href="" className={buttonClass} onClick={clickAction}><i className={icon}/></a>);
    }
  };
});

module.exports = Header;
