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

import _ from 'lodash';
import i18next from 'i18next';
import PrintView from './PrintView';

import {
  deviceName,
  getDeviceMeta,
  startTimeAndValue,
} from '../../utils/settings/data';

import {
  basal,
  bolusTitle,
  ratio,
  sensitivity,
  target,
} from '../../utils/settings/nonTandemData';

import * as dblData from '../../utils/settings/diabeloopData';

import {
  basalSchedules as profileSchedules,
  basal as tandemBasal,
} from '../../utils/settings/tandemData';

const t = i18next.t.bind(i18next);

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.source = _.get(data, 'source', '').toLowerCase();
    this.manufacturer = this.source === 'carelink' ? 'medtronic' : this.source;

    this.deviceMeta = getDeviceMeta(data, opts.timePrefs);

    this.doc.addPage();
  }

  newPage() {
    super.newPage(`Uploaded on: ${this.deviceMeta.uploaded}`);
  }

  render() {
    this.renderDeviceMeta();

    switch (this.manufacturer) {
      case 'tandem':
        this.renderTandemProfiles();
        break;
      case 'diabeloop':
        this.renderDiabeloopProfiles();
        break;
      default:
        this.renderBasalSchedules();
        this.renderWizardSettings();
        break;
    }
  }

  renderDeviceMeta() {
    const device = deviceName(this.manufacturer) || t('Unknown');
    this.doc
      .font(this.boldFont)
      .fontSize(this.defaultFontSize)
      .text(device, { continued: true })
      .font(this.font)
      .text(` › ${t('Serial Number')}: ${this.deviceMeta.serial}`)
      .moveDown();

    this.resetText();
    this.doc.moveDown();
  }

  renderTandemProfiles() {
    this.renderSectionHeading(t('Profile Settings'));

    const basalSchedules = profileSchedules(this.data);

    const sortedSchedules = _.orderBy(basalSchedules,
      [
        schedule => (schedule.name === this.data.activeSchedule ? 1 : 0),
        'position',
      ],
      ['desc', 'asc']
    );

    _.each(sortedSchedules, schedule => {
      const profile = tandemBasal(schedule, this.data, this.bgUnits);

      const heading = {
        text: profile.title.main,
        subText: profile.title.secondary,
      };

      this.renderTableHeading(heading, {
        columnDefaults: {
          fill: {
            color: this.tableSettings.colors.zebraHeader,
            opacity: 1,
          },
          width: this.chartArea.width,
        },
      });

      const tableColumns = _.map(profile.columns, (column, index) => {
        const isFirst = index === 0;

        const widths = {
          rate: 105,
          bgTarget: 105,
          carbRatio: 105,
          insulinSensitivity: 155,
        };

        const fills = {
          grey: {
            color: this.tableSettings.colors.zebraHeader,
            opacity: 1,
          },
          basal: {
            color: this.colors.basal,
            opacity: 0.15,
          },
        };

        const headerFills = {
          start: fills.grey,
          rate: fills.basal,
          bgTarget: fills.basal,
          carbRatio: fills.basal,
          insulinSensitivity: fills.basal,
        };

        const label = _.isPlainObject(column.label)
          ? {
            text: column.label.main,
            subText: column.label.secondary,
          } : {
            text: column.label,
          };

        const columnDef = {
          id: column.key,
          header: label,
          align: isFirst ? 'left' : 'center',
          headerFill: headerFills[column.key],
          cache: false,
          headerRenderer: this.renderCustomTextCell,
        };

        if (!isFirst) {
          columnDef.width = widths[column.key];

          if (columnDef.id === 'rate') {
            columnDef.renderer = this.renderCustomTextCell;
          }
        } else {
          columnDef.cache = false;
          columnDef.renderer = this.renderCustomTextCell;
        }

        return columnDef;
      });

      const rows = _.map(profile.rows, (row, index) => {
        const isLast = index === profile.rows.length - 1;

        if (isLast) {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          row._bold = true;
        }

        return row;
      });

      this.renderTable(tableColumns, rows, {
        columnDefaults: {
          zebra: true,
          headerFill: true,
        },
        flexColumn: 'start',
      });
    });
  }

  renderDiabeloopProfiles() {
    // Device informations:
    const device = _.get(this.data, 'payload.device', null);

    // Device parameters:
    const parameters = _.get(this.data, 'payload.parameters', null);

    // Render the device informations table:
    if (device !== null) {
      const deviceTableData = dblData.getDeviceInfosData(device);

      const deviceTableDataWidth = (this.chartArea.width * 0.6);

      this.renderTableHeading(deviceTableData.heading, {
        columnDefaults: {
          fill: {
            color: this.tableSettings.colors.zebraHeader,
            opacity: 1,
          },
          width: deviceTableDataWidth,
        },
      });

      deviceTableData.columns[0].width = (deviceTableDataWidth * 0.4);
      deviceTableData.columns[1].width = (deviceTableDataWidth * 0.6);

      this.renderTable(deviceTableData.columns, deviceTableData.rows, {
        columnDefaults: {
          zebra: false,
          headerFill: false,
          headerBorder: '',
        },
        flexColumn: 'start',
        showHeaders: false,
      });
    } else {
      this.renderSectionHeading(t('No diabeloop device informations available'));
    }

    // Render the device parameters tables:
    if (parameters !== null) {
      const parametersByLevel = dblData.getParametersByLevel(parameters);

      // eslint-disable-next-line lodash/prefer-lodash-method
      parametersByLevel.forEach((params, level) => {
        const tableData = dblData.getDeviceParametersData(params,
          { level, width: this.chartArea.width });

        this.renderTableHeading(tableData.heading, {
          columnDefaults: {
            fill: {
              color: this.tableSettings.colors.zebraHeader,
              opacity: 1,
            },
            width: this.chartArea.width,
          },
        });

        this.renderTable(tableData.columns, tableData.rows, {
          columnDefaults: {
            zebra: true,
            headerFill: false,
          },
          flexColumn: 'start',
          showHeaders: true,
        });
      });
    } else {
      this.renderSectionHeading(t('No diabeloop device parameters available'));
    }

    this.resetText();
  }

  renderBasalSchedules() {
    this.renderSectionHeading(t('Basal Rates'));

    this.setLayoutColumns({
      width: this.chartArea.width,
      count: 3,
      gutter: 15,
    });

    const {
      activeSchedule,
      basalSchedules,
      lastManualBasalSchedule,
    } = this.data;

    const columnWidth = this.getActiveColumnWidth();

    const tableColumns = _.map(startTimeAndValue('rate'), (column, index) => {
      const isValue = index === 1;
      const valueWidth = 50;

      return {
        id: column.key,
        header: column.label,
        align: isValue ? 'right' : 'left',
        width: isValue ? valueWidth : columnWidth - valueWidth,
      };
    });

    // We only show automated basal schedules if active at upload
    const schedules = _.reject(
      _.map(
        basalSchedules,
        (schedule, index) => basal(index, this.data, this.manufacturer)
      ),
      schedule => (schedule.isAutomated && schedule.scheduleName !== activeSchedule)
    );

    const sortedSchedules = _.orderBy(
      schedules,
      [
        schedule => (schedule.isAutomated ? 1 : 0),
        schedule => (schedule.scheduleName === lastManualBasalSchedule ? 1 : 0),
        schedule => (schedule.scheduleName === activeSchedule ? 1 : 0),
        schedule => schedule.rows.length,
        'name',
      ],
      ['desc', 'desc', 'desc', 'desc', 'asc']
    );

    const automatedScheduleShowing = _.some(sortedSchedules, { isAutomated: true });

    _.each(sortedSchedules, (schedule, index) => {
      const columnIndex = automatedScheduleShowing && index > 0 ? index - 1 : index;
      const activeColumn = columnIndex < this.layoutColumns.count
        ? columnIndex % this.layoutColumns.count
        : this.getShortestLayoutColumn();

      this.goToLayoutColumnPosition(activeColumn);

      const scheduleLabel = _.get(schedule, 'title', {});

      const heading = {
        text: scheduleLabel.main,
        subText: schedule.isAutomated ? scheduleLabel.secondary.toLowerCase() : scheduleLabel.units,
        note: schedule.isAutomated ? null : scheduleLabel.secondary,
      };

      this.renderTableHeading(heading, {
        columnDefaults: {
          fill: {
            color: schedule.isAutomated ? this.colors.basalAutomated : this.colors.basal,
            opacity: 0.15,
          },
          width: columnWidth,
        },
        bottomMargin: schedule.isAutomated ? 15 : 0,
      });

      this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);

      if (!schedule.isAutomated) {
        const rows = _.map(schedule.rows, (row, rowIndex) => {
          const isLast = rowIndex === schedule.rows.length - 1;

          if (isLast) {
            // eslint-disable-next-line no-underscore-dangle, no-param-reassign
            row._bold = true;
          }

          return row;
        });

        this.renderTable(tableColumns, rows, {
          columnDefaults: {
            zebra: true,
            headerFill: true,
          },
          bottomMargin: 15,
        });

        this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);
      }
    });

    this.resetText();
  }

  renderWizardSettings() {
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = _.get(this.layoutColumns, ['columns', this.getLongestLayoutColumn(), 'y']);
    this.doc.moveDown();

    this.renderSectionHeading(bolusTitle(this.manufacturer));

    this.setLayoutColumns({
      width: this.chartArea.width,
      count: 3,
      gutter: 15,
    });

    this.renderSensitivity();

    this.renderTarget();

    this.renderRatio();

    this.resetText();
  }

  renderWizardSetting(settings, units = '') {
    this.goToLayoutColumnPosition(this.getShortestLayoutColumn());

    const columnWidth = this.getActiveColumnWidth();

    const tableColumns = _.map(settings.columns, (column, index) => {
      const isValue = index > 0;
      const valueWidth = 50;

      return {
        id: column.key,
        header: column.label,
        align: isValue ? 'right' : 'left',
        width: isValue ? valueWidth : columnWidth - (valueWidth * (settings.columns.length - 1)),
      };
    });

    const heading = {
      text: settings.title,
      subText: units,
    };

    this.renderTableHeading(heading, {
      columnDefaults: {
        fill: {
          color: this.colors.basal,
          opacity: 0.15,
        },
        width: columnWidth,
      },
    });

    this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);

    this.renderTable(tableColumns, settings.rows, {
      columnDefaults: {
        zebra: true,
        headerFill: true,
      },
    });

    this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);
  }

  renderSensitivity() {
    const units = `${this.bgUnits}/U`;
    this.renderWizardSetting(sensitivity(this.data, this.manufacturer, this.bgUnits), units);
  }

  renderTarget() {
    const units = this.bgUnits;
    this.renderWizardSetting(target(this.data, this.manufacturer), units);
  }

  renderRatio() {
    const units = 'g/U';
    this.renderWizardSetting(ratio(this.data, this.manufacturer), units);
  }
}

export default SettingsPrintView;
