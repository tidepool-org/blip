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
/*global describe, it, before, after, beforeEach, afterEach */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var $ = window.$;
var d3 = window.d3;
var preprocess = window.tideline.preprocess;
var blip = window.tideline.blip;
var chartDailyFactory = blip.oneday;

var imagesBaseUrl = '../../img';

var testpage = require('../../dev/testpage/index');

var tideline = require('../../js/index');
var containerId = '#testContainer';

describe('the tideline container', function(done) {
  // this set of tests isn't really testing anything...EXCEPT
  // we're using the dimensions of the container to test some other things below
  // so these tests are basically canaries to help us debug potentially breaking tests
  before(function() {
    $(containerId).append('<div class="tideline-container"></div>');
  });

  it('should have a width of 960px', function() {
    expect($('.tideline-container').width()).to.equal(960);
  });

  it('should have a height of 590px', function() {
    expect($('.tideline-container').height()).to.equal(590);
  });

  after(function() {
    $(containerId).empty();
  });
});

describe('one-day view', function() {
  var i = 0, testPatterns = testpage.main;

  describe('full day of data', function() {
    var container, oneDay;

    before(function() {
      $(containerId).append('<div class="tideline-container" id="tideline_' + i + '"></div>');
      var el = document.getElementById('tideline_' + i);
      oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}).setupPools();
      var data = preprocess.processData(testPatterns.full());
      oneDay.load(data).locate();
      container = $('#tideline_' + i);
      i++;
    });

    describe('cbg data', function() {
      it('should display cbgs with radius 2.5', function() {
        expect(parseFloat(container.find('.d3-circle-cbg').attr('r'),10)).to.equal(2.5);
      });

      it('should display 289 cbgs with color #FF8B7C, when seed is 79 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-low');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#FF8B7C'.toLowerCase());
      });

      it('should display 289 cbgs with color #9AD859, when seed is 100 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-target');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#9AD859'.toLowerCase());
      });

      it('should display 289 cbgs with color #BB9AE7, when seed is 181 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-high');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#BB9AE7'.toLowerCase());
      });

      describe('left edge cbg elements', function() {
        var leftLow, leftTarget, leftHigh;

        it('should have an x value at the axis gutter', function() {
          leftLow = container.find('.d3-circle-cbg.d3-bg-low').filter(':first');
          leftTarget = container.find('.d3-circle-cbg.d3-bg-target').filter(':first');
          leftHigh = container.find('.d3-circle-cbg.d3-bg-high').filter(':first');
          expect(parseInt(leftLow.attr('cx'), 10)).to.equal(oneDay.axisGutter());
          expect(parseInt(leftTarget.attr('cx'), 10)).to.equal(oneDay.axisGutter());
          expect(parseInt(leftHigh.attr('cx'), 10)).to.equal(oneDay.axisGutter());
        });

        it('(low and target) should offer a right and up tooltip (text = 60, 110) on hover', function() {
          leftLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + leftLow.attr('id').replace('cbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_low.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('60');
          leftTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + leftTarget.attr('id').replace('cbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_target.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('110');
        });

        it('(high) should offer a right and down tooltip (text = 300) on hover', function() {
          leftHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + leftHigh.attr('id').replace('cbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_high.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('300');
        });
      });

      describe('right edge cbg elements', function() {
        var rightLow, rightTarget, rightHigh;

        it('should have an x value at the right edge', function() {
          rightLow = container.find('.d3-circle-cbg.d3-bg-low').filter(':last');
          rightTarget = container.find('.d3-circle-cbg.d3-bg-target').filter(':last');
          rightHigh = container.find('.d3-circle-cbg.d3-bg-high').filter(':last');
          expect(parseInt(rightLow.attr('cx'), 10)).to.equal(960);
          expect(parseInt(rightTarget.attr('cx'), 10)).to.equal(960);
          expect(parseInt(rightHigh.attr('cx'), 10)).to.equal(960);
        });

        it('(low and target) should offer a left and up tooltip (text = 60, 110) on hover', function() {
          rightLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + rightLow.attr('id').replace('cbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_low_left.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('60');
          rightTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + rightTarget.attr('id').replace('cbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_target_left.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('110');
        });

        it('(high) should offer a left and down tooltip (text = 300) on hover', function() {
          rightHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + rightHigh.attr('id').replace('cbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_high_left.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('300');
        });
      });
    });
  });
});