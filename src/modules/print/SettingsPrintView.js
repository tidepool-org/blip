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

import {
  getTimezoneFromTimePrefs,
  formatBirthdate,
  formatCurrentDate,
} from '../../utils/datetime';

import { getPatientFullName } from '../../utils/misc';

const logo = require('./images/tidepool-logo-408x46.png');

class SettingsPrintView {
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

    this.patient = opts.patient;
    this.patientInfoBox = {
      width: 0,
      height: 0,
    };

    this.colors = {
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

    this.totalPages = this.initialTotalPages = this.doc.bufferedPageRange().count || 0;

    // kick off the dynamic calculation of chart area based on font sizes for header and footer
    this.setHeaderSize().setFooterSize();

    // no auto-binding :/
    this.newPage = this.newPage.bind(this);
    this.doc.on('pageAdded', this.newPage);
  }

  newPage() {
    if (this.debug) {
      this.renderDebugGrid();
    }
    this.renderHeader().renderFooter();
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
    this.doc.addPage();
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
    const title = 'The Settings';
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
    const lineHeight = this.doc.fontSize(10).currentLineHeight();
    const helpText = 'Questions or feedback please email support@tidepool.org ' +
                     'or visit support.tidepool.org';

    this.doc.fillColor('black').fillOpacity(1)
      .text(helpText, this.margins.left, this.bottomEdge - lineHeight * 1.4, {
        align: 'center',
      });

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

export default SettingsPrintView;
