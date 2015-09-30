/** @jsx React.DOM */
/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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
 * == BSD2 LICENSE ==
 */

var React = require('react');
var _ = require('lodash');

var RadioGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    options: React.PropTypes.array.isRequired
  },
  getInitialState: function() {
    var selectedId = _.findIndex(this.props.options, {default: true}) || 0;

    return {
      selectedId : selectedId
    }
  },
  onClick: function(e) {
    this.setState({selectedId: parseInt(e.target.value, 10) });
  },
  render: function() {
    var self = this;
    var options = self.props.options.map(function(option, id) {
      var checked = (id === self.state.selectedId) ? 'checked': '';
      return (<div className="RadioGroup-option">
        <input type="radio" name={self.props.name} value={id} checked={checked} onClick={self.onClick} />
        <span>{option.label}</span>
      </div>);
    });

    return (
      <div className="RadioGroup-container">
        {options}
      </div>
    );
  }
});

module.exports = RadioGroup;