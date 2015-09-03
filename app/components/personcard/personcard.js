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
var _ = require('lodash');
var cx = require('react/lib/cx');

var PersonCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    onClick: React.PropTypes.func
  },

  render: function() {
    var classes = cx({
      'personcard': true,
      'personcard-clickable': this.isClickable(),
      'personcard-empty': this.isEmpty()
    });

    if (!this.isClickable()) {
      
      return (
        <div className={classes}>
          {this.props.children}
        </div>
      );
      
    }

    
    return (
      <a
        className={classes}
        href={this.props.href}
        onClick={this.props.onClick}>
        {this.props.children}
      </a>
    );
    
  },

  isClickable: function() {
    return this.props.href || this.props.onClick;
  },

  isEmpty: function() {
    return _.isEmpty(this.props.children);
  }
});

module.exports = PersonCard;
