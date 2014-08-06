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

var app = require('./app');

require('tideline/css/tideline.less');
require('./core/less/fonts.less');
require('./style.less');

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
    '</p>',
    '<p>',
    '<a id="error-close" style="color: #fff; text-decoration: underline; ',
    'position: absolute; top: 5px; right: 5px; font-size: 13px;"',
    'href="#">Close</a>',
    '</p>',
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

  var closeEl = document.getElementById('error-close');
  closeEl.addEventListener('click', function(e) {
    e.preventDefault();
    el.parentNode.removeChild(el);
  });

  // Let default handler run
  return false;
};

// For easier debugging
window.app = app;

app.start();
