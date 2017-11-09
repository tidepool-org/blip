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
import moment from 'moment';
import { mean } from 'd3-array';

import DailyPrintView from '../../../src/modules/print/DailyPrintView';
import * as patients from '../../../data/patient/profiles';
import { data } from '../../../data/print/fixtures';

import { getTotalBasal } from '../../../src/utils/basal';
import { getTotalBolus, getTotalCarbs } from '../../../src/utils/bolus';
import { formatPercentage, formatDecimalNumber, formatBgValue } from '../../../src/utils/format';
import {
  getTimezoneFromTimePrefs,
  formatBirthdate,
  formatCurrentDate,
} from '../../../src/utils/datetime';

import Doc from '../../helpers/pdfDoc';
import { getPatientFullName } from '../../../src/utils/misc';

describe('DailyPrintView', () => {
  let Renderer;
  const sampleDate = '2017-01-02';

  const DPI = 72;
  const MARGIN = DPI / 2;

  let doc;

  const opts = {
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 300,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      },
      bgUnits: 'mg/dL',
    },
    chartsPerPage: 3,
    debug: false,
    defaultFontSize: 8,
    dpi: DPI,
    footerFontSize: 8,
    headerFontSize: 14,
    height: 11 * DPI - (2 * MARGIN),
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    numDays: 6,
    patient: patients.standard,
    summaryHeaderFontSize: 10,
    summaryWidthAsPercentage: 0.18,
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Pacific',
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: 'Daily View',
  };

  const mmollOpts = _.assign({}, opts, {
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 16.7,
        targetUpperBound: 10,
        targetLowerBound: 3.9,
        veryLowThreshold: 3.1,
      },
      bgUnits: 'mmol/L',
    },
  });

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    Renderer = new DailyPrintView(doc, data, opts);
  });

  describe('class constructor', () => {
    it('should instantiate without errors', () => {
      expect(Renderer).to.be.an('object');
    });

    it('should set default properties as provided by constructor args', () => {
      expect(Renderer.doc).to.eql(doc);
      expect(Renderer.data).to.eql(data);

      const overrideOpts = [
        'debug',
        'dpi',
        'margins',
        'defaultFontSize',
        'footerFontSize',
        'headerFontSize',
        'summaryHeaderFontSize',
        'bgPrefs',
        'timePrefs',
        'width',
        'height',
        'chartsPerPage',
        'numDays',
        'patient',
      ];

      _.each(overrideOpts, opt => {
        expect(Renderer[opt]).to.equal(opts[opt]);
      });

      expect(Renderer.bgUnits).to.equal(opts.bgPrefs.bgUnits);
      expect(Renderer.bgBounds).to.equal(opts.bgPrefs.bgBounds);
      expect(Renderer.timezone).to.equal(getTimezoneFromTimePrefs(opts.timePrefs));
    });

    it('should set it\'s own required initial instance properties', () => {
      const requiredProps = [
        { prop: 'font', type: 'string' },
        { prop: 'boldFont', type: 'string' },
        { prop: 'bgAxisFontSize', type: 'number' },
        { prop: 'carbsFontSize', type: 'number' },
        { prop: 'bolusWidth', type: 'number' },
        { prop: 'carbRadius', type: 'number' },
        { prop: 'cbgRadius', type: 'number' },
        { prop: 'extendedLineThickness', type: 'number' },
        { prop: 'interruptedLineThickness', type: 'number' },
        { prop: 'smbgRadius', type: 'number' },
        { prop: 'triangleHeight', type: 'number' },
        // { prop: 'startingPageIndex', type: 'number', value: opts.startingPageIndex || 0 },
        { prop: 'initialTotalPages', type: 'number', value: 0 },
        { prop: 'initialChartsPlaced', type: 'number', value: 0 },
        { prop: 'initialChartIndex', type: 'number', value: 0 },
        { prop: 'colors', type: 'object' },
        { prop: 'gapBtwnSummaryAndChartAsPercentage', type: 'number' },
        { prop: 'rightEdge', type: 'number', value: Renderer.margins.left + Renderer.width },
        { prop: 'bottomEdge', type: 'number', value: Renderer.margins.top + Renderer.height },
        { prop: 'patientInfoBox', type: 'object', value: {
          width: 0,
          height: 0,
        } },
        { prop: 'chartArea', type: 'object' },
        { prop: 'initialChartArea', type: 'object', value: {
          bottomEdge: opts.margins.top + opts.height,
          leftEdge: opts.margins.left +
          (opts.summaryWidthAsPercentage + Renderer.gapBtwnSummaryAndChartAsPercentage) *
          Renderer.width,
          topEdge: opts.margins.top,
          width: Renderer.rightEdge - (opts.margins.left +
          (opts.summaryWidthAsPercentage + Renderer.gapBtwnSummaryAndChartAsPercentage) *
          Renderer.width),
        } },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });

      _.each(_.keys(data.dataByDate), date => {
        expect(Renderer.initialChartsByDate[date]).to.eql(data.dataByDate[date]);
      });
    });

    it('should kick off the dynamic calculation of chart area based on header and footer', () => {
      expect(Renderer.chartArea.bottomEdge).to.not.eql(Renderer.initialChartArea.bottomEdge);
      expect(Renderer.chartArea.topEdge).to.not.eql(Renderer.initialChartArea.topEdge);

      expect(Renderer.chartMinimums).to.be.an('object');
    });

    it('should assign the newPage function as a callback to the doc\'s pageAdded event', () => {
      sinon.assert.calledWith(Renderer.doc.on, 'pageAdded', Renderer.newPage);
    });

    it('should calculate heights in preparation for rendering', () => {
      expect(Renderer.chartsByDate[sampleDate].bolusDetailsHeight).to.be.a('number');
      expect(Renderer.chartsByDate[sampleDate].bolusDetailsHeight > 0).to.be.true;

      expect(Renderer.chartsByDate[sampleDate].chartHeight).to.be.a('number');
      expect(Renderer.chartsByDate[sampleDate].chartHeight > 0).to.be.true;
    });

    it('should place charts in preparation for rendering', () => {
      expect(Renderer.chartsPlaced).to.be.a('number');
      expect(Renderer.chartsPlaced > 0).to.be.true;

      expect(Renderer.totalPages).to.be.a('number');
      expect(Renderer.totalPages > 0).to.be.true;
    });

    it('should make chart scales in preparation for rendering', () => {
      expect(Renderer.chartsByDate[sampleDate].bgScale).to.be.a('function');
      expect(Renderer.chartsByDate[sampleDate].bolusScale).to.be.a('function');
      expect(Renderer.chartsByDate[sampleDate].basalScale).to.be.a('function');
      expect(Renderer.chartsByDate[sampleDate].xScale).to.be.a('function');
    });
  });

  describe('calculateChartMinimums', () => {
    it('should be a function', () => {
      expect(Renderer.calculateChartMinimums).to.be.a('function');
    });

    it('should calculate the minimum area available to the charts', () => {
      Renderer.calculateChartMinimums(Renderer.initialChartArea);
      const { topEdge, bottomEdge } = Renderer.initialChartArea;
      const totalHeight = bottomEdge - topEdge;

      expect(Renderer.chartMinimums.total).to.equal(totalHeight / 3.25);
    });
  });

  describe('calculateDateChartHeight', () => {
    it('should be a function', () => {
      expect(Renderer.calculateDateChartHeight).to.be.a('function');
    });

    // Functionality already confirmed in constructor tests
  });

  describe('makeScales', () => {
    it('should be a function', () => {
      expect(Renderer.makeScales).to.be.a('function');
    });

    // Functionality already confirmed in constructor tests
  });

  describe('newPage', () => {
    it('should be a function', () => {
      expect(Renderer.newPage).to.be.a('function');
    });

    it('should render a header and footer', () => {
      sinon.stub(Renderer, 'renderHeader').returns(Renderer);
      sinon.stub(Renderer, 'renderFooter');

      Renderer.newPage();
      sinon.assert.called(Renderer.renderHeader);
      sinon.assert.called(Renderer.renderFooter);
    });
  });

  describe('placeChartsOnPage', () => {
    it('should be a function', () => {
      expect(Renderer.placeChartsOnPage).to.be.a('function');
    });

    // Functionality already confirmed in constructor tests
  });

  describe('renderEventPath', () => {
    it('should be a function', () => {
      expect(Renderer.renderEventPath).to.be.a('function');
    });

    it('should render an svg path', () => {
      const path = {
        d: 'path',
      };

      const programmedPath = {
        d: 'programmedPath',
        type: 'programmed',
      };

      Renderer.renderEventPath(path);
      sinon.assert.calledWith(Renderer.doc.path, path.d);
      sinon.assert.calledOnce(Renderer.doc.path);
      sinon.assert.calledOnce(Renderer.doc.fill);

      Renderer.renderEventPath(programmedPath);
      sinon.assert.calledWith(Renderer.doc.path, programmedPath.d);
      sinon.assert.calledTwice(Renderer.doc.path);
      sinon.assert.calledOnce(Renderer.doc.lineWidth);
      sinon.assert.calledOnce(Renderer.doc.dash);
      sinon.assert.calledOnce(Renderer.doc.stroke);
    });
  });

  describe('render', () => {
    it('should be a function', () => {
      expect(Renderer.render).to.be.a('function');
    });

    it('should call all the appropriate render methods for each page and chart', () => {
      sinon.stub(Renderer, 'renderPageNumber');
      sinon.stub(Renderer, 'renderSummary').returns(Renderer);
      sinon.stub(Renderer, 'renderXAxes').returns(Renderer);
      sinon.stub(Renderer, 'renderYAxes').returns(Renderer);
      sinon.stub(Renderer, 'renderCbgs').returns(Renderer);
      sinon.stub(Renderer, 'renderSmbgs').returns(Renderer);
      sinon.stub(Renderer, 'renderInsulinEvents').returns(Renderer);
      sinon.stub(Renderer, 'renderBolusDetails').returns(Renderer);
      sinon.stub(Renderer, 'renderBasalPaths').returns(Renderer);

      const numCharts = _.keys(Renderer.chartsByDate).length;

      Renderer.render();

      sinon.assert.callCount(Renderer.doc.switchToPage, numCharts);

      sinon.assert.callCount(Renderer.renderSummary, numCharts);
      sinon.assert.callCount(Renderer.renderXAxes, numCharts);
      sinon.assert.callCount(Renderer.renderYAxes, numCharts);
      sinon.assert.callCount(Renderer.renderCbgs, numCharts);
      sinon.assert.callCount(Renderer.renderSmbgs, numCharts);
      sinon.assert.callCount(Renderer.renderInsulinEvents, numCharts);
      sinon.assert.callCount(Renderer.renderBolusDetails, numCharts);
      sinon.assert.callCount(Renderer.renderBasalPaths, numCharts);
    });
  });

  describe('renderPatientInfo', () => {
    it('should be a function', () => {
      expect(Renderer.renderPatientInfo).to.be.a('function');
    });

    it('should render patient information', () => {
      Renderer.doc.y = 32;
      Renderer.renderPatientInfo();
      sinon.assert.calledWith(Renderer.doc.text, getPatientFullName(opts.patient));
      sinon.assert.calledWith(Renderer.doc.text, `DOB: ${formatBirthdate(opts.patient)}`);

      expect(Renderer.patientInfoBox.width).to.be.a('number');
      expect(Renderer.patientInfoBox.width > 0).to.be.true;

      expect(Renderer.patientInfoBox.height).to.be.a('number');
      expect(Renderer.patientInfoBox.height > 0).to.be.true;
    });
  });

  describe('renderTitle', () => {
    it('should be a function', () => {
      expect(Renderer.renderTitle).to.be.a('function');
    });

    it('should render the page title', () => {
      const title = 'Daily View';

      Renderer.renderTitle();
      sinon.assert.calledWith(Renderer.doc.text, title);
    });

    it('should calculate the width of the title', () => {
      Renderer.renderTitle();
      expect(Renderer.titleWidth).to.be.a('number');
      expect(Renderer.titleWidth > 0).to.be.true;
    });
  });

  describe('renderPrintDate', () => {
    it('should be a function', () => {
      expect(Renderer.renderPrintDate).to.be.a('function');
    });

    it('should render the date printed', () => {
      Renderer.renderPrintDate();
      sinon.assert.calledWith(Renderer.doc.text, `Printed on: ${formatCurrentDate()}`);
    });
  });

  describe('renderLogo', () => {
    it('should be a function', () => {
      expect(Renderer.renderLogo).to.be.a('function');
    });

    it('should render the Tidepool logo', () => {
      Renderer.renderLogo();
      sinon.assert.calledOnce(Renderer.doc.image);
    });
  });

  describe('renderSummary', () => {
    let args;

    const setArgs = (renderer) => ({
      date: sampleDate,
      data: renderer.chartsByDate[sampleDate].data,
      topEdge: 100,
    });

    beforeEach(() => {
      args = setArgs(Renderer);
      Renderer.renderSummary(args);
    });

    it('should be a function', () => {
      expect(Renderer.renderSummary).to.be.a('function');
    });

    it('should render a formatted date', () => {
      const formattedDate = moment(sampleDate, 'YYYY-MM-DD').format('dddd M/D');

      sinon.assert.calledWith(Renderer.doc.text, formattedDate);
    });

    it('should render the time in target', () => {
      const { targetUpperBound, targetLowerBound, veryLowThreshold } = Renderer.bgBounds;

      sinon.assert.calledWith(Renderer.doc.text, 'Time in Target');
      sinon.assert.calledWith(Renderer.doc.text, `${targetLowerBound} - ${targetUpperBound}`);
      sinon.assert.calledWith(Renderer.doc.text, `Below ${veryLowThreshold}`);
    });

    it('should render the basal to bolus ratio', () => {
      const totalBasal = getTotalBasal(args.data.basal);
      const totalBolus = getTotalBolus(args.data.bolus);
      const totalInsulin = totalBasal + totalBolus;
      const basalPercent = formatPercentage(totalBasal / totalInsulin);
      const bolusPercent = formatPercentage(totalBolus / totalInsulin);
      const basalPercentText = `${basalPercent}, ~${formatDecimalNumber(totalBasal, 0)} U`;
      const bolusPercentText = `${bolusPercent}, ~${formatDecimalNumber(totalBolus, 0)} U`;

      sinon.assert.calledWith(Renderer.doc.text, 'Basal:Bolus Ratio');

      sinon.assert.calledWith(Renderer.doc.text, 'Basal');
      sinon.assert.calledWith(Renderer.doc.text, basalPercentText);

      sinon.assert.calledWith(Renderer.doc.text, 'Bolus');
      sinon.assert.calledWith(Renderer.doc.text, bolusPercentText);
    });

    it('should render the Average BG with cbg data if available', () => {
      const averageBG = formatDecimalNumber(mean(args.data.cbg, (d) => (d.value)), 0);
      const averageBGText = `${averageBG} ${Renderer.bgUnits}`;

      sinon.assert.calledWith(Renderer.doc.text, 'Average BG');
      sinon.assert.calledWith(Renderer.doc.text, averageBGText);
    });

    it('should render the Average BG with smbg data if available', () => {
      const noCbgArgs = _.cloneDeep(args);
      noCbgArgs.data.cbg = [];
      Renderer.renderSummary(noCbgArgs);
      const averageBG = formatDecimalNumber(mean(noCbgArgs.data.smbg, (d) => (d.value)), 0);
      const averageBGText = `${averageBG} ${Renderer.bgUnits}`;

      sinon.assert.calledWith(Renderer.doc.text, 'Average BG');
      sinon.assert.calledWith(Renderer.doc.text, averageBGText);
    });

    it('should render the total daily insulin', () => {
      const totalBasal = getTotalBasal(args.data.basal);
      const totalBolus = getTotalBolus(args.data.bolus);
      const totalInsulin = totalBasal + totalBolus;
      const totalInsulinText = `${formatDecimalNumber(totalInsulin, 0)} U`;

      sinon.assert.calledWith(Renderer.doc.text, 'Total Insulin');
      sinon.assert.calledWith(Renderer.doc.text, totalInsulinText);
    });

    it('should render the total carbs intake', () => {
      const totalCarbs = getTotalCarbs(args.data.bolus);
      const totalCarbsText = `${formatDecimalNumber(totalCarbs, 0)} g`;

      sinon.assert.calledWith(Renderer.doc.text, 'Total Carbs');
      sinon.assert.calledWith(Renderer.doc.text, totalCarbsText);
    });

    context('mmol/L support', () => {
      beforeEach(() => {
        Renderer = new DailyPrintView(doc, data, mmollOpts);
        args = setArgs(Renderer);
        Renderer.renderSummary(args);
      });

      it('should render the time in target in mmol/L with correct formatting', () => {
        const { targetUpperBound, targetLowerBound, veryLowThreshold } = Renderer.bgBounds;
        const text = {
          targetUpper: formatDecimalNumber(targetUpperBound, 1),
          targetLower: formatDecimalNumber(targetLowerBound, 1),
          veryLow: formatDecimalNumber(veryLowThreshold, 1),
        };
        sinon.assert.calledWith(Renderer.doc.text, 'Time in Target');
        sinon.assert.calledWith(Renderer.doc.text, `${text.targetLower} - ${text.targetUpper}`);
        sinon.assert.calledWith(Renderer.doc.text, `Below ${text.veryLow}`);
      });

      it('should render the Average BG in mmol/L with correct formatting', () => {
        const averageBG = formatDecimalNumber(mean(args.data.cbg, (d) => (d.value)), 1);
        const averageBGText = `${averageBG} mmol/L`;

        sinon.assert.calledWith(Renderer.doc.text, 'Average BG');
        sinon.assert.calledWith(Renderer.doc.text, averageBGText);
      });
    });
  });

  describe('renderXAxes', () => {
    it('should be a function', () => {
      expect(Renderer.renderXAxes).to.be.a('function');
    });

    it('should render X axis at the bottom of the bg, bolus, and basal charts', () => {
      const args = {
        bolusDetailsHeight: 100,
        topEdge: 150,
        date: sampleDate,
      };

      const {
        notesEtc,
        bgEtcChart,
        basalChart,
      } = Renderer.chartMinimums;

      const bottomOfBgEtcChart = args.topEdge + notesEtc + bgEtcChart;
      const bottomOfBolusInfo = bottomOfBgEtcChart + args.bolusDetailsHeight;
      const bottomOfBasalChart = bottomOfBolusInfo + basalChart;

      Renderer.renderXAxes(args);
      sinon.assert.calledWith(Renderer.doc.moveTo, Renderer.chartArea.leftEdge, bottomOfBgEtcChart);
      sinon.assert.calledWith(Renderer.doc.moveTo, Renderer.chartArea.leftEdge, bottomOfBolusInfo);
      sinon.assert.calledWith(Renderer.doc.moveTo, Renderer.chartArea.leftEdge, bottomOfBasalChart);

      sinon.assert.calledWith(Renderer.doc.lineTo, Renderer.rightEdge, bottomOfBasalChart);
      sinon.assert.calledWith(Renderer.doc.lineTo, Renderer.rightEdge, bottomOfBolusInfo);
      sinon.assert.calledWith(Renderer.doc.lineTo, Renderer.rightEdge, bottomOfBasalChart);

      sinon.assert.calledThrice(Renderer.doc.stroke);
    });
  });

  describe('renderYAxes', () => {
    const setArgs = (renderer) => ({
      bgScale: sinon.stub().returns(100),
      bottomOfBasalChart: 150,
      bounds: renderer.chartsByDate[sampleDate].bounds,
      date: sampleDate,
      topEdge: 350,
      xScale: sinon.stub().returns(100),
    });

    it('should be a function', () => {
      expect(Renderer.renderYAxes).to.be.a('function');
    });

    it('should render Y axis lines, times and bg bounds', () => {
      const args = setArgs(Renderer);
      Renderer.renderYAxes(args);

      // Should draw a vertical line for every 3hr slot,
      // plus a final one to close the chart and the 2 BG target lines
      sinon.assert.callCount(Renderer.doc.lineTo, 24 / 3 + 1 + 2);
      sinon.assert.calledWith(Renderer.doc.moveTo, sinon.match.number, args.topEdge);
      sinon.assert.calledWith(Renderer.doc.lineTo, sinon.match.number, args.bottomOfBasalChart);

      // Should render the timeslot time in the format 9a or 12p
      sinon.assert.calledWith(Renderer.doc.text, sinon.match(/\d?(\d)[a|p]/));
    });

    context('mmol/L support', () => {
      beforeEach(() => {
        Renderer = new DailyPrintView(doc, data, mmollOpts);

        Renderer.renderYAxes(setArgs(Renderer));
      });

      it('should render bg bounds in mmol/L with proper formatting', () => {
        sinon.assert.calledWith(Renderer.doc.text, '16.7');
        sinon.assert.calledWith(Renderer.doc.text, '10.0');
        sinon.assert.calledWith(Renderer.doc.text, '3.9');
        sinon.assert.calledWith(Renderer.doc.text, '3.1');
      });
    });
  });

  describe('renderCbgs', () => {
    it('should be a function', () => {
      expect(Renderer.renderCbgs).to.be.a('function');
    });

    it('should render cbg data', () => {
      const cbgCount = Renderer.chartsByDate[sampleDate].data.cbg.length;

      Renderer.renderCbgs(Renderer.chartsByDate[sampleDate]);
      sinon.assert.callCount(Renderer.doc.circle, cbgCount);
    });
  });

  describe('renderSmbgs', () => {
    it('should be a function', () => {
      expect(Renderer.renderSmbgs).to.be.a('function');
    });

    it('should render smbg data as a cirle with a value', () => {
      const smbgCount = Renderer.chartsByDate[sampleDate].data.smbg.length;

      Renderer.renderSmbgs(Renderer.chartsByDate[sampleDate]);
      sinon.assert.callCount(Renderer.doc.circle, smbgCount);

      _.each(Renderer.chartsByDate[sampleDate].data.smbg, smbg => {
        const smbgLabel = formatBgValue(smbg.value, Renderer.bgPrefs);
        sinon.assert.calledWith(Renderer.doc.text, smbgLabel);
      });
    });

    context('mmol/L support', () => {
      beforeEach(() => {
        Renderer = new DailyPrintView(doc, data, mmollOpts);
        Renderer.renderSmbgs(Renderer.chartsByDate[sampleDate]);
      });

      it('should render smbg data in mmol/L with proper formatting', () => {
        const smbgCount = Renderer.chartsByDate[sampleDate].data.smbg.length;

        sinon.assert.callCount(Renderer.doc.circle, smbgCount);

        _.each(Renderer.chartsByDate[sampleDate].data.smbg, smbg => {
          const smbgLabel = formatBgValue(smbg.value, Renderer.bgPrefs);
          expect(smbgLabel.indexOf('.')).to.equal(smbgLabel.length - 2);
          sinon.assert.calledWith(Renderer.doc.text, smbgLabel);
        });
      });
    });
  });

  describe('renderInsulinEvents', () => {
    it('should be a function', () => {
      expect(Renderer.renderInsulinEvents).to.be.a('function');
    });

    it('should graph bolus and carb events', () => {
      const bolusCount = Renderer.chartsByDate[sampleDate].data.bolus.length;

      sinon.stub(Renderer, 'renderEventPath');
      Renderer.renderInsulinEvents(Renderer.chartsByDate[sampleDate]);

      expect(Renderer.renderEventPath.callCount >= bolusCount).to.be.true;
      sinon.assert.calledOnce(Renderer.doc.circle);
      sinon.assert.calledWith(Renderer.doc.text, 80);
    });
  });

  describe('renderBolusDetails', () => {
    it('should be a function', () => {
      expect(Renderer.renderBolusDetails).to.be.a('function');
    });

    it('should render bolus details', () => {
      const bolusCount = Renderer.chartsByDate[sampleDate].data.bolus.length;
      Renderer.chartsByDate[sampleDate].bolusDetailWidths = Array(8);
      Renderer.chartsByDate[sampleDate].bolusDetailPositions = Array(8);

      Renderer.renderBolusDetails(Renderer.chartsByDate[sampleDate]);

      // We expect 2 calls to doc.text() for each of our 3 sample data boluses
      // Plus one more for the extended one
      const expectedTextCallCount = bolusCount * 2 + 1;

      sinon.assert.callCount(Renderer.doc.text, expectedTextCallCount);
    });
  });

  describe('renderBasalPaths', () => {
    it('should be a function', () => {
      expect(Renderer.renderBasalPaths).to.be.a('function');
    });

    it('should render basal paths', () => {
      const basalData = Renderer.chartsByDate[sampleDate].data.basal;

      Renderer.renderBasalPaths(Renderer.chartsByDate[sampleDate]);

      sinon.assert.callCount(Renderer.doc.path, basalData.length);
    });
  });

  describe('renderDebugGrid', () => {
    it('should be a function', () => {
      expect(Renderer.renderDebugGrid).to.be.a('function');
    });

    // Not really used for anything except local debugging,
    // so no need to test deeply
  });

  describe('renderHeader', () => {
    it('should be a function', () => {
      expect(Renderer.renderHeader).to.be.a('function');
    });

    it('should render the header', () => {
      sinon.spy(Renderer, 'renderPatientInfo');
      sinon.spy(Renderer, 'renderTitle');
      sinon.spy(Renderer, 'renderLogo');
      sinon.spy(Renderer, 'renderPrintDate');

      Renderer.renderHeader();

      sinon.assert.calledOnce(Renderer.renderPatientInfo);
      sinon.assert.calledOnce(Renderer.renderTitle);
      sinon.assert.calledOnce(Renderer.renderLogo);
      sinon.assert.calledOnce(Renderer.renderPrintDate);
    });
  });

  describe('renderLegend', () => {
    it('should be a function', () => {
      expect(Renderer.renderLegend).to.be.a('function');
    });

    it('should render the legend', () => {
      sinon.stub(Renderer, 'renderEventPath');
      sinon.stub(Renderer, 'renderBasalPaths');

      Renderer.renderLegend();

      sinon.assert.calledWith(Renderer.doc.text, 'Legend');
      sinon.assert.calledWith(Renderer.doc.text, 'CGM');
      sinon.assert.calledWith(Renderer.doc.text, 'BGM');
      sinon.assert.calledWith(Renderer.doc.text, 'Bolus');
      sinon.assert.calledWith(Renderer.doc.text, 'Override up & down');
      sinon.assert.calledWith(Renderer.doc.text, 'Interrupted');
      sinon.assert.calledWith(Renderer.doc.text, 'Combo');
      sinon.assert.calledWith(Renderer.doc.text, 'Carbs');
      sinon.assert.calledWith(Renderer.doc.text, 'Basals');

      // All of the bolus visual elements are called by renderEventPath
      // And the paths total 13
      sinon.assert.callCount(Renderer.renderEventPath, 13);

      // CGM and BGM data calls (11) + one for carbs
      sinon.assert.callCount(Renderer.doc.circle, 12);

      sinon.assert.callCount(Renderer.renderBasalPaths, 1);
    });
  });

  describe('renderFooter', () => {
    it('should be a function', () => {
      expect(Renderer.renderFooter).to.be.a('function');
    });

    it('should render the footer', () => {
      Renderer.renderFooter();

      sinon.assert.calledWith(
        Renderer.doc.text,
        'Questions or feedback? Please email support@tidepool.org or visit support.tidepool.org.'
      );
    });
  });

  describe('setFooterSize', () => {
    it('should be a function', () => {
      expect(Renderer.setFooterSize).to.be.a('function');
    });

    it('should set the footer size', () => {
      const bottomEdge = Renderer.chartArea.bottomEdge - Renderer.doc.currentLineHeight() * 9;

      Renderer.setFooterSize();
      expect(Renderer.chartArea.bottomEdge).to.equal(bottomEdge);
    });
  });

  describe('setHeaderSize', () => {
    it('should be a function', () => {
      expect(Renderer.setHeaderSize).to.be.a('function');
    });

    it('should set the footer size', () => {
      const topEdge = Renderer.chartArea.topEdge + Renderer.doc.currentLineHeight() * 4;

      Renderer.setHeaderSize();
      expect(Renderer.chartArea.topEdge).to.equal(topEdge);
    });
  });
});
