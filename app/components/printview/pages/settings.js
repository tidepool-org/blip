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

var _ = require('lodash');
var bows = require('bows');
var React = require('react');
var ReactDOM = require('react-dom');

import personUtils from '../../../core/personutils';
import utils from '../../../core/utils';
import format from 'tideline/js/data/util/format';

const MS_INHOUR = 3600000, MS_INDAY = 86400000;
const MIN_DUR_FOR_RATE = 2 * MS_INHOUR;

var DeviceSettings = React.createClass({
  log: bows('Print View Device Settings'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>{ this.renderDeviceSettings() }</div>
    );
  },

  renderDeviceSettings: function() {
    return (
      <div>
          { this.renderBasalRates() }
          { this.renderCalculatorSettings() }
        </div>
    );
  },

  renderBasalRates: function() {
    var basalSchedules = this.currentSettings().basalSchedules;
    var scheduleLabels = _.pluck(basalSchedules, 'name');
    var scheduleLabelsToKeep = [];
    // remove any basal schedules that are just an empty array
    for (var k = 0; k < scheduleLabels.length; k++) {
      if (_.findWhere(basalSchedules, {'name': scheduleLabels[k]}).value.length !== 0) {
        scheduleLabelsToKeep.push(scheduleLabels[k]);
      }
    }
    scheduleLabels = scheduleLabelsToKeep;

    var activeSchedule = this.currentSettings().activeSchedule;

    var renderBasalScheduleDiagram = this.renderBasalScheduleDiagram;

    return (
      <div className="print-view-section">
        <div className="print-view-basal-rates">
          <p className="print-view-section-title print-view-basal-rates-title">Basal Rates</p>
          <div className="print-view-basal-rates-schedules">
            { scheduleLabels.map(function(name) {
              var date;
              if (name === activeSchedule) {
                date = (
                  <p className="print-view-basal-rates-schedule-date">(Current)</p>
                );
              }
              
              var basalSchedule = _.findWhere(basalSchedules, {name: name}).value;
              var msStartString = function(x) { return format.millisecondsAsTimeOfDay(x).toLowerCase(); };
              var toThreeDecimals = function(x) { return x.toFixed(3); };

              var total = 0.0;
              var lastStart = 0;
              var lastRate = 0;

              var unitsOverMs = function(start, end, rate) {
                return (end - start) / MS_INHOUR * rate;
              };

              var basalScheduleRows = (
                basalSchedule.map(function(period) {
                  total += unitsOverMs(lastStart, period.start, lastRate);
                  lastStart = period.start; lastRate = period.rate;
                  return (
                    <tr key={period.start}>
                      <td>{ msStartString(period.start) }</td>
                      <td>{ toThreeDecimals(period.rate) }</td>
                    </tr>
                  );
                })
              );
              total += unitsOverMs(lastStart, MS_INDAY, lastRate);

              return (
                <div key={name} className="print-view-basal-rates-schedule">
                  <p className="print-view-basal-rates-schedule-name">{ name }</p>
                  { date }
                  <table className="print-view-table print-view-basal-rates-schedule-table">
                    <thead>
                      <tr>
                        <th>Start time</th>
                        <th>Value (u/hr)</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>Daily Total</th>
                        <th>{ total.toFixed(3) }</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      { basalScheduleRows }
                    </tbody>
                  </table> 
                  { renderBasalScheduleDiagram(basalSchedule) }
                </div>
              );
            }) }
          </div>
        </div>
      </div>
    );
  },

  renderBasalScheduleDiagram: function(schedule) {
    var height = 60;
    var width = 415;

    var divider = (
      <div className="print-view-basal-rates-schedule-diagram-divider" 
        style={{height: height + "px"}}>
      </div>
    );

    var widthForDuration = function(duration) {
      return duration / MS_INDAY * width;
    };

    var basalRate = function(rate, duration) {
      var style = {
        lineHeight: rate*height + "px",
        height: rate*height + "px",
        width: widthForDuration(duration) + "px",
      };
      var tmpRate = rate.toString();
      if (rate === 0) {
        style.height = "1px";
      }
      if (rate < 0.4) {
        tmpRate = "";
      }
      if (duration <= MIN_DUR_FOR_RATE) {
        tmpRate = "";
      }

      return (
        <div >
          <div className="print-view-basal-rates-schedule-diagram-rate"
            style={style}>
            { tmpRate }
          </div>
          { divider }
        </div>
      );
    };

    var msStartString = function(x, duration) { 
      if (duration > MIN_DUR_FOR_RATE)
        return format.millisecondsAsTimeOfDay(x).toLowerCase();
      return "";
    };

    var timeTopMargin = {marginTop: (height + 6) + "px"};

    var lastStart = 0;
    var lastRate = 0;
    return (
      <div className="print-view-basal-rates-schedule-diagram">
        { divider }
        { schedule.map(function(period) {
          var tempLastStart = lastStart, tempLastRate = lastRate;
          lastStart = period.start; lastRate = period.rate;
          if (period.start !== 0)
            return (
              <div key={ tempLastStart } className="print-view-basal-rates-schedule-diagram-section">
                <p className="print-view-basal-rates-schedule-diagram-time"
                   style={timeTopMargin}>
                  { msStartString(tempLastStart, period.start - tempLastStart) }
                </p>
                { basalRate(tempLastRate, period.start - tempLastStart) }
              </div>
            );
          return;
        })}
        <div className="print-view-basal-rates-schedule-diagram-section">
          <p className="print-view-basal-rates-schedule-diagram-time"
             style={timeTopMargin}>
            { msStartString(lastStart, MS_INDAY - lastStart) }
          </p>
          { basalRate(lastRate, MS_INDAY - lastStart) }
        </div>
      </div>
    );
  },

  renderCalculatorSettings: function() {

    var msStartString = function(x) { return format.millisecondsAsTimeOfDay(x).toLowerCase(); };
    var toThreeDecimals = function(x) { return x.toFixed(3); };

    var currentSettings = this.currentSettings();
    var activeSchedule = currentSettings.activeSchedule;

    var isPluralSchedules = currentSettings.carbRatios ? true : false;         

    var calculatorSettings;
    if (isPluralSchedules) {
      var carbRatios = currentSettings.carbRatios;
      var sensitivities = currentSettings.insulinSensitivities;
      var targets = currentSettings.bgTargets;

      // TODO: calculator settings for tandem records

    } else {
      var carbRatio = currentSettings.carbRatio;
      var carbRatioDiv = (
        <div className="print-view-calc-settings-block print-view-calc-settings-carbratio">
          <p className="print-view-calc-settings-table-title">Insulin to Carb Ratio</p>
          <table className="print-view-table print-view-calc-settings-table">
            <thead>
              <tr>
                <th>Start time</th>
                <th>Value (g)</th>
              </tr>
            </thead>
            <tbody>
              { carbRatio.map(function(period) {
                return (
                  <tr key={period.start}>
                    <td>{ msStartString(period.start) }</td>
                    <td>{ period.amount }</td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
      );

      var sensitivity = currentSettings.insulinSensitivity;
      var sensitivityDiv = (
        <div className="print-view-calc-settings-block print-view-calc-settings-sensitivity">
          <p className="print-view-calc-settings-table-title">Sensitivity (ISF, Correction)</p>
          <table className="print-view-table print-view-calc-settings-table">
            <thead>
              <tr>
                <th>Start time</th>
                <th>Value (mg/dL/u)</th>
              </tr>
            </thead>
            <tbody>
              { sensitivity.map(function(period) {
                return (
                  <tr key={period.start}>
                    <td>{ msStartString(period.start) }</td>
                    <td>{ period.amount }</td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
      );

      var target = currentSettings.bgTarget;
      var targetHeader, lowHeader, highHeader, rangeHeader;
      if (target[0].target) targetHeader = (<th>Target (mg/dL)</th>);
      if (target[0].low) lowHeader = (<th>Low (mg/dL)</th>);
      if (target[0].high) highHeader = (<th>High (mg/dL)</th>);
      if (target[0].range) rangeHeader = (<th>Range (±mg/dL)</th>);
      var targetDiv= (
        <div className="print-view-calc-settings-block print-view-calc-settings-target">
          <p className="print-view-calc-settings-table-title">Sensitivity (ISF, Correction)</p>
          <table className="print-view-table print-view-calc-settings-table">
            <thead>
              <tr>
                <th>Start time</th>
                { targetHeader }
                { lowHeader }
                { highHeader }
                { rangeHeader }
              </tr>
            </thead>
            <tbody>
              { target.map(function(period) {
                var targetVal, lowVal, highVal, rangeVal;
                if (period.target) targetVal = (<td>{ period.target }</td>);
                if (period.low) lowVal = (<td>{ period.low }</td>);
                if (period.high) highVal = (<td>{ period.high }</td>);
                if (period.range) rangeVal = (<td>{ period.range }</td>);

                return (
                  <tr key={period.start}>
                    <td>{ msStartString(period.start) }</td>
                    { targetVal }
                    { lowVal }
                    { highVal }
                    { rangeVal }
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
      );

      calculatorSettings = (
        <div className="print-view-calc-settings-content">
          { carbRatioDiv }
          { sensitivityDiv }
          { targetDiv }
        </div>
      );
    }

    return (
      <div className="print-view-section print-view-section-last">
        <div className="print-view-calc-settings">
          <p className="print-view-section-title print-view-calc-settings-title">
            Bolus Calculator Settings
          </p>
          { calculatorSettings }
        </div>
      </div>
    );
  },

  currentSettings: function() {
    var pumpSettings = this.props.patientData.grouped.pumpSettings;
    return pumpSettings[pumpSettings.length - 1];
  }

});

module.exports = DeviceSettings;