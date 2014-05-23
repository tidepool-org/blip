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
  var html = [
    '<p>',
    'Sorry! Something went wrong. It\'s our fault, not yours.',
    'Could you please send us a note at',
    '<a style="color: #fff; text-decoration: underline;"',
    'href="mailto:support@tidepool.org">support@tidepool.org</a>',
    'and we\'ll try to see what broke?',
    'In the meantime, could you try refreshing your browser to reload the app?',
    '</p>',
    '<p>',
    'Original error message:',
    '"' + errorMessage + '"',
    '(' + fileUrl + ' at line ' + lineNumber + ')',
    '</p>'
  ].join(' ');

  var style = [
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'right: 0;',
    'padding: 0 20px;',
    'text-align: center;',
    'background: #ff8b7c;',
    'color: #fff;'
  ].join(' ');

  var el = document.createElement('div');
  el.innerHTML = html;
  el.setAttribute('style', style);
  document.body.appendChild(el);

  // Let default handler run
  return false;
};

app.start();
