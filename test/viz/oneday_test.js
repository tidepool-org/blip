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

/*
 * NB: browser-only tests
 */

/*jshint expr: true */
/*global describe, it */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var $ = window.$;
var preprocess = window.tideline.preprocess;
var blip = window.tideline.blip;
var chartDailyFactory = blip.oneday;

var el = document.getElementById('tidelineContainer');
var imagesBaseUrl = '../img';

var oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}).setupPools();

var tideline = require('../../js/index');
var containerId = '#tidelineContainer';

$(document).ready(function() {
  describe('the tideline container', function() {
    it('should have a width of 1200px', function() {
      expect($(containerId).width()).to.equal(1200);
    });

    it('should have a height of 600px', function() {
      expect($(containerId).height()).to.equal(600);
    });
  });
});