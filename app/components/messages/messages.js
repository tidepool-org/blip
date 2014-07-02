/**
 * @jsx React.DOM
 */

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
'use strict';

var React = window.React;
var _ = window._;
var sundial = window.sundial;

var Message = require('./message');
var MessageForm = require('./messageform');

var Messages = React.createClass({

  propTypes: {
    messages : React.PropTypes.array,
    createDatetime : React.PropTypes.string,
    user : React.PropTypes.object,
    patient: React.PropTypes.object,
    onClose : React.PropTypes.func,
    onSave : React.PropTypes.func,
    onNewMessage : React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      NOTE_PROMPT : 'Type a new note here ...',
      COMMENT_PROMPT : 'Type a comment here ...'
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({messages: nextProps.messages});
  },

  getInitialState: function() {
    return {
      isWorking: false,
      formValues: {
        messageDateTime: sundial.formatForDisplay(this.props.createDatetime),
        messageText: ''
      },
      messages : this.props.messages
    };
  },
  renderNote: function(message){
    /* jshint ignore:start */
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize="large"
        imagesEndpoint={this.props.imagesEndpoint}/>
      );
    /* jshint ignore:end */
  },
  renderComment:function(message){
    /* jshint ignore:start */
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize="small"
        imagesEndpoint={this.props.imagesEndpoint}/>
      );
    /* jshint ignore:end */
  },
  renderThread:function(){

    if(this.isMessageThread()){

      var thread = _.map(this.state.messages, function(message) {
        if(!message.parentmessage) {
          return this.renderNote(message);
        } else if (message.parentmessage) {
          return this.renderComment(message);
        }
      }.bind(this));

      /* jshint ignore:start */
      return (
        <div className="messages-thread">{thread}</div>
      );
      /* jshint ignore:end */
    }

    return;
  },
  isMessageThread:function(){
    return this.state.messages;
  },
  renderForm:function(){
    var submitButtonText;

    if(this.isMessageThread()){
      submitButtonText = 'Comment';
      if (this.state.isWorking) {
        submitButtonText = 'Sending...';
      }

      /* jshint ignore:start */
      return (
        <div className="messages-form">

          <MessageForm
            messagePrompt={this.props.COMMENT_PROMPT}
            saveBtnText={submitButtonText}
            onSubmit={this.handleAddComment}/>
        </div>
      );
      /* jshint ignore:end */
    }

    submitButtonText = 'Post';
    if (this.state.isWorking) {
      submitButtonText = 'Sending...';
    }

    /* jshint ignore:start */
    return (
      <div className="messages-form">
        <div className="messages-create-datetime">
          {'New note for '}
          <span className="messages-create-datetime-value">
            {sundial.formatForDisplay(this.props.createDatetime)}
          </span>
        </div>
        <MessageForm
            messagePrompt={this.props.NOTE_PROMPT}
            saveBtnText={submitButtonText}
            onSubmit={this.handleCreateNote}/>
      </div>
    );
    /* jshint ignore:end */
  },
  renderClose:function(){
    /* jshint ignore:start */
    return (<a className='messages-close' onClick={this.handleClose}>Close</a>);
    /* jshint ignore:end */
  },
  render: function() {
    var thread = this.renderThread();
    var close = this.renderClose();
    var form = this.renderForm();

    return (
     /* jshint ignore:start */
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
     /* jshint ignore:end */
     );
  },
  getParent : function(){
    if(this.isMessageThread()){
      return _.first(this.state.messages, function(message){ return !(message.parentmessage); })[0];
    }
    return;
  },
  handleAddComment : function (formValues){

    if(formValues.text){
      this.resetFormStateBeforeSubmit(formValues);

      var addComment = this.props.onSave;
      var parent = this.getParent();

      var comment = {
        parentmessage : parent.id,
        userid : this.props.user.id,
        groupid : parent.groupid,
        messagetext : formValues.text,
        timestamp : formValues.timestamp
      };

      addComment(comment, function(error,commentId){
        this.setState({isWorking: false});

        if (commentId) {
          //set so we can display right away
          comment.id = commentId;
          comment.user = this.props.user;
          var withReply = this.state.messages;
          withReply.push(comment);
          this.setState({
            messages: withReply,
            formValues: {messageText: ''}
          });
        }
      }.bind(this));
    }
  },
  handleCreateNote: function (formValues){

    if(formValues.text){
      this.resetFormStateBeforeSubmit(formValues);

      var createNote = this.props.onSave;

      var message = {
        userid : this.props.user.id,
        groupid : this.props.patient.id,
        messagetext : formValues.text,
        timestamp : this.props.createDatetime
      };

      createNote(message, function(error,messageId){
        this.setState({isWorking: false});

        if (messageId) {
          //set so we can display right away
          message.id = messageId;
          message.user = this.props.user;
          //give this message to anyone that needs it
          this.props.onNewMessage(message);

          // Close the modal if we can, else clear form and display new message
          var close = this.props.onClose;
          if (close) {
            close();
          }
          else {
            this.setState({
              messages: [message],
              formValues: {messageText: '', messageDateTime:''}
            });
          }
        }
      }.bind(this));
    }
  },
  handleClose: function(e) {
    e.preventDefault();
    var close = this.props.onClose;
    if (close) {
      close();
    }
  },
  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      isWorking: true,
      formValues: formValues
    });
  },
});

module.exports = Messages;
