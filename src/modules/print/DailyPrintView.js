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
import { scaleLinear } from 'd3-scale';
import moment from 'moment-timezone';

import { calcCbgTimeInCategories } from '../../utils/bloodglucose';
import { THREE_HRS } from '../../utils/datetime';
import { displayPercentage } from '../../utils/format';

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
    this.summaryHeaderFontSize = opts.summaryHeaderFontSize;

    this.bgBounds = opts.bgBounds;

    this.width = opts.width;
    this.height = opts.height;

    this.chartsPerPage = opts.chartsPerPage;
    this.numDays = opts.numDays;

    // render options
    this.cbgRadius = 1;

    this.colors = {
      lightDividers: '#D8D8D8',
    };

    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    const gapBtwnSummaryAndChartAsPercentage = 0.02;

    this.chartArea = {
      bottomEdge: opts.margins.top + opts.height,
      leftEdge: opts.margins.left +
        (opts.summaryWidthAsPercentage + gapBtwnSummaryAndChartAsPercentage) * this.width,
      topEdge: opts.margins.top,
    };

    this.chartArea.width = this.rightEdge - this.chartArea.leftEdge;

    this.summaryArea = {
      rightEdge: opts.margins.left + opts.summaryWidthAsPercentage * this.width,
    };

    this.summaryArea.width = this.summaryArea.rightEdge - this.margins.left;

    const dates = _.keys(data.dataByDate);
    this.chartsByDate = {};
    _.each(dates, (date) => {
      this.chartsByDate[date] = { data: data.dataByDate[date].data, date };
    });

    this.pages = Math.ceil(opts.numDays / opts.chartsPerPage);

    this.chartIndex = 0;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize().calculateChartMinimums();

    // no auto-binding :/
    this.newPage = this.newPage.bind(this);
    this.doc.on('pageAdded', this.newPage);

    // calculate heights and place charts in preparation for rendering
    for (let i = 0; i < this.numDays; ++i) {
      const dateData = data.dataByDate[dates[i]];
      this.calculateDateChartHeight(dateData);
    }

    let page = 1;
    while (page <= this.pages) {
      this.placeChartsOnPage(page);
      ++page;
    }
    _.each(this.chartsByDate, (dateChart) => {
      this.makeScales(dateChart);
    });
  }

  calculateChartMinimums() {
    this.doc.fontSize(10);
    const { topEdge, bottomEdge } = this.chartArea;
    const totalHeight = bottomEdge - topEdge;
    const perChart = totalHeight / 3.5;
    this.chartMinimums = {
      notesEtc: perChart * (3 / 20),
      bgEtcChart: perChart * (9 / 20),
      bolusDetails: perChart * (4 / 20),
      basalChart: perChart * (3 / 20),
      belowBasal: perChart * (1 / 20),
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

    const { notesEtc, bgEtcChart, basalChart, belowBasal, total } = this.chartMinimums;
    const bolusDetailsHeight = lineHeight * maxBolusStack;
    const totalGivenMaxBolusStack = bolusDetailsHeight +
      notesEtc + bgEtcChart + basalChart + belowBasal;

    const { bolusDetails: minBolusDetails } = this.chartMinimums;

    this.chartsByDate[date].bolusDetailsHeight = _.max([minBolusDetails, bolusDetailsHeight]);
    this.chartsByDate[date].chartHeight = _.max([total, totalGivenMaxBolusStack]);

    return this;
  }

  makeScales(dateChart) {
    const {
      notesEtc,
      bgEtcChart,
      basalChart,
      belowBasal,
    } = this.chartMinimums;
    dateChart.bgScale = scaleLinear() // eslint-disable-line no-param-reassign
      .domain([
        _.min([this.bgBounds.veryLowThreshold, this.data.bgRange[0]],
        _.min([this.bgBounds.veryHighThreshold, this.data.bgRange[1]])),
      ])
      .range([
        dateChart.topEdge + notesEtc + bgEtcChart + this.cbgRadius,
        dateChart.topEdge + notesEtc - this.cbgRadius,
      ]);
    dateChart.bolusScale = scaleLinear() // eslint-disable-line no-param-reassign
      .domain([0, this.data.bolusRange[1]])
      .range([
        dateChart.topEdge + notesEtc + bgEtcChart,
        dateChart.topEdge + notesEtc + (bgEtcChart / 3),
      ]);
    dateChart.basalScale = scaleLinear() // eslint-disable-line no-param-reassign
      .domain([0, this.data.basalRange[1]])
      .range([
        dateChart.bottomEdge - belowBasal,
        dateChart.bottomEdge - belowBasal - basalChart,
      ]);
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
      // NB: subtract one because PDFKit zero-indexes the buffered pages
      chart.page = pageNumber - 1;
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
          .rect(this.chartArea.leftEdge, chart.topEdge, this.chartArea.width, chart.chartHeight)
          .fill();
      }
    }

    return this;
  }

  render() {
    _.each(this.chartsByDate, (dateChart) => {
      // console.log('Rendering', dateChart);
      this.doc.switchToPage(dateChart.page);
      this.renderSummary(dateChart)
        .renderXAxes(
          { bottomEdge: dateChart.bottomEdge, topEdge: dateChart.topEdge },
          dateChart.bolusDetailsHeight,
        );
    });
  }

  renderSummary({ data, date, topEdge }) {
    const smallIndent = this.margins.left + 4;

    this.doc.fillColor('black')
      .fillOpacity(1)
      .font('Helvetica-Bold')
      .fontSize(this.summaryHeaderFontSize)
      .text(moment(date, 'YYYY-MM-DD').format('dddd M/D'), this.margins.left, topEdge);

    const yPos = (function (doc) { // eslint-disable-line func-names
      let value = topEdge + doc.currentLineHeight() * 1.5;
      return {
        current: () => (value),
        update: () => {
          value += (doc.currentLineHeight() * 1.25);
          return value;
        },
      };
    }(this.doc));

    this.doc.moveTo(this.margins.left, yPos.current())
      .lineTo(this.summaryArea.rightEdge, yPos.current())
      .lineWidth(0.5)
      .stroke(this.colors.lightDividers);

    this.doc.fontSize(this.defaultFontSize)
      .lineGap(this.doc.currentLineHeight() * 0.25)
      .text('Time in Target', smallIndent, yPos.update());

    yPos.update();

    const { targetUpperBound, targetLowerBound, veryLowThreshold } = this.bgBounds;
    const cbgTimeInCategories = calcCbgTimeInCategories(data.cbg, this.bgBounds);
    this.doc.font('Helvetica')
      .text(
        `${targetLowerBound} - ${targetUpperBound}`,
        { indent: 8, continued: true, width: this.summaryArea.width },
      )
      .text(`${displayPercentage(cbgTimeInCategories.target)}`, { align: 'right' });

    yPos.update();

    this.doc.text(
        `Below ${veryLowThreshold}`,
        { indent: 8, continued: true, width: this.summaryArea.width },
      )
      .text(`${displayPercentage(cbgTimeInCategories.veryLow)}`, { align: 'right' });

    yPos.update();

    this.doc.moveTo(this.margins.left, yPos.update())
      .lineTo(this.summaryArea.rightEdge, yPos.current())
      .stroke(this.colors.lightDividers);

    this.doc.font('Helvetica-Bold')
      .text('Basal:Bolus Ratio', smallIndent, yPos.update());

    return this;
  }

  renderXAxes({ bottomEdge, topEdge }, bolusDetails) {
    const {
      notesEtc,
      bgEtcChart,
      basalChart,
    } = this.chartMinimums;

    this.doc.lineWidth(0.25);

    // render x-axis for bgEtcChart
    const bottomOfBgEtcChart = topEdge + notesEtc + bgEtcChart;
    this.doc.moveTo(this.chartArea.leftEdge, bottomOfBgEtcChart)
      .lineTo(this.rightEdge, bottomOfBgEtcChart)
      .stroke('black');

    // render bottom border of bolusDetails
    const bottomOfBolusDetails = bottomOfBgEtcChart + bolusDetails;
    this.doc.moveTo(this.chartArea.leftEdge, bottomOfBolusDetails)
      .lineTo(this.rightEdge, bottomOfBolusDetails)
      .stroke('black');

    // render x-axis for basalChart
    const bottomOfBasalChart = bottomOfBolusDetails + basalChart;
    this.doc.moveTo(this.chartArea.leftEdge, bottomOfBasalChart)
      .lineTo(this.rightEdge, bottomOfBasalChart)
      .stroke('black');

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
