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

var SimpleForm = require('../simpleform');

var MessageThread = React.createClass({

  propTypes: {
    messages : React.PropTypes.array,
    user : React.PropTypes.object,
    onClose : React.PropTypes.func,
    onAddComment : React.PropTypes.func
  },

  getInitialState: function() {
    return {
      formValues: {},
      parentId: null
    };
  },

  formInputs: [
    {name: 'comment', label: null, type: 'text'}
  ],

  formatDisplayDate : function(timestamp){
    return moment(timestamp).calendar();
  },

  renderMessage: function(message){
    /* jshint ignore:start */
    return (
      <div className='messagethread-message'>
        <div className='messagethread-message-when'>
          <span>{this.formatDisplayDate(message.timestamp)}</span>
        </div>
        <span className='messagethread-message-username'> {message.username}</span>
        <p className='messagethread-message-text'>{message.messagetext}</p>
      </div>
      );
    /* jshint ignore:end */
  },
  renderComment:function(comment){
    /* jshint ignore:start */
    return (
      <div className='messagethread-comment'>
        <span className='messagethread-comment-header'> {comment.username} - {this.formatDisplayDate(comment.timestamp)}</span>
        <p className='messagethread-comment-text'>{comment.messagetext}</p>
      </div>

      );
    /* jshint ignore:end */
  },
  renderCommentForm: function() {
    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={this.formInputs}
        formValues={this.state.formValues}
        submitButtonText='Comment'
        onSubmit={this.handleAddComment}/>
    );
    /* jshint ignore:end */
  },
  renderThread:function(){
    var thread = this.props.messages.map(function(message, i) {
      if(!message.parentmessage) {
        this.setState({ parentId : message.id });
        return this.renderMessage(message);
      } else if (message.parentmessage) {
        return this.renderComment(message);
      }
    }.bind(this));

    return thread;
  },
  renderClose:function(){
    /* jshint ignore:start */
    return (<a className='messagethread-close' onClick={this.handleClose}>Close</a>);
    /* jshint ignore:end */
  },
  render: function() {
    var thread = this.renderThread();
    var close = this.renderClose();
    var commentForm = null;//this.renderCommentForm();

    return (
     /* jshint ignore:start */
     <div className='messagethread'>
      <div className='messagethread-inner'>
        {close}
        {thread}
        {commentForm}
      </div>
     </div>
     /* jshint ignore:end */
     );
  },
  handleAddComment : function (formValues){

    if(formValues.comment){

      var addComment = this.props.onAddComment;

      var comment = {
        parentmessage : this.state.parentId,
        userid : this.props.user.id,
        messagetext : formValues.comment,
        timestamp : new Date().toISOString()
      };

      addComment(comment);
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

module.exports = MessageThread;
