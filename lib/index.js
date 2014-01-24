// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
// 
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
// 
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
// 
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var TidepoolDateTime;

TidepoolDateTime = (function() {
  function TidepoolDateTime(moment) {
    this.moment = moment || require('moment');
  }

  TidepoolDateTime.FORMAT_LOCAL = 'lll';
  TidepoolDateTime.FORMAT_YYYY_MM_DD_HH_MM_SS = 'YYYY-MM-DDTHH:mm:ss';
  var DATE_FORMATS = ['DD/MM/YYYYTHH:mm:ss', 'MM/DD/YYYYTHH:mm:ss'];

  TidepoolDateTime.prototype.isValidDateTime = function(rawDateTime) {
  
    if(this.moment(rawDateTime,DATE_FORMATS).isValid()){
      return true;
    }
    return this.moment(rawDateTime,TidepoolDateTime.FORMAT_YYYY_MM_DD_HH_MM_SS).isValid();
  };

  TidepoolDateTime.prototype.convertToAdjustedUTC = function(dateTimeString, dateFormat, userOffsetFromUTC) {
    var convertedMoment, adjustedToUTC;

    //do we have zone detail?
    convertedMoment = this.moment.parseZone(dateTimeString);

    if (convertedMoment.zone() === 0) {
      userOffsetFromUTC = userOffsetFromUTC || false;

      if (userOffsetFromUTC == false) {
        throw new Error('Sorry but userOffsetFromUTC is required');
      }
      
      convertedMoment = this.moment.utc(dateTimeString, dateFormat)
                                   .zone(userOffsetFromUTC)
                                   .add('minute', userOffsetFromUTC);
    }

    adjustedToUTC = this.moment.utc(convertedMoment);

    return adjustedToUTC.format();
  };

  TidepoolDateTime.prototype.getDisplayTime = function(adjustedUTCString,format){
    format = format || TidepoolDateTime.FORMAT_LOCAL;
    var utcMoment = this.moment.utc(adjustedUTCString);
    utcMoment.local();
    return utcMoment.format(format);
  };

  TidepoolDateTime.prototype.getMoment = function() {
    return this.moment;
  };

  // CommonJS module is defined
  if (typeof module != 'undefined' && module.exports) {
    module.exports = TidepoolDateTime;
  } else {
    return TidepoolDateTime;
  }

})();



