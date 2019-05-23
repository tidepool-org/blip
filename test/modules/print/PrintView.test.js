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

/* eslint-disable max-len */

import _ from 'lodash';

import PrintView from '../../../src/modules/print/PrintView';

import * as patients from '../../../data/patient/profiles';

import {
  getTimezoneFromTimePrefs,
  formatBirthdate,
  formatCurrentDate,
} from '../../../src/utils/datetime';

import {
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
} from '../../../src/modules/print/utils/constants';

import Doc from '../../helpers/pdfDoc';
import { getPatientFullName } from '../../../src/utils/misc';

describe('PrintView', () => {
  let Renderer;

  const data = {};

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
    patient: patients.standard,
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Pacific',
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: 'Print View',
  };

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    Renderer = new PrintView(doc, data, opts);
  });

  describe('class constructor', () => {
    it('should instantiate without errors', () => {
      expect(Renderer).to.be.an('object');
    });

    it('should set default properties as provided by constructor args', () => {
      expect(Renderer.doc).to.eql(doc);
      expect(Renderer.data).to.eql(data);

      const overrideOpts = [
        'title',
        'debug',
        'dpi',
        'margins',
        'defaultFontSize',
        'footerFontSize',
        'headerFontSize',
        'largeFontSize',
        'smallFontSize',
        'extraSmallFontSize',
        'bgPrefs',
        'timePrefs',
        'width',
        'height',
        'patient',
      ];

      _.each(overrideOpts, opt => {
        expect(Renderer[opt]).to.equal(opts[opt]);
      });

      expect(Renderer.bgUnits).to.equal(opts.bgPrefs.bgUnits);
      expect(Renderer.bgBounds).to.equal(opts.bgPrefs.bgBounds);
      expect(Renderer.timezone).to.equal(getTimezoneFromTimePrefs(opts.timePrefs));
    });

    it('should set fallback default properties when not provided by constructor args', () => {
      const fallbackOpts = [
        'debug',
        'dpi',
        'margins',
        'defaultFontSize',
        'footerFontSize',
        'headerFontSize',
        'largeFontSize',
        'smallFontSize',
        'extraSmallFontSize',
        'width',
        'height',
      ];

      const strippedOpts = _.cloneDeep(opts);

      _.forEach(fallbackOpts, opt => {
        delete(strippedOpts[opt]);
      });

      const strippedRenderer = new PrintView(doc, data, opts);

      _.each(fallbackOpts, opt => {
        expect(strippedRenderer[opt]).to.not.be.undefined;
      });
    });

    it('should set data to an empty object when not provided to constructor', () => {
      const noDataRenderer = new PrintView(doc, undefined, opts);
      expect(noDataRenderer.data).to.eql({});
    });

    it('should set it\'s own required initial instance properties', () => {
      const requiredProps = [
        { prop: 'font', type: 'string' },
        { prop: 'boldFont', type: 'string' },
        { prop: 'colors', type: 'object' },
        { prop: 'tableSettings', type: 'object' },
        { prop: 'leftEdge', type: 'number', value: Renderer.margins.left },
        { prop: 'rightEdge', type: 'number', value: Renderer.margins.left + Renderer.width },
        { prop: 'bottomEdge', type: 'number', value: Renderer.margins.top + Renderer.height },
        { prop: 'patientInfoBox', type: 'object', value: {
          width: 0,
          height: 0,
        } },
        { prop: 'chartArea', type: 'object' },
        { prop: 'initialChartArea', type: 'object' },
        { prop: 'totalPages', type: 'number', value: 0 },
        { prop: 'initialTotalPages', type: 'number', value: 0 },
        { prop: 'currentPageIndex', type: 'number', value: -1 },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });
    });

    it('should remove any existing listeners assigned to the doc\'s pageAdded event', () => {
      sinon.assert.calledWith(Renderer.doc.removeAllListeners, 'pageAdded');
    });

    it('should assign the newPage function as a callback to the doc\'s pageAdded event', () => {
      sinon.assert.calledWith(Renderer.doc.on, 'pageAdded', Renderer.newPage);
    });

    it('should subtract the header and footer size from the chart area', () => {
      expect(Renderer.chartArea.topEdge).to.be.above(Renderer.initialChartArea.topEdge);
      expect(Renderer.chartArea.bottomEdge).to.be.below(Renderer.initialChartArea.bottomEdge);
    });
  });

  describe('newPage', () => {
    it('should render a header and footer', () => {
      sinon.stub(Renderer, 'renderHeader').returns(Renderer);
      sinon.stub(Renderer, 'renderFooter');

      Renderer.newPage();
      sinon.assert.called(Renderer.renderHeader);
      sinon.assert.called(Renderer.renderFooter);
    });

    it('should increment `currentPageIndex` each time it\'s called', () => {
      expect(Renderer.currentPageIndex).to.equal(-1);
      Renderer.newPage();
      expect(Renderer.currentPageIndex).to.equal(0);
      Renderer.newPage();
      expect(Renderer.currentPageIndex).to.equal(1);
    });

    it('should increment `totalPages` each time it\'s called', () => {
      expect(Renderer.totalPages).to.equal(0);
      Renderer.newPage();
      expect(Renderer.totalPages).to.equal(1);
      Renderer.newPage();
      expect(Renderer.totalPages).to.equal(2);
    });

    it('should reset the font styles after rendering the footer', () => {
      sinon.stub(Renderer, 'renderHeader').returns(Renderer);
      sinon.stub(Renderer, 'renderFooter');
      Renderer.doc.font.resetHistory();
      Renderer.doc.fontSize.resetHistory();
      Renderer.newPage();

      sinon.assert.calledOnce(Renderer.doc.font);
      sinon.assert.calledOnce(Renderer.doc.fontSize);
      sinon.assert.callOrder(
        Renderer.renderHeader,
        Renderer.renderFooter,
        Renderer.doc.font,
        Renderer.doc.fontSize
      );
    });

    it('should maintain the previous page\'s column layout and position', () => {
      expect(Renderer.layoutColumns).to.be.undefined;

      Renderer.setLayoutColumns({ width: Renderer.width, count: 3 });
      Renderer.goToLayoutColumnPosition(1);

      expect(Renderer.layoutColumns.activeIndex).to.equal(1);
      expect(Renderer.layoutColumns.count).to.equal(3);

      Renderer.newPage();

      expect(Renderer.layoutColumns.activeIndex).to.equal(1);
      expect(Renderer.layoutColumns.count).to.equal(3);
    });

    it('should call `setNewPageTablePosition` when rendering a table', () => {
      const setNewPageTablePositionSpy = sinon.spy(Renderer, 'setNewPageTablePosition');

      Renderer.table = undefined;
      Renderer.newPage();

      sinon.assert.callCount(setNewPageTablePositionSpy, 0);

      Renderer.table = {
        pos: {
          x: 100,
          y: 100,
        },
        pdf: doc,
      };

      Renderer.newPage();
      sinon.assert.callCount(setNewPageTablePositionSpy, 1);
    });
  });

  describe('setNewPageTablePosition', () => {
    it('should maintain the previous page\'s table x position when in a layout column', () => {
      Renderer.setLayoutColumns({ width: 100, count: 3, gutter: 10 });
      Renderer.goToLayoutColumnPosition(1);

      const xPos = Renderer.layoutColumns.columns[1].x;
      const yPos = 300;

      Renderer.doc.x = xPos;
      Renderer.doc.y = yPos;

      Renderer.table = {
        pos: {
          x: xPos,
          y: yPos,
        },
        pdf: doc,
      };

      Renderer.setNewPageTablePosition();

      expect(Renderer.doc.y).to.equal(Renderer.chartArea.topEdge);
      expect(Renderer.table.pos.y).to.equal(Renderer.chartArea.topEdge);

      expect(Renderer.doc.x).to.equal(xPos);
      expect(Renderer.table.pos.x).to.equal(xPos);
    });

    it('should use the left edge as the x position when not in a layout column', () => {
      Renderer.layoutColumns = undefined;

      Renderer.doc.x = 200;
      Renderer.doc.y = 100;

      Renderer.table = {
        pos: {
          x: 200,
          y: 100,
        },
        pdf: doc,
      };

      Renderer.setNewPageTablePosition();

      expect(Renderer.doc.y).to.equal(Renderer.chartArea.topEdge);
      expect(Renderer.table.pos.y).to.equal(Renderer.chartArea.topEdge);

      expect(Renderer.doc.x).to.equal(Renderer.chartArea.leftEdge);
      expect(Renderer.table.pos.x).to.equal(Renderer.chartArea.leftEdge);
    });
  });

  describe('setLayoutColumns', () => {
    it('should define an equal spaced column layout when type is unspecified', () => {
      Renderer.setLayoutColumns({ count: 3 });
      expect(Renderer.layoutColumns.type).to.equal('equal');
    });

    it('should define an equal spaced column layout with correct count and gutters', () => {
      const colCount = 3;

      Renderer.setLayoutColumns({
        type: 'equal',
        count: colCount,
        gutter: 10,
        width: 120,
      });

      expect(Renderer.layoutColumns.type).to.equal('equal');
      expect(Renderer.layoutColumns.columns.length).to.equal(colCount);
      expect(Renderer.layoutColumns.columns[0].width).to.equal(100 / colCount);
      expect(Renderer.layoutColumns.columns[1].width).to.equal(100 / colCount);
      expect(Renderer.layoutColumns.columns[2].width).to.equal(100 / colCount);
    });

    it('should define a percentage-based column layout with correct count and gutters', () => {
      const colCount = 3;

      Renderer.setLayoutColumns({
        type: 'percentage',
        gutter: 10,
        width: 1020,
        widths: [30, 40, 30],
      });

      expect(Renderer.layoutColumns.type).to.equal('percentage');
      expect(Renderer.layoutColumns.columns.length).to.equal(colCount);
      expect(Renderer.layoutColumns.columns[0].width).to.equal(300);
      expect(Renderer.layoutColumns.columns[1].width).to.equal(400);
      expect(Renderer.layoutColumns.columns[2].width).to.equal(300);
    });
  });

  describe('updateLayoutColumnPosition', () => {
    it('should update the position of a layout column to the current doc cursor position', () => {
      Renderer.doc.y = Renderer.chartArea.topEdge;

      const activeColumn = 0;
      Renderer.setLayoutColumns({ count: 3 });
      Renderer.goToLayoutColumnPosition(activeColumn);

      expect(Renderer.layoutColumns.columns[activeColumn].x).to.equal(Renderer.chartArea.leftEdge);
      expect(Renderer.layoutColumns.columns[activeColumn].y).to.equal(Renderer.chartArea.topEdge);

      Renderer.doc.x = 400;
      Renderer.doc.y = 500;

      Renderer.updateLayoutColumnPosition(activeColumn);
      expect(Renderer.layoutColumns.columns[activeColumn].x).to.equal(400);
      expect(Renderer.layoutColumns.columns[activeColumn].y).to.equal(500);
    });
  });

  describe('goToLayoutColumnPosition', () => {
    it('should move the doc cursor to a layout column position', () => {
      Renderer.doc.x = Renderer.chartArea.leftEdge;
      Renderer.doc.y = Renderer.chartArea.topEdge;

      const activeColumn = 1;
      Renderer.setLayoutColumns({ count: 3, width: 900 });

      expect(Renderer.doc.x).to.equal(Renderer.chartArea.leftEdge);
      expect(Renderer.doc.y).to.equal(Renderer.chartArea.topEdge);

      Renderer.goToLayoutColumnPosition(activeColumn);

      expect(Renderer.doc.x).to.equal(Renderer.chartArea.leftEdge + 300);
      expect(Renderer.doc.y).to.equal(Renderer.chartArea.topEdge);
    });
  });

  describe('getShortestLayoutColumn', () => {
    it('should return the index of the column with the top-most y position', () => {
      Renderer.doc.y = 100;
      Renderer.setLayoutColumns({ count: 3, width: 900 });

      expect(Renderer.getShortestLayoutColumn()).to.equal(0);

      Renderer.doc.y = 200;
      Renderer.updateLayoutColumnPosition(0);
      expect(Renderer.getShortestLayoutColumn()).to.equal(1);

      Renderer.doc.y = 300;
      Renderer.updateLayoutColumnPosition(0);
      Renderer.updateLayoutColumnPosition(1);

      expect(Renderer.getShortestLayoutColumn()).to.equal(2);
    });
  });

  describe('getLongestLayoutColumn', () => {
    it('should return the index of the column with the bottom-most y position', () => {
      Renderer.doc.y = 100;
      Renderer.setLayoutColumns({ count: 3, width: 900 });

      expect(Renderer.getLongestLayoutColumn()).to.equal(0);

      Renderer.doc.y = 200;
      Renderer.updateLayoutColumnPosition(0);
      expect(Renderer.getLongestLayoutColumn()).to.equal(0);

      Renderer.doc.y = 300;
      Renderer.updateLayoutColumnPosition(2);

      expect(Renderer.getLongestLayoutColumn()).to.equal(2);

      Renderer.doc.y = 400;
      Renderer.updateLayoutColumnPosition(1);

      expect(Renderer.getLongestLayoutColumn()).to.equal(1);
    });
  });

  describe('getActiveColumnWidth', () => {
    it('should return the width of the active column', () => {
      Renderer.setLayoutColumns({
        type: 'percentage',
        gutter: 10,
        width: 1020,
        widths: [30, 40, 30],
      });

      Renderer.goToLayoutColumnPosition(1);
      expect(Renderer.getActiveColumnWidth()).to.equal(400);
    });
  });

  describe('getDateRange', () => {
    it('should return the formatted date range', () => {
      const result = Renderer.getDateRange('2017-12-01', '2017-12-10', 'YYYY-MM-DD');

      expect(result).to.equal('Date range: Dec 1 - Dec 10, 2017');
    });
  });

  describe('setFill', () => {
    it('should call doc fill methods with default args', () => {
      Renderer.setFill();
      sinon.assert.calledWith(Renderer.doc.fillColor, 'black');
      sinon.assert.calledWith(Renderer.doc.fillOpacity, 1);
    });

    it('should call doc fill methods with provided args', () => {
      Renderer.setFill('blue', 0.5);
      sinon.assert.calledWith(Renderer.doc.fillColor, 'blue');
      sinon.assert.calledWith(Renderer.doc.fillOpacity, 0.5);
    });
  });

  describe('setStroke', () => {
    it('should call doc stroke methods with default args', () => {
      Renderer.setStroke();
      sinon.assert.calledWith(Renderer.doc.strokeColor, 'black');
      sinon.assert.calledWith(Renderer.doc.strokeOpacity, 1);
    });

    it('should call doc stroke methods with provided args', () => {
      Renderer.setStroke('blue', 0.5);
      sinon.assert.calledWith(Renderer.doc.strokeColor, 'blue');
      sinon.assert.calledWith(Renderer.doc.strokeOpacity, 0.5);
    });
  });

  describe('resetText', () => {
    it('should reset the doc text style', () => {
      sinon.spy(Renderer, 'setFill');

      Renderer.resetText();
      sinon.assert.calledOnce(Renderer.setFill);
      sinon.assert.calledWith(Renderer.doc.lineGap, 0);
      sinon.assert.calledWith(Renderer.doc.fontSize, opts.defaultFontSize);
      sinon.assert.calledWith(Renderer.doc.font, Renderer.font);
    });
  });

  describe('renderSectionHeading', () => {
    it('should render a section heading provided as a string', () => {
      Renderer.renderSectionHeading('hello');
      sinon.assert.calledWith(Renderer.doc.text, 'hello');
    });

    it('should render a section heading provided as an object with text and subText keys', () => {
      Renderer.renderSectionHeading({
        text: 'hello',
        subText: 'there',
      });

      sinon.assert.calledWith(Renderer.doc.text, 'hello');
      sinon.assert.calledWith(Renderer.doc.text, ' there');
    });

    it('should set default font and font sizes for the text and subText', () => {
      Renderer.renderSectionHeading({
        text: 'hello',
        subText: 'there',
      });

      sinon.assert.calledWith(Renderer.doc.fontSize, Renderer.headerFontSize);
      sinon.assert.calledWith(Renderer.doc.font, Renderer.font);

      sinon.assert.calledWith(Renderer.doc.fontSize, Renderer.defaultFontSize);
    });

    it('should override default font sizes for the text and subText', () => {
      Renderer.renderSectionHeading({
        text: 'hello',
        subText: 'there',
      }, {
        font: 'mainFont',
        fontSize: 16,
        subTextFont: 'otherFont',
        subTextFontSize: 18,
      });

      sinon.assert.calledWith(Renderer.doc.fontSize, 16);
      sinon.assert.calledWith(Renderer.doc.font, 'mainFont');

      sinon.assert.calledWith(Renderer.doc.fontSize, 18);
      sinon.assert.calledWith(Renderer.doc.font, 'otherFont');
    });

    it('should default to the current doc position', () => {
      Renderer.doc.x = Renderer.chartArea.leftEdge;
      Renderer.doc.y = Renderer.chartArea.topEdge;

      const xPos = Renderer.doc.x;
      const yPos = Renderer.doc.y;
      Renderer.renderSectionHeading('hello');

      sinon.assert.calledWithMatch(Renderer.doc.text, 'hello', xPos, yPos);
    });

    it('should override the current doc position with provided args', () => {
      Renderer.doc.x = Renderer.chartArea.leftEdge;
      Renderer.doc.y = Renderer.chartArea.topEdge;

      Renderer.renderSectionHeading('hello', {
        xPos: 100,
        yPos: 300,
      });

      sinon.assert.calledWithMatch(Renderer.doc.text, 'hello', 100, 300);
    });

    it('should reset the text style when done', () => {
      sinon.spy(Renderer, 'resetText');
      Renderer.renderSectionHeading('hello');

      sinon.assert.calledOnce(Renderer.resetText);
    });

    it('should move the cursor down a default or specified amount when done', () => {
      Renderer.renderSectionHeading('hello');
      sinon.assert.calledOnce(Renderer.doc.moveDown);
      sinon.assert.calledWith(Renderer.doc.moveDown, 1);

      Renderer.renderSectionHeading('hello', { moveDown: 3.5 });
      sinon.assert.calledWith(Renderer.doc.moveDown, 3.5);
    });
  });

  describe('renderCellStripe', () => {
    const pos = {
      x: 100,
      y: 200,
    };

    const column = {
      fillStripe: {
        color: 'blue',
        opacity: 0.6,
        width: 8,
      },
      headerFillStripe: {
        color: 'green',
        opacity: 0.7,
        width: 10,
      },
      height: 30,
      headerHeight: 40,
    };

    beforeEach(() => {
      sinon.spy(Renderer, 'setFill');
    });

    afterEach(() => {
      Renderer.setFill.resetHistory();
    });

    it('should not render a fill stripe when missing column fill stripe definition', () => {
      const stripe = Renderer.renderCellStripe({}, {}, pos);

      expect(stripe).to.eql({
        width: 0,
        height: 0,
        color: Renderer.colors.grey,
        opacity: 1,
        background: false,
        padding: 0,
      });

      sinon.assert.notCalled(Renderer.setFill);
      sinon.assert.notCalled(Renderer.doc.rect);
      sinon.assert.notCalled(Renderer.doc.fill);
    });

    it('should render a fill stripe with default styles in a table cell', () => {
      const stripe = Renderer.renderCellStripe({}, { fillStripe: true, height: 20 }, pos);

      sinon.assert.calledWith(Renderer.setFill, Renderer.colors.grey, 1);
      sinon.assert.calledWith(Renderer.doc.rect, pos.x + 0.25, pos.y + 0.25, 6);
      sinon.assert.calledOnce(Renderer.doc.fill);

      expect(stripe).to.eql({
        width: 6,
        height: 20,
        color: Renderer.colors.grey,
        opacity: 1,
        background: false,
        padding: 0,
      });
    });

    it('should render a fill stripe with custom styles from column def in a standard cell', () => {
      const paddedColumn = _.assign({}, column, {
        fillStripe: _.assign({}, column.fillStripe, {
          padding: 5,
        }),
      });

      const stripe = Renderer.renderCellStripe({}, paddedColumn, pos);
      const height = stripe.height - 0.5 - (2 * paddedColumn.fillStripe.padding);
      const xPos = pos.x + 0.25 + paddedColumn.fillStripe.padding;
      const yPos = pos.y + 0.25 + paddedColumn.fillStripe.padding;

      sinon.assert.calledWith(Renderer.setFill, 'blue', 0.6);
      sinon.assert.calledWith(Renderer.doc.rect, xPos, yPos, 8, height);
      sinon.assert.calledOnce(Renderer.doc.fill);

      expect(stripe).to.eql({
        width: 8,
        height: 30,
        color: 'blue',
        opacity: 0.6,
        background: false,
        padding: 5,
      });
    });

    it('should render a fill stripe with custom styles from data def in a standard cell', () => {
      const colData = {
        _fillStripe: {
          color: 'orange',
          opacity: 0.9,
          width: 100,
        },
        _renderedContent: {
          height: 80,
        },
      };

      const stripe = Renderer.renderCellStripe(colData, {}, pos);
      const height = stripe.height - 0.5;
      const xPos = pos.x + 0.25;
      const yPos = pos.y + 0.25;

      sinon.assert.calledWith(Renderer.setFill, 'orange', 0.9);
      sinon.assert.calledWith(Renderer.doc.rect, xPos, yPos, 100, height);
      sinon.assert.calledOnce(Renderer.doc.fill);

      expect(stripe).to.eql({
        width: 100,
        height: 80,
        color: 'orange',
        opacity: 0.9,
        background: false,
        padding: 0,
      });
    });

    it('should render a fill stripe with custom styles from column def in a header cell', () => {
      const isHeader = true;
      const stripe = Renderer.renderCellStripe({}, column, pos, isHeader);
      const height = stripe.height - 0.5;

      sinon.assert.calledWith(Renderer.setFill, 'green', 0.7);
      sinon.assert.calledWith(Renderer.doc.rect, pos.x + 0.25, pos.y + 0.25, 10, height);
      sinon.assert.calledOnce(Renderer.doc.fill);

      expect(stripe).to.eql({
        width: 10,
        height: 40,
        color: 'green',
        opacity: 0.7,
        background: false,
        padding: 0,
      });
    });
  });

  describe('renderCustomTextCell', () => {
    const table = {};

    const cellData = {
      cell: {
        text: 'foo',
        subText: 'bar',
        note: 'baz',
      },
      header: {
        text: 'dog',
        subText: 'cat',
        note: 'mouse',
      },
      stringCell: 'pow',
    };

    const draw = true;

    const column = {
      id: 'cell',
      width: 100,
    };

    const headerColumn = {
      id: 'header',
      width: 200,
    };

    const pos = {
      x: 100,
      y: 200,
    };

    const padding = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    beforeEach(() => {
      sinon.spy(Renderer, 'renderCellStripe');
      Renderer.doc.font.resetHistory();
      Renderer.doc.fontSize.resetHistory();
    });

    afterEach(() => {
      Renderer.renderCellStripe.resetHistory();
    });

    it('should make the call to render a cell stripe', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, column, pos, padding);

      sinon.assert.calledOnce(Renderer.renderCellStripe);
    });

    it('should render a standard cell with a text string provided', () => {
      const stringColumn = _.assign({}, column, {
        id: 'stringCell',
      });

      Renderer.renderCustomTextCell(table, cellData, draw, stringColumn, pos, padding);

      sinon.assert.calledWith(Renderer.doc.text, 'pow');
    });

    it('should render a header cell with a text string provided', () => {
      const stringColumn = _.assign({}, headerColumn, {
        header: 'chicken',
      });

      Renderer.renderCustomTextCell(table, cellData, draw, stringColumn, pos, padding, true);

      sinon.assert.calledWith(Renderer.doc.text, 'chicken');
    });

    it('should render a standard cell with a text, subtext, and note object provided', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, column, pos, padding);

      sinon.assert.calledWith(Renderer.doc.text, 'foo');
      sinon.assert.calledWith(Renderer.doc.text, ' bar');
      sinon.assert.calledWith(Renderer.doc.text, 'baz');
    });

    it('should render a standard cell with a text, subtext, and note object provided', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, headerColumn, pos, padding, true);

      sinon.assert.calledWith(Renderer.doc.text, 'dog');
      sinon.assert.calledWith(Renderer.doc.text, ' cat');
      sinon.assert.calledWith(Renderer.doc.text, 'mouse');
    });

    it('should use proper default font styles in a standard cell', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, column, pos, padding);

      sinon.assert.alwaysCalledWith(Renderer.doc.font, Renderer.font);
      sinon.assert.neverCalledWith(Renderer.doc.font, Renderer.boldFont);
      sinon.assert.alwaysCalledWith(Renderer.doc.fontSize, Renderer.defaultFontSize);
    });

    it('should use proper default font styles in a header cell', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, headerColumn, pos, padding, true);

      sinon.assert.calledWith(Renderer.doc.font, Renderer.boldFont);
      sinon.assert.calledWith(Renderer.doc.font, Renderer.font);
      sinon.assert.alwaysCalledWith(Renderer.doc.fontSize, Renderer.defaultFontSize);
    });

    it('should use left alignment by default in a standard cell', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, column, pos, padding);

      sinon.assert.calledWith(
        Renderer.doc.text,
        'foo',
        pos.x,
        pos.y,
        {
          continued: true,
          align: 'left',
          width: 100,
        }
      );
    });

    it('should use left alignment by default in a header cell', () => {
      Renderer.renderCustomTextCell(table, cellData, draw, headerColumn, pos, padding, true);

      sinon.assert.calledWith(
        Renderer.doc.text,
        'dog',
        pos.x,
        pos.y,
        {
          continued: true,
          align: 'left',
          width: 200,
        }
      );
    });

    it('should allow custom font styles and alignment in a standard cell', () => {
      const customColumn = _.assign({}, column, {
        align: 'right',
        font: 'comic sans',
        fontSize: 13,
        noteFontSize: 9,
      });

      Renderer.renderCustomTextCell(table, cellData, draw, customColumn, pos, padding);

      sinon.assert.calledWith(Renderer.doc.font, 'comic sans');
      sinon.assert.calledWith(Renderer.doc.fontSize, 13);
      sinon.assert.calledWith(Renderer.doc.fontSize, 9);

      sinon.assert.calledWith(
        Renderer.doc.text,
        'foo',
        pos.x,
        pos.y,
        {
          continued: true,
          align: 'right',
          width: 100,
        }
      );

      sinon.assert.calledWith(
        Renderer.doc.text,
        ' bar',
        pos.x,
        pos.y,
        {
          align: 'right',
          width: 100,
        }
      );

      sinon.assert.calledWith(
        Renderer.doc.text,
        'baz',
        {
          align: 'right',
          width: 100,
        }
      );
    });

    it('should allow custom font styles and alignment in a header cell', () => {
      const customColumn = _.assign({}, headerColumn, {
        headerAlign: 'center',
        headerFont: 'courrier new',
        fontSize: 15,
        noteFontSize: 11,
      });

      Renderer.renderCustomTextCell(table, cellData, draw, customColumn, pos, padding, true);

      sinon.assert.calledWith(Renderer.doc.font, 'courrier new');
      sinon.assert.calledWith(Renderer.doc.fontSize, 15);
      sinon.assert.calledWith(Renderer.doc.fontSize, 11);

      sinon.assert.calledWith(
        Renderer.doc.text,
        'dog',
        pos.x,
        pos.y,
        {
          continued: true,
          align: 'center',
          width: 200,
        }
      );

      sinon.assert.calledWith(
        Renderer.doc.text,
        ' cat',
        pos.x,
        pos.y,
        {
          align: 'center',
          width: 200,
        }
      );

      sinon.assert.calledWith(
        Renderer.doc.text,
        'mouse',
        {
          align: 'center',
          width: 200,
        }
      );
    });

    it('should allow rendering a specified row in bold', () => {
      const customData = _.assign({}, cellData, {
        _bold: true,
      });

      Renderer.renderCustomTextCell(table, customData, draw, column, pos, padding);
      sinon.assert.calledWith(Renderer.doc.font, Renderer.boldFont);
    });
  });

  describe('renderTableHeading', () => {
    let renderTable;
    let resetText;

    const defaultColumns = [
      {
        id: 'heading',
        align: 'left',
        height: 24,
        cache: false,
      },
    ];

    const defaultRows = [
      {
        heading: {},
        note: undefined,
      },
    ];

    const defaultOpts = {
      columnDefaults: {
        headerBorder: '',
      },
      bottomMargin: 0,
      showHeaders: false,
    };

    beforeEach(() => {
      renderTable = sinon.stub(Renderer, 'renderTable');
      resetText = sinon.stub(Renderer, 'resetText');
      defaultColumns[0].renderer = Renderer.renderCustomTextCell;
      defaultColumns[0].font = Renderer.boldFont;
      defaultColumns[0].fontSize = Renderer.largeFontSize;
    });

    afterEach(() => {
      renderTable.restore();
      resetText.restore();
    });

    it('should render a table heading with default settings when no args provided', () => {
      Renderer.renderTableHeading();

      sinon.assert.calledWith(
        Renderer.renderTable,
        defaultColumns,
        defaultRows,
        defaultOpts,
      );
    });

    it('should render a table heading with custom settings when args provided', () => {
      const heading = {
        text: 'foo',
        note: 'bar',
      };

      const customOpts = {
        height: 60,
        align: 'right',
        font: 'comic sans',
        fontSize: 22,
      };

      Renderer.renderTableHeading(heading, customOpts);

      sinon.assert.calledWith(
        Renderer.renderTable,
        [_.assign({}, defaultColumns[0], {
          height: customOpts.height,
          align: customOpts.align,
          font: customOpts.font,
          fontSize: customOpts.fontSize,
        })],
        [{ heading, note: heading.note }],
        _.assign({}, defaultOpts, customOpts),
      );
    });
  });

  describe('renderTable', () => {
    const columns = [
      {
        id: 'name',
        fill: 'blue',
      },
      {
        id: 'value',
      },
    ];

    const rows = [
      { name: 'one', value: 1 },
      { name: 'two', value: 2 },
      { name: 'three', value: 3 },
    ];

    const defaultOpts = {
      columnDefaults: {
        headerBorder: 'TBLR',
        border: 'TBLR',
        align: 'left',
        padding: [7, 5, 3, 5],
        headerPadding: [7, 5, 3, 5],
        fill: false,
      },
      bottomMargin: 20,
    };

    class Table {
      constructor() {
        this.addHeader = sinon.stub().returns(this);
        this.addPlugin = sinon.stub().returns(this);
        this.onCellBackgroundAdd = sinon.stub().resolves(true);
        this.onCellBackgroundAdded = sinon.stub().resolves(true);
        this.onCellBorderAdd = sinon.stub().resolves(true);
        this.onCellBorderAdded = sinon.stub().resolves(true);
        this.onRowAdd = sinon.stub().resolves(true);
        this.onRowAdded = sinon.stub().resolves(true);
        this.onPageAdd = sinon.stub().resolves(true);
        this.onPageAdded = sinon.stub().resolves(true);
        this.onBodyAdded = sinon.stub().resolves(true);
        this.setColumnsDefaults = sinon.stub().returns(this);
        this.addColumns = sinon.stub().returns(this);
        this.addBody = sinon.stub().returns(this);
        this.bottomMargin = 20;
        this.pdf = {
          addPage: sinon.stub(),
          switchToPage: sinon.stub(),
        };
      }
    }

    let TableStub;
    let FitColumnStub;
    let setFill;
    let setStroke;
    let resetText;

    beforeEach(() => {
      /* eslint-disable new-cap */
      TableStub = new sinon.stub().returns(new Table());
      FitColumnStub = new sinon.stub().resolves(true);
      /* eslint-enable new-cap */

      defaultOpts.columnDefaults.borderColor = Renderer.tableSettings.colors.border;
      defaultOpts.pos = {
        maxY: Renderer.chartArea.bottomEdge,
      };

      TableStub.resetHistory();
      FitColumnStub.resetHistory();

      setFill = sinon.spy(Renderer, 'setFill');
      setStroke = sinon.spy(Renderer, 'setStroke');
      resetText = sinon.spy(Renderer, 'resetText');
    });

    afterEach(() => {
      setFill.resetHistory();
      setStroke.resetHistory();
      resetText.resetHistory();
    });

    it('should render a table with default settings when no args provided', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);

      sinon.assert.calledWithNew(TableStub);
      sinon.assert.calledWith(TableStub, Renderer.doc, defaultOpts);
      sinon.assert.calledWith(Renderer.table.setColumnsDefaults, defaultOpts.columnDefaults);
      sinon.assert.calledWith(Renderer.table.addColumns, []);
      sinon.assert.calledWith(Renderer.table.addBody, []);
    });

    it('should render a table with custom rows, columns, and opts extending defaults', () => {
      const customOpts = {
        bottomMargin: 80,
      };

      Renderer.renderTable(columns, rows, customOpts, TableStub, FitColumnStub);

      sinon.assert.calledWith(TableStub, Renderer.doc, _.defaultsDeep({}, customOpts, defaultOpts));
      sinon.assert.calledWith(Renderer.table.setColumnsDefaults, defaultOpts.columnDefaults);
      sinon.assert.calledWith(Renderer.table.addColumns, columns);
      sinon.assert.calledWith(Renderer.table.addBody, rows);
    });

    it('should initialize the FitColumn table plugin when required', () => {
      Renderer.renderTable([], [], { flexColumn: 'test' }, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.addPlugin);
      sinon.assert.calledWith(Renderer.table.addPlugin, new FitColumnStub());
      sinon.assert.calledWith(FitColumnStub, { column: 'test' });
    });

    it('should add a listener for the `onPageAdd` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onPageAdd);
    });

    it('should add a listener for the `onPageAdded` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onPageAdded);
    });

    it('should add a listener for the `onCellBackgroundAdd` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onCellBackgroundAdd);
    });

    it('should add a listener for the `onCellBackgroundAdded` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onCellBackgroundAdded);
    });

    it('should add a listener for the `onCellBorderAdd` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onCellBorderAdd);
    });

    it('should add a listener for the `onCellBorderAdded` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onCellBorderAdded);
    });

    it('should add a listener for the `onRowAdd` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onRowAdd);
    });

    it('should add a listener for the `onRowAdded` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onRowAdded);
    });

    it('should add a listener for the `onBodyAdded` table event', () => {
      Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
      sinon.assert.calledOnce(Renderer.table.onBodyAdded);
    });

    describe('onPageAdd', () => {
      it('should call `addPage` and not `switchToPage` or `setNewPageTablePosition` when we are on the last page in the document', () => {
        Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
        sinon.spy(Renderer, 'setNewPageTablePosition');

        Renderer.initialTotalPages = 2;
        Renderer.totalPages = 4; // 2 pages have been added to the initial count
        Renderer.currentPageIndex = 1; // zero-based index, so this is the last page

        sinon.assert.notCalled(Renderer.table.pdf.addPage);

        Renderer.onPageAdd(Renderer.table, {}, { cancel: false });
        sinon.assert.calledOnce(Renderer.table.pdf.addPage);
        sinon.assert.notCalled(Renderer.table.pdf.switchToPage);
        sinon.assert.notCalled(Renderer.setNewPageTablePosition);
      });

      it('should call `switchToPage` and `setNewPageTablePosition` and not `addPage` when we are not on the last page in the document', () => {
        Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
        sinon.spy(Renderer, 'setNewPageTablePosition');

        Renderer.table.pos = {
          x: 100,
          y: 100,
        };

        Renderer.table.pdf = Renderer.doc;

        Renderer.initialTotalPages = 0;
        Renderer.totalPages = 2; // 2 pages have been added to the initial count
        Renderer.currentPageIndex = 0; // zero-based index, so this is the first of 2 pages

        sinon.assert.notCalled(Renderer.table.pdf.switchToPage);
        sinon.assert.notCalled(Renderer.setNewPageTablePosition);

        Renderer.onPageAdd(Renderer.table, {}, { cancel: false });
        sinon.assert.calledOnce(Renderer.table.pdf.switchToPage);
        sinon.assert.calledOnce(Renderer.setNewPageTablePosition);
        sinon.assert.notCalled(Renderer.table.pdf.addPage);
      });
    });

    describe('onPageAdded', () => {
      it('should add a table header', () => {
        Renderer.renderTable([], [], {}, TableStub, FitColumnStub);
        sinon.assert.notCalled(Renderer.table.addHeader);

        Renderer.onPageAdded(Renderer.table);
        sinon.assert.calledOnce(Renderer.table.addHeader);
      });
    });

    describe('onCellBackgroundAdd', () => {
      it('should set the standard cell fill color when defined as a string', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          columns[0],
          rows[0],
          0,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWith(Renderer.setFill, 'blue', 1);
      });

      it('should set the standard cell fill color and opacity when defined as an object', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          {
            fill: {
              color: 'yellow',
              opacity: 0.4,
            },
          },
          rows[0],
          0,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWith(Renderer.setFill, 'yellow', 0.4);
      });

      it('should set the header cell fill color when defined as a string', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          {
            headerFill: 'magenta',
          },
          rows[0],
          0,
          true,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWith(Renderer.setFill, 'magenta', 1);
      });

      it('should set the header cell fill color and opacity when defined as an object', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          {
            headerFill: {
              color: 'red',
              opacity: 0.5,
            },
          },
          rows[0],
          0,
          true,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWith(Renderer.setFill, 'red', 0.5);
      });

      it('should not set the fill styles when not defined', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          columns[1],
          rows[0],
          0,
          false,
        );

        sinon.assert.notCalled(Renderer.setFill);
      });

      it('should set even zebra fill style when defined but fill color not set', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          { zebra: true, fill: true },
          rows[0],
          0,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(
          Renderer.setFill,
          Renderer.tableSettings.colors.zebraEven,
          1
        );
      });

      it('should set odd zebra fill style when defined but fill color not set', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          { zebra: true, fill: true },
          rows[1],
          1,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(
          Renderer.setFill,
          Renderer.tableSettings.colors.zebraOdd,
          1
        );
      });

      it('should set even zebra fill style at full opacity when fill color set as object', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          {
            zebra: true,
            fill: {
              color: 'yellow',
              opacity: 0.4,
            },
          },
          rows[0],
          0,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(
          Renderer.setFill,
          'yellow',
          0.4
        );
      });

      it('should set odd zebra fill style at half opacity when fill color set as object', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          {
            zebra: true,
            fill: {
              color: 'yellow',
              opacity: 0.4,
            },
          },
          rows[1],
          1,
          false,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(
          Renderer.setFill,
          'yellow',
          0.2
        );
      });

      it('should set zebra header fill style when defined but fill color not set', () => {
        Renderer.onCellBackgroundAdd(
          Renderer.table,
          { zebra: true, headerFill: true },
          rows[1],
          1,
          true,
        );

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(
          Renderer.setFill,
          Renderer.tableSettings.colors.zebraHeader,
          1
        );
      });
    });

    describe('onCellBackgroundAdded', () => {
      it('should reset to the default fill styles', () => {
        Renderer.onCellBackgroundAdded();

        sinon.assert.calledOnce(Renderer.setFill);
        sinon.assert.calledWithExactly(Renderer.setFill);
      });
    });

    describe('onCellBorderAdd', () => {
      it('should set the border width', () => {
        Renderer.onCellBorderAdd(Renderer.table, {});

        sinon.assert.calledOnce(Renderer.doc.lineWidth);
        sinon.assert.calledWithExactly(Renderer.doc.lineWidth, Renderer.tableSettings.borderWidth);
      });

      it('should set the border color to black by default', () => {
        Renderer.onCellBorderAdd(Renderer.table, {});

        sinon.assert.calledOnce(Renderer.setStroke);
        sinon.assert.calledWithExactly(Renderer.setStroke, 'black', 1);
      });
    });

    describe('onCellBorderAdded', () => {
      it('should reset to the default stroke styles', () => {
        Renderer.onCellBorderAdded();

        sinon.assert.calledOnce(Renderer.setStroke);
        sinon.assert.calledWithExactly(Renderer.setStroke);
      });
    });

    describe('onRowAdd', () => {
      it('should set the font to bold if required', () => {
        Renderer.onRowAdd(Renderer.table, { _bold: true });

        sinon.assert.calledOnce(Renderer.doc.font);
        sinon.assert.calledWithExactly(Renderer.doc.font, Renderer.boldFont);
      });

      it('should not set the font to bold if not required', () => {
        Renderer.onRowAdd(Renderer.table, {});

        sinon.assert.notCalled(Renderer.doc.font);
      });
    });

    describe('onRowAdded', () => {
      it('should reset to the default text styles', () => {
        Renderer.onRowAdded();

        sinon.assert.calledOnce(Renderer.resetText);
        sinon.assert.calledWithExactly(Renderer.resetText);
      });
    });

    describe('onBodyAdded', () => {
      it('should properly update the pdf cursor position after rendering', () => {
        Renderer.doc.x = 150;
        Renderer.doc.y = 200;

        Renderer.onBodyAdded({
          pos: { x: 100 },
          bottomMargin: 50,
        });

        expect(Renderer.doc.x).to.equal(100);
        expect(Renderer.doc.y).to.equal(250);
      });

      it('should default to the page\'s left margin when the table position isn\'t set', () => {
        Renderer.doc.x = 150;

        Renderer.onBodyAdded(new Table());

        expect(Renderer.doc.x).to.equal(36);
      });
    });
  });

  describe('renderPatientInfo', () => {
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

    it('should render the page title as is for the first rendered page', () => {
      Renderer.doc.text.reset();
      Renderer.currentPageIndex = 0;
      Renderer.renderTitle();
      sinon.assert.calledWith(Renderer.doc.text, 'Print View');
    });

    it('should render the page title with (cont.)` for subsequent pages', () => {
      Renderer.doc.text.reset();
      Renderer.currentPageIndex = 1;
      Renderer.renderTitle();
      sinon.assert.calledWith(Renderer.doc.text, 'Print View (cont.)');
    });

    it('should calculate the width of the title', () => {
      Renderer.renderTitle();
      expect(Renderer.titleWidth).to.be.a('number');
      expect(Renderer.titleWidth > 0).to.be.true;
    });
  });

  describe('renderDateText', () => {
    it('should render the provided date text', () => {
      const text = 'Date range';

      Renderer.renderDateText(text);
      sinon.assert.calledWith(Renderer.doc.text, text);
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
      sinon.spy(Renderer, 'renderDateText');

      Renderer.renderHeader();

      sinon.assert.calledOnce(Renderer.renderPatientInfo);
      sinon.assert.calledOnce(Renderer.renderTitle);
      sinon.assert.calledOnce(Renderer.renderLogo);
      sinon.assert.calledOnce(Renderer.renderDateText);
    });
  });

  describe('renderFooter', () => {
    it('should be a function', () => {
      expect(Renderer.renderFooter).to.be.a('function');
    });

    it('should render the footer help text', () => {
      Renderer.renderFooter();

      sinon.assert.calledWith(
        Renderer.doc.text,
        'Questions or feedback? Please email support@tidepool.org or visit support.tidepool.org.'
      );
    });

    it('should render the date printed', () => {
      Renderer.renderFooter();
      sinon.assert.calledWith(Renderer.doc.text, `Printed on: ${formatCurrentDate()}`);
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
