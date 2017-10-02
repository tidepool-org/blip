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

describe('print module', () => {
  const pdf = {
    url: 'someURL',
    blob: 'someBlob',
  };

  const mostRecent = 'mostRecent';
  const groupedData = [];
  const opts = {
    bgPrefs: {},
    numDays: 6,
    patient: {},
    timePrefs: {},
  };

  let stream = new MemoryStream();

  class Doc {
    pipe() {
      const Stream = stream;
      Stream.toBlobURL = () => pdf.url;
      Stream.toBlob = () => pdf.blob;
      return Stream;
    }
    end() {}
  }

  class DailyPrintView {
    render() {}
  }

  sinon.stub(Module.utils, 'reshapeBgClassesToBgBounds');
  sinon.stub(Module.utils, 'selectDailyViewData').returns(undefined);
  sinon.stub(Module.utils, 'DailyPrintView').returns(new DailyPrintView());
  sinon.stub(Module.utils, 'PDFDocument').returns(new Doc());
  sinon.stub(Module.utils, 'blobStream').returns(new MemoryStream());

  beforeEach(() => {
    stream = new MemoryStream();
  });

  afterEach(() => {
    Module.utils.reshapeBgClassesToBgBounds.resetHistory();
    Module.utils.selectDailyViewData.resetHistory();
    Module.utils.DailyPrintView.resetHistory();
    Module.utils.PDFDocument.resetHistory();
    Module.utils.blobStream.resetHistory();
  });

  it('should export a createPrintPDFPackage method', () => {
    expect(Module.createPrintPDFPackage).to.be.a('function');
  });

  it('should export a createPrintView method', () => {
    expect(Module.createPrintView).to.be.a('function');
  });

  it('should properly set bg bounds', () => {
    const result = Module.createPrintPDFPackage(mostRecent, groupedData, opts);
    stream.end();

    return result.then(() => {
      sinon.assert.calledOnce(Module.utils.reshapeBgClassesToBgBounds);
      sinon.assert.calledWithExactly(Module.utils.reshapeBgClassesToBgBounds, opts.bgPrefs);
    });
  });

  it('should fetch the daily view data', () => {
    const result = Module.createPrintPDFPackage(mostRecent, groupedData, opts);
    stream.end();

    return result.then(() => {
      sinon.assert.calledOnce(Module.utils.selectDailyViewData);
      sinon.assert.calledWithExactly(
        Module.utils.selectDailyViewData,
        mostRecent,
        groupedData,
        opts.numDays,
        opts.timePrefs
      );
    });
  });

  it('should render and return the pdf data', () => {
    const result = Module.createPrintPDFPackage(mostRecent, groupedData, opts);
    stream.end();

    return result.then(_result => {
      sinon.assert.calledOnce(Module.utils.DailyPrintView);
      sinon.assert.calledWithMatch(
        Module.utils.DailyPrintView,
        new Module.utils.PDFDocument(),
        Module.utils.selectDailyViewData(),
        {
          numDays: opts.numDays,
          patient: opts.patient,
          timePrefs: opts.timePrefs,
        },
      );

      expect(_result).to.eql(pdf);
    });
  });
});
