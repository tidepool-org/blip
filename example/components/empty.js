/** @jsx React.DOM */
var bows = require('bows');
var React = require('react');

var Empty = React.createClass({
  chartType: 'empty',
  log: bows('Empty View'),
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain" className="grid">
        <div className="tidelineNav grid"></div>
        <div id="tidelineOuterContainer">
          <div id="fetchAndProcess">
            <p>Fetching and validating data...</p>
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
          </div>
        </div>
        <div className="tidelineNav grid"></div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = Empty;
