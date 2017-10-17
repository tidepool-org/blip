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

import * as Module from '../../../src/modules/print';
import Doc from '../../helpers/pdfDoc';

describe('print module', () => {
  const pdf = {
    url: 'someURL',
    blob: 'someBlob',
  };

  const margin = 36;

  const data = {
    daily: {},
    basics: {},
  };
  const opts = {
    bgPrefs: {},
    numDays: {
      daily: 6,
    },
    patient: {},
    timePrefs: {},
    mostRecent: '',
  };

  class DailyPrintView {
    render() {}
  }

  const sandbox = sinon.sandbox.create();

  let doc;
  let stream;

  sinon.stub(Module.utils, 'reshapeBgClassesToBgBounds');
  sinon.stub(Module.utils, 'selectDailyViewData').returns(undefined);
  sinon.stub(Module.utils, 'DailyPrintView').returns(new DailyPrintView());
  // sinon.stub(Module.utils, 'PDFDocument').returns(new Doc({ pdf, margin }, stream));
  sinon.stub(Module.utils, 'blobStream').returns(new MemoryStream());

  beforeEach(() => {
    stream = new MemoryStream();
    doc = new Doc({ pdf, margin });
    sandbox.stub(Module.utils, 'PDFDocument').returns(doc);
  });

  afterEach(() => {
    sandbox.restore();
    Module.utils.reshapeBgClassesToBgBounds.resetHistory();
    Module.utils.selectDailyViewData.resetHistory();
    Module.utils.DailyPrintView.resetHistory();
    Module.utils.blobStream.resetHistory();
  });

  it('should export a createPrintPDFPackage method', () => {
    expect(Module.createPrintPDFPackage).to.be.a('function');
  });

  it('should export a createPrintView method', () => {
    expect(Module.createPrintView).to.be.a('function');
  });

  it('should properly set bg bounds', () => {
    const result = Module.createPrintPDFPackage(data, opts, stream);
    doc.stream.end();

    return result.then(() => {
      sinon.assert.calledOnce(Module.utils.reshapeBgClassesToBgBounds);
      sinon.assert.calledWithExactly(Module.utils.reshapeBgClassesToBgBounds, opts.bgPrefs);
    });
  });

  it('should fetch the daily view data', () => {
    const result = Module.createPrintPDFPackage(data, opts);
    doc.stream.end();

    return result.then(() => {
      sinon.assert.calledOnce(Module.utils.selectDailyViewData);
      sinon.assert.calledWithExactly(
        Module.utils.selectDailyViewData,
        opts.mostRecent,
        data.daily,
        opts.numDays.daily,
        opts.timePrefs
      );
    });
  });

  it('should render and return the pdf data', () => {
    const result = Module.createPrintPDFPackage(data, opts);
    doc.stream.end();

    return result.then(_result => {
      sinon.assert.calledOnce(Module.utils.DailyPrintView);
      sinon.assert.calledWithMatch(
        Module.utils.DailyPrintView,
        new Module.utils.PDFDocument(),
        Module.utils.selectDailyViewData(),
        {
          numDays: opts.numDays.daily,
          patient: opts.patient,
          timePrefs: opts.timePrefs,
        },
      );

      expect(_result).to.eql(pdf);
    });
  });
});
