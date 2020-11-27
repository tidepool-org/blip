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

import MemoryStream from 'memorystream';

export default class Doc {
  constructor(opts = {}) {
    this.stream = new MemoryStream();
    this.stream.toBlobURL = () => this.pdf.url;
    this.stream.toBlob = () => this.pdf.blob;

    this.autoFirstPage = false;
    this.bufferPages = true;
    this.margin = opts.margin;

    this.page = {
      width: 300,
      margins: {
        left: 36,
        right: 36,
        top: 36,
        bottom: 36,
      },
    };

    this.pdf = opts.pdf;

    this.currentLineHeight = sinon.stub().returns(10);
    this.bufferedPageRange = sinon.stub().returns({ start: 0, count: 0 });
    this.on = sinon.stub();
    this.removeAllListeners = sinon.stub();
    this.end = sinon.stub();
    this.fontSize = sinon.stub().returns(this);
    this.addPage = sinon.stub().returns(this);
    this.path = sinon.stub().returns(this);
    this.fill = sinon.stub().returns(this);
    this.fillAndStroke = sinon.stub().returns(this);
    this.stub = sinon.stub().returns(this);
    this.dash = sinon.stub().returns(this);
    this.undash = sinon.stub().returns(this);
    this.stroke = sinon.stub().returns(this);
    this.strokeColor = sinon.stub().returns(this);
    this.strokeOpacity = sinon.stub().returns(this);
    this.circle = sinon.stub().returns(this);
    this.lineWidth = sinon.stub().returns(this);
    this.rect = sinon.stub().returns(this);
    this.switchToPage = sinon.stub().returns(this);
    this.text = sinon.stub().returns(this);
    this.image = sinon.stub().returns(this);
    this.fillColor = sinon.stub().returns(this);
    this.fillOpacity = sinon.stub().returns(this);
    this.font = sinon.stub().returns(this);
    this.moveTo = sinon.stub().returns(this);
    this.moveDown = sinon.stub().returns(this);
    this.lineTo = sinon.stub().returns(this);
    this.lineGap = sinon.stub().returns(this);
    this.lineCap = sinon.stub().returns(this);
    this.save = sinon.stub().returns(this);
    this.restore = sinon.stub().returns(this);
    this.widthOfString = sinon.stub().returns(20);
    this.heightOfString = sinon.stub().returns(10);
  }

  pipe() {
    return this.stream;
  }

  end() {
    this.stream.end();
  }
}
