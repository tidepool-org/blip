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

import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18next from "i18next";
import bows from "bows";
import moment from "moment-timezone";

import { isTimezoneAware, getDisplayTimestamp } from "./messagemixins";

const DATE_MASK = "YYYY-MM-DD";
const TIME_MASK = "HH:mm";
const t = i18next.t.bind(i18next);

/**
 * Form for creating new Notes or adding Comments
 */
class MessageForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.initialState();
    this.isTimezoneAware = isTimezoneAware.bind(this);
    this.getDisplayTimestamp = getDisplayTimestamp.bind(this);
    this.log = bows("MessageForm UI");
  }

  /**
   * Declared so that we can reset them easily
   */
  initialState() {
    return {
      /** @type {string} The edited message */
      msg: "",
      /** @type {string} ISO date-time string in UTC */
      when: null,
      /** @type {string} The edited date */
      date: null,
      /** @type {string} The original date (same as date but never changed when we edit the date/time) */
      originalDate: null,
      /** @type {string} The edited time */
      time: null,
      /** @type {string} The original time (same as time but never changed when we edit the date/time) */
      originaltime: null,
      /** Are we in edition mode or 'click to add a comment' ? */
      editing: false,
      /** Saving in progress -> Disable the buttons */
      saving: false,
      /** When true, the date & time can be changed: => renderEditableDate() */
      changeDateTime: false,
      rows: 1,
    };
  }

  componentDidMount() {
    if (this.isExistingNoteEdit()) {
      this.initEdit();
    }
  }

  getEditableDateAndTime(ts) {
    const timezone = this.props.timePrefs.timezoneName;
    const m = moment.utc(ts).tz(timezone);
    const date = m.format(DATE_MASK);
    const time = m.format(TIME_MASK);
    // this.log('getEditableDateAndTime', { ts, date, time, m, timezone });
    return { date, time };
  }

  isExistingNoteEdit() {
    const { formFields } = this.props;
    return formFields !== null && !_.isEmpty(formFields);
  }

  hasTextToEdit() {
    return this.isExistingNoteEdit() && _.isString(this.props.formFields.editableText);
  }

  hasTimestampToEdit() {
    return this.isExistingNoteEdit() && !_.isEmpty(this.props.formFields.editableTimestamp);
  }

  initEdit() {
    const { formFields } = this.props;
    const textToEdit = this.hasTextToEdit();
    const timestampToEdit = this.hasTimestampToEdit();

    if (textToEdit && timestampToEdit) {
      this.log.info("initEdit at", formFields.editableTimestamp);
      const editable = this.getEditableDateAndTime(formFields.editableTimestamp);
      // allow editing of both the note text and timestamp
      this.setState({
        msg: formFields.editableText,
        when: formFields.editableTimestamp,
        editing: true,
        changeDateTime: false,
        date: editable.date,
        time: editable.time,
        originalDate: editable.date,
        originaltime: editable.time,
      });
    } else if (textToEdit) {
      // allow editing of the note text only
      this.setState({
        msg: formFields.editableText,
        when: formFields.displayTimestamp,
        editing: true,
      });
    } else {
      this.log.error("initEdit: Wrong state", { textToEdit, timestampToEdit, props: { ...this.props }, state: { ...this.state } });
    }

    this.setState({ rows: 3 });
  }

  /**
   * If we are allowing the date to be edited then
   *  - set as the when date as will be the case for most new dates
   *  - OR if the date has been edited then resolve the date and return
   */
  getUtcTimestamp() {
    const timezone = this.props.timePrefs.timezoneName;
    const { when, date, time } = this.state;

    let messageTime = when;
    if (_.isString(date) && _.isString(time)) {
      const m = moment.tz(`${date}T${time}`, timezone);
      messageTime = m.toISOString();
    }

    return messageTime;
  }

  /**
   * If there is now a message showing
   * - make sure the current datetime is set
   * - go in to `editing` mode
   *
   * Always keep the msg state current
   */
  handleMsgChange = (e) => {
    this.setState({ msg: e.target.value });
  };

  /**
   * Use the given onCancel handler or just
   * clear the data if there wasn't one given
   */
  handleCancel = (e) => {
    if (this.props.onCancel) {
      this.props.onCancel(e);
    } else {
      this.log.debug("Cancel edit note");
      this.setState(this.initialState());
    }
  };

  handleDateChange = (e) => {
    this.setState({ date: e.target.value });
  };

  handleTimeChange = (e) => {
    this.setState({ time: e.target.value });
  };

  handleSaving = async (/* e */) => {
    const { alwaysActiveCommentForm } = this.props;
    this.log.debug("handleSaving", { ...this.state, alwaysActiveCommentForm });
    this.setState({ saving: true });

    try {
      if (_.isFunction(this.props.onSubmit)) {
        await this.props.onSubmit({ text: this.state.msg, timestamp: this.getUtcTimestamp() });
      } else {
        this.log.warn("handleSaving: onSubmit callback is missing");
      }
    } catch (err) {
      this.log.error("handleSaving(): TODO manage error", err);
    }

    if (alwaysActiveCommentForm) {
      // Only update the state when we are mounted
      // -> After edit a comment
      this.setState(this.initialState());
    }
  };

  handleFocus = (/* e */) => {
    if (this.isExistingNoteEdit() === false) {
      this.log("Starting to edit a note");
      this.setState({ editing: true, when: moment.utc().toISOString() });
    }
    this.setState({ rows: 3 });
  };

  /**
   * Split the timestamp into the date and time
   * components to allow for editing
   *
   * callback from renderDisplayDate() when this.hasTimestampToEdit() === true
   */
  handleShowEditDate = (e) => {
    if (e) {
      e.preventDefault();
    }
    // const editable = this.getEditableDateAndTime(this.state.when);
    this.setState({
      changeDateTime: true,
      // time: editable.time,
      // date: editable.date,
    });
  }

  isButtonDisabled() {
    const { formFields } = this.props;
    const { msg, date, time, originalDate, originaltime, changeDateTime } = this.state;

    if (formFields === null) {
      return _.isEmpty(msg);
    }

    if (changeDateTime) {
      return formFields.editableText === msg && date === originalDate && time === originaltime;
    }
    return formFields.editableText === msg;
  }

  /**
   * Just displays the notes date if it is set
   */
  renderDisplayDate() {
    const { when } = this.state;
    const canEditTimestamp = this.hasTimestampToEdit();
    let displayDate = null;
    if (when !== null) {
      const displayTimestamp = this.getDisplayTimestamp(when);
      let editLink = null;

      if (canEditTimestamp) {
        editLink = (
          <a className="messageform-change-datetime" href="" onClick={this.handleShowEditDate}>
            {t("Change")}
          </a>
        );
      }

      displayDate = (
        <div>
          {editLink}
          <label className="messageform-datetime-label">{displayTimestamp}</label>
        </div>
      );
    }

    return displayDate;
  }

  /**
   * Enables the editing of the notes date and time components
   */
  renderEditableDate() {
    return (
      <div>
        <input type="time" value={this.state.time} className="messageform-time" onChange={this.handleTimeChange} />
        <input type="date" value={this.state.date} className="messageform-date" onChange={this.handleDateChange} />
      </div>
    );
  }

  renderButtons() {
    const { saving: isSavingInProgress } = this.state;

    let saveBtnText = null;
    if (isSavingInProgress) {
      saveBtnText = t("Sending...");
    } else {
      saveBtnText = t("Post_submit");
    }

    return (
      <div className="messageform-buttons">
        <button
          type="reset"
          disabled={isSavingInProgress}
          className="messageform-button messageform-button-cancel"
          onClick={this.handleCancel}>
          {t("Cancel")}
        </button>
        <button
          type="button"
          className="messageform-button messageform-button-save"
          disabled={this.isButtonDisabled() || isSavingInProgress}
          onClick={this.handleSaving}>
          {saveBtnText}
        </button>
      </div>
    );
  }

  renderTextArea() {
    const { rows } = this.state;
    return (
      <div className="messageform-textarea-wrapper">
        <textarea
          type="textarea"
          rows={rows}
          className="messageform-textarea"
          placeholder={this.props.messagePrompt}
          value={this.state.msg}
          onFocus={this.handleFocus}
          onChange={this.handleMsgChange}
        />
      </div>
    );
  }

  render() {
    const { editing, changeDateTime } = this.state;
    const textArea = this.renderTextArea();
    let date = null;
    let buttons = null;

    if (editing) {
      buttons = this.renderButtons();
    }

    if (changeDateTime) {
      date = this.renderEditableDate();
    } else {
      date = this.renderDisplayDate();
    }

    return (
      <form className="messageform">
        {date}
        {textArea}
        {buttons}
      </form>
    );
  }
}

MessageForm.propTypes = {
  formFields: PropTypes.shape({
    editableText: PropTypes.string.isRequired,
    editableTimestamp: PropTypes.string,
    displayTimestamp: PropTypes.string,
  }),
  messagePrompt: PropTypes.string,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  alwaysActiveCommentForm: PropTypes.bool,
  timePrefs: PropTypes.shape({
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
};

MessageForm.defaultProps = {
  formFields: null,
  onCancel: null,
  onSubmit: null,
  alwaysActiveCommentForm: false,
};

export default MessageForm;
