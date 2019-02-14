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

import i18next from './core/language';

const t = i18next.t.bind(i18next);

export default function myErrorHandler(errorMessage, fileUrl, lineNumber, colno, error) {
  const ERR_GENERIC_LIST = [
    t('Whoops! Tidepool\'s servers got clogged with glucose tabs.'),
    t('Whoops! Tidepool ran out of test strips...'),
    t('Whoa, sorry about that. Looks like Tidepool needs to change the battery on its pump.')
  ];
  const ERR_GENERIC_HELP = t('Tidepool is stuck and isn\'t doing what you want it to do. We\'re sorry for the trouble.');
  const ERR_SENT_TO_SERVER = t('Tidepool will attempt to send the details to our server.');
  const ERR_PLEASE_SEND_DETAIL = t('We were unable to log this error to our server so could you please send us a note at <a style="text-decoration: underline;" href="mailto:support@tidepool.org">support@tidepool.org</a> and we\'ll try to see what broke?');
  let html;

  const details = {
    utcDateTime: new Date().toISOString(),
    href: window.location.href,
    msg: errorMessage,
    file: fileUrl,
    ln: lineNumber,
    cn: colno
  };

  try {
    //try and send it to the server in the first instance
    window.app.api.errors.log(error,'Caught in onerror',details);

    html = [
    '<div style="background: #fefefe;border: gray solid 1px;margin-left: -200px;position: fixed;left: 50%;top: 20%;z-index: 11;width: 390px;padding: 20px 25px;padding-top:30px;">',
      '<p>' + ERR_GENERIC_HELP + '</p>',
      '<p>' + ERR_SENT_TO_SERVER + '</p>',
      '<p> UTC time: ' + new Date().toISOString() + '</p>',
      '<a id="error-close" style="text-decoration: underline; position: absolute; top: 10px; right: 15px;" href="#"><i class="icon-close"></i></a>',
    '</div>'
    ].join(' ');
  } catch(err) {
    console.log('unable to send details to server');

    details.error = error;

    html = [
    '<div style="background: #fefefe;border: gray solid 1px;margin-left: -200px;position: fixed;left: 50%;top: 20%;z-index: 11;width: 390px;padding: 20px 25px;padding-top:30px">',
      '<p>' + ERR_GENERIC_HELP + '</p>',
      '<p>'+ ERR_PLEASE_SEND_DETAIL +'</p>',
      '<p style="color:rgb(240, 93, 93); overflow: hidden; text-overflow: ellipsis;">Error details:' + JSON.stringify(details) + '"</p>',
      '<a id="error-close" style="text-decoration: underline; position: absolute; top: 10px; right: 15px;" href="#"><i class="icon-close"></i></a>',
    '</div>'
    ].join(' ');
  }

  const style = [
    'content: "";',
    'background: rgba(0,0,0,.6);',
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'right: 0; ',
    'bottom: 0;',
    'z-index: 10;'
  ].join(' ');

  const el = document.createElement('div');
  el.innerHTML = html;
  el.setAttribute('style', style);
  document.body.appendChild(el);

  const closeEl = document.getElementById('error-close');
  closeEl.addEventListener('click', function(e) {
    e.preventDefault();
    el.parentNode.removeChild(el);
  });
  // Let default handler run
  return false;
};
