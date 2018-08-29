/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/

import React from 'react';
import _ from 'lodash';
import sundial from 'sundial';
import { translate } from 'react-i18next';

var Message = require('./message');
var MessageForm = require('./messageform');

var Messages = translate()(React.createClass({
  propTypes: {
    messages: React.PropTypes.array,
    createDatetime: React.PropTypes.string,
    user: React.PropTypes.object,
    patient: React.PropTypes.object,
    onClose: React.PropTypes.func,
    onSave: React.PropTypes.func,
    onEdit: React.PropTypes.func,
    onNewMessage: React.PropTypes.func,
    timePrefs: React.PropTypes.object.isRequired
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({messages: nextProps.messages});
  },
  getInitialState: function() {
    return {
      messages : this.props.messages
    };
  },
  /*
   * Should the user be able to edit this message?
   */
  getSaveEdit: function(messageUserId) {
    var saveEdit;
    if (messageUserId === this.props.user.userid) {
      saveEdit = this.handleEditNote;
    }
    return saveEdit;
  },
  renderNote: function(message){
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize='large'
        onSaveEdit={this.getSaveEdit(message.userid)}
        timePrefs={this.props.timePrefs} />
      );

  },
  renderComment: function(message){
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize='small'
        onSaveEdit={this.getSaveEdit(message.userid)}
        timePrefs={this.props.timePrefs} />
      );

  },
  renderThread: function() {
    if (this.isMessageThread()) {
      var thread = _.map(this.state.messages, function(message) {
        if (!message.parentmessage) {
          return this.renderNote(message);
        } else if (message.parentmessage) {
          return this.renderComment(message);
        }
      }.bind(this));


      return (
        <div className='messages-thread'>{thread}</div>
      );

    }

    return;
  },
  isMessageThread: function() {
    return !_.isEmpty(this.state.messages);
  },
  renderCommentOnThreadForm: function() {
    const { t } = this.props;
    var submitButtonText = t('Comment_submit');


    return (
      <div className='messages-form'>
        <MessageForm
          messagePrompt={t('Type a comment here ...')}
          saveBtnText={submitButtonText}
          onSubmit={this.handleAddComment}
          timePrefs={this.props.timePrefs} />
      </div>
    );
  },
  renderNewThreadForm: function() {
    const { t } = this.props;
    var submitButtonText = t('Post_submit');


    return (
      <div className='messages-form'>
        <MessageForm
          formFields={{editableTimestamp: this.props.createDatetime}}
          messagePrompt={t('Type a new note here ...')}
          saveBtnText={submitButtonText}
          onSubmit={this.handleCreateNote}
          onCancel={this.handleClose}
          timePrefs={this.props.timePrefs} />
      </div>
    );
  },
  renderClose:function(){
    return (<a className='messages-close' onClick={this.handleClose}>Close</a>);

  },
  render: function() {
    var thread = this.renderThread();
    var form = this.renderNewThreadForm() ;
    var close;

    //If we are closing an existing thread then have close and render the comment form
    if (thread) {
      close = this.renderClose();
      form = this.renderCommentOnThreadForm();
    }

    return (

     <div className='messages'>
      <div className='messages-inner'>
        <div className='messages-header'>
          {close}
        </div>
        <div>
          {thread}
          {form}
        </div>
      </div>
     </div>
    );
  },
  getParent: function() {
    if (this.isMessageThread()) {
      return _.find(
        this.state.messages,
        function(message) { return !(message.parentmessage); }
      );
    }
    return;
  },
  handleAddComment: function(formValues, cb) {
    var self = this;
    if (_.isEmpty(formValues) === false) {
      var addComment = this.props.onSave;
      var parent = this.getParent();

      var comment = {
        parentmessage: parent.id,
        userid: this.props.user.userid,
        groupid: parent.groupid,
        messagetext: formValues.text,
        timestamp: formValues.timestamp
      };

      addComment(comment, function(err, commentId) {
        if(cb){
          cb();
        }
        comment.id = commentId ;
        comment.user = self.props.user.profile;
        var withReply = self.state.messages;
        withReply.push(comment);
        self.setState({
          messages: withReply
        });
      });

    }
  },
  handleCreateNote: function(formValues,cb) {
    var self = this;
    if (_.isEmpty(formValues) === false) {
      var createNote = this.props.onSave;

      var message = {
        userid : this.props.user.userid,
        groupid : this.props.patient.userid,
        messagetext : formValues.text,
        timestamp : sundial.formatForStorage(
          formValues.timestamp,
          sundial.getOffsetFromTime(formValues.timestamp)
        )
      };

      createNote(message, function(err, messageId) {
        if(cb){
          //let the form know all is good
          cb();
        }
        //set so we can display right away
        message.id = messageId // TODO: Need to fix this too;
        message.user = self.props.user.profile;
        //give this message to anyone that needs it
        self.props.onNewMessage(message);

        // Close the modal if we can, else clear form and display new message
        var close = self.props.onClose;
        if (close) {
          close();
        }
        else {
          self.setState({
            messages: [message]
          });
        }
      });
    }
  },
  handleEditNote: function(updated) {
    if(_.isEmpty(updated) === false){
      this.props.onEdit(updated, function(error, details){});
    }
  },
  handleClose: function(e) {
    if(e){
      e.preventDefault();
    }
    var close = this.props.onClose;
    if (close) {
      close();
    }
  }
}));

module.exports = Messages;
