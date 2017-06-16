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
// import util from 'util';

import DailyPrintView from '../../../src/modules/print/DailyPrintView';
import * as patients from '../../../data/patient/fixtures';
import { data } from '../../../data/print/fixtures';

import { getTimezoneFromTimePrefs } from '../../../src/utils/datetime';

describe('DailyPrintView', () => {
  let Renderer;
  const sampleDate = '2017-01-02';

  const DPI = 72;
  const MARGIN = DPI / 2;

  class Doc {
    constructor() {
      this.autoFirstPage = false;
      this.bufferPages = true;
      this.margin = MARGIN;

      this.currentLineHeight = sinon.stub().returns(10);
      this.on = sinon.stub();
      this.fontSize = sinon.stub().returns(this);
      this.addPage = sinon.stub().returns(this);
      this.path = sinon.stub().returns(this);
      this.fill = sinon.stub().returns(this);
      this.stub = sinon.stub().returns(this);
      this.dash = sinon.stub().returns(this);
      this.stroke = sinon.stub().returns(this);
      this.lineWidth = sinon.stub().returns(this);
      this.switchToPage = sinon.stub().returns(this);
      this.text = sinon.stub().returns(this);
      this.fillColor = sinon.stub().returns(this);
      this.fillOpacity = sinon.stub().returns(this);
      this.font = sinon.stub().returns(this);
      this.moveTo = sinon.stub().returns(this);
      this.lineTo = sinon.stub().returns(this);
      this.lineGap = sinon.stub().returns(this);
      this.widthOfString = sinon.stub().returns(this);
    }
  }

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
  };

  beforeEach(() => {
    doc = new Doc();
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
        { prop: 'startingPageIndex', type: 'number', value: opts.startingPageIndex || 0 },
        { prop: 'totalPages', type: 'number', value: 0 },
        { prop: 'chartsPlaced', type: 'number', value: 0 },
        { prop: 'chartIndex', type: 'number', value: 0 },
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
        item.value && expect(Renderer[item.prop]).to.eql(item.value);
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

      const numPages = _.uniq(_.pluck(Renderer.chartsByDate, 'page')).length;
      const numCharts = _.keys(Renderer.chartsByDate).length;

      Renderer.render();

      sinon.assert.callCount(Renderer.doc.switchToPage, (numPages + numCharts));

      sinon.assert.callCount(Renderer.renderPageNumber, numPages);

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

  describe('renderPageNumber', () => {
    it('should be a function', () => {
      expect(Renderer.renderPageNumber).to.be.a('function');
    });

    it('should render the page number', () => {
      const page = 1;

      Renderer.renderPageNumber(page);
      sinon.assert.calledWith(Renderer.doc.text, `page ${page} of ${Renderer.totalPages}`);
    });
  });

  describe('renderPatientInfo', () => {
    it('should be a function', () => {
      expect(Renderer.renderPatientInfo).to.be.a('function');
    });

    it('should render patient information', () => {
      Renderer.renderPatientInfo();
    });
  });
});
