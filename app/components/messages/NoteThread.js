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

var SimpleForm = require('../simpleform');

var Note = require('./note');

var NoteThread = React.createClass({

  propTypes: {
    messages: React.PropTypes.array,
    onClose: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      formValues: {}
    };
  },

  formInputs: [
    {name: 'comment', label: 'Comment', type: 'text'}
  ],

  renderNote: function(message){
    return (
      /* jshint ignore:start */
      <Note
      ref='rootNote'
      key={message.id}
      author={message.username}
      note={message.messagetext}
      when={message.timestamp} />
      /* jshint ignore:end */
      );
  },
  renderCommentOnNote:function(message){
    return (
      /* jshint ignore:start */
      <Note
      ref='commentNote'
      key={message.id}
      author={message.username}
      note={message.messagetext}
      when={message.timestamp} />
      /* jshint ignore:end */
      );
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
  render: function() {
    var items = this.props.messages.map(function(message, i) {
      if(!message.parentmessage) {
        return this.renderNote(message);
      } else if (message.parentmessage) {
        return this.renderCommentOnNote(message);
      }
    }.bind(this));

    var commentForm = this.renderCommentForm();

    return (
     /* jshint ignore:start */
     <div ref='messageThread' className='notethread'>
     <a className='notethread-close' onClick={this.handleClose}>Close</a>
      <div className='notethread-inner'>
        {items}
        {commentForm}
      </div>
     </div>
     /* jshint ignore:end */
     );
  },
  handleAddComment : function (formValues){
    console.log('comment: ',formValues);
  },
  handleClose: function(e) {
    e.preventDefault();
    var close = this.props.onClose;
    if (close) {
      close();
    }
  }
});

module.exports = NoteThread;