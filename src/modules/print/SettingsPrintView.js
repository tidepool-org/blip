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

/* eslint-disable lodash/prefer-lodash-method */

import _ from 'lodash';

import PrintView from './PrintView';

import {
  getDeviceMeta,
  getScheduleLabel,
  processBasalRateData,
  startTimeAndValue,
} from '../../utils/settings/data';

import {
  bolusTitle,
  ratio,
  sensitivity,
  target,
} from '../../utils/settings/nonTandemData';

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.manufacturer = _.get(data, 'source', '').toLowerCase();
    this.isTandem = this.manufacturer === 'tandem';
    this.deviceMeta = getDeviceMeta(data, opts.timePrefs);
    this.layoutColumns = {};
  }

  render() {
    // console.log('doc', this.doc);
    // console.log('data', this.data);
    // console.log('deviceMeta', this.deviceMeta);
    this.doc.addPage();
    this.renderDeviceMeta();
    this.renderBasalSchedules();
    this.renderBolusSettings();
  }

  renderDeviceMeta() {
    this.doc
    .font(this.boldFont)
    .fontSize(this.defaultFontSize)
    .text(this.data.source, { continued: true })
    .font(this.font)
    .text(` Uploaded on ${this.deviceMeta.uploaded}`, { continued: true })
    .text(` › Serial Number: ${this.deviceMeta.serial}`)
    .moveDown();

    this.resetText();
    this.doc.moveDown();
  }

  renderBasalSchedules() {
    this.renderSectionHeading('Basal Rates');

    const {
      activeSchedule,
      basalSchedules,
    } = this.data;

    this.setLayoutColumns(this.chartArea.width, 3, 20);

    const tableWidth = this.layoutColumns.itemWidth;

    const tableColumns = _.map(startTimeAndValue('rate'), (column, index) => {
      const isValue = index === 1;
      const valueWidth = 50;

      return {
        id: column.key,
        header: column.label,
        align: isValue ? 'right' : 'left',
        width: isValue ? valueWidth : tableWidth - valueWidth,
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

      this.gotoLayoutColumnPosition(activeColumn);

      const data = processBasalRateData(schedule);

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
            opacity: 0.4,
          },
          width: tableWidth,
        },
      });

      this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);

      this.renderTable(tableColumns, data, {
        columnDefaults: {
          zebra: true,
          headerFill: true,
        },
      });

      this.updateLayoutColumnPosition(this.layoutColumns.activeIndex);
    });

    this.resetText();
  }

  renderBolusSettings() {
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = this.layoutColumns.columns[this.getLongestLayoutColumn()].y;
    this.doc.moveDown();

    this.renderSectionHeading(bolusTitle(this.manufacturer));

    this.setLayoutColumns(this.chartArea.width, 3, 20);

    this.renderSensitivity();

    this.renderTarget();

    this.renderRatio();

    this.resetText();
    this.doc.moveDown();
  }

  renderBolusSetting(settings, units = '') {
    this.gotoLayoutColumnPosition(this.getShortestLayoutColumn());

    const tableWidth = this.layoutColumns.itemWidth;

    const tableColumns = _.map(settings.columns, (column, index) => {
      const isValue = index > 0;
      const valueWidth = 50;

      return {
        id: column.key,
        header: column.label,
        align: isValue ? 'right' : 'left',
        width: isValue ? valueWidth : tableWidth - (valueWidth * (settings.columns.length - 1)),
      };
    });

    const heading = {
      text: settings.title,
      subText: units,
    };

    this.renderTableHeading(heading, {
      columnDefaults: {
        fill: {
          color: this.colors.bolus,
          opacity: 0.4,
        },
        width: tableWidth,
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
    this.renderBolusSetting(sensitivity(this.data, this.manufacturer, this.bgUnits), `${this.bgUnits}/U`);
  }

  renderTarget() {
    this.renderBolusSetting(target(this.data, this.manufacturer, this.bgUnits));
  }

  renderRatio() {
    this.renderBolusSetting(ratio(this.data, this.manufacturer), 'g/U');
  }
}

export default SettingsPrintView;
