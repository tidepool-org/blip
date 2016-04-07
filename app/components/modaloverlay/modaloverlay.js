
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
var cx = require('classnames');

var ModalOverlay = React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    dialog: React.PropTypes.node.isRequired,
    overlayClickHandler: React.PropTypes.func.isRequired
  },
  render: function() {
    var self = this;
    var classes = cx({
      'ModalOverlay': true,
      'ModalOverlay--show': this.props.show
    });

    
    return (
      <div className={classes}>
        <div className="ModalOverlay-target" onClick={this.props.overlayClickHandler}></div>
        <div className="ModalOverlay-dialog">
          {this.props.dialog}
        </div>
      </div>
    );
    
  }
});

module.exports = ModalOverlay;
