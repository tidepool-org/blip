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
import PdfTable from 'voilab-pdf-table';
import PdfTableFitColumn from 'voilab-pdf-table/plugins/fitcolumn';
import i18next from 'i18next';
import moment from 'moment';

import {
  getTimezoneFromTimePrefs,
  formatBirthdate,
  formatCurrentDate,
  formatDateRange,
} from '../../utils/datetime';

import { getPatientFullName } from '../../utils/misc';

import {
  DPI,
  MARGINS,
  WIDTH,
  HEIGHT,
  DEFAULT_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
} from './utils/constants';

const t = i18next.t.bind(i18next);

// TO_DO have a configuration variable to support specific branding or not like done e.g. in Blip
// branding should make use of artifact.sh to download specific branding artifacts such as images
const logo = require('./images/diabeloop/ylp_logo_small.png');

class PrintView {
  constructor(doc, data = {}, opts) {
    moment.locale(i18next.language);
    this.doc = doc;

    this.title = opts.title;
    this.data = data;

    this.debug = opts.debug || false;

    this.dpi = opts.dpi || DPI;
    this.margins = opts.margins || MARGINS;

    this.font = 'Helvetica';
    this.boldFont = 'Helvetica-Bold';

    this.defaultFontSize = opts.defaultFontSize || DEFAULT_FONT_SIZE;
    this.footerFontSize = opts.footerFontSize || FOOTER_FONT_SIZE;
    this.headerFontSize = opts.headerFontSize || HEADER_FONT_SIZE;
    this.largeFontSize = opts.largeFontSize || LARGE_FONT_SIZE;
    this.smallFontSize = opts.smallFontSize || SMALL_FONT_SIZE;
    this.extraSmallFontSize = opts.extraSmallFontSize || EXTRA_SMALL_FONT_SIZE;

    this.bgPrefs = opts.bgPrefs;
    this.bgUnits = opts.bgPrefs.bgUnits;
    this.bgBounds = opts.bgPrefs.bgBounds;
    this.timePrefs = opts.timePrefs;
    this.timezone = getTimezoneFromTimePrefs(opts.timePrefs);

    this.width = opts.width || WIDTH;
    this.height = opts.height || HEIGHT;

    this.patient = opts.patient;
    this.patientInfoBox = {
      width: 0,
      height: 0,
    };

    this.colors = {
      basal: '#19A0D7',
      basalHeader: '#DCF1F9',
      basalAutomated: '#00D3E6',
      bolus: '#7CD0F0',
      bolusHeader: '#EBF7FC',
      smbg: '#6480FB',
      smbgHeader: '#E8ECFE',
      siteChange: '#FCD144',
      veryLow: '#FB5951',
      low: '#FF8B7C',
      target: '#76D3A6',
      high: '#BB9AE7',
      veryHigh: '#8C65D6',
      grey: '#6D6D6D',
      lightGrey: '#979797',
      darkGrey: '#4E4E4F',
    };

    this.tableSettings = {
      colors: {
        border: this.colors.grey,
        tableHeader: this.colors.basal,
        zebraHeader: '#FAFAFA',
        zebraEven: '#FAFAFA',
        zebraOdd: '#FFFFFF',
      },
      borderWidth: 0.5,
    };

    this.leftEdge = this.margins.left;
    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    this.chartArea = {
      bottomEdge: this.margins.top + opts.height,
      leftEdge: this.margins.left,
      topEdge: this.margins.top,
    };

    this.chartArea.width = this.rightEdge - this.chartArea.leftEdge;
    this.initialChartArea = _.clone(this.chartArea);

    this.initialTotalPages = 0;
    this.totalPages = this.initialTotalPages = this.doc.bufferedPageRange().count || 0;
    this.currentPageIndex = -1;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize();

    // Auto-bind callback methods
    this.newPage = this.newPage.bind(this);
    this.setNewPageTablePosition = this.setNewPageTablePosition.bind(this);
    this.renderCustomTextCell = this.renderCustomTextCell.bind(this);

    // Clear previous and set up pageAdded listeners :/
    this.doc.removeAllListeners('pageAdded');
    this.doc.on('pageAdded', this.newPage);
  }

  newPage(dateText) {
    if (this.debug) {
      this.renderDebugGrid();
    }

    const currentFont = {
      name: _.get(this.doc, '_font.name', this.font),
      size: _.get(this.doc, '_fontSize', this.defaultFontSize),
    };

    this.currentPageIndex++;
    this.totalPages++;

    this.renderHeader(dateText).renderFooter();
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = this.chartArea.topEdge;

    // Set font styles back to what they were before the page break
    // This is needed because the header and footer rendering changes it
    // and any tables that need to continue rendering on the new page are affected.
    this.doc
      .font(currentFont.name)
      .fontSize(currentFont.size);

    if (this.table) {
      this.setNewPageTablePosition();
    }

    if (this.layoutColumns) {
      this.setLayoutColumns({
        activeIndex: this.layoutColumns.activeIndex,
        count: this.layoutColumns.count,
        gutter: this.layoutColumns.gutter,
        type: this.layoutColumns.type,
        width: this.layoutColumns.width,
        widths: this.layoutColumns.widths,
      });

      this.goToLayoutColumnPosition(this.layoutColumns.activeIndex);
    }
  }

  setNewPageTablePosition() {
    const xPos = this.layoutColumns
      ? _.get(this, `layoutColumns.columns.${this.layoutColumns.activeIndex}.x`)
      : this.chartArea.leftEdge;

    this.doc.x = this.table.pos.x = xPos;
    this.doc.y = this.table.pos.y = this.chartArea.topEdge;

    this.table.pdf.lineWidth(this.tableSettings.borderWidth);
  }

  setLayoutColumns(opts) {
    const {
      activeIndex = 0,
      columns = [],
      count = _.get(opts, 'widths.length', 0),
      gutter = 0,
      type = 'equal',
      width = this.chartArea.width,
      widths = [],
    } = opts;

    const availableWidth = width - (gutter * (count - 1));

    switch (type) {
      case 'percentage': {
        let combinedWidths = 0;
        let i = 0;

        do {
          const columnWidth = availableWidth * widths[i] / 100;

          columns.push({
            x: this.chartArea.leftEdge + (gutter * i) + combinedWidths,
            y: this.doc.y,
            width: columnWidth,
          });

          i++;
          combinedWidths += columnWidth;
        } while (i < count);

        break;
      }

      case 'equal':
      default: {
        const columnWidth = availableWidth / count;
        let i = 0;

        do {
          columns.push({
            x: this.chartArea.leftEdge + (gutter * i) + (columnWidth * i),
            y: this.doc.y,
            width: columnWidth,
          });
          i++;
        } while (i < count);

        break;
      }
    }

    this.layoutColumns = {
      activeIndex,
      columns,
      count,
      gutter,
      type,
      width,
      widths,
    };
  }

  updateLayoutColumnPosition(index) {
    this.layoutColumns.columns[index].x = this.doc.x;
    this.layoutColumns.columns[index].y = this.doc.y;
  }

  goToLayoutColumnPosition(index) {
    this.doc.x = this.layoutColumns.columns[index].x;
    this.doc.y = this.layoutColumns.columns[index].y;
    this.layoutColumns.activeIndex = index;
  }

  getShortestLayoutColumn() {
    let shortest;
    let shortestIndex;
    _.each(this.layoutColumns.columns, (column, colIndex) => {
      if (!shortest || (shortest > column.y)) {
        shortest = column.y;
        shortestIndex = colIndex;
      }
    });

    return shortestIndex;
  }

  getLongestLayoutColumn() {
    let longest;
    let longestIndex;
    _.each(_.get(this, 'layoutColumns.columns', []), (column, colIndex) => {
      if (!longest || (longest < column.y)) {
        longest = column.y;
        longestIndex = colIndex;
      }
    });

    return longestIndex;
  }

  getActiveColumnWidth() {
    return this.layoutColumns.columns[this.layoutColumns.activeIndex].width;
  }

  getDateRange(startDate, endDate, format) {
    return t('Date range: ') + formatDateRange(startDate, endDate, format);
  }

  setFill(color = 'black', opacity = 1) {
    this.doc
      .fillColor(color)
      .fillOpacity(opacity);
  }

  setStroke(color = 'black', opacity = 1) {
    this.doc
      .strokeColor(color)
      .strokeOpacity(opacity);
  }

  resetText() {
    this.setFill();
    this.doc
      .lineGap(0)
      .fontSize(this.defaultFontSize)
      .font(this.font);
  }

  renderSectionHeading(heading, opts = {}) {
    const {
      xPos = this.doc.x,
      yPos = this.doc.y,
      font = _.get(opts, 'font', this.font),
      fontSize = _.get(opts, 'fontSize', this.headerFontSize),
      subTextFont = _.get(opts, 'subTextFont', this.font),
      subTextFontSize = _.get(opts, 'subTextFontSize', this.defaultFontSize),
      moveDown = 1,
    } = opts;

    const text = _.isString(heading) ? heading : heading.text;
    const subText = _.get(heading, 'subText', false);

    const textHeight = this.doc
      .font(font)
      .fontSize(fontSize)
      .heightOfString(' ');

    const subTextHeight = this.doc
      .font(subTextFont)
      .fontSize(subTextFontSize)
      .heightOfString(' ');

    const subTextYOffset = (textHeight - subTextHeight) / 1.75;

    this.doc
      .font(font)
      .fontSize(fontSize)
      .text(text, xPos, yPos, _.defaults(opts, {
        align: 'left',
        continued: !!subText,
      }));

    if (subText) {
      this.doc
        .font(subTextFont)
        .fontSize(subTextFontSize)
        .text(` ${subText}`, xPos, yPos + subTextYOffset);
    }

    this.resetText();
    this.doc.moveDown(moveDown);
  }

  renderCellStripe(data = {}, column = {}, pos = {}, isHeader = false) {
    const fillStripeKey = isHeader ? 'headerFillStripe' : 'fillStripe';
    const fillKey = isHeader ? 'headerFill' : 'fill';
    const heightKey = isHeader ? 'headerHeight' : 'height';

    const height = _.get(column, heightKey, column.height)
                || _.get(data, '_renderedContent.height', 0);

    const stripe = {
      width: 0,
      height,
      padding: 0,
      color: this.colors.grey,
      opacity: 1,
      background: false,
    };

    const fillStripe = _.get(data, `_${fillStripeKey}`, column[fillStripeKey]);
    const fill = _.get(data, `_${fillKey}`, column[fillKey]);

    if (fillStripe) {
      const stripeDefined = _.isPlainObject(fillStripe);

      stripe.color = stripeDefined
        ? _.get(fillStripe, 'color', this.colors.grey)
        : _.get(fill, 'color', this.colors.grey);

      stripe.opacity = stripeDefined ? _.get(fillStripe, 'opacity', 1) : 1;
      stripe.width = stripeDefined ? _.get(fillStripe, 'width', 6) : 6;
      stripe.background = _.get(fillStripe, 'background', false);
      stripe.padding = _.get(fillStripe, 'padding', 0);

      this.setFill(stripe.color, stripe.opacity);

      const xPos = pos.x + 0.25 + stripe.padding;
      const yPos = pos.y + 0.25 + stripe.padding;
      const stripeWidth = stripe.width;
      const stripeHeight = stripe.height - 0.5 - (2 * stripe.padding);

      if (stripe.width > 0) {
        this.doc
          .rect(xPos, yPos, stripeWidth, stripeHeight)
          .fill();
      }

      this.setFill();
    }

    return stripe;
  }

  renderCustomTextCell(tb, data, draw, column, pos, padding, isHeader) {
    if (draw) {
      let {
        text = '',
        subText = '',
        note,
      } = _.get(data, column.id, column.header || {});

      if ((!isHeader && _.isString(data[column.id])) || _.isString(column.header)) {
        text = isHeader ? column.header : data[column.id];
        subText = note = null;
      }

      const alignKey = isHeader ? 'headerAlign' : 'align';
      const align = _.get(column, alignKey, 'left');

      const stripe = this.renderCellStripe(data, column, pos, isHeader);
      const stripeOffset = stripe.background ? 0 : stripe.width;

      const xPos = pos.x + _.get(padding, 'left', 0) + stripeOffset;
      let yPos = pos.y + padding.top;

      // eslint-disable-next-line no-underscore-dangle
      const boldRow = data._bold || isHeader;

      const width = column.width - _.get(padding, 'left', 0) - _.get(padding, 'right', 0);

      const heightKey = isHeader ? 'headerHeight' : 'height';

      const height = _.get(column, heightKey, column.height)
                  || _.get(data, '_renderedContent.height', 0);

      const fontKey = isHeader ? 'headerFont' : 'font';

      this.doc
        .font(_.get(column, fontKey, boldRow ? this.boldFont : this.font))
        .fontSize(_.get(column, 'fontSize', this.defaultFontSize));

      if (column.valign === 'center') {
        const textHeight = this.doc.heightOfString(text, { width });
        yPos += (height - textHeight) / 2 + 1;
      }

      this.doc.text(text, xPos, yPos, {
        continued: !!subText,
        align,
        width,
      });

      this.doc.font(this.font);

      if (subText) {
        this.doc.text(` ${subText}`, xPos, yPos, {
          align,
          width,
        });
      }

      if (note) {
        this.doc
          .fontSize(_.get(column, 'noteFontSize', this.defaultFontSize))
          .text(note, {
            align,
            width,
          });
      }
    }

    return ' ';
  }

  renderTableHeading(heading = {}, opts = {}) {
    this.doc
      .font(this.font)
      .fontSize(this.largeFontSize);

    const columns = [
      {
        id: 'heading',
        align: _.get(opts, 'align', 'left'),
        height: _.get(opts, 'height', heading.note ? 37 : 24),
        cache: false,
        renderer: this.renderCustomTextCell,
        font: _.get(opts, 'font', this.boldFont),
        fontSize: _.get(opts, 'fontSize', this.largeFontSize),
      },
    ];

    const rows = [
      {
        heading,
        note: heading.note,
      },
    ];

    this.renderTable(columns, rows, _.defaultsDeep(opts, {
      columnDefaults: {
        headerBorder: '',
      },
      bottomMargin: 0,
      showHeaders: false,
    }));

    this.resetText();
  }

  renderTable(columns = [], rows = [], opts = {}, Table = PdfTable, FitColumn = PdfTableFitColumn) {
    this.doc.lineWidth(this.tableSettings.borderWidth);

    _.defaultsDeep(opts, {
      columnDefaults: {
        borderColor: this.tableSettings.colors.border,
        headerBorder: 'TBLR',
        border: 'TBLR',
        align: 'left',
        padding: [7, 5, 3, 5],
        headerPadding: [7, 5, 3, 5],
        fill: _.get(opts, 'columnDefaults.fill', _.get(opts, 'columnDefaults.zebra', false)),
      },
      bottomMargin: 20,
      pos: {
        maxY: this.chartArea.bottomEdge,
      },
    });

    const {
      flexColumn,
    } = opts;

    const table = this.table = new Table(this.doc, opts);

    if (flexColumn) {
      table.addPlugin(new FitColumn({
        column: flexColumn,
      }));
    }

    table.onPageAdd(this.onPageAdd.bind(this));

    table.onPageAdded(this.onPageAdded.bind(this));

    table.onCellBackgroundAdd(this.onCellBackgroundAdd.bind(this));

    table.onCellBackgroundAdded(this.onCellBackgroundAdded.bind(this));

    table.onCellBorderAdd(this.onCellBorderAdd.bind(this));

    table.onCellBorderAdded(this.onCellBorderAdded.bind(this));

    table.onRowAdd(this.onRowAdd.bind(this));

    table.onRowAdded(this.onRowAdded.bind(this));

    table.onBodyAdded(this.onBodyAdded.bind(this));

    table
      .setColumnsDefaults(opts.columnDefaults)
      .addColumns(columns)
      .addBody(rows);
  }

  onPageAdd(tb, row, ev) {
    const currentPageIndex = this.initialTotalPages + this.currentPageIndex;

    if (currentPageIndex + 1 === this.totalPages) {
      tb.pdf.addPage();
    } else {
      this.currentPageIndex++;
      tb.pdf.switchToPage(this.initialTotalPages + this.currentPageIndex);
      this.setNewPageTablePosition();
    }

    // cancel event so the automatic page add is not triggered
    ev.cancel = true; // eslint-disable-line no-param-reassign
  }

  onPageAdded(tb) {
    tb.addHeader();
  }

  onBodyAdded(tb) {
    // Restore x position after table is drawn
    this.doc.x = _.get(tb, 'pos.x', this.doc.page.margins.left);

    // Add margin to the bottom of the table
    this.doc.y += tb.bottomMargin;
  }

  onCellBackgroundAdd(tb, column, row, index, isHeader) {
    const {
      fill,
      headerFill,
      zebra,
    } = column;

    const isEven = index % 2 === 0;

    const fillKey = isHeader ? headerFill : fill;

    if (fillKey) {
      const fillDefined = _.isPlainObject(fillKey);
      let color;
      let opacity;

      if (!fillDefined) {
        opacity = 1;

        if (zebra) {
          if (isHeader) {
            color = this.tableSettings.colors.zebraHeader;
          } else {
            color = isEven
              ? this.tableSettings.colors.zebraEven
              : this.tableSettings.colors.zebraOdd;
          }
        } else {
          color = fillKey || 'white';
        }
      } else {
        const defaultOpacity = _.get(fillKey, 'opacity', 1);

        color = _.get(fillKey, 'color', 'white');
        opacity = zebra && !isEven ? defaultOpacity / 2 : defaultOpacity;
      }

      this.setFill(color, opacity);
    }

    /* eslint-disable no-underscore-dangle */
    if (row._fill) {
      const {
        color,
        opacity,
      } = row._fill;

      this.setFill(color, opacity);
    }
    /* eslint-enable no-underscore-dangle */
  }

  onCellBackgroundAdded() {
    this.setFill();
  }

  onCellBorderAdd(tb, column) {
    this.doc.lineWidth(this.tableSettings.borderWidth);
    this.setStroke(_.get(column, 'borderColor', 'black'), 1);
  }

  onCellBorderAdded() {
    this.setStroke();
  }

  onRowAdd(tb, row) {
    // eslint-disable-next-line no-underscore-dangle
    if (row._bold) {
      this.doc.font(this.boldFont);
    }
  }

  onRowAdded() {
    this.resetText();
  }

  renderPatientInfo() {
    const patientName = _.truncate(getPatientFullName(this.patient), { length: 32 });
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
    const patientDOB = t('DOB: {{birthdate}}', { birthdate: patientBirthdate });

    this.doc
      .fontSize(10)
      .text(patientDOB);

    const patientBirthdayWidth = this.doc.widthOfString(patientDOB);
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
    const lineHeight = this.doc.fontSize(14).currentLineHeight();
    const xOffset = this.margins.left + this.patientInfoBox.width + 21;
    const yOffset = (
      this.margins.top + ((this.patientInfoBox.height - this.margins.top) / 2 - (lineHeight / 2))
    );

    const title = this.currentPageIndex === 0
      ? this.title
      : t('{{title}} (cont.)', { title: this.title });

    this.doc.text(title, xOffset, yOffset);
    this.titleWidth = this.doc.widthOfString(title);
  }

  renderDateText(dateText = '') {
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
      .text(dateText, xOffset, yOffset + 2.5, {
        width: availableWidth,
        align: 'center',
      });
  }

  renderLogo() {
    this.logoWidth = 80;
    const xOffset = this.doc.page.width - this.logoWidth - this.margins.right;
    const yOffset = this.margins.top + 5;

    this.doc.image(logo, xOffset, yOffset, { width: this.logoWidth });
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

  renderHeader(dateText) {
    this.renderPatientInfo();

    this.renderTitle();

    this.renderLogo();

    this.renderDateText(dateText);

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
    this.doc.fontSize(this.footerFontSize);

    const helpText = t('Questions or feedback? Please email support@tidepool.org' +
    ' or visit support.tidepool.org.');

    const printDateText = t('Printed on: ') + formatCurrentDate();
    const printDateWidth = this.doc.widthOfString(printDateText);

    const pageCountWidth = this.doc.widthOfString('Page 1 of 1');

    const xPos = this.margins.left;
    const yPos = (this.height + this.margins.top) - this.doc.currentLineHeight() * 1.5;
    const innerWidth = (this.width) - printDateWidth - pageCountWidth;

    this.doc
      .fillColor(this.colors.lightGrey)
      .fillOpacity(1)
      .text(printDateText, xPos, yPos)
      .text(helpText, xPos + printDateWidth, yPos, {
        width: innerWidth,
        align: 'center',
      });

    this.setFill();

    return this;
  }

  static renderPageNumbers(doc) {
    const pageCount = doc.bufferedPageRange().count;
    let page = 0;
    while (page < pageCount) {
      page++;
      doc.switchToPage(page - 1);
      doc.fontSize(FOOTER_FONT_SIZE).fillColor('#979797').fillOpacity(1);
      doc.text(
        t('Page {{page}} of {{pageCount}}', { page, pageCount }),
        MARGINS.left,
        (HEIGHT + MARGINS.top) - doc.currentLineHeight() * 1.5,
        { align: 'right' }
      );
    }
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

export default PrintView;
