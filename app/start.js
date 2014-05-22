/**
 * Copyright (c) 2014, Tidepool Project
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
 */

/* global app */

window.onerror = function myErrorHandler(errorMessage, fileUrl, lineNumber) {
  var text = [
    'Sorry! Something went wrong. It\'s our fault, not yours.',
    'We\'re going to go investigate.',
    'For the time being, try refreshing your browser?',
    'Original error message:',
    '"' + errorMessage + '"',
    '(' + fileUrl + ' at line ' + lineNumber + ')'
  ].join(' ');

  var style = [
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'right: 0;',
    'padding: 20px;',
    'text-align: center;',
    'background: #ff8b7c;',
    'color: #fff;'
  ].join(' ');

  var el = document.createElement('div');
  el.textContent = text;
  el.setAttribute('style', style);
  document.body.appendChild(el);

  // Let default handler run
  return false;
};

app.start();
