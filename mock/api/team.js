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

var _ = require('lodash');

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

  api.team.getMessageThread = function(messageId,callback){
    api.log('[mock] GET /message/thread/' + messageId);

    var thread = data.messagethread.tbd;

    var theNote = _.find(data.messagenotes[11], function(note) {
      return note.id === messageId;
    });

    thread = _.map(thread, function(message) {
      return {
        timestamp: message.timestamp,
        messagetext: message.messagetext,
        userid: message.userid,
        user: message.user,
        parentmessage : messageId,
        groupid : message.groupid,
        id : message.id
      };
    });

    thread.unshift(theNote);

    setTimeout(function() {
      callback(null, thread);
    }, getDelayFor('api.team.getMessageThread'));
  };

  api.team.getNotes = function(userId,callback){
    api.log('[mock] GET /message/notes/' + userId);

    var messages = data.messagenotes[userId] || [];

    messages = _.map(messages, function(message) {
      return {
        utcTime : message.timestamp,
        messageText : message.messagetext,
        parentMessage : message.parentmessage,
        type: 'message',
        id: message.id
      };
    });

    if (getParam('api.team.getNotes.empty')) {
      messages = [];
    }

    setTimeout(function() {
      callback(null, messages);
    }, getDelayFor('api.team.getNotes'));
  };

  api.team.replyToMessageThread = function(message,cb){
    api.log('[mock] POST /message/reply ',message);

    var fakeId = _.random(0,999);

    setTimeout(function() {
      cb(null, fakeId);
    }, getDelayFor('api.team.replyToMessageThread'));

  };

  api.team.startMessageThread = function(message,cb){
    api.log('[mock] POST /message/send ',message);

    var fakeId = _.random(1000,1999);

    setTimeout(function() {
      cb(null, fakeId);
    }, getDelayFor('api.team.startMessageThread'));

  };

  api.team.editMessage = function(message,cb){
    api.log('[mock]  /message/edit');

    setTimeout(function() {
      cb(null, null);
    }, getDelayFor('api.team.editMessage'));
  };

  return api;
};

module.exports = patch;
