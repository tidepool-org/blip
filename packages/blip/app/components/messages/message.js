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
import bows from 'bows';

import MessageForm from "./messageform";

import profileLargeSrc from "./images/profile-100x100.png";
import profileSmallSrc from "./images/profile-64x64.png";

import { getDisplayTimestamp } from "./messagemixins";

const t = i18next.t.bind(i18next);

class Message extends React.Component {
  constructor(props) {
    super(props);

    this.log = bows('Message UI');
    this.getDisplayTimestamp = getDisplayTimestamp.bind(this);

    this.state = {
      editing: false,
      /** Displayed date/time */
      when: this.getDisplayTimestamp(this.props.theNote.timestamp),
      /** Message text */
      note: this.props.theNote.messagetext,
      author: this.getUserDisplayName(this.props.theNote.user),
    };
  }

  getUserDisplayName(user) {
    let result = t('Anonymous user');
    if (user && user.fullName) {
      result = user.fullName;
    }
    return result;
  }

  isComment() {
    return _.isEmpty(this.props.theNote.parentmessage) === false;
  }

  handleEditSave = async (edits) => {
    const { theNote, onSaveEdit: saveEdit } = this.props;

    const newState = {
      editing: false,
    };

    if (_.isFunction(saveEdit)) {
      const isTextChanged = theNote.messagetext !== edits.text;
      const isTimeChanged = _.isString(edits.timestamp) && theNote.timestamp !== edits.timestamp;

      if (isTextChanged || isTimeChanged) {
        const newNote = _.cloneDeep(theNote);
        if (isTextChanged) {
          newNote.messagetext = edits.text;
          newState.note = edits.text;
        }
        if (isTimeChanged) {
          newNote.timestamp = edits.timestamp;
          newState.when = this.getDisplayTimestamp(edits.timestamp);
        }

        this.log.info('handleEditSave', newNote, newState);
        await saveEdit(newNote);
      } else {
        this.log.info('handleEditSave: Nothing changed');
      }

    } else {
      this.log.warn('handleEditSave: onSaveEdit is missing');
    }

    this.setState(newState);
  }

  handleAllowEdit = (e) => {
    e.preventDefault();
    this.setState({ editing: true });
  }

  handleCancelEdit = (e) => {
    e.preventDefault();
    this.setState({ editing: false });
    this.props.trackMetric('message', { action: 'Cancel edit message' });
  }

  renderTitle() {
    const edit = this.renderEditLink();
    return (
      <div>
        {edit}
        <span className="message-author">{this.state.author}</span>
      </div>
    );
  }

  renderEditLink() {
    if (this.state.editing === false && this.props.onSaveEdit) {
      return (
        <a className="message-edit" href="" onClick={this.handleAllowEdit}>
          {t('Edit')}
        </a>
      );
    }
  }

  renderImage() {
    let { imageSize } = this.props;
    let imageSource = null;

    if (imageSize === "large") {
      imageSource = profileLargeSrc;
    } else {
      imageSize = "small";
      imageSource = profileSmallSrc;
    }

    return <img className={`message-picture message-picture-${imageSize}`} src={imageSource} alt={t('Profile')} />;
  }

  renderNoteEdit() {
    const { timePrefs, theNote } = this.props;
    const { note } = this.state;

    const formFields = {
      editableText: note ?? theNote.messagetext ?? '',
    };

    if (this.isComment()) {
      // we only allow the editing of the text on a comment
      formFields.displayTimestamp = theNote.timestamp;
    } else {
      formFields.editableTimestamp = theNote.timestamp;
    }
    const title = this.renderTitle();

    return (
      <div>
        <div className="message-body">
          <div className="message-header">{title}</div>
            <MessageForm
              formFields={formFields}
              onSubmit={this.handleEditSave}
              onCancel={this.handleCancelEdit}
              saveBtnText={t('Save')}
              timePrefs={timePrefs}
            />
        </div>
      </div>
    );
  }

  renderNoteContent() {
    const { note, when } = this.state;
    const image = this.renderImage();
    const title = this.renderTitle();

    return (
      <div>
        {image}
        <div className="message-body">
          <div className="message-header">
            {title}
            <div className="message-timestamp">{when}</div>
          </div>
          <div className="message-note">{note}</div>
        </div>
      </div>
    );
  }

  render() {
    const { editing } = this.state;
    let noteClasses = "message";
    const note = editing ? this.renderNoteEdit() : this.renderNoteContent();

    if (editing) {
      noteClasses = noteClasses + " message-editing";
    }

    return <div className={noteClasses}>{note}</div>;
  }
}

Message.propTypes = {
  theNote: PropTypes.object.isRequired,
  imageSize: PropTypes.string,
  onSaveEdit: PropTypes.func,
  timePrefs: PropTypes.shape({
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default Message;
