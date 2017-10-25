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
import PdfTable from './utils/pdfTable/pdfTable';
// import PdfTable from 'voilab-pdf-table';
import PdfTableFitColumn from './utils/pdfTable/plugins/fitColumn';
// import PdfTableFitColumn from 'voilab-pdf-table/plugins/fitcolumn';

import {
  getTimezoneFromTimePrefs,
  formatBirthdate,
  formatCurrentDate,
} from '../../utils/datetime';

import { getPatientFullName } from '../../utils/misc';

import {
  DPI,
  MARGINS,
  WIDTH,
  HEIGHT,
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
} from './utils/constants';

const logo = require('./images/tidepool-logo-408x46.png');

class PrintView {
  constructor(doc, data, opts) {
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
      low: '#FF8B7C',
      target: '#76D3A6',
      basal: '#19A0D7',
      bolus: '#7CD0F0',
      high: '#BB9AE7',
      zebraHeader: '#FAFAFA',
      zebraEven: '#FAFAFA',
      zebraOdd: '#FFFFFF',
      grey: '#6D6D6D',
      lightGrey: '#979797',
      lightestGrey: '#F7F7F8',
    };

    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    this.chartArea = {
      bottomEdge: opts.margins.top + opts.height,
      leftEdge: opts.margins.left,
      topEdge: opts.margins.top,
    };

    this.chartArea.width = this.rightEdge - this.chartArea.leftEdge;
    this.initialChartArea = _.clone(this.chartArea);

    this.totalPages = this.initialTotalPages = this.doc.bufferedPageRange().count || 0;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize();

    // Auto-bind callback methods
    this.newPage = this.newPage.bind(this);
    this.renderCustomColumnHeader = this.renderCustomColumnHeader.bind(this);

    // Clear previous and set up pageAdded listeners :/
    this.doc.removeAllListeners('pageAdded');
    this.doc.on('pageAdded', this.newPage);
  }

  newPage() {
    if (this.debug) {
      this.renderDebugGrid();
    }
    this.renderHeader().renderFooter();
    this.doc.x = this.chartArea.leftEdge;
    this.doc.y = this.chartArea.topEdge;

    if (this.table) {
      const xPos = this.layoutColumns
        ? _.get(this, `layoutColumns.columns.${this.layoutColumns.activeIndex}.x`)
        : this.chartArea.leftEdge;

      this.table.pos = {
        x: xPos,
        y: this.chartArea.topEdge,
      };
    }

    if (this.layoutColumns) {
      this.setLayoutColumns(
        this.layoutColumns.width,
        this.layoutColumns.count,
        this.layoutColumns.gutter,
      );
    }
  }

  setLayoutColumns(layoutWidth, count, gutter) {
    const itemWidth = (layoutWidth - (gutter * (count - 1))) / count;
    const columns = [];

    let i = 0;
    do {
      columns.push({
        x: this.chartArea.leftEdge + (gutter * i) + (itemWidth * i),
        y: this.doc.y,
      });
      i++;
    } while (i < count);

    this.layoutColumns = {
      columns,
      width: layoutWidth,
      count,
      gutter,
      itemWidth,
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
    _.each(this.layoutColumns.columns, (column, colIndex) => {
      if (!longest || (longest < column.y)) {
        longest = column.y;
        longestIndex = colIndex;
      }
    });

    return longestIndex;
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
      .fontSize(this.defaultFontSize)
      .font(this.font);
  }

  renderSectionHeading(text, opts = {}) {
    const {
      x = this.doc.x,
      y = this.doc.y,
    } = opts;

    this.doc
      .fontSize(this.headerFontSize)
      .text(text, x, y, _.defaults(opts, {
        align: 'left',
      }));

    this.resetText();
    this.doc.moveDown();
  }

  renderCustomColumnHeader(tb, data, draw, column, pos, padding, isHeader) {
    if (draw) {
      const {
        text = '',
        subText = '',
        note,
      } = _.get(data, 'heading', column.header || {});

      let stripeWidth = 0;

      const fillStripeKey = isHeader ? 'headerFillStripe' : 'fillStripe';
      if (column[fillStripeKey]) {
        const stripeDefined = typeof column[fillStripeKey] === 'object';

        const stripeColor = stripeDefined
          ? _.get(column, `${fillStripeKey}.color`, this.colors.grey)
          : _.get(column, 'fill.color', this.colors.grey);

        const stripeOpacity = stripeDefined ? _.get(column, `${fillStripeKey}.opacity`, 1) : 1;
        stripeWidth = stripeDefined ? _.get(column, `${fillStripeKey}.width`, 6) : 6;

        // eslint-disable-next-line no-underscore-dangle
        const stripeHeight = column.height || data._renderedContent.height;

        this.setFill(stripeColor, stripeOpacity);

        this.doc
          .rect(pos.x + 0.25, pos.y + 0.25, stripeWidth, stripeHeight - 0.5)
          .fill();

        this.setFill();
      }

      const xPos = pos.x + padding.left + stripeWidth;
      const yPos = pos.y + padding.top;

      this.doc
        .font(this.boldFont)
        .fontSize(isHeader ? this.defaultFontSize : this.largeFontSize)
        .text(text, xPos, yPos, {
          continued: !!subText,
        });

      this.doc.font(this.font);

      if (subText) {
        this.doc.text(` ${subText}`, xPos, yPos);
      }

      if (note) {
        this.resetText();
        this.doc.text(note);
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
        align: 'left',
        height: heading.note ? 37 : 24,
        cache: false,
        renderer: this.renderCustomColumnHeader,
      },
    ];

    const data = [
      {
        heading,
        note: heading.note,
      },
    ];

    this.renderTable(columns, data, _.defaultsDeep(opts, {
      columnDefaults: {
        headerBorder: '',
      },
      bottomMargin: 0,
      showHeaders: false,
    }));

    this.resetText();
  }

  renderTable(columns = [], rows = [], opts = {}) {
    this.doc.lineWidth(0.5);

    _.defaultsDeep(opts, {
      columnDefaults: {
        borderColor: this.colors.grey,
        headerBorder: 'TBLR',
        border: 'TBLR',
        align: 'left',
        padding: [7, 5, 3, 5],
        headerPadding: [7, 5, 3, 5],
        fill: _.get(opts, 'columnDefaults.zebra', false),
      },
      bottomMargin: 20,
      pos: {
        maxY: this.chartArea.bottomEdge,
      },
    });

    const {
      flexColumn,
    } = opts;

    const table = this.table = new PdfTable(this.doc, opts);

    if (flexColumn) {
      table.addPlugin(new PdfTableFitColumn({
        column: flexColumn,
      }));
    }

    table.onCellBackgroundAdd((tb, column, row, index, isHeader) => {
      const {
        fill,
        headerFill,
        zebra,
      } = column;

      const isEven = index % 2 === 0;

      const fillKey = isHeader ? headerFill : fill;

      if (fillKey) {
        const fillDefined = typeof fillKey === 'object';
        let color;
        let opacity;

        if (!fillDefined) {
          opacity = 1;

          if (zebra) {
            if (isHeader) {
              color = this.colors.zebraHeader;
            } else {
              color = isEven ? this.colors.zebraEven : this.colors.zebraOdd;
            }
          }
        } else {
          const defaultOpacity = _.get(fillKey, 'opacity', 1);

          color = _.get(fillKey, 'color', 'white');
          opacity = zebra ? defaultOpacity / 2 : defaultOpacity;
        }

        this.setFill(color, opacity);
      }
    });

    table.onCellBackgroundAdded(() => {
      this.setFill();
    });

    table.onCellBorderAdd((tb, column) => {
      this.setStroke(_.get(column, 'borderColor', 'black'), 1);
    });

    table.onCellBorderAdded(() => {
      this.setStroke();
    });

    table.onRowAdd((tb, row) => {
      // eslint-disable-next-line no-underscore-dangle
      if (row._bold) {
        this.doc.font(this.boldFont);
      }
    });

    table.onRowAdded(() => {
      this.resetText();
    });

    table
      .setColumnsDefaults(opts.columnDefaults)
      .addColumns(columns)
      .addBody(rows);
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
    const lineHeight = this.doc.fontSize(14).currentLineHeight();
    const xOffset = this.margins.left + this.patientInfoBox.width + 21;
    const yOffset = (
      this.margins.top + ((this.patientInfoBox.height - this.margins.top) / 2 - (lineHeight / 2))
    );

    this.doc.text(this.title, xOffset, yOffset);
    this.titleWidth = this.doc.widthOfString(this.title);
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
    const lineHeight = this.doc.fontSize(this.footerFontSize).currentLineHeight();
    const helpText = 'Questions or feedback please email support@tidepool.org ' +
                     'or visit support.tidepool.org';

    this.doc.fillColor('black').fillOpacity(1)
      .text(helpText, this.margins.left, this.bottomEdge - lineHeight * 1.5, {
        align: 'center',
      });

    return this;
  }

  static renderPageNumbers(doc) {
    const pageCount = doc.bufferedPageRange().count;
    let page = 0;
    while (page < pageCount) {
      page++;
      doc.switchToPage(page - 1);
      doc.fontSize(FOOTER_FONT_SIZE).fillColor('black').fillOpacity(1);
      doc.text(
        `page ${page} of ${pageCount}`,
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
