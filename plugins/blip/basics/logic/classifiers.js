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
var commonbolus = require('../../../../js/plot/util/commonbolus');

module.exports = function(bgClasses) {
  var classifers = {
    basal: function(d) {
      if (d.deliveryType === 'scheduled') {
        return [];
      }
      else {
        return [d.deliveryType];
      }
    },
    bolus: function(d) {
      var tags = [];
      var delivered = commonbolus.getDelivered(d);
      var programmed = commonbolus.getProgrammed(d);
      if (d.wizard && !_.isEmpty(d.wizard)) {
        var recommended = commonbolus.getRecommended(d.wizard);
        tags.push('wizard');
        if (!isNaN(recommended) && (programmed === delivered)) {
          if (recommended > delivered) {
            tags.push('override');
          }
          else if (delivered > recommended) {
            tags.push('override');
          }

          if (d.wizard.recommended.correction > 0 &&
              d.wizard.recommended.carb === 0) {
            tags.push('correction');
          }
        }
      }
      else {
        tags.push('manual');
      }

      if (programmed !== delivered) {
        tags.push('interrupted');
      }

      if (d.extended > 0) {
        tags.push('extended');
      }
      return tags;
    },
    categorizeBg: function(d) {
      if (d.value < bgClasses['very-low'].boundary) {
        return 'verylow';
      }
      else if (d.value >= bgClasses['very-low'].boundary &&
        d.value < bgClasses.low.boundary) {
        return 'low';
      }
      else if (d.value >= bgClasses.low.boundary &&
        d.value < bgClasses.target.boundary) {
        return 'target';
      }
      else if (d.value >= bgClasses.target.boundary &&
        d.value < bgClasses.high.boundary) {
        return 'high';
      }
      else if (d.value >= bgClasses.high.boundary) {
        return 'veryhigh';
      }
    },
    smbg: function(d) {
      var tags = [];
      if (d.subType && d.subType === 'manual') {
        tags.push(d.subType);
      }
      else {
        tags.push('meter');
      }
      var bgCategory = classifers.categorizeBg(d);
      switch (bgCategory) {
        case 'verylow':
          tags = tags.concat(['verylow', 'belowtarget']);
          break;
        case 'low':
          tags.push('belowtarget');
          break;
        case 'high':
        case 'veryhigh':
          tags.push('abovetarget');
          break;
        default:
          break;
      }
      return tags;
    }
  };

  return classifers;
};