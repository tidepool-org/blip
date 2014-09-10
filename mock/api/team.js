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

var common = require('./common');

var messageIdSize = 12;

function generateMessageId() {
  return common.generateRandomId(messageIdSize);
}

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

  function addUserToMessage(message) {
    var user = data.users[message.userid];
    user = _.cloneDeep(user);
    return _.assign({}, message, {user: user.profile});
  }

  function updateMessageIn(messages, message) {
    return _.map(messages, function(savedMessage) {
      if (savedMessage.id === message.id) {
        return _.omit(message, 'user');
      }
      return savedMessage;
    });
  }

  api.team.getMessageThread = function(messageId, callback){
    api.log('[mock] GET /message/thread/' + messageId);

    setTimeout(function() {
      var theNote = _.find(data.messagenotes[api.userId], function(note) {
        return note.id === messageId;
      });
      if (!theNote) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      var thread = data.messagethread[messageId] || [];
      thread = _.map(thread, function(message) {
        return _.assign({}, message, {
          parentmessage : messageId
        });
      });
      thread = [theNote].concat(thread);
      thread = _.map(thread, addUserToMessage);

      callback(null, thread);
    }, getDelayFor('api.team.getMessageThread'));
  };

  api.team.getNotes = function(userId, callback){
    api.log('[mock] GET /message/notes/' + userId);

    setTimeout(function() {
      if (!data.users[userId]) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      var messages = data.messagenotes[userId] || [];
      messages = _.map(messages, addUserToMessage);

      if (getParam('api.team.getNotes.empty')) {
        messages = [];
      }

      callback(null, messages);
    }, getDelayFor('api.team.getNotes'));
  };

  api.team.replyToMessageThread = function(message, callback){
    api.log('[mock] POST /message/reply/' + message.parentmessage);

    setTimeout(function() {
      var comment = _.cloneDeep(message);
      var commentId = generateMessageId();
      comment.id = commentId;

      var thread = data.messagethread[comment.parentmessage] || [];
      thread.push(comment);
      data.messagethread[comment.parentmessage] = thread;

      callback(null, commentId);
    }, getDelayFor('api.team.replyToMessageThread'));

  };

  api.team.startMessageThread = function(message, callback){
    api.log('[mock] POST /message/send/' + message.groupid);

    setTimeout(function() {
      var note = _.cloneDeep(message);
      var noteId = generateMessageId();
      note.id = noteId;

      var notes = data.messagenotes[note.groupid] || [];
      notes.unshift(note);
      data.messagenotes[note.groupid] = notes;

      callback(null, noteId);
    }, getDelayFor('api.team.startMessageThread'));

  };

  api.team.editMessage = function(message, callback){
    api.log('[mock] PUT /message/edit/' + message.id);

    setTimeout(function() {
      var isNote = !Boolean(message.parentmessage);

      if (isNote) {
        var notes = data.messagenotes[message.groupid];
        notes = updateMessageIn(notes, message);
        data.messagenotes[message.groupid] = notes;
      }

      else {
        var comments = data.messagethread[message.parentmessage];
        comments = updateMessageIn(comments, message);
        data.messagethread[message.parentmessage] = comments;
      }

      callback(null, null);
    }, getDelayFor('api.team.editMessage'));
  };

  return api;
};

module.exports = patch;
