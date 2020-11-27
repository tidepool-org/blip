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
var d3 = require('d3');

var EventEmitter = require('events').EventEmitter;

var tideline = require('../../js/index');

function settingsFactory(el, options) {
  var log = bows('Settings Factory');
  options = options || {};

  var page = tideline.settings(options);

  var create = function(el, options) {
    if (!el) {
      throw new Error('Sorry, you must provide a DOM element! :(');
    }

    d3.select(el).call(page, options);

    return page;
  };

  page.load = function(data) {
    page.data(data).render();

    return page;
  };

  page.type = 'settings';

  return create(el, options);
}

module.exports = settingsFactory;
