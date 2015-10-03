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

module.exports = {
  smbg: function(d) {
    if (d.subType && d.subType === 'manual') {
      return [d.subType];
    }
    else {
      return ['meter'];
    }
  },
  bolus: function(d) {
    var tags = [];
    var delivered = commonbolus.getDelivered(d);
    var programmed = commonbolus.getProgrammed(d);
    var recommended = commonbolus.getRecommended(d);
    if (d.wizard && !_.isEmpty(d.wizard)) {
      tags.push('wizard');
      if (!isNaN(recommended)) {
        if (recommended > delivered) {
          tags.push('underride');
        }
        else if (delivered > recommended) {
          tags.push('override');
        }

        if (d.recommended.correction > 0 && d.recommended.carb === 0) {
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
  }
};