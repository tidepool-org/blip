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

onmessage = (msg) => {
  const { id } = _.get(msg, 'data.meta', {});

  if (id) {
    // Instantiate a new queue if not set or id changes
    if (!q || q.id !== id) q = newQueue(id);

    // Add message to queue
    q.push(msg);
    log('Pushed msg to queue:', msg);
  }
};

function newQueue(id) {
  const _queue = queue(processMessage, 1);
  _queue.id = id;

  log('New queue with id:', id, _queue);
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
