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

var React = require('react');
var _ = require('lodash');
var sundial = require('sundial');

// Form for creating new Notes or adding Comments
var MessageForm = React.createClass({
  propTypes: {
    formFields : React.PropTypes.object,
    messagePrompt : React.PropTypes.string,
    saveBtnText : React.PropTypes.string,
    cancelBtnText : React.PropTypes.string,
    onCancel : React.PropTypes.func,
    onSubmit : React.PropTypes.func
  },
  getInitialState: function() {
    return this.initialState();
  },
  getDefaultProps: function () {
    return {
      DATE_MASK : 'YYYY-MM-DD',
      TIME_MASK : 'HH:mm',
      EDITED_DATE_MASK : 'YYYY-MM-DD HH:mm',
      SENDING_TEXT : 'Sending...',
      cancelBtnText : 'Cancel',
      saveBtnText : 'Post',
    };
  },
  isExistingNoteEdit:function() {
    return _.isEmpty(this.props.formFields) === false;
  },
  hasTextToEdit:function(){
    return this.isExistingNoteEdit() && _.isEmpty(this.props.formFields.editableText) === false;
  },
  hasTimestampToEdit:function(){
    return this.isExistingNoteEdit() && _.isEmpty(this.props.formFields.editableTimestamp) === false;
  },
  initEdit:function() {
    if( this.hasTextToEdit() && this.hasTimestampToEdit() ){
      var offset = sundial.getOffsetFromTime(this.props.formFields.editableTimestamp) || sundial.getOffset();
      //allow editing of both the note text and timestamp
      this.setState({
        msg : this.props.formFields.editableText,
        whenUtc : this.props.formFields.editableTimestamp ,
        editing : true,
        changeDateTime : true,
        time : sundial.formatFromOffset(this.props.formFields.editableTimestamp, offset, this.props.TIME_MASK),
        date : sundial.formatFromOffset(this.props.formFields.editableTimestamp, offset, this.props.DATE_MASK)
      });
    } else if(this.hasTextToEdit()) {
      //allow editing of the note text only
      this.setState({
        msg : this.props.formFields.editableText,
        whenUtc : this.props.formFields.displayTimestamp,
        editing : true
      });
    } else if(this.hasTimestampToEdit()) {
      //allow editing of the note text only
      this.setState({
        whenUtc : this.props.formFields.editableTimestamp,
        editing : true
      });
    }
    this.refs.messageText.getDOMNode().rows = 3;
  },
  componentDidMount: function () {
    if( this.isExistingNoteEdit() ){
      this.initEdit();
    }
  },
  /*
   * Declared so that we can reset them easily
   */
  initialState: function(){
    return {
      msg: '',
      whenUtc : null,
      date: null,
      time: null,
      offset : null,
      editing : false,
      saving : false,
      changeDateTime : false
    };
  },
  /*
   * If there is now a message show
   * - make sure the current datetime is set
   * - go in to `editing` mode
   *
   * Always keep the msg state current
   */
  handleMsgChange: function(e) {
    this.setState({ msg: e.target.value});
  },
  /*
   * Use the given onCancel handler or just
   * clear the data if there wasn't one given
   */
  handleCancel: function(e) {
    if(this.props.onCancel){
      this.props.onCancel();
    } else {
      this.refs.messageText.getDOMNode().rows = 1;
      this.setState(this.initialState());
    }
  },
  handleDateChange: function(e) {
    this.setState({ date: e.target.value});
  },
  handleTimeChange: function(e) {
    this.setState({ time: e.target.value});
  },
  /*
   * If we are allowing the date to be edited then
   *  - set as the whenUtc date as will be the case for most new dates
   *  - OR if the date has been edited then resolve the date and return
   *
   */
  getUtcTimestamp: function() {
    var utcTimestamp = this.state.whenUtc;

    if(this.state.date && this.state.time){
      var editedTimestamp = this.state.date+'T'+this.state.time;
      var offset = sundial.getOffsetFromTime(editedTimestamp);
      utcTimestamp = sundial.formatForStorage(editedTimestamp,offset);
    }

    return utcTimestamp;
  },
  handleSaving: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({ saving : true});

    if (this.props.onSubmit) {

      this.props.onSubmit({
        text: this.state.msg,
        timestamp: this.getUtcTimestamp()
      },function(){
        this.handleSaved();
      }.bind(this));
    }
  },
  handleSaved : function(){
    this.refs.messageText.getDOMNode().rows = 1;
    this.setState(this.initialState());
  },
  handleGrow:function(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.messageText.getDOMNode().rows = 3;
    if(this.isExistingNoteEdit() === false){
      this.setState({  editing : true, whenUtc: sundial.utcDateString() });
    }
  },
  /*
   * Split the timestamp into the date and time
   * components to allow for editing
   */
  showEditDate:function(e){
    if (e) {
      e.preventDefault();
    }
    var offset = sundial.getOffsetFromTime(this.state.whenUtc) || sundial.getOffset();
    this.setState({
      changeDateTime : true,
      time : sundial.formatFromOffset(this.state.whenUtc, offset, this.props.TIME_MASK),
      date : sundial.formatFromOffset(this.state.whenUtc, offset, this.props.DATE_MASK)
    });
  },
  isButtonDisabled: function() {
    var msg = this.state.msg;
    return !(msg && msg.length);
  },
  /* jshint ignore:start */
  /*
   * Just displays the notes date if it is set
   */
  renderDisplayDate: function(canEditTimestamp){
    var displayDate;
    if(this.state.whenUtc){
      var editLink;

      if(canEditTimestamp){
        editLink = (
          <a className='messageform-change-datetime' href='' ref='showDateTime' onClick={this.showEditDate}>Change</a>
        );
      }

      var offset = sundial.getOffsetFromTime(this.state.whenUtc) || sundial.getOffset();

      displayDate = (
        <div>
          {editLink}
          <label className='messageform-datetime-label'>
            {sundial.formatFromOffset(this.state.whenUtc, offset)}
          </label>
        </div>
      );
    }
    return displayDate;
  },
  /*
   * Enables the editing of the notes date and time components
   */
  renderEditableDate: function(){
    return (
      <div ref='editDateTime'>
        <input
          type='time'
          ref='editMessageTime'
          value={this.state.time}
          className='messageform-time'
          onChange={this.handleTimeChange}/>
        <input
          type='date'
          ref='editMessageDate'
          value={this.state.date}
          className='messageform-date'
          onChange={this.handleDateChange}/>
      </div>
    );
  },
  renderButtons: function(){

    var saveBtnText = this.props.saveBtnText;

    if(this.state.saving){
      saveBtnText = this.props.SENDING_TEXT;
    }

    return (
      <div className='messageform-buttons'>
        <button
          type='reset'
          className='messageform-button messageform-button-cancel'
          onClick={this.handleCancel}
          ref='cancelBtn'>{this.props.cancelBtnText}</button>
        <button
          type='submit'
          className='messageform-button messageform-button-save'
          disabled={this.isButtonDisabled()}
          onClick={this.handleSaving}
          ref='sendBtn'>{saveBtnText}</button>
      </div>
    );
  },
  renderTextArea: function(){
    return (
      <div className='messageform-textarea-wrapper'>
        <textarea
          type='textarea'
          rows='1'
          className='messageform-textarea'
          ref='messageText'
          placeholder={this.props.messagePrompt}
          value={this.state.msg}
          onFocus={this.handleGrow}
          onChange={this.handleMsgChange}/>
      </div>
    );
  },
  render: function() {

    var date = this.renderDisplayDate(this.hasTimestampToEdit());
    var textArea = this.renderTextArea();
    var buttons;

    if(this.state.editing){
      buttons = this.renderButtons();
    }

    if(this.state.changeDateTime){
      date = this.renderEditableDate();
    }

    return (
      <form ref='messageForm' className='messageform'>
        {date}
        {textArea}
        {buttons}
      </form>
    );
  }
  /* jshint ignore:end */
});

module.exports = MessageForm;
