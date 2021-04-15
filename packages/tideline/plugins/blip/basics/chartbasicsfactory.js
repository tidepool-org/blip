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

import _ from "lodash";
import bows from "bows";
import i18next from "i18next";
import PropTypes from "prop-types";
import React from "react";
import sizeMe from "react-sizeme";

import "./less/basics.less";

import basicsState from "./logic/state";
import basicsActions from "./logic/actions";
import dataMungerMkr from "./logic/datamunger";
import { SECTION_TYPE_UNDECLARED } from "./logic/constants";

import Section from "./components/DashboardSection";
import togglableState from "./TogglableState";

class BasicsChartNoSize extends React.Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
    onSelectDay: PropTypes.func.isRequired,
    patient: PropTypes.object.isRequired,
    tidelineData: PropTypes.object.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    size: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.log = bows("BasicsChart");
    this.state = {
      basicsData: null,
      data: null,
      sections: null,
    };
  }

  componentDidMount() {
    this.log.debug("Mounting...");

    const { tidelineData, bgClasses, bgUnits, patient, permsOfLoggedInUser } = this.props;
    const basicsData = _.cloneDeep(tidelineData.basicsData);

    const dataMunger = dataMungerMkr(bgClasses, bgUnits);
    const latestPump = dataMunger.getLatestPumpUploaded(this.props.tidelineData);
    basicsData.sections = basicsState(latestPump, tidelineData.latestPumpManufacturer).sections;

    dataMunger.reduceByDay(basicsData);

    dataMunger.processInfusionSiteHistory(basicsData, latestPump, patient, permsOfLoggedInUser);

    this.adjustSectionsBasedOnAvailableData(basicsData);
    basicsActions.bindApp(this);
    this.setState({ basicsData, sections: basicsData.sections, data: basicsData.data });
  }

  componentWillUnmount() {
    this.log.debug("Unmounting...");
    basicsActions.bindApp(null);
  }

  adjustSectionsBasedOnAvailableData(basicsData) {
    const insulinDataAvailable = this.insulinDataAvailable(basicsData);
    const noPumpDataMessage = i18next.t("This section requires data from an insulin pump, so there's nothing to display.");

    if (basicsData.sections.siteChanges.type !== SECTION_TYPE_UNDECLARED) {
      if (!this.hasSectionData(basicsData, basicsData.sections.siteChanges.type)) {
        basicsData.sections.siteChanges.active = false;
        basicsData.sections.siteChanges.message = noPumpDataMessage;
        basicsData.sections.siteChanges.settingsTogglable = togglableState.off;
        if (!insulinDataAvailable) {
          basicsData.sections.siteChanges.noDataMessage = null;
        }
      }
    }

    if (!this.hasSectionData(basicsData, basicsData.sections.boluses.type)) {
      basicsData.sections.boluses.active = false;
      basicsData.sections.boluses.message = noPumpDataMessage;
    }

    if (!this.hasSectionData(basicsData, basicsData.sections.basals.type)) {
      basicsData.sections.basals.active = false;
      basicsData.sections.basals.message = noPumpDataMessage;
    }

    if (!this.automatedBasalEventsAvailable(basicsData)) {
      const basalSection = _.find(basicsData.sections, { type: "basal" });

      basalSection.selectorOptions.rows.forEach((row) => {
        // eslint-disable-next-line lodash/prefer-filter
        _.forEach(row, (option) => {
          if (option.key === "automatedStop") {
            option.active = false;
          }
        });
      });
    }
  }

  insulinDataAvailable(basicsData) {
    const { basal, bolus, wizard } = _.get(basicsData, "data", {});
    if (_.get(basal, "data.length", false) || _.get(bolus, "data.length", false) || _.get(wizard, "data.length", false)) {
      return true;
    }

    return false;
  }

  automatedBasalEventsAvailable(basicsData) {
    return _.get(basicsData, "data.basal.summary.automatedStop.count", 0) > 0;
  }

  hasSectionData(basicsData, section) {
    // check that section has data within range of current view
    const data = _.get(basicsData, `data[${section}].data`);
    if (_.isEmpty(data)) {
      return false;
    }
    return _.some(data, (datum) => {
      return datum.normalTime >= basicsData.dateRange[0];
    });
  }

  availableDeviceData() {
    const { basicsData } = this.state;
    const deviceTypes = [];

    if (this.hasSectionData(basicsData, "cbg")) {
      deviceTypes.push("CGM");
    }
    if (this.hasSectionData(basicsData, "smbg")) {
      deviceTypes.push("BGM");
    }
    if (this.insulinDataAvailable(basicsData)) {
      deviceTypes.push("Pump");
    }

    return deviceTypes;
  }

  render() {
    const { basicsData } = this.state;
    if (basicsData === null) {
      return null;
    }

    return <div id="chart-basics-factory">{this.renderColumn("right")}</div>;
  }

  renderColumn(columnSide) {
    const { timePrefs, bgClasses, bgUnits } = this.props;
    const { basicsData, data, sections: basicsSections } = this.state;
    const tz = timePrefs.timezoneName;
    const sections = [];
    for (const key in basicsSections) {
      const section = _.cloneDeep(basicsSections[key]);
      section.name = key;
      sections.push(section);
    }
    const column = _.sortBy(_.filter(sections, { column: columnSide }), "index");

    return _.map(column, (section) => {
      return (
        <Section
          key={section.name}
          bgClasses={bgClasses}
          bgUnits={bgUnits}
          chart={section.chart}
          chartWidth={this.props.size.width}
          data={data}
          days={basicsData.days}
          labels={section.labels}
          name={section.name}
          onSelectDay={this.props.onSelectDay}
          open={section.open}
          togglable={section.togglable}
          section={section}
          title={section.title}
          settingsTogglable={section.settingsTogglable}
          timezone={tz}
          trackMetric={this.props.trackMetric}
        />
      );
    });
  }
}

export { BasicsChartNoSize };
export default sizeMe({ monitorHeight: true })(BasicsChartNoSize);
