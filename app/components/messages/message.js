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
/* jshint unused: false */

var React = require('react');
var _ = require('lodash');
var sundial = require('sundial');

var MessageForm = require('./messageform');

if (!window.process) {
  var profileLargeSrc = require('./images/profile-100x100.png');
  var profileSmallSrc = require('./images/profile-64x64.png');
}

var Message = React.createClass({

  propTypes: {
    theNote : React.PropTypes.object,
    imageSize: React.PropTypes.string,
    onSaveEdit : React.PropTypes.func
  },

  getInitialState: function() {
    return {
      editing : false
    };
  },
  componentDidMount: function () {
    var offset = sundial.getOffsetFromTime(this.props.theNote.timestamp) || sundial.getOffset();

    this.setState({
      author :  this.getUserDisplayName(this.props.theNote.user),
      note : this.props.theNote.messagetext,
      when : sundial.formatFromOffset(this.props.theNote.timestamp, offset)
    });
  },
  getUserDisplayName: function(user) {
    var result = 'Anonymous user';
    if (user && user.fullName) {
      result = user.fullName;
    }
    return result;
  },

  isComment : function(){
    return _.isEmpty(this.props.theNote.parentmessage) === false;
  },

  handleEditSave:function(edits){

    var saveEdit = this.props.onSaveEdit;

    if(saveEdit){
      var newNote = _.cloneDeep(this.props.theNote);
      if (this.props.theNote.messagetext !== edits.text ||
        (edits.timestamp && this.props.theNote.timestamp !== edits.timestamp)) {
        newNote.messagetext = edits.text;
        if (edits.timestamp) {
          newNote.timestamp = edits.timestamp;
        }
        saveEdit(newNote);
      }

      var offset = sundial.getOffsetFromTime(edits.timestamp || this.props.theNote.timestamp) || sundial.getOffset();

      this.setState({
        editing : false,
        note : edits.text,
        when : sundial.formatFromOffset(edits.timestamp || this.props.theNote.timestamp, offset)
      });
    }

  },

  handleAllowEdit : function(e){
    if (e) {
      e.preventDefault();
    }
    this.setState({editing:true});
  },

  handleCancelEdit : function(e){
    if (e) {
      e.preventDefault();
    }
    this.setState({editing:false});
  },

  renderTitle : function(){
    var edit = this.renderEditLink();
    /* jshint ignore:start */
    return (
      <div>
        {edit}
        <span className='message-author'>{this.state.author}</span>
      </div>
    );
    /* jshint ignore:end */
  },

  renderEditLink : function(){
    if( this.state.editing === false && this.props.onSaveEdit){
      return (
        /* jshint ignore:start */
        <a
          className='message-edit'
          href=''
          onClick={this.handleAllowEdit}
          ref='editNote'>Edit</a>
        /* jshint ignore:end */
      );
    }
  },
  renderImage: function() {
    var imageSize = this.props.imageSize;
    var imageSource;

    if (imageSize === 'large') {
      imageSource = profileLargeSrc;
    }
    else {
      imageSize = 'small';
      imageSource = profileSmallSrc;
    }

    /* jshint ignore:start */
    return (
      <img
        className={'message-picture message-picture-' + imageSize}
        src={imageSource}
        alt='Profile picture'/>
    );
    /* jshint ignore:end */
  },
  renderNoteEdit:function(){
    if(this.state.editing){
      var editForm;
       /* jshint ignore:start */
      if ( this.isComment() ){

        //we only allow the editing of the text on a comment
        editForm = (
          <MessageForm
            formFields={{editableText: this.props.theNote.messagetext, displayOnlyTimestamp : this.props.theNote.timestamp }}
            onSubmit={this.handleEditSave}
            onCancel={this.handleCancelEdit}
            saveBtnText='Save' />
        );
      } else {
        editForm = (
          <MessageForm
            formFields={{editableText: this.props.theNote.messagetext, editableTimestamp: this.props.theNote.timestamp}}
            onSubmit={this.handleEditSave}
            onCancel={this.handleCancelEdit}
            saveBtnText='Save' />
        );
      }
      var title = this.renderTitle();
      return (
        <div>
          <div className='message-body'>
            <div className='message-header'>
              {title}
            </div>
            {editForm}
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  },
  renderNoteContent: function() {

    if(this.state.editing === false){

      var image = this.renderImage();
      var title = this.renderTitle();

      return this.transferPropsTo(
        /* jshint ignore:start */
        <div>
          {image}
          <div className='message-body'>
            <div className='message-header'>
              {title}
              <div ref='messageWhen' className='message-timestamp'>{this.state.when}</div>
            </div>
            <div ref='messageText'>{this.state.note}</div>
          </div>
        </div>
        /* jshint ignore:end */
      );
    }
  },

  render: function() {

    var noteClasses = 'message';
    var note = this.renderNoteContent() ? this.renderNoteContent() : this.renderNoteEdit();
    if( this.state.editing ){
      noteClasses = noteClasses + ' message-editing';
    }

    return (
      /* jshint ignore:start */
      <div className={noteClasses} >
        {note}
      </div>
      /* jshint ignore:end */
    );
  }
});

module.exports = Message;
