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

var width = 960, height = 590;

describe('the tideline container', function(done) {
  // this set of tests isn't really testing anything...EXCEPT
  // we're using the dimensions of the container to test some other things below
  // so these tests are basically canaries to help us debug potentially breaking tests
  before(function() {
    $(containerId).append('<div class="tideline-container"></div>');
  });

  it('should have a width of 960px', function() {
    expect($('.tideline-container').width()).to.equal(width);
  });

  it('should have a height of 590px', function() {
    expect($('.tideline-container').height()).to.equal(height);
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
      $(containerId).append('<h3>Full day of data</h3>');
      $(containerId).append('<div class="tideline-container" id="tideline_' + i + '"></div>');
      var el = document.getElementById('tideline_' + i);
      oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}).setupPools();
      var data = preprocess.processData(testPatterns.full);
      oneDay.load(data).locate('2008-01-01T12:00:00.000Z');
      container = $('#tideline_' + i);
      i++;
    });

    describe('bg pool', function() {
      it('should have a label', function() {
        expect(container.find('#poolBG_label_0').size()).to.be.above(0);
        expect(container.find('#poolBG_label_0').html()).to.equal('Blood Glucose<tspan> (mg/dL)</tspan>');
      });

      it('should have a legend', function() {
        expect(container.find('#poolBG_legend_bg').size()).to.be.above(0);
      });
    });

    describe('carbs and bolus pool', function() {
      it('should have a label', function() {
        expect(container.find('#poolBolus_label_0').size()).to.be.above(0);
        expect(container.find('#poolBolus_label_0').html()).to.equal('Bolus<tspan> (U)</tspan>');
        expect(container.find('#poolBolus_label_1').size()).to.be.above(0);
        expect(container.find('#poolBolus_label_1').html()).to.equal(' &amp; Carbohydrates<tspan> (g)</tspan>');
      });

      it('should have legends', function() {
        expect(container.find('#poolBolus_legend_bolus').size()).to.be.above(0);
        expect(container.find('#poolBolus_legend_carbs').size()).to.be.above(0);
      });
    });

    describe('basal pool', function() {
      it('should have a label', function() {
        expect(container.find('#poolBasal_label_0').size()).to.be.above(0);
        expect(container.find('#poolBasal_label_0').html()).to.equal('Basal Rates<tspan> (U/hr)</tspan>');
      });

      it('should have a legend', function() {
        expect(container.find('#poolBasal_legend_basal').size()).to.be.above(0);
      });
    });

    describe('cbg data', function() {
      it('should display cbgs with radius 2.5', function() {
        expect(container.find('.d3-circle-cbg').attr('r')).to.equal('2.5');
      });

      it('should display 289 cbgs with color #FF8B7C, when seed is 79 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-low');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#FF8B7C'.toLowerCase());
      });

      it('should display 289 cbgs with color #76D3A6, when seed is 100 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-target');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#76D3A6'.toLowerCase());
      });

      it('should display 289 cbgs with color #BB9AE7, when seed is 181 mg/dL', function() {
        var these = container.find('.d3-circle-cbg.d3-bg-high');
        expect(these.length).to.equal(289);
        expect(d3.rgb(these.css('fill')).toString()).to.equal('#BB9AE7'.toLowerCase());
      });

      describe('left edge cbg elements', function() {
        var leftLow, leftTarget, leftHigh, midnightFill;

        it('should have an x value at the left edge of midnight fill', function() {
          leftLow = container.find('.d3-circle-cbg.d3-bg-low').filter(':first');
          leftTarget = container.find('.d3-circle-cbg.d3-bg-target').filter(':first');
          leftHigh = container.find('.d3-circle-cbg.d3-bg-high').filter(':first');
          midnightFill = parseInt(container.find('.d3-fill-darkest').attr('x'), 10);

          expect(parseInt(leftLow.attr('cx'), 10)).to.equal(midnightFill);
          expect(parseInt(leftTarget.attr('cx'), 10)).to.equal(midnightFill);
          expect(parseInt(leftHigh.attr('cx'), 10)).to.equal(midnightFill);
        });

        it('(low and target) should yield a right and up tooltip (text = 60, 110) on hover', function() {
          leftLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + leftLow.attr('id').replace('cbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_low.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('60');

          leftTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + leftTarget.attr('id').replace('cbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_target.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('110');
        });

        it('(high) should yield a right and down tooltip (text = 300) on hover', function() {
          leftHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + leftHigh.attr('id').replace('cbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_high.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('300');
        });

        it('should have tooltips that disappear on mouseout', function() {
          leftLow.simulate('mouseout');
          leftTarget.simulate('mouseout');
          leftHigh.simulate('mouseout');
          expect(container.find('#tidelineTooltips_cbg .d3-tooltip').size()).to.equal(0);
          leftLow.simulate('mouseover');
          leftTarget.simulate('mouseover');
          leftHigh.simulate('mouseover');
        });
      });

      describe('right edge cbg elements', function() {
        var rightLow, rightTarget, rightHigh, premidnightFill;

        it('should have an x value equal to the x of the pre-midnight fill plus width of fill rect', function() {
          rightLow = container.find('.d3-circle-cbg.d3-bg-low').filter(':last');
          rightTarget = container.find('.d3-circle-cbg.d3-bg-target').filter(':last');
          rightHigh = container.find('.d3-circle-cbg.d3-bg-high').filter(':last');
          premidnightFill = container.find('#fill_20080101T210000000Z');
          var x = parseInt(premidnightFill.attr('x'), 10) + parseInt(premidnightFill.attr('width'), 10);

          expect(parseInt(rightLow.attr('cx'), 10)).to.equal(x);
          expect(parseInt(rightTarget.attr('cx'), 10)).to.equal(x);
          expect(parseInt(rightHigh.attr('cx'), 10)).to.equal(x);
        });

        it('(low and target) should yield a left and up tooltip (text = 60, 110) on hover', function() {
          rightLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + rightLow.attr('id').replace('cbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_low_left.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('60');

          rightTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + rightTarget.attr('id').replace('cbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_target_left.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('110');
        });

        it('(high) should yield a left and down tooltip (text = 300) on hover', function() {
          rightHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + rightHigh.attr('id').replace('cbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/cbg/cbg_tooltip_high_left.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('300');
        });

        it('should have tooltips that disappear on mouseout', function() {
          rightLow.simulate('mouseout');
          rightTarget.simulate('mouseout');
          rightHigh.simulate('mouseout');
          // 3 not zero because left tooltips get added back for visual inspection purposes
          expect(container.find('#tidelineTooltips_cbg .d3-tooltip').size()).to.equal(3);
          rightLow.simulate('mouseover');
          rightTarget.simulate('mouseover');
          rightHigh.simulate('mouseover');
        });
      });
    });

    describe('smbg data', function() {
      var circleSize = 16, highestLow, lowestHigh;

      it('should display smbgs with a radius of 7 (= size/2 - 1)', function() {
        // smbg circles have radius size/2 - 1 because of 1px stroke for open circles
        expect(parseInt(container.find('.d3-circle-smbg').attr('r'),10)).to.equal(circleSize/2 - 1);
      });

      it('should display 8 low smbgs, 2 of which are very low at bottom of pool', function() {
        var lows = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-low');
        // parent group itself doesn't have a pixel height, so compare to first fill rectangle instead
        var fillRectHeight = container.find('#poolBG_fill').find('rect').filter(':first').attr('height');

        lows.each(function() {
          var isLow = $(this).attr('class').search('d3-bg-low') !== -1;
          var isOpen = $(this).attr('class').search('d3-circle-open') !== -1;
          if (isLow && !isOpen) {
            expect(parseFloat($(this).attr('cy'))).to.equal(fillRectHeight - circleSize/2);
          }
          else if (isLow && isOpen) {
            highestLow = parseFloat($(this).attr('cy'));
            expect(highestLow).to.be.below(fillRectHeight - circleSize/2);
          }
        });
        expect(lows.size()).to.equal(8);
      });

      it('should display 8 high smbgs, 2 of which are very high at top of pool', function() {
        var highs = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-high');

        highs.each(function() {
          var isHigh = $(this).attr('class').search('d3-bg-high') !== -1;
          var isOpen = $(this).attr('class').search('d3-circle-open') !== -1;
          if (isHigh && !isOpen) {
            expect(parseFloat($(this).attr('cy'))).to.equal(circleSize/2);
          }
          else if (isHigh && isOpen) {
            lowestHigh = parseFloat($(this).attr('cy'));
            expect(lowestHigh).to.be.above(0);
          }
        });
        expect(highs.size()).to.equal(8);
      });

      it('should display 8 target smbgs with y attributes between highestLow and lowestHigh', function() {
        var targets = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-target');
        expect(targets.size()).to.equal(8);
        targets.each(function() {
          expect(parseFloat($(this).attr('cy'))).to.be.below(highestLow);
          expect(parseFloat($(this).attr('cy'))).to.be.above(lowestHigh);
        });
      });

      describe('left edge smbg elements', function() {
        var leftLow, leftTarget, leftHigh;

        it('(low and target) should yield a right and up tooltip (text = 20, 80) on hover', function() {
          leftLow = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-low').filter(':first');
          leftTarget = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-target').filter(':first');
          leftHigh = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-high').filter(':first');

          leftLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + leftLow.attr('id').replace('smbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_low.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('20');
          // check for AM not am because CSS handles the transform to lowercase
          expect(lowTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 12:30 AM');
          expect(lowTooltipGroup.find('rect').size()).to.be.above(0);

          leftTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + leftTarget.attr('id').replace('smbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_target.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('80');
          expect(targetTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 1:30 AM');
          expect(targetTooltipGroup.find('rect').size()).to.be.above(0);
        });

        it('(high) should yield a right and down tooltip (text = 181) on hover', function() {
          leftHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + leftHigh.attr('id').replace('smbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_high.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('181');
          expect(highTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 2:30 AM');
          expect(highTooltipGroup.find('rect').size()).to.be.above(0);
        });

        it('should have tooltips that disappear on mouseout', function() {
          leftLow.simulate('mouseout');
          leftTarget.simulate('mouseout');
          leftHigh.simulate('mouseout');
          expect(container.find('#tidelineTooltips_smbg .d3-tooltip').size()).to.equal(0);
          leftLow.simulate('mouseover');
          leftTarget.simulate('mouseover');
          leftHigh.simulate('mouseover');
        });
      });

      describe('right edge smbg elements', function() {
        var rightLow, rightTarget, rightHigh;

        it('(low and target) should yield a left and up tooltip (text = 20, 80) on hover', function() {
          rightLow = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-low').filter(':last');
          rightTarget = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-target').filter(':last');
          rightHigh = container.find('#poolBG').find('.d3-circle-smbg.d3-bg-high').filter(':last');

          rightLow.simulate('mouseover');
          var lowTooltipGroup = container.find('#tooltip_' + rightLow.attr('id').replace('smbg_', ''));
          expect(lowTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_low_left.svg');
          expect(lowTooltipGroup.find('text').html()).to.equal('20');
          expect(lowTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 11:30 PM');
          expect(lowTooltipGroup.find('rect').size()).to.be.above(0);

          rightTarget.simulate('mouseover');
          var targetTooltipGroup = container.find('#tooltip_' + rightTarget.attr('id').replace('smbg_', ''));
          expect(targetTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_target_left.svg');
          expect(targetTooltipGroup.find('text').html()).to.equal('80');
          expect(targetTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 10:30 PM');
          expect(targetTooltipGroup.find('rect').size()).to.be.above(0);
        });

        it('(high) should yield a left and down tooltip (text = 181) on hover', function() {
          rightHigh.simulate('mouseover');
          var highTooltipGroup = container.find('#tooltip_' + rightHigh.attr('id').replace('smbg_', ''));
          expect(highTooltipGroup.find('image').attr('href')).to.equal('../../img/smbg/smbg_tooltip_high_left.svg');
          expect(highTooltipGroup.find('text').html()).to.equal('181');
          expect(highTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 9:30 PM');
          expect(highTooltipGroup.find('rect').size()).to.be.above(0);
        });

        it('should have tooltips that disappear on mouseout', function() {
          rightLow.simulate('mouseout');
          rightTarget.simulate('mouseout');
          rightHigh.simulate('mouseout');
          // 3 not zero because left tooltips get added back for visual inspection purposes
          expect(container.find('#tidelineTooltips_smbg .d3-tooltip').size()).to.equal(3);
          rightLow.simulate('mouseover');
          rightTarget.simulate('mouseover');
          rightHigh.simulate('mouseover');
        });
      });
    });

    describe('carbs data', function() {
      var carbs, wizards, leftCarb, rightCarb;

      it('should display carbs events with a radius of 14 #FFD382', function() {
        carbs = container.find('.d3-circle-carbs');
        expect(carbs.size()).to.equal(24);
        expect(carbs.attr('r')).to.equal('14');
        expect(d3.rgb(carbs.css('fill')).toString()).to.equal('#FFD382'.toLowerCase());
      });

      it('should display a numerical value in the center of the circle', function() {
        wizards = container.find('.d3-wizard-group');
        expect($.isNumeric(wizards.find('text').html())).to.be.true;
      });

      it('should yield a left and up tooltip if at the right edge', function() {
        leftCarb = carbs.filter(':first');
        leftCarb.simulate('mouseover');
        var leftTooltipGroup = container.find('#tidelineTooltips_bolus').find('.d3-tooltip').filter(':first');
        expect(leftTooltipGroup.find('image').attr('href')).to.equal('../../img/bolus/tooltip_bolus_large_left.svg');
        expect(leftTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 11:25 PM');
        expect(leftTooltipGroup.find('rect').size()).to.be.above(0);
      });

      it('should yield a right and up tooltip if not at the right edge', function() {
        rightCarb = carbs.filter(':last');
        rightCarb.simulate('mouseover');
        var rightTooltipGroup = container.find('#tidelineTooltips_bolus').find('.d3-tooltip').filter(':last');
        expect(rightTooltipGroup.find('image').attr('href')).to.equal('../../img/bolus/tooltip_bolus_small.svg');
        expect(rightTooltipGroup.find('text').filter('.d3-tooltip-timestamp').html()).to.equal('at 12:25 PM');
        expect(rightTooltipGroup.find('rect').size()).to.be.above(0);
      });

      it('should have tooltips that disappear on mouseout', function() {
        leftCarb.simulate('mouseout');
        rightCarb.simulate('mouseout');
        expect(container.find('#tidelineTooltips_bolus .d3-tooltip').size()).to.equal(0);
        leftCarb.simulate('mouseover');
        rightCarb.simulate('mouseover');
      });
    });

    describe('bolus data', function() {
      it('should display twenty-four boluses', function() {
        var boluses = container.find('#poolBolus_wizard').find('.d3-wizard-group').find('rect.d3-rect-bolus');
        expect(boluses.size()).to.equal(24);
      });
    });
  });
  
  describe('full day of data, quick boluses only', function() {
    var container, oneDay;

    before(function() {
      $(containerId).append('<h3>Full day of data, quick boluses only</h3>');
      $(containerId).append('<div class="tideline-container" id="tideline_' + i + '"></div>');
      var el = document.getElementById('tideline_' + i);
      oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}).setupPools();
      var data = preprocess.processData(testPatterns.quickbolusonly);
      oneDay.load(data).locate('2008-01-01T12:00:00.000Z');
      container = $('#tideline_' + i);
      i++;
    });

    it('should display twenty-four boluses', function() {
      var boluses = container.find('#poolBolus_bolus').find('.d3-wizard-group').find('rect.d3-rect-bolus');
      expect(boluses.size()).to.equal(24);
    });
  });
});