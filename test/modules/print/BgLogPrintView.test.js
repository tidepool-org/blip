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

/* eslint-disable max-len, no-underscore-dangle */

import _ from 'lodash';

import BgLogPrintView from '../../../src/modules/print/BgLogPrintView';
import PrintView from '../../../src/modules/print/PrintView';
import * as patients from '../../../data/patient/profiles';
import * as settings from '../../../data/patient/settings';

import { bgLogData as data } from '../../../data/print/fixtures';

import {
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
} from '../../../src/modules/print/utils/constants';

import { THREE_HRS } from '../../../src/utils/datetime';

import Doc from '../../helpers/pdfDoc';
import { MMOLL_UNITS } from '../../../src/utils/constants';

describe('BgLogPrintView', () => {
  let Renderer;

  const DPI = 72;
  const MARGIN = DPI / 2;

  let doc;

  const opts = {
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 250,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      },
      bgUnits: 'mg/dL',
    },
    debug: false,
    dpi: DPI,
    defaultFontSize: DEFAULT_FONT_SIZE,
    footerFontSize: FOOTER_FONT_SIZE,
    headerFontSize: HEADER_FONT_SIZE,
    largeFontSize: LARGE_FONT_SIZE,
    smallFontSize: SMALL_FONT_SIZE,
    extraSmallFontSize: EXTRA_SMALL_FONT_SIZE,
    height: 11 * DPI - (2 * MARGIN),
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    numDays: 30,
    patient: {
      ...patients.standard,
      ...settings.cannulaPrimeSelected,
    },
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Pacific',
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: 'Bg Readings',
  };

  const defaultBgChartHeaders = [
    {
      id: 'date',
      text: '',
    },
    {
      id: 0,
      text: '12 am',
    },
    {
      id: THREE_HRS * 1,
      text: '3 am',
    },
    {
      id: THREE_HRS * 2,
      text: '6 am',
    },
    {
      id: THREE_HRS * 3,
      text: '9 am',
    },
    {
      id: THREE_HRS * 4,
      text: '12 pm',
    },
    {
      id: THREE_HRS * 5,
      text: '3 pm',
    },
    {
      id: THREE_HRS * 6,
      text: '6 pm',
    },
    {
      id: THREE_HRS * 7,
      text: '9 pm',
    },
  ];

  const createRenderer = (renderData = data, renderOpts = opts) => (
    new BgLogPrintView(doc, renderData, renderOpts)
  );

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    Renderer = createRenderer();
  });

  describe('class constructor', () => {
    it('should instantiate without errors', () => {
      expect(Renderer).to.be.an('object');
    });

    it('should extend the `PrintView` class', () => {
      expect(Renderer instanceof PrintView).to.be.true;
    });

    it('should set it\'s own required initial instance properties', () => {
      const requiredProps = [
        { prop: 'smbgRadius', type: 'number' },
        { prop: 'numDays', type: 'number' },
        { prop: 'chartDates', type: 'array' },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });
    });

    it('should set the `chartDates` property to the dataByDate keys in reverse chronological order', () => {
      expect(Renderer.chartDates).to.be.an('array').and.have.length(30);
      expect(Renderer.chartDates[0]).to.equal('2018-01-29');
      expect(Renderer.chartDates[29]).to.equal('2017-12-31');
    });

    it('should add the first pdf page', () => {
      sinon.assert.calledOnce(Renderer.doc.addPage);
    });
  });

  describe('newPage', () => {
    let newPageSpy;

    beforeEach(() => {
      newPageSpy = sinon.spy(PrintView.prototype, 'newPage');
    });

    afterEach(() => {
      newPageSpy.restore();
    });

    it('should call the newPage method of the parent class with a date range string', () => {
      Renderer.newPage();
      sinon.assert.calledWith(PrintView.prototype.newPage, 'Date range: Dec 31, 2017 - Jan 29, 2018');
    });
  });

  describe('getBGLabelYOffset', () => {
    it('should return `-12` if `bgChart.datumsRendered` is an even number or undefined', () => {
      Renderer.bgChart = {
        datumsRendered: undefined,
      };
      expect(Renderer.getBGLabelYOffset()).to.equal(-12);

      Renderer.bgChart.datumsRendered = 2;
      expect(Renderer.getBGLabelYOffset()).to.equal(-12);

      Renderer.bgChart.datumsRendered = 20;
      expect(Renderer.getBGLabelYOffset()).to.equal(-12);
    });

    it('should return `5` if `bgChart.datumsRendered` is an odd number', () => {
      Renderer.bgChart = {
        datumsRendered: 1,
      };
      expect(Renderer.getBGLabelYOffset()).to.equal(5);

      Renderer.bgChart.datumsRendered = 3;
      expect(Renderer.getBGLabelYOffset()).to.equal(5);

      Renderer.bgChart.datumsRendered = 21;
      expect(Renderer.getBGLabelYOffset()).to.equal(5);
    });
  });

  describe('getBgChartColumns', () => {
    beforeEach(() => {
      Renderer.bgChart = {
        headers: defaultBgChartHeaders,
        columnWidth: 100,
      };
    });

    it('should return default column definitions from a map of headers', () => {
      const result = Renderer.getBgChartColumns();

      expect(result).to.be.an('array').and.have.length(9);

      _.each(result, (column, i) => {
        expect(column.header).to.equal(defaultBgChartHeaders[i].text);
        expect(column.id).to.equal(defaultBgChartHeaders[i].id);
        expect(column.cache).to.be.false;
        expect(column.headerPadding).to.be.an('array');
        expect(column.height).to.be.a('number');
        expect(column.padding).to.be.an('array');
        expect(column.renderer).to.be.a('function');
        expect(column.renderer.name).to.contain('renderBgCell');
        expect(column.width).to.equal(100);
      });
    });

    it('should return empty column `border`, `headerBorder`, and `headerFill` properties for first column', () => {
      const result = Renderer.getBgChartColumns();

      expect(result[0].border).to.equal('');
      expect(result[0].headerBorder).to.equal('');
      expect(result[0].headerFill).to.be.false;
    });

    it('should return non-empty column `border`, `headerBorder`, and `headerFill` properties for subsequent columns', () => {
      const result = Renderer.getBgChartColumns();

      expect(result[1].border).to.equal('TBLR');
      expect(result[1].headerBorder).to.equal('BL');
      expect(result[1].headerFill).to.be.an('object').and.have.keys(['color', 'opacity']);
    });

    it('should return empty column `border`, `headerBorder`, and `headerFill` properties for subsequent columns when disabled via `opts` arg', () => {
      const result = Renderer.getBgChartColumns({
        border: false,
        headerBorder: false,
        headerFill: false,
      });

      expect(result[1].border).to.equal('');
      expect(result[1].headerBorder).to.equal('');
      expect(result[1].headerFill).to.be.false;
    });
  });

  describe('getBgChartRow', () => {
    beforeEach(() => {
      Renderer.bgChart = {
        headers: defaultBgChartHeaders,
        columnWidth: 100,
      };

      Renderer.bgChart.columns = Renderer.getBgChartColumns();
    });

    it('should return formatted date text for each row', () => {
      const result = Renderer.getBgChartRow('2017-12-31');

      expect(result.date.text).to.equal('Sun, Dec 31');
    });

    it('should return the row smbg data for a given date, grouped by 3 hr time slot', () => {
      const result = Renderer.getBgChartRow('2017-12-31');

      expect(result[THREE_HRS * 0].smbg[0].value).to.equal(50);
      expect(result[THREE_HRS * 1].smbg[0].value).to.equal(70);
      expect(result[THREE_HRS * 2].smbg[0].value).to.equal(90);
      expect(result[THREE_HRS * 3].smbg[0].value).to.equal(150);
      expect(result[THREE_HRS * 4].smbg[0].value).to.equal(170);
      expect(result[THREE_HRS * 5].smbg[0].value).to.equal(190);
      expect(result[THREE_HRS * 6].smbg[0].value).to.equal(210);
      expect(result[THREE_HRS * 7].smbg[0].value).to.equal(260);
    });

    it('should return a darker fill color for weekend rows', () => {
      const weekendResult = Renderer.getBgChartRow('2017-12-31');
      expect(weekendResult.date.text).to.equal('Sun, Dec 31');
      expect(weekendResult._fill.color).to.equal('#FAFAFA');

      const weekdayResult = Renderer.getBgChartRow('2018-01-01');
      expect(weekdayResult.date.text).to.equal('Mon, Jan 1');
      expect(weekdayResult._fill.color).to.equal('white');
    });
  });

  describe('render', () => {
    it('should call all the appropriate render methods', () => {
      sinon.stub(Renderer, 'renderBGChart');
      sinon.stub(Renderer, 'renderSummaryTable');

      Renderer.render();

      sinon.assert.calledOnce(Renderer.renderBGChart);
      sinon.assert.calledOnce(Renderer.renderSummaryTable);
    });
  });

  describe('renderBGChart', () => {
    beforeEach(() => {
      Renderer.renderTable = sinon.stub();
      Renderer.getBgChartColumns = sinon.stub().returns('stubbed columns');
      Renderer.getBgChartRow = sinon.stub().returns('stubbed row');
    });

    it('should define a bgChart class property', () => {
      expect(Renderer.bgChart).to.be.undefined;
      Renderer.renderBGChart();
      expect(Renderer.bgChart).to.be.an('object');
    });

    it('should define the bg chart headers', () => {
      Renderer.renderBGChart();
      expect(Renderer.bgChart.headers).to.eql(defaultBgChartHeaders);
    });

    it('should set the chart to use equal column widths based on the number of headers', () => {
      Renderer.renderBGChart();
      assert(Renderer.chartArea.width === 540);
      assert(Renderer.bgChart.headers.length === 9);
      expect(Renderer.bgChart.columnWidth).to.eql(60);
    });

    it('should define the bg chart columns', () => {
      sinon.assert.notCalled(Renderer.getBgChartColumns);

      Renderer.renderBGChart();

      sinon.assert.called(Renderer.getBgChartColumns);
      expect(Renderer.bgChart.columns).to.eql('stubbed columns');
    });

    it('should create the bg chart rows - one for each chart date', () => {
      sinon.assert.callCount(Renderer.getBgChartRow, 0);

      Renderer.renderBGChart();
      assert(Renderer.chartDates.length === 30);
      expect(Renderer.bgChart.rows).to.be.an('array').and.have.length(30);

      sinon.assert.callCount(Renderer.getBgChartRow, 30);

      Renderer.chartDates.pop();
      Renderer.renderBGChart();
      expect(Renderer.bgChart.rows).to.be.an('array').and.have.length(29);
    });

    it('should define the bg chart initial render position', () => {
      Renderer.doc.x = 260;
      Renderer.doc.y = 80;
      Renderer.initialTotalPages = 2;
      Renderer.currentPageIndex = 1;

      Renderer.renderBGChart();
      expect(Renderer.bgChart.pos).to.eql({
        x: 260,
        y: 80,
        currentPage: 3,
        currentPageIndex: 1,
      });
    });

    it('should render a first pass of the table, skipping the cell data rendering', () => {
      Renderer.renderBGChart();

      sinon.assert.callCount(Renderer.renderTable, 2);

      expect(Renderer.renderTable.firstCall.calledWith(
        Renderer.bgChart.columns,
        Renderer.bgChart.rows,
        sinon.match({
          columnDefaults: {
            fill: true,
            skipDraw: true,
          },
        })
      ));
    });

    it('should render a second pass of the table, skipping the table fills and borders', () => {
      Renderer.renderBGChart();

      sinon.assert.callCount(Renderer.renderTable, 2);

      sinon.assert.calledWith(Renderer.getBgChartColumns, {
        headerFill: false,
        border: false,
      });

      expect(Renderer.renderTable.secondCall.calledWith(
        'stubbed columns',
        Renderer.bgChart.rows,
        sinon.match({
          columnDefaults: {
            fill: false,
          },
        })
      ));
    });

    it('should switch back to the original chart position between render passes', () => {
      Renderer.initialTotalPages = 2;
      Renderer.currentPageIndex = 1;

      Renderer.renderBGChart();

      assert(Renderer.bgChart.pos.currentPage === 3);

      sinon.assert.calledWith(Renderer.doc.switchToPage, 3);
      sinon.assert.callOrder(Renderer.renderTable, Renderer.doc.switchToPage, Renderer.renderTable);
    });
  });

  describe('renderSummaryTable', () => {
    beforeEach(() => {
      Renderer.renderTable = sinon.stub();
      Renderer.bgChart = {
        columnWidth: 200,
      };
    });

    it('should reset text styles', () => {
      const resetTextSpy = sinon.spy(Renderer, 'resetText');
      sinon.assert.callCount(resetTextSpy, 0);
      Renderer.renderSummaryTable();
      sinon.assert.callCount(resetTextSpy, 1);
    });

    it('should define the summary table columns for mg/dL units', () => {
      Renderer.renderSummaryTable();

      expect(Renderer.summaryTable.columns).to.eql([
        {
          id: 'totalDays',
          header: 'Days In Report',
        },
        {
          id: 'totalReadings',
          header: 'Total BG Readings',
        },
        {
          id: 'avgReadingsPerDay',
          header: 'Avg. BG Readings / Day',
        },
        {
          id: 'avgBg',
          header: 'Avg. BG (mg/dL)',
        },
      ]);
    });

    it('should define the summary table columns for mmol/L units', () => {
      Renderer.bgUnits = MMOLL_UNITS;
      Renderer.renderSummaryTable();

      expect(Renderer.summaryTable.columns).to.eql([
        {
          id: 'totalDays',
          header: 'Days In Report',
        },
        {
          id: 'totalReadings',
          header: 'Total BG Readings',
        },
        {
          id: 'avgReadingsPerDay',
          header: 'Avg. BG Readings / Day',
        },
        {
          id: 'avgBg',
          header: 'Avg. BG (mmol/L)',
        },
      ]);
    });

    it('should define the summary table rows with results when all required stat data is provided', () => {
      Renderer = createRenderer(_.assign({}, data, {
        stats: { averageGlucose: { data: { raw: {
          averageGlucose: 120,
          total: 90,
          days: 30,
        } } } },
      }), opts);

      Renderer.renderTable = sinon.stub();
      Renderer.bgChart = {
        columnWidth: 200,
      };

      Renderer.renderSummaryTable();

      expect(Renderer.summaryTable.rows).to.eql([
        {
          totalDays: '30',
          totalReadings: '90',
          avgReadingsPerDay: '3',
          avgBg: '120',
        },
      ]);
    });

    it('should define the summary table rows with empty results when no stat data is provided', () => {
      Renderer = createRenderer(_.assign({}, data, {
        stats: undefined,
      }), _.assign({}, opts, {
        numDays: 30,
      }));

      Renderer.renderTable = sinon.stub();
      Renderer.bgChart = {
        columnWidth: 200,
      };

      Renderer.renderSummaryTable();

      expect(Renderer.summaryTable.rows).to.eql([
        {
          totalDays: '30',
          totalReadings: '0',
          avgReadingsPerDay: '0',
          avgBg: '--',
        },
      ]);
    });

    it('should render the summary table with the defined columns and rows', () => {
      Renderer.renderSummaryTable();

      sinon.assert.callCount(Renderer.renderTable, 1);
      sinon.assert.calledWith(Renderer.renderTable,
        Renderer.summaryTable.columns,
        Renderer.summaryTable.rows,
        sinon.match.object,
      );
    });
  });

  describe('renderBgCell', () => {
    beforeEach(() => {
      Renderer.doc.circle.resetHistory();
      Renderer.doc.text.resetHistory();

      Renderer.bgChart = {
        datumsRendered: 0,
      };
    });

    it('should return a non-empty string to ensure it performs a second render pass', () => {
      const result = Renderer.renderBgCell();
      expect(result).to.equal(' ');
    });

    it('should render the date text when `text` data property is available', () => {
      const draw = true;
      const column = { id: 'myCol' };
      const pos = { x: 100, y: 100 };
      const padding = { top: 2, left: 2, bottom: 2 };

      const cellData = { myCol: { text: 'Tues, Jan 9' } };

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);
      sinon.assert.calledWith(Renderer.doc.text, 'Tues, Jan 9');
    });

    it('should render a circle and text for an smbg value when `smbg` data property is available', () => {
      const draw = true;
      const column = { id: 'myCol' };
      const pos = { x: 100, y: 100 };
      const padding = { top: 2, left: 2, bottom: 2 };

      const cellData = { myCol: { smbg: [{
        msPer24: 1000,
        value: 90,
      }] } };

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);
      sinon.assert.calledWith(Renderer.doc.text, '90');
      sinon.assert.callCount(Renderer.doc.circle, 1);
    });

    it('should render smbg circles in the appropriate bg range colors', () => {
      const draw = true;
      const column = { id: 'myCol' };
      const pos = { x: 100, y: 100 };
      const padding = { top: 2, left: 2, bottom: 2 };

      const cellData = { myCol: { smbg: [
        {
          msPer24: 1000,
          value: 50,
        },
        {
          msPer24: 1000,
          value: 60,
        },
        {
          msPer24: 1000,
          value: 90,
        },
        {
          msPer24: 1000,
          value: 190,
        },
        {
          msPer24: 1000,
          value: 260,
        },
      ] } };

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);

      sinon.assert.callCount(Renderer.doc.fill, 10);

      // First fill call in each render will be for the circle color
      const fillCall1 = Renderer.doc.fill.getCall(0);
      const fillCall2 = Renderer.doc.fill.getCall(2);
      const fillCall3 = Renderer.doc.fill.getCall(4);
      const fillCall4 = Renderer.doc.fill.getCall(6);
      const fillCall5 = Renderer.doc.fill.getCall(8);

      expect(fillCall1.calledWith(Renderer.colors.veryLow)).to.be.true;
      expect(fillCall2.calledWith(Renderer.colors.low)).to.be.true;
      expect(fillCall3.calledWith(Renderer.colors.target)).to.be.true;
      expect(fillCall4.calledWith(Renderer.colors.high)).to.be.true;
      expect(fillCall5.calledWith(Renderer.colors.veryHigh)).to.be.true;
    });

    it('should call `getBGLabelYOffset` instance method during each smbg render to stagger the labels for legibility', () => {
      sinon.spy(Renderer, 'getBGLabelYOffset');

      const draw = true;
      const column = { id: 'myCol' };
      const pos = { x: 100, y: 100 };
      const padding = { top: 2, left: 2, bottom: 2 };

      const cellData = { myCol: { smbg: [
        {
          msPer24: 1000,
          value: 50,
        },
        {
          msPer24: 1000,
          value: 60,
        },
        {
          msPer24: 1000,
          value: 90,
        },
        {
          msPer24: 1000,
          value: 190,
        },
        {
          msPer24: 1000,
          value: 260,
        },
      ] } };

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);

      sinon.assert.callCount(Renderer.getBGLabelYOffset, 5);
    });

    it('should increment `bgChart.datumsRendered` after each smbg render', () => {
      const draw = true;
      const column = { id: 'myCol' };
      const pos = { x: 100, y: 100 };
      const padding = { top: 2, left: 2, bottom: 2 };

      const cellData = { myCol: { smbg: [{
        msPer24: 1000,
        value: 90,
      }] } };

      expect(Renderer.bgChart.datumsRendered).to.equal(0);

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);
      expect(Renderer.bgChart.datumsRendered).to.equal(1);

      Renderer.renderBgCell(doc.table, cellData, draw, column, pos, padding);
      expect(Renderer.bgChart.datumsRendered).to.equal(2);
    });

    it('should not draw a cell when `draw` arg is false', () => {
      const draw = false;
      Renderer.renderBgCell(doc.table, {}, draw);

      sinon.assert.callCount(Renderer.doc.circle, 0);
      sinon.assert.callCount(Renderer.doc.text, 0);
    });

    it('should not draw a cell when `skipDraw` property of the `column` arg is true', () => {
      const draw = true;
      const column = { skipDraw: true };
      Renderer.renderBgCell(doc.table, {}, draw, column);

      sinon.assert.callCount(Renderer.doc.circle, 0);
      sinon.assert.callCount(Renderer.doc.text, 0);
    });
  });
});
