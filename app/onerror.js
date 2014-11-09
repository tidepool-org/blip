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
module.exports = function myErrorHandler(errorMessage, fileUrl, lineNumber, colno, error) {
  var ERR_GENERIC_LIST = [
    'Whoops! Blip\'s servers got clogged with glucose tabs.',
    'Whoops! Blip ran out of test strips...',
    'Whoa, sorry about that. Looks like Blip needs to change the battery on its pump.',
    'Oh no! Blip\'s blood sugar crashed and now it’s going slower than usual.',
    'Uh oh, Blip\'s blood sugar\'s high and it\'s moving slowly.'
  ];
  var ERR_GENERIC_HELP = 'Blip is stuck and isn\'t doing what you want it to do. We\'re sorry for the trouble. Try refreshing.';
  var html;

  var details = {
    href: window.location.href,
    msg: errorMessage,
    file: fileUrl,
    ln: lineNumber,
    cn: colno
  };

  var chosenMessage = ERR_GENERIC_LIST[Math.floor(Math.random() * (ERR_GENERIC_LIST.length))];

  try{

    //try and send it to the server in the first instance
    window.app.api.errors.log(error,'Caught in onerror',details);

    html = [
    '<div style="background: #fefefe;border: gray solid 1px;margin-left: -200px;position: fixed;left: 50%;top: 20%;z-index: 11;width: 390px;padding: 20px 25px;padding-top:30px;">',
      '<p>' + chosenMessage + '</p>',
      '<p>' + ERR_GENERIC_HELP + '</p>',
      '<a id="error-close" style="text-decoration: underline; position: absolute; top: 10px; right: 15px;" href="#"><i class="icon-close"></i></a>',
    '</div>'
    ].join(' ');


  }catch(err){
    console.log('unable to send details to server');

    details.error = error;

    html = [
    '<div style="background: #fefefe;border: gray solid 1px;margin-left: -200px;position: fixed;left: 50%;top: 20%;z-index: 11;width: 390px;padding: 20px 25px;padding-top:30px">',
      '<p>' + chosenMessage + '</p>',
      '<p>We were unable to log this error to our server so could you please send us a note at <a style="text-decoration: underline;" href="mailto:support@tidepool.org">support@tidepool.org</a> and we\'ll try to see what broke?</p>',
      '<p>' + ERR_GENERIC_HELP + '</p>',
      '<p style="color:rgb(240, 93, 93); overflow: hidden; text-overflow: ellipsis;">Error details: "' + JSON.stringify(details) + '"</p>',
      '<a id="error-close" style="text-decoration: underline; position: absolute; top: 10px; right: 15px;" href="#"><i class="icon-close"></i></a>',
    '</div>'
    ].join(' ');
  }

  var style = [
    'content: "";',
    'background: rgba(0,0,0,.6);',
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'right: 0; ',
    'bottom: 0;',
    'z-index: 10;'
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
