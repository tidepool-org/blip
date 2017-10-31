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
  calculateBasalBolusStats,
  cgmStatusMessage,
  determineBgDistributionSource,
  reduceByDay,
} from '../../utils/basics/data';

import { calcBgPercentInCategories, generateBgRangeLabels } from '../../utils/bloodglucose';
import { formatPercentage, formatDecimalNumber } from '../../utils/format';

import { pie, arc } from 'd3-shape';
import parse from 'parse-svg-path';
import translate from 'translate-svg-path';
import serialize from 'serialize-svg-path';

class BasicsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.data = reduceByDay(this.data, this.bgPrefs);

    // Auto-bind callback methods
    this.renderStackedStat = this.renderStackedStat.bind(this);
    this.renderPieChart = this.renderPieChart.bind(this);
  }

  render() {
    console.log('data', this.data);
    console.log('doc', this.doc);
    this.doc.addPage();
    this.initLayout();
    this.renderLeftColumn();
    this.renderCenterColumn();
    this.renderRightColumn();
  }

  renderLeftColumn() {
    this.goToLayoutColumnPosition(0);
    this.renderBgDistribution();
    this.renderAggregatedStats();
  }

  renderCenterColumn() {
    this.renderCalendar({
      title: 'BG readings',
      data: this.data.data.smbg, // calibration
      days: this.data.days,
    });

    this.renderCalendar({
      title: 'Bolusing',
      data: this.data.data.bolus,
      days: this.data.days,
    });

    this.renderCalendar({
      title: {
        text: 'Infusion site changes',
        subText: 'from cannula fills', // reservoirChange | tubingPrime
      },
      data: this.data.data.cannulaPrime, // reservoirChange | tubingPrime
      days: this.data.days,
    });

    this.renderCalendar({
      title: 'Basals',
      data: this.data.data.basal, // reservoirChange | tubingPrime
      days: this.data.days,
    });
  }

  renderRightColumn() {

  }

  initLayout() {
    this.setLayoutColumns({
      width: this.chartArea.width,
      gutter: 20,
      type: 'percentage',
      widths: [25, 50, 25],
    });
  }

  renderBgDistribution() {
    const { source, cgmStatus } = determineBgDistributionSource(this.data);

    const columnWidth = this.getActiveColumnWidth();

    this.renderSectionHeading('BG Distribution', {
      width: columnWidth,
      fontSize: this.largeFontSize,
    });

    if (source) {
      const distribution = calcBgPercentInCategories(this.data.data[source].data, this.bgBounds);

      this.doc.text(cgmStatusMessage(cgmStatus), { width: columnWidth });

      const tableColumns = [
        {
          id: 'value',
          cache: false,
          renderer: this.renderCustomCell,
          width: columnWidth,
          height: 35,
          fontSize: this.largeFontSize,
          font: this.boldFont,
          noteFontSize: this.smallFontSize,
          align: 'center',
        },
      ];

      const bgRangeLabels = generateBgRangeLabels(this.bgPrefs);
      const bgRangeColors = _.mapValues(distribution, (value, key) => {
        switch (key) {
          case 'veryLow':
          case 'low':
            return this.colors.low;

          case 'high':
          case 'veryHigh':
            return this.colors.high;

          case 'target':
          default:
            return this.colors.target;
        }
      });

      const rows = _.map(_.keys(distribution), key => {
        const value = distribution[key];
        const stripePadding = 2;

        return {
          value: {
            text: formatPercentage(value),
            note: bgRangeLabels[key],
          },
          _fillStripe: {
            color: bgRangeColors[key],
            opacity: 0.75,
            width: (columnWidth - (2 * stripePadding)) * distribution[key],
            background: true,
            padding: stripePadding,
          },
        };
      }).reverse();

      this.renderTable(tableColumns, rows, {
        showHeaders: false,
        bottomMargin: 15,
      });
    } else {
      this.doc.text('No BG data available', { width: columnWidth });
    }
  }

  renderAggregatedStats() {
    const {
      averageDailyCarbs,
      averageDailyDose,
      basalBolusRatio,
      totalDailyDose,
    } = calculateBasalBolusStats(this.data);

    this.renderSimpleStat('Avg daily carbs', formatDecimalNumber(averageDailyCarbs), ' g');
    this.renderBasalBolusRatio(averageDailyDose, basalBolusRatio);
    this.renderSimpleStat('Avg total daily dose', formatDecimalNumber(totalDailyDose, 1), ' U');
  }

  renderBasalBolusRatio(averageDailyDose, basalBolusRatio) {
    const columnWidth = this.getActiveColumnWidth();

    const heading = {
      text: 'Insulin ratio',
    };

    this.renderTableHeading(heading, {
      font: this.font,
      fontSize: this.defaultFontSize,
      columnDefaults: {
        width: columnWidth,
        border: 'TLR',
      },
    });

    const tableColumns = [
      {
        id: 'basal',
        align: 'center',
        width: columnWidth * 0.33,
        height: 50,
        cache: false,
        renderer: this.renderStackedStat,
        border: 'LB',
      },
      {
        id: 'chart',
        align: 'center',
        width: columnWidth * 0.34,
        height: 50,
        cache: false,
        renderer: this.renderPieChart,
        padding: [0, 0, 0, 0],
        border: 'B',
      },
      {
        id: 'bolus',
        align: 'center',
        width: columnWidth * 0.33,
        height: 50,
        cache: false,
        renderer: this.renderStackedStat,
        border: 'RB',
      },
    ];

    const rows = [
      {
        basal: {
          stat: 'Basal',
          value: formatPercentage(basalBolusRatio.basal),
          summary: `${formatDecimalNumber(averageDailyDose.basal, 1)} U`,
        },
        chart: {
          data: [
            {
              value: basalBolusRatio.basal,
              color: this.colors.basal,
            },
            {
              value: basalBolusRatio.bolus,
              color: this.colors.bolus,
            },
          ],
        },
        bolus: {
          stat: 'Bolus',
          value: formatPercentage(basalBolusRatio.bolus),
          summary: `${formatDecimalNumber(averageDailyDose.bolus, 1)} U`,
        },
      },
    ];

    this.renderTable(tableColumns, rows, {
      showHeaders: false,
      bottomMargin: 15,
    });
  }

  renderStackedStat(tb, data, draw, column, pos, padding) {
    if (draw) {
      const {
        stat,
        value,
        summary,
      } = data[column.id];

      const xPos = pos.x + _.get(padding, 'left', 0);
      const yPos = pos.y + padding.top;

      const width = column.width - _.get(padding, 'left', 0) - _.get(padding, 'right', 0);
      const align = _.get(column, 'align', 'left');

      const textOpts = {
        align,
        width,
        paragraphGap: 5,
      };

      this.doc
        .font(this.boldFont)
        .fontSize(this.smallFontSize)
        .text(stat, xPos, yPos, textOpts);

      this.doc
        .font(this.boldFont)
        .fontSize(this.largeFontSize)
        .text(value, _.assign({}, textOpts, {
          paragraphGap: 0,
        }));

      this.doc
        .font(this.font)
        .fontSize(this.smallFontSize)
        .text(summary, textOpts);
    }

    return ' ';
  }

  renderPieChart(tb, data, draw, column, pos) {
    if (draw) {
      const {
        width,
        height,
      } = column;

      const radius = width > height ? height / 2 : width / 2;
      const xPos = pos.x + width / 2;
      const yPos = pos.y + height / 2;

      const {
        data: pieData,
      } = data[column.id];

      const arcData = pie()(_.map(pieData, datum => datum.value));

      const generateArcPath = (datum) => (
        arc()
          .innerRadius(0)
          .outerRadius(radius)(datum)
      );

      _.each(arcData, (segment, index) => {
        const path = generateArcPath(segment);
        const points = translate(parse(path), xPos, yPos);
        const adjustedPath = serialize(points);

        this.setFill(pieData[index].color, 1);

        this.doc
          .path(adjustedPath)
          .fill();
      });

      this.setFill();
    }

    return ' ';
  }

  renderSimpleStat(stat, value, units) {
    const columnWidth = this.getActiveColumnWidth();

    const tableColumns = [
      {
        id: 'stat',
        cache: false,
        renderer: this.renderCustomCell,
        width: columnWidth * 0.65,
        height: 35,
        fontSize: this.defaultFontSize,
        font: this.font,
        align: 'left',
        border: 'TBL',
        valign: 'center',
      },
      {
        id: 'value',
        cache: false,
        renderer: this.renderCustomCell,
        width: columnWidth * 0.35,
        height: 35,
        fontSize: this.defaultFontSize,
        font: this.boldFont,
        align: 'right',
        border: 'TBR',
        valign: 'center',
      },
    ];

    const rows = [
      {
        stat,
        value: `${value}${units}`,
      },
    ];

    this.renderTable(tableColumns, rows, {
      showHeaders: false,
      bottomMargin: 15,
    });
  }

  renderCalendar() {

  }
}

export default BasicsPrintView;
