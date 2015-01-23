/** @jsx React.DOM */
/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */
var bows = require('bows');
var React = require('react');
var cx = require('react/lib/cx');

var tideline = {
  log: bows('Footer')
};

var TidelineFooter = React.createClass({
  propTypes: {
    chartType: React.PropTypes.string.isRequired,
    onClickBoxOverlay: React.PropTypes.func,
    onClickGroup: React.PropTypes.func,
    onClickLines: React.PropTypes.func,
    onClickValues: React.PropTypes.func,
    boxOverlay: React.PropTypes.bool,
    grouped: React.PropTypes.bool,
    showingLines: React.PropTypes.bool,
    showingValues: React.PropTypes.bool,
    onClickRefresh: React.PropTypes.func
  },
  render: function() {
    var refreshLinkClass = cx({
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    function getValuesCheckboxValue(props) {
      return props.showingValues;
    }

    function getLinesCheckboxValue(props) {
      return props.showingLines;
    }

    function getGroupCheckboxValue(props) {
      return props.grouped;
    }

    function getOverlayCheckboxValue(props) {
      return props.boxOverlay;
    }

    var valuesCheck = getValuesCheckboxValue(this.props);
    var linesCheck = getLinesCheckboxValue(this.props);
    var groupCheck = getGroupCheckboxValue(this.props);
    var overlayCheck = getOverlayCheckboxValue(this.props);

    /* jshint ignore:start */
    var showValues = (
      <label htmlFor="valuesCheckbox" ref="label">
        <input type="checkbox" name="valuesCheckbox" id="valuesCheckbox" checked={valuesCheck} onChange={this.props.onClickValues} ref="control" /> Values
      </label>
      );
    /* jshint ignore:end */

    /* jshint ignore:start */
    var modalOpts = (
      <div>
        <label htmlFor="linesCheckbox" ref="label">
          <input type="checkbox" name="linesCheckbox" id="linesCheckbox" checked={linesCheck} onChange={this.props.onClickLines} ref="control" /> Lines
        </label>

        <label htmlFor="groupCheckbox" ref="label">
          <input type="checkbox" name="groupCheckbox" id="groupCheckbox" checked={groupCheck} onChange={this.props.onClickGroup} ref="control" /> Group
        </label>

        <label htmlFor="overlayCheckbox" ref="label">
          <input type="checkbox" name="overlayCheckbox" id="overlayCheckbox" checked={overlayCheck} onChange={this.props.onClickBoxOverlay} ref="control" /> Range &amp; Average
        </label>
      </div>
      );
    /* jshint ignore:end */

    /* jshint ignore:start */
    var rightSide = this.props.chartType === 'weekly' ? showValues :
      this.props.chartType === 'modal' ? modalOpts : null;
    /* jshint ignore:end */

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-footer-outer">
        <div className="container-box-inner patient-data-footer-inner">
          <div className="grid patient-data-footer">
            <div className="grid-item one-whole medium-one-half patient-data-footer-left">
              <button className="btn btn-chart"
                onClick={this.props.onClickRefresh}>
                Refresh</button>
            </div>
            <div className="grid-item one-whole medium-one-half patient-data-footer-right">{rightSide}</div>
          </div>
        </div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = TidelineFooter;
