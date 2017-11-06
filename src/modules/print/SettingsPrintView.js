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

import PrintView from './PrintView';

import {
  getDeviceMeta,
  getScheduleLabel,
  processBasalRateData,
  startTimeAndValue,
} from '../../utils/settings/data';

import {
  deviceName,
  bolusTitle,
  ratio,
  sensitivity,
  target,
} from '../../utils/settings/nonTandemData';

import {
  basalSchedules as profileSchedules,
  basal,
} from '../../utils/settings/tandemData';

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.manufacturer = _.get(data, 'source', '').toLowerCase();
    this.isTandem = this.manufacturer === 'tandem';
    this.deviceMeta = getDeviceMeta(data, opts.timePrefs);

    this.doc.addPage();
  }

  render() {
    this.renderDeviceMeta();

    if (this.isTandem) {
      this.renderTandemProfiles();
    } else {
      this.renderBasalSchedules();
      this.renderWizardSettings();
    }
  }

  renderDeviceMeta() {
    const device = this.isTandem ? 'Tandem' : deviceName(this.manufacturer);
    this.doc
    .font(this.boldFont)
    .fontSize(this.defaultFontSize)
    .text(device, { continued: true })
    .font(this.font)
    .text(` Uploaded on ${this.deviceMeta.uploaded}`, { continued: true })
    .text(` › Serial Number: ${this.deviceMeta.serial}`)
    .moveDown();

    this.resetText();
    this.doc.moveDown();
  }

  renderTandemProfiles() {
    this.renderSectionHeading('Profile Settings');

    const basalSchedules = profileSchedules(this.data);

    const sortedSchedules = _.sortByOrder(basalSchedules,
      [
        schedule => (schedule.name === this.data.activeSchedule ? 1 : 0),
        'position',
      ],
      ['desc', 'asc']
    );

    _.each(sortedSchedules, schedule => {
      const profile = basal(schedule, this.data, this.bgUnits);

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

        const fillStripes = {
          rate: this.colors.basal,
          bgTarget: this.colors.bolus,
          carbRatio: this.colors.bolus,
          insulinSensitivity: this.colors.bolus,
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
          headerFillStripe: !fillStripes[column.key] ? false : {
            color: fillStripes[column.key],
          },
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

  renderBasalSchedules() {
    this.renderSectionHeading('Basal Rates');

    this.setLayoutColumns({
      width: this.chartArea.width,
      count: 3,
      gutter: 15,
    });

    const {
      activeSchedule,
      basalSchedules,
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

    const sortedSchedules = _.sortByOrder(basalSchedules,
      [
        schedule => (schedule.name === activeSchedule ? 1 : 0),
        schedule => schedule.value.length,
        'name',
      ],
      ['desc', 'desc', 'asc']
    );

    _.each(sortedSchedules, (schedule, index) => {
      const activeColumn = index < this.layoutColumns.count
        ? index % this.layoutColumns.count
        : this.getShortestLayoutColumn();

      this.goToLayoutColumnPosition(activeColumn);

      const scheduleLabel = getScheduleLabel(
        schedule.name,
        activeSchedule,
        this.manufacturer,
        this.isTandem
      );

      const heading = {
        text: scheduleLabel.main,
        subText: scheduleLabel.units,
        note: scheduleLabel.secondary,
      };

      this.renderTableHeading(heading, {
        columnDefaults: {
          fill: {
            color: this.colors.basal,
            opacity: 0.15,
          },
          fillStripe: true,
          width: columnWidth,
        },
      });

      this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);

      const sheduleRows = processBasalRateData(schedule);
      const rows = _.map(sheduleRows, (row, rowIndex) => {
        const isLast = rowIndex === sheduleRows.length - 1;

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
    });

    this.resetText();
  }

  renderWizardSettings() {
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = this.layoutColumns.columns[this.getLongestLayoutColumn()].y;
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
        fillStripe: {
          color: this.colors.bolus,
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
