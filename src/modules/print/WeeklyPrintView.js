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
import i18next from 'i18next';
import { range } from 'd3-array';

import PrintView from './PrintView';
import { formatClocktimeFromMsPer24, THREE_HRS } from '../../utils/datetime';

const t = i18next.t.bind(i18next);

class WeeklyPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);
    console.log('weekly data in', data);

    this.colors = _.assign(this.colors, {
      '12a': '#D3DBDD',
      '3a': '#E3EAED',
      '6a': '#E9EFF1',
      '9a': '#F2F4F6',
      '12p': '#F8F9FA',
      '3p': '#E9EFF1',
      '6p': '#E3EAED',
      '9p': '#DCE4E7',
      fillDarker: '#DCE4E7',
      fillDarkest: '#D3DBDD',
      fillDark: '#E3EAED',
      fillLighter: '#E9EFF1',
      fillLight: '#F2F4F6',
      fillLightest: '#F8F9FA',
    });

    this.dayCount = _.keys(data.dataByDate).length;

    this.doc.addPage();

    // Auto-bind callback methods
    this.RenderBgCell = this.RenderBgCell.bind(this);
  }

  newPage() {
    super.newPage(this.getDateRange(this.data.dateRange[0], this.data.dateRange[1]));
  }

  getBgChartRow(data, key) {
    console.log('row data', data);
    return [
      {
        value: {
          text: key,
        },
      },
    ];
  }

  render() {
    this.renderBGChart();
  }

  renderBGChart() {
    this.renderSectionHeading(t('SMBG Readings'));

    const bgChart = {};

    bgChart.labels = _.map(range(0, 8), i => (formatClocktimeFromMsPer24(i * THREE_HRS, 'h a')));
    bgChart.labels.unshift('Date');

    bgChart.columns = _.map(bgChart.labels, label => ({
      id: label,
      header: label,
      width: this.chartArea.width / bgChart.labels.length,
      height: this.chartArea.width / bgChart.labels.length,
      cache: false,
      renderer: this.RenderBgCell,
      headerBorder: '',
      headerPadding: [4, 2, 0, 2],
      padding: [3, 2, 3, 2],
    }));

    const rows = _.map(this.data.dataByDate, this.getBgChartRow);

    console.log('bgChart', bgChart);

    this.renderTable(bgChart.columns, rows, {
      bottomMargin: 20,
    });
  }

  RenderBgCell(tb, data, draw, column, pos, padding) {
    if (draw) {
      const {
        color,
        count,
        type,
        daysSince,
        label,
      } = data[column.id];

      const xPos = pos.x + padding.left;
      const yPos = pos.y + padding.top;

      this.setFill(type === 'future' ? this.colors.lightGrey : 'black', 1);

      this.doc
        .fontSize(this.extraSmallFontSize)
        .text(label, xPos, yPos);

      const width = column.width - _.get(padding, 'left', 0) - _.get(padding, 'right', 0);
      const height = column.height - _.get(padding, 'top', 0) - _.get(padding, 'bottom', 0);

      this.resetText();
    }

    return ' ';
  }
}

export default WeeklyPrintView;
