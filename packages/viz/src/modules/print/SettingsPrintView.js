/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
import i18next from "i18next";
import PrintView from "./PrintView";

import {
  getDeviceMeta,
} from "../../utils/settings/data";

import * as dblData from "../../utils/settings/diabeloopData";

const t = i18next.t.bind(i18next);

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.source = _.get(data, "source", "").toLowerCase();

    // Use the pumpSettings timezone if available
    const timePrefs = _.isString(data.timezone) ? {
      timezoneAware: true,
      timezoneName: data.timezone,
    } : opts.timePrefs;
    this.timePrefs = timePrefs;
    this.deviceMeta = getDeviceMeta(data, timePrefs);

    this.doc.addPage();
  }

  newPage() {
    super.newPage(`${t("Uploaded on")} ${this.deviceMeta.uploaded}`);
  }

  render() {
    this.renderDeviceInfo();
    this.renderPumpInfo();
    this.renderCgmInfo();
    this.renderDeviceParameters();
    this.resetText();
  }

  /** Render the device information table */
  renderDeviceInfo() {
    const device = _.get(this.data, "payload.device", null);

    if (device) {
      const deviceTableData = dblData.getDeviceInfosData(device, this.data.timezone, this.data.originalDate);
      const deviceTableDataWidth = (this.chartArea.width * 0.6);
      deviceTableData.columns[0].width = (deviceTableDataWidth * 0.5);
      deviceTableData.columns[1].width = (deviceTableDataWidth * 0.5);

      this.renderSettingsSection(deviceTableData, deviceTableDataWidth);
    } else {
      this.renderSectionHeading(t("No diabeloop device informations available"));
    }
  }

  /** Render the pump parameters table */
  renderPumpInfo() {
    const pump = _.get(this.data, "payload.pump", null);

    if (pump) {
      const pumpData = dblData.getPumpParametersData(pump, this.data.timezone, this.data.originalDate);
      const customWidth = (this.chartArea.width * 0.6);
      pumpData.columns[0].width = (customWidth * 0.5);
      pumpData.columns[1].width = (customWidth * 0.5);

      this.renderSettingsSection(pumpData, customWidth);
    }
  }

  /** Render the CGM parameters table */
  renderCgmInfo() {
    const cgm = _.get(this.data, "payload.cgm", null);

    if (cgm) {
      const cgmData = dblData.getCGMParametersData(cgm, this.data.timezone, this.data.originalDate);
      const customWidth = (this.chartArea.width * 0.6);
      cgmData.columns[0].width = (customWidth * 0.5);
      cgmData.columns[1].width = (customWidth * 0.5);

      this.renderSettingsSection(cgmData, customWidth);
    }
  }

  /** Render the device parameters tables */
  renderDeviceParameters() {
    const parameters = _.get(this.data, "payload.parameters", null);
    if (parameters) {
      const parametersByLevel = dblData.getParametersByLevel(parameters);
      // Display the parameters date only when originalDate is set, like the others table. But the date is the good one this time
      const originalDate = !this.data.originalDate ? undefined : this.data.normalTime;
      parametersByLevel.forEach((params, level) => {
        const tableData = dblData.getDeviceParametersData(params, { level, width: this.chartArea.width }, this.data.timezone, originalDate);
        this.renderSettingsSection(tableData, this.chartArea.width, { zebra: true, showHeaders: true });
      });
    } else {
      this.renderSectionHeading(t("No diabeloop device parameters available"));
    }
  }

  /** @private */
  renderSettingsSection(tableData, width, { zebra, showHeaders } = false) {
    this.renderTableHeading(tableData.heading, {
      columnDefaults: {
        fill: {
          color: this.tableSettings.colors.zebraHeader,
          opacity: 1,
        },
        width
      },
    });

    this.renderTable(tableData.columns, tableData.rows, {
      columnDefaults: {
        zebra : zebra ?? false,
        headerFill: false,
      },
      flexColumn: "start",
      showHeaders : showHeaders ?? false,
    });
  }
}

export default SettingsPrintView;
