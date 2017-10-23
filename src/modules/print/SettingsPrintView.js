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
  processBasalRateData,
} from '../../utils/settings/data';

import {
  bolusTitle,
} from '../../utils/settings/nonTandemData';

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.manufacturer = _.get(data, 'source', '').toLowerCase();
    this.deviceMeta = getDeviceMeta(data, opts.timePrefs);
    this.layoutColumns = {};
  }

  render() {
    // console.log('doc', this.doc);
    console.log('data', this.data);
    console.log('deviceMeta', this.deviceMeta);
    this.doc.addPage();
    this.renderDeviceMeta();
    this.renderBasalSchedules();
    this.renderBolusDetails();
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
  }

  renderBasalSchedules() {
    this.renderSectionHeading('Basal Rates');

    const {
      activeSchedule,
      basalSchedules,
    } = this.data;

    this.setLayoutColumns(this.chartArea.width, 3, 20);

    const tableWidth = this.layoutColumns.itemWidth;

    const tableColumns = [
      {
        id: 'start',
        header: 'Start time',
        align: 'left',
        width: tableWidth - 50,
      },
      {
        id: 'rate',
        header: 'Value',
        align: 'right',
        width: 50,
      },
    ];

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

      const note = schedule.name === activeSchedule ? 'Active at Upload' : null;

      const data = processBasalRateData(schedule);

      const heading = {
        text: schedule.name,
        subText: 'U/hr',
        note,
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

      this.updateLayoutColumnPosition(activeColumn);

      this.renderTable(tableColumns, data, {
        columnDefaults: {
          zebra: true,
          headerFill: true,
        },
      });

      this.updateLayoutColumnPosition(activeColumn);
    });

    this.doc.moveDown();
  }

  renderBolusDetails() {
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = this.layoutColumns.columns[this.getLongestLayoutColumn()].y;
    this.renderSectionHeading(bolusTitle(this.manufacturer));
  }
}

export default SettingsPrintView;
