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
var moment = window.moment;
var _ = window._;

var SimpleForm = require('../simpleform');

var Messages = React.createClass({

  propTypes: {
    messages : React.PropTypes.array,
    createDatetime : React.PropTypes.string,
    user : React.PropTypes.object,
    patient: React.PropTypes.object,
    onClose : React.PropTypes.func,
    onSave : React.PropTypes.func,
    onNewMessage : React.PropTypes.func
  },

  getInitialState: function() {
    return {
      formValues: { messageText: '', messageDateTime : this.formatDisplayDate(this.props.createDatetime) },
      messages : this.props.messages
    };
  },

  commentFormInputs: [
    {name: 'messageText', label: null, placeholder: 'Type a comment here ...', type: 'textarea'}
  ],

  messageFormInputs: [
    {name: 'messageDateTime', label: null, type: 'text', disabled:true },
    {name: 'messageText', label: null, placeholder: 'Type a new note here ...', type: 'textarea'}
  ],

  formatDisplayDate : function(timestamp){
    return moment.utc(timestamp).format('MMMM D [at] h:mm a');
  },

  renderMessage: function(message){
    /* jshint ignore:start */
    return (
      <div className='messages-message' key={message.id}>
        <div className='messages-message-when'>
          <span>{this.formatDisplayDate(message.timestamp)}</span>
        </div>
        <span className='messages-message-username'>
          {' ' + this.getUserFullName(message.user)}
        </span>
        <p className='messages-message-text'>{message.messagetext}</p>
      </div>
      );
    /* jshint ignore:end */
  },
  renderComment:function(comment){
    /* jshint ignore:start */
    return (
      <div className='messages-comment' key={comment.id}>
        <span className='messages-comment-header'>
          {' ' + this.getUserFullName(comment.user)}
          {' - '}
          {this.formatDisplayDate(comment.timestamp)}
        </span>
        <p className='messages-comment-text'>{comment.messagetext}</p>
      </div>

      );
    /* jshint ignore:end */
  },
  renderThread:function(){

    if(this.isMessageThread()){

      var thread = _.map(this.state.messages, function(message) {
        if(!message.parentmessage) {
          return this.renderMessage(message);
        } else if (message.parentmessage) {
          return this.renderComment(message);
        }
      }.bind(this));

      return thread;
    }

    return;
  },
  isMessageThread:function(){
    return this.state.messages;
  },
  renderForm:function(){
    /* jshint ignore:start */
    if(this.isMessageThread()){
      return (
        <SimpleForm
          inputs={this.commentFormInputs}
          formValues={this.state.formValues}
          submitButtonText='Comment'
          onSubmit={this.handleAddComment} />
      );
    }
    return (
      <SimpleForm
        inputs={this.messageFormInputs}
        formValues={this.state.formValues}
        submitButtonText='Post'
        onSubmit={this.handleCreateMessage} />
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
  getUserFullName: function(user) {
    var result = 'Anonymous user';
    if (user && user.firstName && user.lastName) {
      result = user.firstName + ' ' + user.lastName;
    }
    return result;
  },
  handleAddComment : function (formValues){

    if(formValues.messageText){

      var addComment = this.props.onSave;
      var parent = this.getParent();

      var comment = {
        parentmessage : parent.id,
        userid : this.props.user.id,
        groupid : parent.groupid,
        messagetext : formValues.messageText,
        timestamp : new Date().toISOString()
      };

      addComment(comment, function(error,commentId){
        if(commentId){
          //set so we can display right away
          comment.id = commentId;
          comment.username = this.props.user.firstName;
          var withReply = this.state.messages;
          withReply.push(comment);
          this.setState({ messages: withReply, formValues : {messageText: ''} });
        }
      }.bind(this));
    }
  },
  handleCreateMessage : function (formValues){

    if(formValues.messageText){

      var createMessage = this.props.onSave;

      var message = {
        userid : this.props.user.id,
        groupid : this.props.patient.teamId,
        messagetext : formValues.messageText,
        timestamp : this.props.createDatetime
      };

      createMessage(message, function(error,messageId){
        if(messageId){
          //set so we can display right away
          message.id = messageId;
          message.username = this.props.user.firstName;
          //give this message to anyone that needs it
          this.props.onNewMessage(message);
          this.setState({ messages: [message], formValues : {messageText: '', messageDateTime:''} });
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
  }
});

module.exports = Messages;
