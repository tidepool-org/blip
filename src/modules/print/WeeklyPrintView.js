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
import moment from 'moment';

import PrintView from './PrintView';
import { formatBgValue } from '../../utils/format';
import { classifyBgValue, getOutOfRangeThreshold } from '../../utils/bloodglucose';
import { formatClocktimeFromMsPer24, THREE_HRS } from '../../utils/datetime';
import { MS_IN_HOUR } from '../../utils/constants';

const t = i18next.t.bind(i18next);

class WeeklyPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.smbgRadius = 3;
    this.dayCount = _.keys(data.dataByDate).length;

    this.doc.addPage();

    // Auto-bind callback methods
    this.getBgChartRow = this.getBgChartRow.bind(this);
    this.RenderBgCell = this.RenderBgCell.bind(this);
  }

  newPage() {
    super.newPage(this.getDateRange(this.data.dateRange[0], this.data.dateRange[1]));
  }

  getBgChartRow(data = {}) {
    const date = moment(data.date);
    const isWeekend = _.includes(['0', '6'], date.format('d'));
    const timeSlots = _.filter(_.pluck(_.sortBy(this.bgChart.columns, 'id'), 'id'), _.isNumber);

    const smbgByTimeSlot = _.groupBy(
      data.data.smbg,
      datum => _.findLast(timeSlots, slot => datum.msPer24 >= slot)
      );

    const row = {};

    _.each(this.bgChart.columns, ({ id }) => {
      if (id === 'date') {
        row[id] = {
          text: date.format('ddd, MMM D'),
        };
      } else {
        row[id] = {
          smbg: _.get(smbgByTimeSlot, id, []),
        };
      }
    });

    row._fill = { // eslint-disable-line no-underscore-dangle
      color: isWeekend ? this.tableSettings.colors.zebraEven : 'white',
    };

    return row;
  }

  render() {
    this.renderBGChart();
  }

  renderBGChart() {
    this.resetText();
    this.renderSectionHeading({
      text: t('SMBG Readings'),
      subText: t('Units displayed in {{- units}}', { units: this.bgUnits }),
    });

    this.doc.fontSize(this.defaultFontSize);

    this.bgChart = {};

    this.bgChart.headers = _.map(
      range(0, 8),
      i => ({
        id: i * THREE_HRS,
        text: formatClocktimeFromMsPer24(i * THREE_HRS, 'h a'),
      }),
    );

    this.bgChart.headers.unshift({
      id: 'date',
      text: '',
    });

    this.bgChart.columns = _.map(this.bgChart.headers, ({ id, text }, index) => ({
      cache: false,
      border: index === 0 ? '' : 'TBLR',
      header: text,
      headerBorder: index === 0 ? '' : 'BL',
      headerFill: index === 0 ? false : {
        color: this.colors.smbg,
        opacity: 0.1,
      },
      headerPadding: [6, 2, 2, 2],
      height: this.doc.fontSize(this.defaultFontSize).currentLineHeight(),
      id,
      padding: [6, 2, 2, 2],
      renderer: this.RenderBgCell,
      width: this.chartArea.width / this.bgChart.headers.length,
    }));

    this.bgChart.rows = _.map(this.data.dataByDate, this.getBgChartRow);

    this.renderTable(this.bgChart.columns, this.bgChart.rows, {
      bottomMargin: 20,
      columnDefaults: {
        fill: true,
      },
    });
  }

  RenderBgCell(tb, data, draw, column, pos, padding) {
    if (draw) {
      const {
        id,
        height,
        width,
      } = column;

      const {
        text,
        smbg,
      } = data[id];

      if (text) {
        const xPos = pos.x + padding.left;
        const yPos = pos.y + padding.top;

        this.setFill('black', 1);

        this.doc
          .fontSize(this.defaultFontSize)
          .text(text, xPos, yPos, {
            align: 'right',
            width: width - padding.left - padding.right,
          });
      } else if (smbg.length) {
        _.each(smbg, datum => {
          const xPos = pos.x + ((datum.msPer24 - id) * width / (MS_IN_HOUR * 3));
          const yPos = pos.y + padding.top + (height / 2);

          this.doc
          .circle(xPos, yPos, this.smbgRadius)
          .fill(this.colors[classifyBgValue(this.bgBounds, datum.value, 'fiveWay')]);

          const smbgLabel = formatBgValue(datum.value, this.bgPrefs, getOutOfRangeThreshold(datum));
          const labelWidth = this.doc.widthOfString(smbgLabel);
          const labelOffsetX = labelWidth / 2;
          const labelOffsetY = -10;
          let labelStartX = xPos - labelOffsetX;
          const labelEndX = labelStartX + labelWidth;

          // Ensure label is printed within chart area for the x-axis
          const chartLeftEdge = this.leftEdge + width;

          if (labelStartX <= chartLeftEdge) {
            labelStartX = labelStartX + (chartLeftEdge - labelStartX) + 1;
          }
          if (labelEndX >= this.rightEdge) {
            labelStartX = labelStartX - (labelEndX - this.rightEdge) - 1;
          }

          this.doc.fontSize(this.smallFontSize);

          this.doc
            .rect(
              labelStartX - 1,
              yPos + labelOffsetY - 1,
              labelWidth + 2,
              this.doc.currentLineHeight() + 2)
            .fill('#f2f2f2');

          this.doc
            .fontSize(this.smallFontSize)
            .fillColor('black')
            .text(
              smbgLabel,
              labelStartX,
              yPos + labelOffsetY, {
                lineBreak: false,
              },
            );
        });
      }

      this.resetText();
    }

    return ' ';
  }
}

export default WeeklyPrintView;
