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

var React = require('react');

var ModalOverlay = require('../modaloverlay');

var NotesLink = React.createClass({
  getInitialState: function() {
    return {
      showModal: false
    };
  },
  onClick: function() {
    this.setState({showModal: true});
  },
  onBlur: function() {
    this.setState({showModal: false});
  },
  render: function() {
    return (
      <div className='noteslink'>
        <a onClick={this.onClick}>Blip Notes</a>
      </div>
    );
  }

});

module.exports = NotesLink;
