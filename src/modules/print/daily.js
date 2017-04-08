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

/* global PDFDocument, blobStream */

/**
 * DESCRIPTION
 * @param {Array} data - the PwD-in-view's processed data
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {String} url - the PDF file blog URL for opening in a new tab & printing
 */

// opts will be { dateTitle, patientName }
export default function openDailyPrintView() {
  // dimensions of portrait-oriented 8.5" x 11" PDF are 612 x 792 at 72 dpi
  // usable area with default 1" margins is 468 x 648
  const margin = 72;
  const doc = new PDFDocument;
  const stream = doc.pipe(blobStream());
  doc.text('Daily View')
    .moveDown();
  const height = doc.currentLineHeight() * 2 + margin;
  doc.moveTo(margin, height)
    .lineTo(margin * 7.5, height)
    .stroke();
  doc.end();

  stream.on('finish', () => {
    const printWindow = window.open(stream.toBlobURL('application/pdf'));
    printWindow.focus();
    printWindow.print();
  });
}
