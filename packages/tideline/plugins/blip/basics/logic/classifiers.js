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

/* jshint esversion:6 */

var _ = require('lodash');
var commonbolus = require('../../../../js/plot/util/commonbolus');
var categorizer = require('../../../../js/data/util/categorize');
var { MGDL_UNITS } = require('../../../../js/data/util/constants');

module.exports = function(bgClasses, bgUnits = MGDL_UNITS) {
  var classifiers = {
    basal: function(d) {
      if (_.includes(['scheduled', 'automated'], d.deliveryType)) {
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
        if (!Number.isNaN(recommended)) {
          if (recommended > Math.max(delivered, programmed)) {
            tags.push('underride');
          } else if (Math.max(delivered, programmed) > recommended) {
            tags.push('override');
          }

          if (d.wizard.recommended.correction > 0 && d.wizard.recommended.carb === 0) {
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
    categorizeBg: categorizer(bgClasses, bgUnits),
    smbg: function(d) {
      var tags = [];
      if (d.subType && d.subType === 'manual') {
        tags.push(d.subType);
      }
      else {
        tags.push('meter');
      }
      var bgCategory = classifiers.categorizeBg(d);
      switch (bgCategory) {
        case 'verylow':
          tags.push('verylow');
          break;
        case 'veryhigh':
          tags.push('veryhigh');
          break;
        default:
          break;
      }
      return tags;
    }
  };

  return classifiers;
};
