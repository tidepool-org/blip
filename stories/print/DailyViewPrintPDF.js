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

import React from 'react';

import { storiesOf } from '@kadira/storybook';
import { WithNotes } from '@kadira/storybook-addon-notes';

import { createDailyPrintView } from '../../src/modules/print/index';
import * as patients from '../../data/patient/fixtures';

/* global PDFDocument, blobStream */

// eslint-disable-next-line import/no-unresolved
const data = require('../../local/daily-print-view.json');

function openPDF({ patient }) {
  const doc = new PDFDocument({ autoFirstPage: false, bufferPages: true, margin: 36 });
  const stream = doc.pipe(blobStream());

  const dailyPrintView = createDailyPrintView(doc, data, {
    bgBounds: {
      veryHighThreshold: 300,
      targetUpperBound: 180,
      targetLowerBound: 70,
      veryLowThreshold: 54,
    },
    bgUnits: 'mg/dL',
  }, {
    timezoneAware: true,
    timezoneName: 'US/Pacific',
  }, 6, patient);

  dailyPrintView.render();
  doc.end();

  stream.on('finish', () => {
    window.open(stream.toBlobURL('application/pdf'));
  });
}

const notes = `Use \`window.downloadDailyPrintViewData()\` to get daily view munged data,
  save it in local/ directory of viz as \`daily-print-view.json\`,
  then use this story to iterate on the Daily Print PDF outside of blip!`;

storiesOf('DailyViewPrintPDF', module)
  .add('standard account', () => (
    <WithNotes notes={notes}>
      <button onClick={() => openPDF({ patient: patients.standard })}>
        Open PDF in new tab
      </button>
    </WithNotes>
  ))

  .add('fake child account', () => (
    <WithNotes notes={notes}>
      <button onClick={() => openPDF({ patient: patients.fakeChildAcct })}>
        Open PDF in new tab
      </button>
    </WithNotes>
  ));
