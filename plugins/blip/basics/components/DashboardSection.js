/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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

var _ = require('lodash');
var bows = require('bows');
var cx = require('classnames');
var PropTypes = require('prop-types');
var React = require('react');

var debug = bows('Section');

var basicsActions = require('../logic/actions');
var NoDataContainer = require('./NoDataContainer');

var togglableState = require('../TogglableState');

class DashboardSection extends React.Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    chartWidth: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    days: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    onSelectDay: PropTypes.func.isRequired,
    togglable: PropTypes.oneOf([
      togglableState.open,
      togglableState.closed,
      togglableState.off,
    ]).isRequired,
    section: PropTypes.object.isRequired,
    timezone: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func ]).isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  render() {
    var dataDisplay;
    var section = this.props.section;
    if (section.column === 'right') {
      if (section.active) {
        dataDisplay = (
          <section.container
            bgClasses={this.props.bgClasses}
            bgUnits={this.props.bgUnits}
            chart={section.chart}
            chartWidth={this.props.chartWidth}
            data={this.props.data}
            days={this.props.days}
            hasHover={section.hasHover}
            hoverDisplay={section.hoverDisplay}
            onSelectDay={this.props.onSelectDay}
            sectionId={section.id}
            selector={section.selector}
            selectorOptions={section.selectorOptions}
            selectorMetaData={section.selectorMetaData}
            settingsTogglable={this.props.settingsTogglable}
            timezone={this.props.timezone}
            type={section.type}
            trackMetric={this.props.trackMetric}
            updateBasicsSettings={this.props.updateBasicsSettings}
            title={section.title} />
        );
      }
      else {
        dataDisplay = (
          <NoDataContainer message={section.message} moreInfo={section.noDataMessage || null} />
        );
      }
    }
    else {
      dataDisplay = (
        <section.container
          bgClasses={this.props.bgClasses}
          bgUnits={this.props.bgUnits}
          chart={section.chart}
          data={this.props.data}
          days={this.props.days}
          labels={section.labels || {}}
          title={this.props.title} />
      );
    }

    var settingsToggle;
    if (this.props.settingsTogglable !== togglableState.off) {
      settingsToggle = (
        <i className="icon-settings icon--toggle" onClick={this.handleToggleSettings}/>
      );
    }

    var iconClass = cx({
      'icon-down': this.props.togglable === togglableState.open,
      'icon-right': this.props.togglable === togglableState.closed
    });

    var containerClass = cx({
      'DashboardSection-container': true
    });

    var titleContainer;
    if (this.props.title && typeof this.props.title === 'function') {
      titleContainer = this.props.title({
        data: this.props.data,
        iconClass: iconClass,
        sectionName: this.props.name,
        trackMetric: this.props.trackMetric
      });
    } else if (this.props.title) {
      var headerClasses = cx({
        'SectionHeader--nodata': section.noData,
        'selectable': this.props.togglable !== togglableState.off
      });
      titleContainer = (
        <h3 className={headerClasses} onClick={this.handleToggleSection}>{this.props.title}
          <i className={iconClass}/>
          {settingsToggle}
        </h3>
      );
    }

    return (
      <div className='DashboardSection'>
        {titleContainer}
        <div className={containerClass} ref='container'>
          <div className='DashboardSection-content' ref='content'>
            {this.props.togglable !== togglableState.closed ? dataDisplay : null}
          </div>
        </div>
      </div>
    );
  }

  handleToggleSection = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (this.props.togglable !== togglableState.off) {
      basicsActions.toggleSection(this.props.name, this.props.trackMetric);
    }
  };

  handleToggleSettings = (e) => {
    if (e) {
      e.preventDefault();
    }
    basicsActions.toggleSectionSettings(this.props.name, this.props.trackMetric);
  };
}

module.exports = DashboardSection;
