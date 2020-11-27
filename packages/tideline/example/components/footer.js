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
var PropTypes = require('prop-types');
var React = require('react');
var cx = require('classnames');

var tideline = {
  log: bows('Footer')
};

class TidelineFooter extends React.Component {
  static propTypes = {
    chartType: PropTypes.string.isRequired,
    onClickBoxOverlay: PropTypes.func,
    onClickGroup: PropTypes.func,
    onClickLines: PropTypes.func,
    onClickValues: PropTypes.func,
    grouped: PropTypes.bool,
    showingValues: PropTypes.bool
  };

  render() {
    var valuesLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true
    });

    var linesLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true
    });

    var groupLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true
    });

    var overlayLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true
    });

    function getValuesLinkText(props) {
      if (props.chartType === 'weekly') {
        if (props.showingValues) {
          return 'Hide values';
        }
        else {
          return 'Show values';
        }
      }
      else {
        return '';
      }
    }

    function getLinesLinkText(props) {
      if (props.chartType === 'modal') {
        if (props.showingLines) {
          return 'Hide lines';
        }
        else {
          return 'Show lines';
        }
      }
      else {
        return '';
      }
    }

    function getGroupLinkText(props) {
      if (props.chartType === 'modal') {
        if (props.grouped) {
          return 'Ungroup';
        }
        else {
          return 'Group';
        }
      }
      else {
        return '';
      }
    }

    function getOverlayLinkText(props) {
      if (props.chartType === 'modal') {
        if (props.boxOverlay) {
          return 'Hide range & average';
        }
        else {
          return 'Show range & average';
        }
      }
      else {
        return '';
      }
    }

    var valuesLinkText = getValuesLinkText(this.props);

    var groupLinkText = getGroupLinkText(this.props);

    var overlayLinkText = getOverlayLinkText(this.props);

    /* jshint ignore:start */
    var showValues = (
      <a className={valuesLinkClass} onClick={this.props.onClickValues}>{valuesLinkText}</a>
      );
    /* jshint ignore:end */

    var linesLinkText = getLinesLinkText(this.props);

    /* jshint ignore:start */
    var modalOpts = (
      <div>
        <a className={linesLinkClass} onClick={this.props.onClickLines}>{linesLinkText}</a>
        <a className={groupLinkClass} onClick={this.props.onClickGroup}>{groupLinkText}</a>
        <a className={overlayLinkClass} onClick={this.props.onClickBoxOverlay}>{overlayLinkText}</a>
      </div>
      );
    /* jshint ignore:end */

    /* jshint ignore:start */
    var rightSide = this.props.chartType === 'weekly' ? showValues :
      this.props.chartType === 'modal' ? modalOpts : null;
    /* jshint ignore:end */

    /* jshint ignore:start */
    return (
      <div className="tidelineNav grid">
        <div className="grid-item one-half"/>
        <div className="grid-item one-half">{rightSide}</div>
      </div>
      );
    /* jshint ignore:end */
  }
}

module.exports = TidelineFooter;
