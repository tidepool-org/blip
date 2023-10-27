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

/* global postMessage */

import _ from 'lodash';
import bows from 'bows';

import PDFWorker from './PDFWorker';
import DataWorker from './DataWorker';
import { queue } from 'async';

const dataWorker = new DataWorker();
const pdfWorker = new PDFWorker(dataWorker.dataUtil);
const log = bows('Worker');

let q;

import fs from 'fs';
import forEach from 'lodash/forEach';
// the content file is returned as is (webpack is configured to load *.afm files as asset/source)

function registerBinaryFiles(ctx) {
  forEach(ctx.keys(), key => {
    // extracts "./" from beginning of the key
    fs.writeFileSync(key.substring(2), ctx(key));
  });
}

function registerAFMFonts(ctx) {
  forEach(ctx.keys(), key => {
    const match = key.match(/([^/]*\.afm$)/);
    if (match) {
      // afm files must be stored on data path
      fs.writeFileSync(`data/${match[0]}`, ctx(key));
    }
  });
}

// register all files found in assets folder (relative to src)
// registerBinaryFiles(require.context('./static-assets', true));

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase too much
registerAFMFonts(require.context('pdfkit/js/data', false, /Helvetica.*\.afm$/));

onmessage = (msg) => {
  const { patientId } = _.get(msg, 'data.meta', {});

  if (patientId) {
    // Instantiate a new queue if not set or patientId changes
    if (!q || q.id !== patientId) q = newQueue(patientId);

    // Add message to queue
    q.push(msg);
    log('Pushed msg to queue:', msg);
  }
};

function newQueue(patientId) {
  const _queue = queue(processMessage, 1);
  _queue.id = patientId;

  log('New queue with patientId:', patientId, _queue);
  return _queue;
}

function processMessage(msg, cb) {
  switch(_.get(msg, 'data.meta.worker')) {
    case 'pdf':
      pdfWorker.handleMessage(msg, postMessage);
      break;

    case 'data':
      dataWorker.handleMessage(msg, postMessage);
      break;
    }

  cb();
}
