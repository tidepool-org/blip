/** @jsx React.DOM */
/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

var React = window.React;
var moment = window.moment;

var Message = React.createClass({
  propTypes: {
    message: React.PropTypes.object,
    imageSize: React.PropTypes.string,
    imagesEndpoint: React.PropTypes.string
  },

  render: function() {
    var image = this.renderImage();
    var author = this.renderAuthor();
    var timestamp = this.renderTimestamp();
    var text = this.renderText();

    /* jshint ignore:start */
    return (
      <div className="message">
        {image}
        <div className="message-body">
          <div className="message-header">
            {author}
            {timestamp}
          </div>
          {text}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderImage: function() {
    var imageSize = this.props.imageSize;
    var imageSource = this.props.imagesEndpoint;

    if (imageSize === 'large') {
      imageSource = imageSource + '/profile-100x100.png';
    }
    else {
      imageSize = 'small';
      imageSource = imageSource + '/profile-64x64.png';
    }

    /* jshint ignore:start */
    return (
      <img
        className={'message-picture message-picture-' + imageSize}
        src={imageSource}
        alt="Profile picture"/>
    );
    /* jshint ignore:end */
  },

  renderAuthor: function() {
    var user = this.props.message.user;
    user = this.getUserDisplayName(user);

    /* jshint ignore:start */
    return (
      <div className="message-author">{user}</div>
    );
    /* jshint ignore:end */
  },

  renderTimestamp: function() {
    var timestamp = this.props.message.timestamp;
    timestamp = this.getDisplayDate(timestamp);

    /* jshint ignore:start */
    return (
      <div className="message-timestamp">{timestamp}</div>
    );
    /* jshint ignore:end */
  },

  renderText: function() {
    /* jshint ignore:start */
    return (
      <div className="message-text">{this.props.message.messagetext}</div>
    );
    /* jshint ignore:end */
  },

  getUserDisplayName: function(user) {
    var result = 'Anonymous user';
    if (user && user.fullName) {
      result = user.fullName;
    }
    return result;
  },

  getDisplayDate: function(timestamp){
    return moment(timestamp).format('MMMM D [at] h:mm a');
  }
});

module.exports = Message;
