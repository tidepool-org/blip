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

var _ = require('lodash');
var bows = require('bows');
var cx = require('classnames');
var React = require('react');

var debug = bows('Section');

var basicsActions = require('../logic/actions');

var DashboardSection = React.createClass({
  propTypes: {
    chart: React.PropTypes.func,
    container: React.PropTypes.any.isRequired,
    data: React.PropTypes.object.isRequired,
    days: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    open: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string.isRequired
  },
  componentDidMount: function() {
    this.setHeight();
  },
  render: function() {
    // debug('Rendered section with props', this.props);
    var dataDisplay;
    if (typeof this.props.chart === 'object') {
      var componentKeys = Object.keys(this.props.container);
      dataDisplay = [];
      for (var i = 0; i < componentKeys.length; ++i) {
        var component = this.props.container[componentKeys[i]];
        if (component.active) {
          dataDisplay.push(
            <component.container
              key={componentKeys[i]}
              section={this.props.name}
              component={componentKeys[i]}
              chart={component.chart}
              data={this.props.data}
              days={this.props.days}
              open={component.open}
              title={component.title}
              onRerender={this.setHeight} />
          );
        }
      }
    }
    else {
      dataDisplay = (
        <this.props.container chart={this}
          data={this.props.data}
          days={this.props.days}
          title={this.props.title} />
      );
    }
    var iconClass = cx({
      'icon-down': this.props.open,
      'icon-right': !this.props.open
    });
    var containerClass = cx({
      'DashboardSection-container': true,
      'DashboardSection-container--closed': !this.props.open
    });
    return (
      <div className='DashboardSection'>
        <h3>{this.props.title}
          <a href='' onClick={this.handleToggleSection}>
            <i className={iconClass}/>
          </a>
        </h3>
        <div className={containerClass} ref='container'>
          <div className='DashboardSection-content' ref='content'>
            {dataDisplay}
          </div>
        </div>
      </div>
    );
  },
  setHeight: function() {
    var content = this.refs.content.getDOMNode();
    var container = this.refs.container.getDOMNode();
    container.style.height = content.offsetHeight + 'px';
    debug('setHeight triggered on', this.props.name, content.offsetHeight);
  },
  handleToggleSection: function(e) {
    e.preventDefault();
    basicsActions.toggleSection(this.props.name);
  }
});

module.exports = DashboardSection;