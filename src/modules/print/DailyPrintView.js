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
import { mean, range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import moment from 'moment-timezone';

import { calculateBasalPath, getBasalSequencePaths } from '../render/basal';
import getBolusPaths from '../render/bolus';
import { getTotalBasal } from '../../utils/basal';
import { calcBgPercentInCategories, classifyBgValue } from '../../utils/bloodglucose';
import {
  getBolusFromInsulinEvent,
  getCarbs,
  getDelivered,
  getExtendedPercentage,
  getMaxDuration,
  getMaxValue,
  getNormalPercentage,
  getTotalBolus,
  getTotalCarbs,
} from '../../utils/bolus';
import {
  getTimezoneFromTimePrefs,
  formatLocalizedFromUTC,
  formatDuration,
  formatBirthdate,
  formatCurrentDate,
} from '../../utils/datetime';
import {
  formatBgValue, formatDecimalNumber, formatPercentage, removeTrailingZeroes,
} from '../../utils/format';
import { getPatientFullName } from '../../utils/misc';

import { MMOLL_UNITS } from '../../utils/constants';

const logo = require('./images/tidepool-logo-408x46.png');

class DailyPrintView {
  constructor(doc, data, opts) {
    this.doc = doc;

    this.debug = opts.debug || false;

    this.data = data;

    this.dpi = opts.dpi;

    this.margins = opts.margins;

    this.font = 'Helvetica';
    this.boldFont = 'Helvetica-Bold';

    this.bgAxisFontSize = 5;
    this.carbsFontSize = 5.5;
    this.defaultFontSize = opts.defaultFontSize;
    this.footerFontSize = opts.footerFontSize;
    this.headerFontSize = opts.headerFontSize;
    this.summaryHeaderFontSize = opts.summaryHeaderFontSize;

    this.bgPrefs = opts.bgPrefs;
    this.bgUnits = opts.bgPrefs.bgUnits;
    this.bgBounds = opts.bgPrefs.bgBounds;
    this.timePrefs = opts.timePrefs;
    this.timezone = getTimezoneFromTimePrefs(opts.timePrefs);

    this.width = opts.width;
    this.height = opts.height;

    this.chartsPerPage = opts.chartsPerPage;
    this.numDays = opts.numDays;

    this.patient = opts.patient;
    this.patientInfoBox = {
      width: 0,
      height: 0,
    };


    // render options
    this.bolusWidth = 3;
    this.carbRadius = 4.25;
    this.cbgRadius = 1;
    this.extendedLineThickness = 0.75;
    this.interruptedLineThickness = 0.5;
    this.smbgRadius = 3;
    this.triangleHeight = 1.25;

    const undelivered = '#B2B2B2';

    this.colors = {
      axes: '#858585',
      bolus: {
        delivered: 'black',
        extendedPath: 'black',
        extendedExpectationPath: undelivered,
        extendedTriangle: 'black',
        extendedTriangleInterrupted: undelivered,
        interrupted: 'white',
        overrideTriangle: 'white',
        programmed: 'black',
        undelivered,
        underride: undelivered,
        underrideTriangle: 'white',
      },
      carbs: '#CFCFCF',
      lightDividers: '#D8D8D8',
      low: '#FF8B7C',
      target: '#76D3A6',
      basal: '#19A0D7',
      high: '#BB9AE7',
    };

    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    this.gapBtwnSummaryAndChartAsPercentage = 0.04;
    this.chartArea = {
      bottomEdge: opts.margins.top + opts.height,
      leftEdge: opts.margins.left +
        (opts.summaryWidthAsPercentage + this.gapBtwnSummaryAndChartAsPercentage) * this.width,
      topEdge: opts.margins.top,
    };

    this.chartArea.width = this.rightEdge - this.chartArea.leftEdge;
    this.initialChartArea = _.clone(this.chartArea);

    this.summaryArea = {
      rightEdge: opts.margins.left + opts.summaryWidthAsPercentage * this.width,
    };

    this.summaryArea.width = this.summaryArea.rightEdge - this.margins.left;

    const dates = _.keys(data.dataByDate);
    this.chartsByDate = {};
    this.initialChartsByDate = {};
    _.each(dates, (date) => {
      const dateData = data.dataByDate[date];
      this.chartsByDate[date] = { ...dateData };
      this.initialChartsByDate[date] = { ...dateData };
    });

    this.startingPageIndex = opts.startingPageIndex || 0;
    this.totalPages = this.initialTotalPages = 0;
    this.chartsPlaced = this.initialChartsPlaced = 0;

    this.chartIndex = this.initialChartIndex = 0;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize().calculateChartMinimums(this.chartArea);

    // no auto-binding :/
    this.newPage = this.newPage.bind(this);
    this.doc.on('pageAdded', this.newPage);

    // calculate heights and place charts in preparation for rendering
    for (let i = 0; i < this.numDays; ++i) {
      const dateData = data.dataByDate[dates[i]];
      this.calculateDateChartHeight(dateData);
    }

    while (this.chartsPlaced < this.numDays) {
      this.placeChartsOnPage(this.totalPages);
    }
    _.each(this.chartsByDate, (dateChart) => {
      this.makeScales(dateChart);
    });
  }

  calculateChartMinimums(chartArea) {
    this.doc.fontSize(10);
    const { topEdge, bottomEdge } = chartArea;
    const totalHeight = bottomEdge - topEdge;
    const perChart = totalHeight / 3.25;
    this.chartMinimums = {
      notesEtc: perChart * (3 / 20),
      bgEtcChart: perChart * (9 / 20),
      bolusDetails: perChart * (4 / 20),
      basalChart: perChart * (3 / 20),
      belowBasal: perChart * (1 / 20),
      paddingBelow: (totalHeight * (1 / 13)) / 3,
      total: perChart,
    };

    return this;
  }

  calculateDateChartHeight({ data, date }) {
    this.doc.fontSize(this.defaultFontSize);
    const lineHeight = this.doc.currentLineHeight() * 1.25;

    const threeHrBinnedBoluses = _.groupBy(data.bolus, (d) => {
      const bolus = getBolusFromInsulinEvent(d);
      return bolus.threeHrBin;
    });
    const maxBolusStack = _.max(_.map(
      _.keys(threeHrBinnedBoluses),
      (key) => {
        const totalLines = _.reduce(threeHrBinnedBoluses[key], (lines, insulinEvent) => {
          const bolus = getBolusFromInsulinEvent(insulinEvent);
          if (bolus.extended || bolus.expectedExtended) {
            return lines + 2;
          }
          return lines + 1;
        }, 0);
        return totalLines;
      },
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
      .domain([0, _.min([this.bgBounds.veryHighThreshold, this.data.bgRange[1]])])
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
    dateChart.xScale = scaleLinear() // eslint-disable-line no-param-reassign
      .domain([dateChart.bounds[0], dateChart.bounds[1]])
      // TODO: change to this.bolusWidth / 2 assuming boluses will be wider than cbgs
      .range([this.chartArea.leftEdge + this.cbgRadius, this.rightEdge - this.cbgRadius]);

    return this;
  }

  newPage() {
    if (this.debug) {
      this.renderDebugGrid();
    }
    this.renderHeader().renderFooter();
  }

  placeChartsOnPage(pageIndex) {
    this.doc.addPage();
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
        break;
      }
      this.chartIndex = i + 1;
      totalChartHeight += thisChartHeight + this.chartMinimums.paddingBelow;
      chartsOnThisPage += 1;
      this.chartsPlaced += 1;
    }
    for (let i = startingIndexThisPage; i < startingIndexThisPage + chartsOnThisPage; ++i) {
      const chart = this.chartsByDate[dates[i]];
      chart.page = pageIndex;
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
        this.doc.fillColor('blue', 0.1)
          .rect(this.chartArea.leftEdge, chart.topEdge, this.chartArea.width, chart.chartHeight)
          .fill();
      }
    }

    this.totalPages += 1;
    return this;
  }

  renderEventPath(path) {
    if (path.type === 'programmed') {
      this.doc.path(path.d)
        .lineWidth(0.5)
        .dash(0.5, { space: 1 })
        .stroke(this.colors.bolus[path.type]);
    } else {
      this.doc.path(path.d)
        .fill(this.colors.bolus[path.type]);
    }
  }

  render() {
    _.each(_.uniq(_.pluck(this.chartsByDate, 'page')), (page) => {
      this.doc.switchToPage(page);
      this.renderPageNumber(page + 1);
    });
    _.each(this.chartsByDate, (dateChart) => {
      this.doc.switchToPage(dateChart.page);
      this.renderSummary(dateChart)
        .renderXAxes(dateChart)
        .renderYAxes(dateChart)
        .renderCbgs(dateChart)
        .renderSmbgs(dateChart)
        .renderInsulinEvents(dateChart)
        .renderBolusDetails(dateChart)
        .renderBasalPaths(dateChart);
    });
  }

  renderPageNumber(page) {
    this.doc.fontSize(this.defaultFontSize);
    const pageNumberY = this.bottomEdge - this.doc.currentLineHeight() * 1.5;
    this.doc.text(
      `page ${page} of ${this.totalPages}`,
      this.margins.left,
      pageNumberY,
      { align: 'right' }
    );
  }

  renderPatientInfo() {
    const patientName = getPatientFullName(this.patient);
    const patientBirthdate = formatBirthdate(this.patient);
    const xOffset = this.margins.left;
    const yOffset = this.margins.top;

    this.doc
      .lineWidth(1)
      .fontSize(10)
      .text(patientName, xOffset, yOffset, {
        lineGap: 2,
      });

    const patientNameWidth = this.patientInfoBox.width = this.doc.widthOfString(patientName);

    this.doc
      .fontSize(10)
      .text(patientBirthdate);

    const patientBirthdayWidth = this.doc.widthOfString(patientBirthdate);
    this.patientInfoBox.height = this.doc.y;

    if (patientNameWidth < patientBirthdayWidth) {
      this.patientInfoBox.width = patientBirthdayWidth;
    }

    // Render the divider between the patient info and title
    const padding = 10;

    this.doc
      .moveTo(this.margins.left + this.patientInfoBox.width + padding, this.margins.top)
      .lineTo(this.margins.left + this.patientInfoBox.width + padding, this.patientInfoBox.height)
      .stroke('black');

    this.dividerWidth = padding * 2 + 1;
  }

  renderTitle() {
    const title = 'Daily View';
    const lineHeight = this.doc.fontSize(14).currentLineHeight();
    const xOffset = this.margins.left + this.patientInfoBox.width + 21;
    const yOffset = (
      this.margins.top + ((this.patientInfoBox.height - this.margins.top) / 2 - (lineHeight / 2))
    );

    this.doc.text(title, xOffset, yOffset);
    this.titleWidth = this.doc.widthOfString(title);
  }

  renderPrintDate() {
    const lineHeight = this.doc.fontSize(14).currentLineHeight();

    // Calculate the remaining available width so we can
    // center the print text between the patient/title text and the logo
    const availableWidth = this.doc.page.width - _.reduce([
      this.patientInfoBox.width,
      this.dividerWidth,
      this.titleWidth,
      this.logoWidth,
      this.margins.left,
      this.margins.right,
    ], (a, b) => (a + b), 0);

    const xOffset = (
      this.margins.left + this.patientInfoBox.width + this.dividerWidth + this.titleWidth
    );
    const yOffset = (
      this.margins.top + ((this.patientInfoBox.height - this.margins.top) / 2 - (lineHeight / 2))
    );

    this.doc
      .fontSize(10)
      .text(`Printed from Tidepool: ${formatCurrentDate()}`, xOffset, yOffset + 4, {
        width: availableWidth,
        align: 'center',
      });
  }

  renderLogo() {
    this.logoWidth = 100;
    const xOffset = this.doc.page.width - this.logoWidth - this.margins.right;
    const yOffset = this.margins.top + 6;

    this.doc.image(logo, xOffset, yOffset, { width: this.logoWidth });
  }

  renderSummary({ data, date, topEdge }) {
    const smallIndent = this.margins.left + 4;
    const statsIndent = 6;
    const widthWithoutIndent = this.summaryArea.width - statsIndent;
    let first = true;

    const totalBasal = getTotalBasal(data.basal);
    const totalBolus = getTotalBolus(data.bolus);
    const totalInsulin = totalBasal + totalBolus;

    const bgPrecision = this.bgUnits === MMOLL_UNITS ? 1 : 0;

    this.doc.fillColor('black')
      .fillOpacity(1)
      .font(this.boldFont)
      .fontSize(this.summaryHeaderFontSize)
      .text(moment(date, 'YYYY-MM-DD').format('dddd M/D'), this.margins.left, topEdge);

    const yPos = (function (doc) { // eslint-disable-line func-names
      let value = topEdge + doc.currentLineHeight() * 1.5;
      return {
        current: () => (value),
        small: () => {
          value += (doc.currentLineHeight() * 0.75);
          return value;
        },
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

    if (!_.isEmpty(data.cbg)) {
      first = false;
      this.doc.fontSize(this.defaultFontSize)
        .lineGap(this.doc.currentLineHeight() * 0.25)
        .text('Time in Target', smallIndent, yPos.update());

      yPos.update();

      const { targetUpperBound, targetLowerBound, veryLowThreshold } = this.bgBounds;

      const cbgTimeInCategories = calcBgPercentInCategories(data.cbg, this.bgBounds);
      const upperTarget = formatDecimalNumber(targetUpperBound, bgPrecision);
      const lowerTarget = formatDecimalNumber(targetLowerBound, bgPrecision);

      this.doc.font(this.font)
        .text(
          `${lowerTarget} - ${upperTarget}`,
          { indent: statsIndent, continued: true, width: widthWithoutIndent },
        )
        .text(`${formatPercentage(cbgTimeInCategories.target)}`, { align: 'right' });

      yPos.update();

      this.doc.text(
          `Below ${formatDecimalNumber(veryLowThreshold, bgPrecision)}`,
          { indent: statsIndent, continued: true, width: widthWithoutIndent },
        )
        .text(`${formatPercentage(cbgTimeInCategories.veryLow)}`, { align: 'right' });

      yPos.update();
    }

    if (!_.isEmpty(data.basal)) {
      if (!first) {
        this.doc.moveTo(this.margins.left, yPos.update())
          .lineTo(this.summaryArea.rightEdge, yPos.current())
          .stroke(this.colors.lightDividers);
      } else {
        first = false;
      }

      this.doc.fontSize(this.defaultFontSize).font(this.boldFont)
        .text('Basal:Bolus Ratio', smallIndent, yPos.update());

      yPos.update();

      const basalPercent = formatPercentage(totalBasal / totalInsulin);
      const bolusPercent = formatPercentage(totalBolus / totalInsulin);

      this.doc.font(this.font)
        .text(
          'Basal',
          { indent: statsIndent, continued: true, width: widthWithoutIndent },
        )
        .text(
          `${basalPercent}, ~${formatDecimalNumber(totalBasal, 0)} U`,
          { align: 'right' }
        );

      yPos.update();

      this.doc.font(this.font)
        .text(
          'Bolus',
          { indent: statsIndent, continued: true, width: widthWithoutIndent },
        )
        .text(
          `${bolusPercent}, ~${formatDecimalNumber(totalBolus, 0)} U`,
          { align: 'right' }
        );

      yPos.update();
    }

    if (!_.isEmpty(data.cbg)) {
      if (!first) {
        this.doc.moveTo(this.margins.left, yPos.update())
          .lineTo(this.summaryArea.rightEdge, yPos.current())
          .stroke(this.colors.lightDividers);
      } else {
        first = false;
      }

      this.doc.fontSize(this.defaultFontSize).font(this.boldFont)
        .text(
          'Average BG',
          smallIndent,
          yPos.update(),
          { continued: true, width: widthWithoutIndent }
        )
        .font(this.font)
        .text(
          `${formatDecimalNumber(mean(data.cbg, (d) => (d.value)), bgPrecision)} ${this.bgUnits}`,
          { align: 'right' }
        );

      yPos.small();
    } else if (!_.isEmpty(data.smbg)) {
      if (!first) {
        this.doc.moveTo(this.margins.left, yPos.update())
          .lineTo(this.summaryArea.rightEdge, yPos.current())
          .stroke(this.colors.lightDividers);
      } else {
        first = false;
      }

      this.doc.fontSize(this.defaultFontSize).font(this.boldFont)
        .text(
          'Average BG',
          smallIndent,
          yPos.update(),
          { continued: true, width: widthWithoutIndent }
        )
        .font(this.font)
        .text(
          `${formatDecimalNumber(mean(data.smbg, (d) => (d.value)), bgPrecision)} ${this.bgUnits}`,
          { align: 'right' }
        );

      yPos.small();
    }

    if (!_.isEmpty(data.basal)) {
      if (!first) {
        this.doc.moveTo(this.margins.left, yPos.update())
          .lineTo(this.summaryArea.rightEdge, yPos.current())
          .stroke(this.colors.lightDividers);
      } else {
        first = false;
      }

      this.doc.fontSize(this.defaultFontSize).font(this.boldFont)
        .text(
          'Total Insulin',
          smallIndent,
          yPos.update(),
          { continued: true, width: widthWithoutIndent }
        )
        .font(this.font)
        .text(
          `${formatDecimalNumber(totalInsulin, 0)} U`,
          { align: 'right' }
        );

      yPos.small();
    }

    if (!_.isEmpty(data.bolus)) {
      if (!first) {
        this.doc.moveTo(this.margins.left, yPos.update())
          .lineTo(this.summaryArea.rightEdge, yPos.current())
          .stroke(this.colors.lightDividers);
      } else {
        first = false;
      }

      this.doc.fontSize(this.defaultFontSize).font(this.boldFont)
        .text(
          'Total Carbs',
          smallIndent,
          yPos.update(),
          { continued: true, width: widthWithoutIndent }
        )
        .font(this.font)
        .text(
          `${formatDecimalNumber(getTotalCarbs(data.bolus), 0)} g`,
          { align: 'right' }
        );
    }

    return this;
  }

  renderXAxes({ bolusDetailsHeight, topEdge }) {
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
      .stroke(this.colors.axes);

    // render bottom border of bolusDetails
    const bottomOfBolusDetails = bottomOfBgEtcChart + bolusDetailsHeight;
    this.doc.moveTo(this.chartArea.leftEdge, bottomOfBolusDetails)
      .lineTo(this.rightEdge, bottomOfBolusDetails)
      .stroke(this.colors.axes);

    // render x-axis for basalChart
    const bottomOfBasalChart = bottomOfBolusDetails + basalChart;
    this.doc.moveTo(this.chartArea.leftEdge, bottomOfBasalChart)
      .lineTo(this.rightEdge, bottomOfBasalChart)
      .stroke(this.colors.axes);

    return this;
  }

  renderYAxes({ bgScale, bottomEdge, bounds, date, topEdge, xScale }) {
    const end = bounds[1];
    let current = bounds[0];
    const threeHrLocs = [current];
    while (current < end) {
      current = moment.utc(current)
        .add(3, 'h')
        .valueOf();
      threeHrLocs.push(current);
    }
    const chart = this.chartsByDate[date];
    chart.bolusDetailPositions = Array(8);
    chart.bolusDetailWidths = Array(8);

    // render the vertical lines at three-hr intervals
    _.each(threeHrLocs, (loc, i) => {
      let xPos = xScale(loc);
      if (i === 0) {
        xPos = this.chartArea.leftEdge;
      }
      if (i === 8) {
        xPos = this.rightEdge;
      }
      if (i > 0) {
        chart.bolusDetailWidths[i - 1] = xPos - chart.bolusDetailPositions[i - 1];
      }
      if (i < 8) {
        chart.bolusDetailPositions[i] = xPos;

        this.doc.font(this.font).fontSize(this.defaultFontSize)
          .text(
            formatLocalizedFromUTC(loc, this.timePrefs, 'ha').slice(0, -1),
            xPos,
            topEdge,
            { indent: 3 },
          );
      }

      this.doc.moveTo(xPos, topEdge)
        .lineTo(xPos, bottomEdge)
        .lineWidth(0.25)
        .stroke(this.colors.axes);
    });

    // render the BG axis labels
    const opts = {
      align: 'right',
      width: this.chartArea.leftEdge - this.summaryArea.rightEdge - 3,
    };
    _.each(this.bgBounds, (bound) => {
      const bgTick = this.bgUnits === MMOLL_UNITS ? parseFloat(bound).toFixed(1) : bound;
      this.doc.font(this.font)
        .fontSize(this.bgAxisFontSize)
        .fillColor(this.colors.axis)
        .text(
          `${bgTick}`,
          this.summaryArea.rightEdge,
          bgScale(bound) - this.doc.currentLineHeight() / 2,
          opts,
        );
    });

    return this;
  }

  renderCbgs({ bgScale, data: { cbg: cbgs }, xScale }) {
    _.each(cbgs, (cbg) => {
      this.doc.circle(xScale(cbg.utc), bgScale(cbg.value), 1)
        .fill(this.colors[classifyBgValue(this.bgBounds, cbg.value)]);
    });

    return this;
  }

  renderSmbgs({ bgScale, data: { smbg: smbgs }, xScale }) {
    _.each(smbgs, (smbg) => {
      const xPos = xScale(smbg.utc);
      const yPos = bgScale(smbg.value);
      const smbgLabel = formatBgValue(smbg.value, this.bgPrefs);
      const labelWidth = this.doc.widthOfString(smbgLabel);
      const labelOffsetX = labelWidth / 2;
      let labelStartX = xPos - labelOffsetX;
      const labelEndX = labelStartX + labelWidth;

      this.doc.circle(xPos, yPos, this.smbgRadius)
        .fill(this.colors[classifyBgValue(this.bgBounds, smbg.value)]);

      // Ensure label is printed within chart area for the x-axis
      if (labelStartX <= this.chartArea.leftEdge) {
        labelStartX = labelStartX + (this.chartArea.leftEdge - labelStartX) + 1;
      }
      if (labelEndX >= this.rightEdge) {
        labelStartX = labelStartX - (labelEndX - this.rightEdge) - 1;
      }

      this.doc.font(this.boldFont)
        .fontSize(this.defaultFontSize)
        .fillColor('black')
        .text(
          smbgLabel,
          labelStartX,
          yPos - 12.5, {
            lineBreak: false,
          },
        );
    });

    return this;
  }

  renderInsulinEvents({ bolusScale, data: { bolus: insulinEvents }, xScale }) {
    _.each(insulinEvents, (insulinEvent) => {
      const paths = getBolusPaths(insulinEvent, xScale, bolusScale, {
        bolusWidth: this.bolusWidth,
        extendedLineThickness: this.extendedLineThickness,
        interruptedLineThickness: this.interruptedLineThickness,
        triangleHeight: this.triangleHeight,
      });
      _.each(paths, (path) => {
        this.renderEventPath(path);
      });
      const carbs = getCarbs(insulinEvent);
      const circleOffset = 1;
      const textOffset = 1.75;
      if (carbs) {
        const carbsX = xScale(getBolusFromInsulinEvent(insulinEvent).utc);
        const carbsY = bolusScale(getMaxValue(insulinEvent)) - this.carbRadius - circleOffset;
        this.doc.circle(carbsX, carbsY, this.carbRadius)
          .fill(this.colors.carbs);
        this.doc.font(this.font)
          .fontSize(this.carbsFontSize)
          .fillColor('black')
          .text(
            carbs,
            carbsX - this.carbRadius,
            carbsY - textOffset,
            { align: 'center', width: this.carbRadius * 2 }
          );
      }
    });

    return this;
  }

  renderBolusDetails({
    bolusDetailPositions,
    bolusDetailWidths,
    bolusScale,
    data: { bolus: insulinEvents },
  }) {
    this.doc.font(this.font)
      .fontSize(this.defaultFontSize)
      .fillColor('black');

    const topOfBolusDetails = bolusScale.range()[0] + 2;

    const grouped = _.groupBy(
      _.map(insulinEvents, (d) => (getBolusFromInsulinEvent(d))),
      (d) => (d.threeHrBin / 3),
    );

    _.each(grouped, (binOfBoluses, i) => {
      const groupWidth = bolusDetailWidths[i] - 2;
      const groupXPos = bolusDetailPositions[i];
      const yPos = (function (doc) { // eslint-disable-line func-names
        let value = topOfBolusDetails;
        return {
          current: () => (value),
          update: () => {
            value += (doc.currentLineHeight() * 1.2);
            return value;
          },
        };
      }(this.doc));
      _.each(_.sortBy(binOfBoluses, 'utc'), (bolus) => {
        const displayTime = formatLocalizedFromUTC(bolus.utc, this.timePrefs, 'h:mma')
          .slice(0, -1);
        this.doc.text(
            displayTime,
            groupXPos,
            yPos.current(),
            { continued: true, indent: 2, width: groupWidth },
          )
          .text(
            removeTrailingZeroes(formatDecimalNumber(getDelivered(bolus), 2)),
            { align: 'right' }
          );
        if (bolus.extended != null) {
          const normalPercentage = getNormalPercentage(bolus);
          const extendedPercentage = getExtendedPercentage(bolus);
          const durationText = `${formatDuration(getMaxDuration(bolus))}`;
          const percentagesText = Number.isNaN(normalPercentage) ?
            `over ${durationText}` : `${extendedPercentage} ${durationText}`;
          this.doc.text(
            percentagesText,
            groupXPos,
            yPos.update(),
            { indent: 2, width: groupWidth },
          );
        }
        yPos.update();
      });
    });

    return this;
  }

  renderBasalPaths({ basalScale, data: { basal, basalSequences: sequences }, xScale }) {
    _.each(sequences, (sequence) => {
      // Skip empty basal sequences -- otherwise getBasalSequencePaths throws error
      if (_.filter(sequence).length) {
        const paths = getBasalSequencePaths(sequence, xScale, basalScale);

        _.each(paths, (path) => {
          const opacity = path.basalType === 'scheduled' ? 0.4 : 0.2;
          if (path.renderType === 'fill') {
            this.doc.path(path.d)
              .fillColor(this.colors.basal)
              .fillOpacity(opacity)
              .fill();
          } else if (path.renderType === 'stroke') {
            this.doc.path(path.d)
              .lineWidth(0.5)
              .dash(1, { space: 2 })
              .stroke(this.colors.basal);
          }
        });
      }
    });

    if (!_.isEmpty(basal)) {
      const wholeDateDeliveredPath = calculateBasalPath(basal, xScale, basalScale, {
        endAtZero: false,
        flushBottomOffset: -0.25,
        isFilled: false,
        startAtZero: false,
      });

      this.doc.path(wholeDateDeliveredPath)
        .lineWidth(0.5)
        .undash()
        .stroke(this.colors.basal);
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

  renderHeader() {
    this.renderPatientInfo();

    this.renderTitle();

    this.renderLogo();

    this.renderPrintDate();

    this.doc.moveDown();

    const lineHeight = this.doc.fontSize(14).currentLineHeight();
    const height = lineHeight * 2.25 + this.margins.top;
    this.doc
      .moveTo(this.margins.left, height)
      .lineTo(this.margins.left + this.width, height)
      .stroke('black');

    // TODO: remove this; it is just for exposing/debugging the chartArea.topEdge adjustment
    if (this.debug) {
      this.doc
        .fillColor('#E8E8E8', 0.3333333333)
        .rect(this.margins.left, this.margins.top, this.width, lineHeight * 4)
        .fill();
    }

    return this;
  }

  renderFooter() {
    this.doc.fontSize(9);
    const lineHeight = this.doc.currentLineHeight();
    this.doc.fillColor('black').fillOpacity(1)
      .text('Legend', this.margins.left, this.bottomEdge - lineHeight * 8);

    const legendHeight = lineHeight * 4;
    const legendTop = this.bottomEdge - lineHeight * 6;

    this.doc.lineWidth(1)
      .rect(this.margins.left, legendTop, this.width, legendHeight)
      .stroke('black');

    this.doc.fontSize(this.defaultFontSize);

    const legendVerticalMiddle = legendTop + lineHeight * 2;
    const legendTextMiddle = legendVerticalMiddle - this.doc.currentLineHeight() / 2;
    const legendItemLeftOffset = 9;
    const legendItemLabelOffset = 6;

    let cursor = this.margins.left + legendItemLeftOffset;

    // rendering the items in the legend
    // cbg
    _.each(_.map(range(0, 16, 2), (d) => ([d, d - 8])), (pair) => {
      const [horizOffset, vertOffset] = pair;
      let fill;
      if (horizOffset < 4) {
        fill = 'high';
      } else if (horizOffset < 12) {
        fill = 'target';
      } else {
        fill = 'low';
      }
      this.doc.circle(cursor + horizOffset, legendVerticalMiddle + vertOffset, this.cbgRadius)
        .fill(this.colors[fill]);
    });
    cursor += 16 + legendItemLabelOffset;
    this.doc.fillColor('black').text('CGM', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('CGM') + legendItemLeftOffset * 2;

    // smbg
    const smbgPositions = {
      target: [cursor, legendVerticalMiddle],
      high: [cursor + this.smbgRadius * 2, legendVerticalMiddle - this.smbgRadius * 2],
      low: [cursor + this.smbgRadius * 2, legendVerticalMiddle + this.smbgRadius * 2],
    };
    this.doc.circle(cursor, legendVerticalMiddle, this.smbgRadius)
      .fill(this.colors.target);
    this.doc.circle(smbgPositions.high[0], smbgPositions.high[1], this.smbgRadius)
      .fill(this.colors.high);
    this.doc.circle(smbgPositions.low[0], smbgPositions.low[1], this.smbgRadius)
      .fill(this.colors.low);
    cursor += this.smbgRadius * 3 + legendItemLabelOffset;
    this.doc.fillColor('black').text('BGM', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('BGM') + legendItemLeftOffset * 2;

    /* boluses */
    const bolusOpts = {
      bolusWidth: this.bolusWidth,
      extendedLineThickness: this.extendedLineThickness,
      interruptedLineThickness: this.interruptedLineThickness,
      triangleHeight: this.triangleHeight,
    };
    const legendBolusYScale = scaleLinear()
      .domain([0, 10])
      .range([legendTop + legendHeight - legendHeight / 4, legendTop + legendHeight / 4]);

    // (normal) bolus
    const normalBolusXScale = scaleLinear()
      .domain([0, 10])
      .range([cursor, cursor + 10]);
    const normalPaths = getBolusPaths(
      { normal: 10, utc: 0 },
      normalBolusXScale,
      legendBolusYScale,
      bolusOpts
    );
    _.each(normalPaths, (path) => {
      this.renderEventPath(path);
    });
    cursor += this.bolusWidth + legendItemLabelOffset;
    this.doc.fillColor('black').text('Bolus', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('Bolus') + legendItemLeftOffset * 2;

    // underride & override boluses
    const rideBolusXScale = scaleLinear()
      .domain([0, 10])
      .range([cursor, cursor + 10]);
    const overridePaths = getBolusPaths(
      {
        type: 'wizard',
        recommended: {
          net: 8,
          carb: 8,
          correction: 0,
        },
        bolus: {
          normal: 10,
          utc: 0,
        },
      },
      rideBolusXScale,
      legendBolusYScale,
      bolusOpts
    );
    _.each(overridePaths, (path) => {
      this.renderEventPath(path);
    });
    const underridePaths = getBolusPaths(
      {
        type: 'wizard',
        recommended: {
          net: 10,
          carb: 8,
          correction: 2,
        },
        bolus: {
          normal: 5,
          utc: 5,
        },
      },
      rideBolusXScale,
      legendBolusYScale,
      bolusOpts
    );
    _.each(underridePaths, (path) => {
      this.renderEventPath(path);
    });
    cursor += this.bolusWidth * 3 + legendItemLabelOffset;
    this.doc.fillColor('black').text('Override up & down', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('Override up & down') + legendItemLeftOffset * 2;

    // interrupted bolus
    const interruptedBolusXScale = scaleLinear()
      .domain([0, 10])
      .range([cursor, cursor + 10]);
    const interruptedPaths = getBolusPaths(
      {
        normal: 6,
        expectedNormal: 10,
        utc: 0,
      },
      interruptedBolusXScale,
      legendBolusYScale,
      bolusOpts
    );
    _.each(interruptedPaths, (path) => {
      this.renderEventPath(path);
    });
    cursor += this.bolusWidth + legendItemLabelOffset;
    this.doc.fillColor('black').text('Interrupted', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('Interrupted') + legendItemLeftOffset * 2;

    // extended bolus
    const extendedBolusXScale = scaleLinear()
      .domain([0, 10])
      .range([cursor, cursor + 10]);
    const extendedPaths = getBolusPaths(
      {
        normal: 5,
        extended: 5,
        duration: 10,
        utc: 0,
      },
      extendedBolusXScale,
      legendBolusYScale,
      bolusOpts
    );
    _.each(extendedPaths, (path) => {
      this.renderEventPath(path);
    });
    cursor += this.bolusWidth / 2 + 10 + legendItemLabelOffset;
    this.doc.fillColor('black').text('Combo', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('Combo') + legendItemLeftOffset * 2;

    // carbohydrates
    this.doc.circle(cursor, legendVerticalMiddle, this.carbRadius)
      .fill(this.colors.carbs);
    this.doc.fillColor('black')
      .fontSize(this.carbsFontSize)
      .text(
        '25',
        cursor - this.carbRadius,
        legendVerticalMiddle - this.carbRadius / 2,
        { align: 'center', width: this.carbRadius * 2 }
      );
    this.doc.fontSize(this.defaultFontSize);
    cursor += this.carbRadius + legendItemLabelOffset;
    this.doc.fillColor('black').text('Carbs', cursor, legendTextMiddle);
    cursor += this.doc.widthOfString('Carbs') + legendItemLeftOffset * 2;

    /* basals */
    const legendBasalYScale = scaleLinear()
      .domain([0, 2])
      .range([legendTop + legendHeight - legendHeight / 4, legendTop + legendHeight / 4]);

    const legendBasalXScale = scaleLinear()
      .domain([0, 10])
      .range([cursor, cursor + 50]);

    const scheduled1 = {
      subType: 'scheduled',
      rate: 1.5,
      duration: 2,
      utc: 0,
    };
    const negTemp = {
      subType: 'temp',
      rate: 0.5,
      duration: 2.5,
      utc: 2,
      suppressed: {
        rate: 1.5,
      },
    };
    const scheduled2 = {
      subType: 'scheduled',
      rate: 1.75,
      duration: 1.5,
      utc: 4.5,
    };
    const posTemp = {
      subType: 'temp',
      rate: 2,
      duration: 2,
      utc: 6,
      suppressed: {
        rate: 1.75,
      },
    };
    const suspend = {
      subType: 'suspend',
      rate: 0,
      duration: 2,
      utc: 8,
      suppressed: {
        rate: 1.75,
      },
    };
    const data = {
      basal: [
        scheduled1,
        negTemp,
        scheduled2,
        posTemp,
        suspend,
      ],
      basalSequences: [
        [scheduled1],
        [negTemp],
        [scheduled2],
        [posTemp],
        [suspend],
      ],
    };
    this.renderBasalPaths({
      basalScale: legendBasalYScale,
      data,
      xScale: legendBasalXScale,
    });
    cursor += 50 + legendItemLabelOffset;
    this.doc.fillColor('black').text('Basals', cursor, legendTextMiddle);

    // TODO: remove this; it is just for exposing/debugging the chartArea.bottomEdge adjustment
    if (this.debug) {
      this.doc.fillColor('#E8E8E8', 0.3333333333)
        .rect(this.margins.left, this.bottomEdge - lineHeight * 9, this.width, lineHeight * 9)
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
