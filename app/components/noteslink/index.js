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
var screenshot = require('./blip-notes-screenshot.png');
var icon = require('./blip-notes-icon.png');

var NotesLink = React.createClass({
  getInitialState: function() {
    return {
      showModal: false
    };
  },
  showModal: function() {
    this.setState({showModal: true});
  },
  hideModal: function() {
    this.setState({showModal: false});
  },
  render: function() {
    return (
      <div className='footer-link NotesLink-dialog'>
        <a href="#" onClick={this.showModal}>Get Blip Notes</a>
        {this.renderModalOverlay()}
      </div>
    );
  },
  renderModalOverlay: function() {
    return (
      <ModalOverlay
        show={this.state.showModal}
        dialog={this.renderDialog()}
        overlayClickHandler={this.hideModal}/>
    );

  },
  renderDialog: function(patient) {
    return (
      <div>
        <div className="ModalOverlay-content">
          <div className="ModalOverlay-controls clearfix">
            <div className="NotesLink-close" onClick={this.hideModal}></div>
          </div>
          <div className="NotesLink-screenshot">
            <img src={screenshot} alt="Blip Notes Screenshot"/>
          </div>
          <div className="NotesLink-content">
            <div className="NotesLink-header">
              <div className="NotesLink-icon"></div>
              <div className="NotesLink-title">
                <h2>Blip Notes</h2>
                <h4>context for your data</h4>
              </div>
            </div>
            <div>
              <p className="NotesLink-key-paragraph">On your smartphone, go to <a href="http://notes.tidepool.io">notes.tidepool.io</a>.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = NotesLink;
