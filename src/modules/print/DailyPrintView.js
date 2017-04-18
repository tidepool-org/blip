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

class DailyPrintView {
  constructor(doc, data, opts) {
    this.doc = doc;

    this.data = data;

    this.dpi = opts.dpi;

    this.margins = opts.margins;

    this.width = opts.width;
    this.height = opts.height;

    this.rightEdge = this.margins.left + this.width;
    this.bottomEdge = this.margins.top + this.height;

    this.chartArea = {
      topEdge: opts.margins.top,
      bottomEdge: opts.margins.top + opts.height,
    };
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
  }

  renderHeader(fontSize) {
    this.doc.lineWidth(1);
    this.doc.fontSize(fontSize).text('Daily View', this.margins.left, this.margins.top)
      .moveDown();
    const lineHeight = this.doc.currentLineHeight();
    const height = lineHeight * 2 + this.margins.top;
    this.doc.moveTo(this.margins.left, height)
      .lineTo(this.margins.left + this.width, height)
      .stroke('black');
    this.chartArea.topEdge = this.chartArea.topEdge + lineHeight * 4;
    // TODO: remove this; it is just for exposing/debugging the chartArea.topEdge adjustment
    // eslint-disable-next-line lodash/prefer-lodash-method
    this.doc.fillColor('#E8E8E8', 0.3333333333)
      .rect(this.margins.left, this.margins.top, this.width, lineHeight * 4)
      .fill();
  }
}

export default DailyPrintView;
