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

var d3 = require('./lib/').d3;
var _ = require('./lib/')._;

var format = require('./data/util/format');

var log = require('./lib/').bows('Settings');

module.exports = function(emitter, opts) {

  opts = opts || {'bgUnits': 'mg/dL'};

  var msStartString = function(x) { return format.millisecondsAsTimeOfDay(x); };
  var defaults = {
    'sections': {
      'basal': {
        'label': 'Basal Rates',
        'columnTypes': ['basalSchedules']
      },
      'wizard': {
        'label': 'Bolus Wizard',
        'columnTypes': ['carbRatio', 'insulinSensitivity', 'bgTarget']
      }
    },
    'labelsByType': {
      'carbRatio': 'Insulin to Carb Ratio (I:C)',
      'insulinSensitivity': 'Sensitivity (ISF, Correction)',
      'bgTarget': 'BG Target'
    },
    'rowHeadersByType': {
      'basalSchedules': ['Start time', 'Value U/hr'],
      'carbRatio': ['Start time', 'Value g/U'],
      'insulinSensitivity': ['Start time', 'Value mg/dL/U'],
      'bgTarget': ['Start time', 'Low', 'High']
    },
    'mapsByType': {
      'basalSchedules': {
        'start': msStartString,
        'rate': function(x) { return x; }
      },
      'carbRatio': {
        'start': msStartString,
        'amount': function(x) { return x + ' g/U'; }
      },
      'insulinSensitivity': {
        'start': msStartString,
        'amount': function(x) { return x + ' ' + opts.bgUnits + '/U'; }
      },
      'bgTarget': {
        'start': msStartString,
        'low': function(x) { return x + ' ' + opts.bgUnits; },
        'high': function(x) { return x + ' ' + opts.bgUnits; }
      }
    }
  };

  _.defaults(opts, defaults);

  var settings, mainDiv;

  function container(selection) {
    mainDiv = selection.append('div')
      .attr('id', 'tidelineSettings');
  }

  // getters only
  container.currentSettings = function() {
    return settings[settings.length - 1];
  };

  // getters & setters
  container.data = function(data) {
    if (!arguments.length) return settings;

    settings = data.grouped.settings;
    return container;
  };

  container.section = function(type, label, numColumns) {
    var sectionDiv = mainDiv.append('div')
      .attr({
        'id': type + 'Settings',
        'class': 'd3-settings-section'
      });

    sectionDiv.append('div')
      .attr({
        'class': 'd3-settings-section-label'
      })
      .text(label);

    if (type === 'basal'){
      var basalSchedules = container.currentSettings().basalSchedules;
      var scheduleLabels = Object.keys(basalSchedules);
      for (var i = 0; i < scheduleLabels.length; i++) {
        if (basalSchedules[scheduleLabels[i]].length > 0) {
          container.column(sectionDiv, scheduleLabels[i]);
        }
      }
    }
    else {
      for (var j = 0; j < numColumns; j++) {
        container.column(sectionDiv, opts.sections[type].columnTypes[j]);
      }
    }

    return container;
  };

  container.tableHeaders = function(table, data) {
    table.append('tr')
      .selectAll('th')
      .data(data)
      .enter()
      .append('th')
      .attr({
        'class': 'd3-settings-table-head'
      })
      .text(function(d) {
        return d;
      });

    return container;
  };

  container.tableRows = function(table, data) {
    table.selectAll('tr.d3-settings-table-row-data')
      .data(data)
      .enter()
      .append('tr')
      .attr({
        'class': 'd3-settings-table-row-data'
      });

    return container;
  };

  container.renderRows = function(table, map) {
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      table.selectAll('.d3-settings-table-row-data')
        .append('td')
        .attr('class', function(d) {
          if (keys[i] === 'start') {
            return 'd3-settings-start-time'
          }
        })
        .text(function(d) {
          var key = keys[i];
          if (d[key] === 0) {
            console.log(map[key](d[key]));
          }
          return map[key](d[key]);
        });
    }

    return container;
  };

  container.column = function(selection, datatype) {
    var columnDiv = selection.append('div')
      .attr({
        'id': datatype.replace(' ', '_') + 'Settings',
        'class': 'd3-settings-col'
      });
    // all but basal rates
    if (opts.labelsByType[datatype]) {
      columnDiv.append('div')
        .attr({
          'class': 'd3-settings-col-label'
        })
        .text(opts.labelsByType[datatype]);
    }
    // basal rates
    else {
      columnDiv.classed({
        'd3-settings-col': false,
        'd3-settings-basal-col': true
      });
      columnDiv.append('div')
        .attr({
          'class': 'd3-settings-basal-schedule-label'
        })
        .text(datatype);
    }
    var columnTable = columnDiv.append('table');

    // all but basal rates
    if (opts.rowHeadersByType[datatype]) {
      container.tableHeaders(columnTable, opts.rowHeadersByType[datatype])
        .tableRows(columnTable, container.currentSettings()[datatype])
        .renderRows(columnTable, opts.mapsByType[datatype]);
    }
    // basal rates
    else {
      container.tableHeaders(columnTable, opts.rowHeadersByType.basalSchedules)
        .tableRows(columnTable, container.currentSettings().basalSchedules[datatype])
        .renderRows(columnTable, opts.mapsByType.basalSchedules);
    }

    return container;
  };

  container.render = function() {
    console.log(container.currentSettings());
    _.each(Object.keys(opts.sections), function(key) {
      container.section(key, opts.sections[key].label, opts.sections[key].columnTypes.length);
    }, container);
  };

  container.clear = function() {
    mainDiv.selectAll('div').remove();
  };

  return container;
};