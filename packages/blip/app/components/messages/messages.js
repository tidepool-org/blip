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

import PropTypes from "prop-types";

import React from "react";
import _ from "lodash";
import i18next from "i18next";
import bows from "bows";

import Message from "./message";
import MessageForm from "./messageform";

const t = i18next.t.bind(i18next);

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: Array.isArray(props.messages) ? props.messages : [],
      errorMessage: null,
    };
    this.log = bows("Messages UI");
  }

  /**
   * Should the user be able to edit this message?
   */
  getSaveEdit(messageUserId) {
    let saveEdit = null;
    if (messageUserId === this.props.user.userid) {
      saveEdit = this.handleEditNote;
    }
    return saveEdit;
  }

  renderNote(message) {
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize="large"
        onSaveEdit={this.getSaveEdit(message.userid)}
        timePrefs={this.props.timePrefs}
        trackMetric={this.props.trackMetric}
      />
    );
  }

  renderComment(message) {
    return (
      <Message
        key={message.id}
        theNote={message}
        imageSize="small"
        onSaveEdit={this.getSaveEdit(message.userid)}
        timePrefs={this.props.timePrefs}
        trackMetric={this.props.trackMetric}
      />
    );
  }

  renderThread() {
    if (this.isMessageThread()) {
      const { messages } = this.state;
      const thread = _.map(messages, (message) => {
        if (_.isEmpty(message.parentmessage)) {
          return this.renderNote(message);
        }
        return this.renderComment(message);
      });

      return <div className="messages-thread">{thread}</div>;
    }
    return null;
  }

  isMessageThread() {
    return !_.isEmpty(this.state.messages);
  }

  renderCommentOnThreadForm() {
    return (
      <div className="messages-form">
        <MessageForm
          messagePrompt={t("Type a comment here ...")}
          saveBtnText={t("Comment_submit")}
          onSubmit={this.handleAddComment}
          timePrefs={this.props.timePrefs}
          alwaysActiveCommentForm={true}
        />
      </div>
    );
  }

  renderNewThreadForm() {
    var submitButtonText = t("Post_submit");

    return (
      <div className="messages-form">
        <MessageForm
          formFields={{ editableTimestamp: this.props.createDatetime, editableText: "" }}
          messagePrompt={t("Type a new note here ...")}
          saveBtnText={submitButtonText}
          onSubmit={this.handleCreateNote}
          onCancel={this.handleClose}
          timePrefs={this.props.timePrefs}
        />
      </div>
    );
  }

  renderClose() {
    return <a className="messages-close" onClick={this.handleClose}>{t("Close")}</a>;
  }

  render() {
    const { errorMessage } = this.state;
    const thread = this.renderThread();
    let form = null;
    var close = null;

    // If we are closing an existing thread then have close and render the comment form
    if (thread) {
      close = this.renderClose();
      form = this.renderCommentOnThreadForm();
    } else {
      form = this.renderNewThreadForm();
    }

    let divError = null;
    if (errorMessage !== null) {
      divError = <div className="messages-error">{errorMessage}</div>;
    }

    return (
      <div className="messages">
        <div className="messages-inner">
          <div className="messages-header">{close}</div>
          <div>
            {thread}
            {form}
          </div>
          {divError}
        </div>
      </div>
    );
  }

  getParent() {
    if (this.isMessageThread()) {
      return _.find(this.state.messages, (message) => _.isEmpty(message.parentmessage));
    }
    return null;
  }

  handleAddComment = async (formValues) => {
    this.log.debug("handleAddComment", formValues);
    const { onSave: addComment, user } = this.props;
    const { messages } = this.state;

    if (!_.isEmpty(formValues)) {
      const parent = this.getParent();

      const comment = {
        parentmessage: parent.id,
        userid: this.props.user.userid,
        groupid: parent.groupid,
        messagetext: formValues.text,
        timestamp: formValues.timestamp,
      };

      try {
        const commentId = await addComment(comment);

        comment.id = commentId;
        comment.user = user.profile;
        this.setState({
          messages: messages.concat([comment]),
        }, () => {
          this.log.debug("handleAddComment done", { messages: this.state.messages });
        });
      } catch (reason) {
        this.log.error("handleAddComment", reason);
        this.setState({ errorMessage: t("An unknown error occurred") });
      }
    }
  };

  handleCreateNote = async (formValues) => {
    const { onClose, onSave: createNote, onNewMessage, timePrefs, patient, user } = this.props;
    if (!_.isEmpty(formValues)) {
      const message = {
        timezone: timePrefs.timezoneName,
        userid: user.userid,
        groupid: patient.userid,
        messagetext: formValues.text,
        timestamp: formValues.timestamp,
      };

      try {
        const messageId = await createNote(message);
        // set so we can display right away
        message.id = messageId; // TODO: Need to fix this too;
        message.user = user.profile;
        // give this message to anyone that needs it
        await onNewMessage(message);
        // Close the modal
        onClose();
      } catch (reason) {
        this.log.error("handleCreateNote", reason);
        this.setState({ errorMessage: t("An unknown error occurred") });
      }
    }
  };

  handleEditNote = async (updated) => {
    if (!_.isEmpty(updated)) {
      try {
        await this.props.onEdit(updated);
      } catch (reason) {
        this.log.error("handleEditNote", reason);
        this.setState({ errorMessage: t("An unknown error occurred") });
      }
    }
  };

  handleClose = (e) => {
    e.preventDefault();
    const { onClose } = this.props;
    onClose();
  };
}

Messages.propTypes = {
  messages: PropTypes.array,
  createDatetime: PropTypes.string,
  user: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onNewMessage: PropTypes.func,
  timePrefs: PropTypes.shape({
    timezoneName: PropTypes.string.isRequired,
  }).isRequired,
  trackMetric: PropTypes.func.isRequired,
};

Messages.defaultProps = {
  messages: null,
  createDatetime: null,
  onNewMessage: null,
};

export default Messages;
