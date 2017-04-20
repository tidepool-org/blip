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

import { THREE_HRS } from '../../utils/datetime';

class DailyPrintView {
  constructor(doc, data, opts) {
    this.doc = doc;

    this.debug = opts.debug || false;

    this.data = data;

    this.dpi = opts.dpi;

    this.margins = opts.margins;

    this.defaultFontSize = opts.defaultFontSize;
    this.footerFontSize = opts.footerFontSize;
    this.headerFontSize = opts.headerFontSize;

    this.width = opts.width;
    this.height = opts.height;

    this.chartsPerPage = opts.chartsPerPage;
    this.numDays = opts.numDays;

    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    this.chartArea = {
      topEdge: opts.margins.top,
      bottomEdge: opts.margins.top + opts.height,
    };

    this.chartsByDate = {};
    _.each(_.keys(data).slice(0, opts.numDays), (date) => {
      this.chartsByDate[date] = { date };
    });

    this.pages = Math.ceil(opts.numDays / opts.chartsPerPage);

    this.chartIndex = 0;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize().calculateChartMinimums();

    // no auto-binding :/
    this.newPage = this.newPage.bind(this);
    this.doc.on('pageAdded', this.newPage);
  }

  calculateChartMinimums() {
    this.doc.fontSize(10);
    const { topEdge, bottomEdge } = this.chartArea;
    const totalHeight = bottomEdge - topEdge;
    const perChart = totalHeight / 3.5;
    this.chartMinimums = {
      notes: 0,
      bgEtcChart: perChart * (5 / 12),
      bolusDetails: perChart * (4 / 12),
      basalChart: perChart * (3 / 12),
      paddingBelow: (totalHeight * (1 / 7)) / 3,
      total: perChart,
    };

    return this;
  }

  calculateDateChartHeight({ bounds, data, date }) {
    this.doc.fontSize(this.defaultFontSize);
    const lineHeight = this.doc.currentLineHeight();

    const start = Date.parse(bounds[0]);
    const threeHrBinnedBoluses = _.groupBy(
      data.bolus,
      (d) => (Math.floor((Date.parse(d.normalTime) - start) / THREE_HRS)),
    );
    const maxBolusStack = _.max(_.map(
      _.keys(threeHrBinnedBoluses),
      (key) => (threeHrBinnedBoluses[key].length),
    ));

    const { bgEtcChart, basalChart, total } = this.chartMinimums;
    const totalGivenMaxBolusStack = (lineHeight * maxBolusStack) + bgEtcChart + basalChart;

    this.chartsByDate[date].bolusDetailsHeight = lineHeight * maxBolusStack;
    this.chartsByDate[date].chartHeight = (totalGivenMaxBolusStack > total) ?
      totalGivenMaxBolusStack : total;

    return this;
  }

  newPage() {
    if (this.debug) {
      this.renderDebugGrid();
    }
    this.renderHeader().renderFooter();
  }

  placeChartsOnPage(pageNumber) {
    if (pageNumber <= this.pages) {
      this.doc.addPage();
    }
    const { topEdge, bottomEdge } = this.chartArea;
    let totalChartHeight = 0;
    const dates = _.keys(this.chartsByDate);
    const startingIndexThisPage = this.chartIndex;
    let chartsOnThisPage = 0;
    const limit = _.min([dates.length, startingIndexThisPage + this.chartsPerPage]);
    for (let i = startingIndexThisPage; i < limit; ++i) {
      const thisChartHeight = this.chartsByDate[dates[i]].chartHeight;
      const nextTotalHeight = totalChartHeight + thisChartHeight + this.chartMinimums.paddingBelow;
      if (nextTotalHeight > (bottomEdge - topEdge)) {
        this.chartIndex = i;
        if (startingIndexThisPage !== 0) {
          this.pages += 1;
        }
        break;
      }
      this.chartIndex = i + 1;
      totalChartHeight += thisChartHeight + this.chartMinimums.paddingBelow;
      chartsOnThisPage += 1;
    }
    for (let i = startingIndexThisPage; i < startingIndexThisPage + chartsOnThisPage; ++i) {
      const chart = this.chartsByDate[dates[i]];
      chart.page = pageNumber;
      if (i === startingIndexThisPage) {
        chart.topEdge = this.chartArea.topEdge;
        chart.bottomEdge = this.chartArea.topEdge + chart.chartHeight;
      } else {
        chart.topEdge =
          this.chartsByDate[dates[i - 1]].bottomEdge + this.chartMinimums.paddingBelow;
        chart.bottomEdge = chart.topEdge + chart.chartHeight;
      }
      // TODO: remove this; it is just for exposing/debugging the chart placement
      if (this.debug) {
        // eslint-disable-next-line lodash/prefer-lodash-method
        this.doc.fillColor('blue', 0.1)
          .rect(this.margins.left, chart.topEdge, this.width, chart.chartHeight)
          .fill();
      }
    }

    return this;
  }

  renderDebugGrid() {
    const minorLineColor = '#B8B8B8';
    const numMinorLines = 5;
    let thisLineYPos = this.margins.top;
    while (thisLineYPos <= (this.bottomEdge)) {
      this.doc.moveTo(this.margins.left, thisLineYPos)
        .lineTo(this.rightEdge, thisLineYPos)
        .lineWidth(0.25)
        .stroke('red');
      if (thisLineYPos !== this.bottomEdge) {
        for (let i = 1; i < numMinorLines + 1; ++i) {
          const innerLinePos = thisLineYPos + this.dpi * (i / (numMinorLines + 1));
          this.doc.moveTo(this.margins.left, innerLinePos)
            .lineTo(this.rightEdge, innerLinePos)
            .lineWidth(0.05)
            .stroke(minorLineColor);
        }
      }
      thisLineYPos += this.dpi;
    }

    let thisLineXPos = this.margins.left;
    while (thisLineXPos <= (this.rightEdge)) {
      this.doc.moveTo(thisLineXPos, this.margins.top)
        .lineTo(thisLineXPos, this.bottomEdge)
        .lineWidth(0.25)
        .stroke('red');
      for (let i = 1; i < numMinorLines + 1; ++i) {
        const innerLinePos = thisLineXPos + this.dpi * (i / (numMinorLines + 1));
        if (innerLinePos <= this.rightEdge) {
          this.doc.moveTo(innerLinePos, this.margins.top)
            .lineTo(innerLinePos, this.bottomEdge)
            .lineWidth(0.05)
            .stroke(minorLineColor);
        }
      }
      thisLineXPos += this.dpi;
    }

    return this;
  }

  renderFooter() {
    this.doc.fontSize(9);
    const lineHeight = this.doc.currentLineHeight();
    this.doc.fillColor('black').fillOpacity(1)
      .text('Legend', this.margins.left, this.bottomEdge - lineHeight * 8);
    this.doc.lineWidth(1)
      .rect(this.margins.left, this.bottomEdge - lineHeight * 6, this.width, lineHeight * 4)
      .stroke('black');
    // TODO: remove this; it is just for exposing/debugging the chartArea.bottomEdge adjustment
    if (this.debug) {
      // eslint-disable-next-line lodash/prefer-lodash-method
      this.doc.fillColor('#E8E8E8', 0.3333333333)
        .rect(this.margins.left, this.bottomEdge - lineHeight * 9, this.width, lineHeight * 9)
        .fill();
    }

    return this;
  }

  renderHeader() {
    this.doc.lineWidth(1);
    this.doc.fontSize(14).text('Daily View', this.margins.left, this.margins.top)
      .moveDown();
    const lineHeight = this.doc.currentLineHeight();
    const height = lineHeight * 2 + this.margins.top;
    this.doc.moveTo(this.margins.left, height)
      .lineTo(this.margins.left + this.width, height)
      .stroke('black');
    // TODO: remove this; it is just for exposing/debugging the chartArea.topEdge adjustment
    if (this.debug) {
      // eslint-disable-next-line lodash/prefer-lodash-method
      this.doc.fillColor('#E8E8E8', 0.3333333333)
        .rect(this.margins.left, this.margins.top, this.width, lineHeight * 4)
        .fill();
    }

    return this;
  }

  setFooterSize() {
    this.doc.fontSize(this.footerFontSize);
    const lineHeight = this.doc.currentLineHeight();
    this.chartArea.bottomEdge = this.chartArea.bottomEdge - lineHeight * 9;

    return this;
  }

  setHeaderSize() {
    this.doc.fontSize(this.headerFontSize);
    const lineHeight = this.doc.currentLineHeight();
    this.chartArea.topEdge = this.chartArea.topEdge + lineHeight * 4;

    return this;
  }
}

export default DailyPrintView;
