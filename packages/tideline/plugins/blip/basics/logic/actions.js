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
var togglableState = require('../TogglableState');

var basicsActions = {};

basicsActions.bindApp = function(app) {
  this.app = app;
  return this;
};

basicsActions.toggleSection = function(sectionName, metricsFunc) {
  var sections = _.cloneDeep(this.app.state.sections);
  if (sections[sectionName].togglable === togglableState.closed) {
    sections[sectionName].togglable = togglableState.open;
    metricsFunc(sections[sectionName].id + ' was opened');
  } else {
    sections[sectionName].togglable = togglableState.closed;
    metricsFunc(sections[sectionName].id + ' was closed');
  }
  this.app.setState({sections: sections});
};

basicsActions.toggleSectionSettings = function(sectionName, metricsFunc) {
  var sections = _.cloneDeep(this.app.state.sections);
  if (sections[sectionName].settingsTogglable === togglableState.closed) {
    sections[sectionName].settingsTogglable = togglableState.open;
    metricsFunc(sections[sectionName].id + ' settings was opened');
  }
  else {
    sections[sectionName].settingsTogglable = togglableState.closed;
    metricsFunc(sections[sectionName].id + ' settings was closed');
  }
  this.app.setState({sections: sections});
};

basicsActions.setSiteChangeEvent = function(sectionName, selectedKey, selectedLabel, metricsFunc, updateBasicsSettingsFunc) {
  var sections = _.cloneDeep(this.app.state.sections);
  var selectorOptions = sections[sectionName].selectorOptions;
  selectorOptions = clearSelected(selectorOptions);
  sections[sectionName].selectorOptions = basicsActions.setSelected(selectorOptions, selectedKey);
  sections.siteChanges.type = selectedKey;
  sections.siteChanges.hasHover = true;

  var canUpdateSettings = _.get(sections, 'siteChanges.selectorMetaData.canUpdateSettings');

  metricsFunc('Selected ' + selectedLabel, {
    initiatedBy: canUpdateSettings ? 'User' : 'Care Team',
  });

  var newSettings = _.assign({}, this.app.props.patient.settings, {
    siteChangeSource: selectedKey,
  });

  updateBasicsSettingsFunc(this.app.props.patient.userid, newSettings, canUpdateSettings);

  this.app.setState({sections: sections});
};

basicsActions.selectSubtotal = function(sectionName, selectedKey, metricsFunc) {
  var sections = _.cloneDeep(this.app.state.sections);
  var selectorOptions = sections[sectionName].selectorOptions;

  if (metricsFunc) {
    metricsFunc('filtered on ' + selectedKey);
  }

  selectorOptions = clearSelected(selectorOptions);
  sections[sectionName].selectorOptions = basicsActions.setSelected(selectorOptions, selectedKey);
  this.app.setState({sections: sections});
};

basicsActions.addToBasicsData = function(key, value) {
  var newData = this.app.state.data;
  newData[key] = value;
  this.app.setState({data: newData});
};

function clearSelected(opts) {
  opts.primary = _.omit(opts.primary, 'selected');
  opts.rows = opts.rows.map(function(row) {
    return row.map(function(opt) {
      return _.omit(opt, 'selected');
    });
  });

  return opts;
}

basicsActions.setSelected = function(opts, selectedKey) {
  if (selectedKey === opts.primary.key) {
    opts.primary.selected = true;
  } else {
    opts.rows = opts.rows.map(function(row) {
      return row.map(function(opt) {
        if (opt.key === selectedKey) {
          opt.selected = true;
        }
        return opt;
      });
    });
  }

  return opts;
};

module.exports = basicsActions;
