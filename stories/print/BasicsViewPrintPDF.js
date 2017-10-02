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
import _ from 'lodash';

import { storiesOf } from '@kadira/storybook';
import { WithNotes } from '@kadira/storybook-addon-notes';

import { createPrintView } from '../../src/modules/print/index';
import * as patients from '../../data/patient/fixtures';

import { MGDL_UNITS, MMOLL_UNITS } from '../../src/utils/constants';

/* global PDFDocument, blobStream */

// eslint-disable-next-line import/no-unresolved
import dataMGDL from '../../local/basics-print-view-mgdl.json';

// eslint-disable-next-line import/no-unresolved
import dataMMOLL from '../../local/basics-print-view-mmoll.json';

const data = {
  [MGDL_UNITS]: dataMGDL,
  [MMOLL_UNITS]: dataMMOLL,
};

const bgBounds = {
  [MGDL_UNITS]: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 70,
    veryLowThreshold: 54,
  },
  [MMOLL_UNITS]: {
    veryHighThreshold: 16.7,
    targetUpperBound: 10,
    targetLowerBound: 3.9,
    veryLowThreshold: 3.12345,
  },
};

function openPDF({ patient, bgUnits = MGDL_UNITS }) {
  const doc = new PDFDocument({ autoFirstPage: false, bufferPages: true, margin: 36 });
  const stream = doc.pipe(blobStream());
  const opts = {
    bgPrefs: {
      bgBounds: bgBounds[bgUnits],
      bgUnits,
    },
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Eastern',
    },
    patient,
  };

  const basicsPrintView = createPrintView('basics', data[bgUnits], opts, doc);

  basicsPrintView.render();
  doc.end();

  stream.on('finish', () => {
    window.open(stream.toBlobURL('application/pdf'));
  });
}

const notes = `Use \`window.downloadBasicsPrintViewData()\` to get basics view munged data,
  save it in local/ directory of viz as \`basics-print-view.json\`,
  then use this story to iterate on the Basics Print PDF outside of blip!`;

patients.longName = _.cloneDeep(patients.standard);
patients.longName.profile.fullName = 'Super Duper Long Patient Name';

storiesOf('BasicsViewPrintPDF', module)
  .add(`standard account (${MGDL_UNITS})`, () => (
    <WithNotes notes={notes}>
      <button onClick={() => openPDF({ patient: patients.standard })}>
        Open PDF in new tab
      </button>
    </WithNotes>
  ))

  .add(`standard account (${MMOLL_UNITS})`, () => (
    <WithNotes notes={notes}>
      <button onClick={() => openPDF({ patient: patients.standard, bgUnits: MMOLL_UNITS })}>
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
  ))

  .add('long patient name', () => (
    <WithNotes notes={notes}>
      <button onClick={() => openPDF({ patient: patients.longName })}>
        Open PDF in new tab
      </button>
    </WithNotes>
  ));
