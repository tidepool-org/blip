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
import { scaleLinear } from 'd3-scale';
import moment from 'moment';

import PrintView from './PrintView';
import { formatBgValue } from '../../utils/format';
import { classifyBgValue, getOutOfRangeThreshold } from '../../utils/bloodglucose';
import { formatClocktimeFromMsPer24, THREE_HRS, getSimpleHourFormatSpace } from '../../utils/datetime';
import { MS_IN_HOUR } from '../../utils/constants';

const t = i18next.t.bind(i18next);

class BgLogPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.smbgRadius = 3;
    this.numDays = opts.numDays;

    this.doc.addPage();

    const dates = _.keys(data.dataByDate).sort();
    const numDays = _.min([this.numDays, dates.length]);
    this.chartDates = _.slice(dates, -Math.abs(numDays)).reverse();

    // Auto-bind callback methods
    this.getBGLabelYOffset = this.getBGLabelYOffset.bind(this);
    this.getBgChartColumns = this.getBgChartColumns.bind(this);
    this.getBgChartRow = this.getBgChartRow.bind(this);
    this.renderBgCell = this.renderBgCell.bind(this);
  }

  newPage() {
    super.newPage(this.getDateRange(this.data.dateRange[0], this.data.dateRange[1]));
  }

  getBGLabelYOffset() {
    return _.get(this.bgChart, 'datumsRendered', 0) % 2 === 0 ? -12 : 5;
  }

  getBgChartColumns(opts = {}) {
    return _.map(this.bgChart.headers, ({ id, text }, index) => ({
      cache: false,
      border: index === 0 || opts.border === false ? '' : 'TBLR',
      header: text,
      headerBorder: index === 0 || opts.headerBorder === false ? '' : 'BL',
      headerFill: index === 0 || opts.headerFill === false ? false : {
        color: this.colors.smbgHeader,
        opacity: 1,
      },
      headerPadding: [6, 2, 2, 2],
      height: this.doc.fontSize(this.defaultFontSize).currentLineHeight(),
      id,
      padding: [12, 2, 8, 2],
      renderer: this.renderBgCell,
      width: this.bgChart.columnWidth,
    }));
  }

  getBgChartRow(date) {
    const data = this.data.dataByDate[date];
    const dateMoment = moment(date);
    const isWeekend = _.includes(['0', '6'], dateMoment.format('d'));
    const timeSlots = _.filter(_.map(_.sortBy(this.bgChart.columns, 'id'), 'id'), _.isNumber);

    const smbgByTimeSlot = _.groupBy(
      data.data.smbg,
      datum => _.findLast(timeSlots, slot => datum.msPer24 >= slot)
    );

    const row = {};

    _.each(this.bgChart.columns, ({ id }) => {
      if (id === 'date') {
        row[id] = {
          text: dateMoment.format(t('ddd, MMM D')),
        };
      } else {
        row[id] = {
          smbg: _.get(smbgByTimeSlot, id, []),
        };
      }
    });

    row._fill = { // eslint-disable-line no-underscore-dangle
      color: isWeekend ? this.tableSettings.colors.zebraEven : 'white',
      opacity: 1,
    };

    return row;
  }

  render() {
    this.renderBGChart();
    this.renderSummaryTable();
  }

  renderBGChart() {
    this.resetText();

    this.bgChart = {
      datumsRendered: 0,
    };

    this.bgChart.headers = _.map(
      range(0, 8),
      i => ({
        id: i * THREE_HRS,
        text: formatClocktimeFromMsPer24(i * THREE_HRS, getSimpleHourFormatSpace()),
      }),
    );

    this.bgChart.headers.unshift({
      id: 'date',
      text: '',
    });

    this.bgChart.columnWidth = this.chartArea.width / this.bgChart.headers.length;

    this.bgChart.columns = this.getBgChartColumns();

    this.bgChart.rows = _.map(this.chartDates, this.getBgChartRow);

    this.bgChart.pos = {
      x: this.doc.x,
      y: this.doc.y,
      currentPage: this.initialTotalPages + this.currentPageIndex,
      currentPageIndex: this.currentPageIndex,
    };

    // First, we render the table, but don't render the data, to get the cell backgrounds filled
    this.renderTable(this.bgChart.columns, this.bgChart.rows, {
      bottomMargin: 20,
      columnDefaults: {
        fill: true,
        skipDraw: true,
      },
    });

    // Reposition to the original bgChart rendering postion, and render over top with the data
    this.doc.switchToPage(this.bgChart.pos.currentPage);
    this.currentPageIndex = this.bgChart.pos.currentPageIndex;

    this.doc.x = this.bgChart.pos.x;
    this.doc.y = this.bgChart.pos.y;

    this.renderTable(this.getBgChartColumns({
      headerFill: false,
      border: false,
    }), this.bgChart.rows, {
      bottomMargin: 20,
      columnDefaults: {
        fill: false,
      },
    });
  }

  renderSummaryTable() {
    this.resetText();

    const { stats = {} } = this.data;
    const { total, days, averageGlucose } = _.get(stats, 'averageGlucose.data.raw', {});

    const totalDays = Math.ceil(days || this.numDays || 0);
    const totalReadings = total || 0;
    const avgReadingsPerDay = Math.round(totalReadings / totalDays);

    const averageGlucoseText = averageGlucose
      ? formatBgValue(averageGlucose, this.bgPrefs)
      : '--';

    this.summaryTable = {};

    this.doc.x = this.leftEdge + this.bgChart.columnWidth;

    this.summaryTable.columnWidth = (this.chartArea.width - this.bgChart.columnWidth) / 4;

    this.summaryTable.columns = [
      {
        id: 'totalDays',
        header: t('Days In Report'),
      },
      {
        id: 'totalReadings',
        header: t('Total BG Readings'),
      },
      {
        id: 'avgReadingsPerDay',
        header: t('Avg. BG Readings / Day'),
      },
      {
        id: 'avgBg',
        header: t('Avg. BG ({{- units}})', { units: this.bgUnits }),
      },
    ];

    this.summaryTable.rows = [
      {
        totalDays: totalDays.toString(),
        totalReadings: totalReadings.toString(),
        avgReadingsPerDay: (avgReadingsPerDay || 0).toString(),
        avgBg: averageGlucoseText,
      },
    ];

    this.renderTable(this.summaryTable.columns, this.summaryTable.rows, {
      bottomMargin: 20,
      columnDefaults: {
        align: 'center',
        headerAlign: 'center',
        headerFill: {
          color: this.colors.smbgHeader,
          opacity: 1,
        },
        width: this.summaryTable.columnWidth,
      },
    });
  }

  renderBgCell(tb, data, draw, column, pos, padding) {
    if (draw && !column.skipDraw) {
      const {
        id,
        height,
        width,
      } = column;

      const {
        text,
        smbg = [],
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
          const xScale = scaleLinear()
            .domain([id, id + (MS_IN_HOUR * 3)])
            .range([pos.x, pos.x + width]);

          const xPos = xScale(datum.msPer24);
          const yPos = pos.y + padding.top + (height / 2);

          this.doc
            .circle(xPos, yPos, this.smbgRadius)
            .fill(this.colors[classifyBgValue(this.bgBounds, datum.value, 'fiveWay')]);

          const smbgLabel = formatBgValue(datum.value, this.bgPrefs, getOutOfRangeThreshold(datum));
          const labelWidth = this.doc.widthOfString(smbgLabel);
          const labelOffsetX = labelWidth / 2;
          const labelOffsetY = this.getBGLabelYOffset();

          let labelStartX = xPos - labelOffsetX;
          const labelEndX = labelStartX + labelWidth;


          // Ensure label is printed within chart area for the x-axis
          const chartLeftEdge = this.leftEdge + width;

          if (labelStartX - 1 <= chartLeftEdge) {
            labelStartX = labelStartX + (chartLeftEdge - (labelStartX - 1)) + 1;
          }

          if (labelEndX + 1 >= this.rightEdge) {
            labelStartX = labelStartX - ((labelEndX + 1) - this.rightEdge) - 1;
          }

          this.doc.fontSize(this.smallFontSize);

          this.doc
            .rect(
              labelStartX - 1,
              yPos + labelOffsetY - 1,
              labelWidth + 2,
              this.doc.currentLineHeight())
            .fill('white');

          this.doc
            .fontSize(this.smallFontSize)
            .fillColor('black')
            .text(
              smbgLabel,
              labelStartX,
              yPos + labelOffsetY, {
                lineBreak: false,
                width: labelWidth,
                align: 'center',
              },
            );

          this.bgChart.datumsRendered++;
        });
      }

      this.resetText();
    }

    return ' ';
  }
}

export default BgLogPrintView;
