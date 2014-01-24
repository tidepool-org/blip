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

var should
  , moment
  , PDT_OFFSET_DAYLIGHTSAVINGS
  , NZDT_OFFSET_DAYLIGHTSAVINGS
  , CEST_OFFSET_DAYLIGHTSAVINGS
  , FIRST_OCT_2013_230AM_NO_ZONE
  , TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE;

should = require('should');
moment = require('moment');
/*
Timezone offsets from UTC see http://www.timeanddate.com
*/
PDT_OFFSET_DAYLIGHTSAVINGS = 420;
NZDT_OFFSET_DAYLIGHTSAVINGS = -780;
CEST_OFFSET_DAYLIGHTSAVINGS = -120;

/*
Raw time as per many devices that give no zone info
*/
FIRST_OCT_2013_230AM_NO_ZONE = '10/1/13 02:30:00';


/*
Raw time as per many devices that give no zone info
*/
TWENTYFORTH_SEPT_2013_230AM_NO_ZONE = '9/24/13 02:30:00';

/*
Diasend Raw Time
*/
DIASEND_TWELVE_OCT_2013_14_NO_ZONE = '12/10/2013 14:00';

/*
Time with zone information
*/
TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE = '2013-10-22T14:57:09+13:00';

describe('Tidepool Dates', function() {
  describe('TidepoolDateTime',function(){
    it('should not break require',function(done){
      var TidepoolDateTime = require('../lib/');
      should.exist(TidepoolDateTime);
      done();
    });
    
    it('should have convertToAdjustedUTC method',function(done){
      var TidepoolDateTime, tpDateTime;

      TidepoolDateTime = require('../lib/');

      tpDateTime = new TidepoolDateTime();
      
      should.exist(tpDateTime.convertToAdjustedUTC);
      done();
    });
    it('should have getDisplayTime method',function(done){
      var TidepoolDateTime, tpDateTime;

      TidepoolDateTime = require('../lib/');

      tpDateTime = new TidepoolDateTime();
      
      should.exist(tpDateTime.getDisplayTime);
      done();
    });
    it('should have getMoment method',function(done){
      var TidepoolDateTime, tpDateTime;

      TidepoolDateTime = require('../lib/');

      tpDateTime = new TidepoolDateTime();
      
      should.exist(tpDateTime.getMoment);
      done();
    });
    it('should have format for local',function(done){
      var TidepoolDateTime;

      TidepoolDateTime = require('../lib/');
      
      should.exist(TidepoolDateTime.FORMAT_LOCAL);
      done();
    });
    it('should have format for YYYY-MM-DDTHH:mm:ss',function(done){
      var TidepoolDateTime;

      TidepoolDateTime = require('../lib/');
      
      should.exist(TidepoolDateTime.FORMAT_YYYY_MM_DD_HH_MM_SS);
      done();
    });
    describe("getMoment", function() {
      it('should return instance of moment',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');
        tpDateTime = new TidepoolDateTime();
        var moment = tpDateTime.getMoment();

        moment().isValid().should.be.true;

        done();
      });
    });
    describe("convertToAdjustedUTC", function() {
      it('should convert TidepoolDateTime to utc string',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        convertedUTC = tpDateTime.convertToAdjustedUTC(FIRST_OCT_2013_230AM_NO_ZONE, 'MM/DD/YYTHH:mm:ss', CEST_OFFSET_DAYLIGHTSAVINGS);

        isUTC = convertedUTC.indexOf('+00:00') !=-1 ? true : false;

        isUTC.should.be.true;

        done();
      });
      it('should use the given offset when the date does no include it and be utc',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        convertedUTC = tpDateTime.convertToAdjustedUTC(FIRST_OCT_2013_230AM_NO_ZONE, 'MM/DD/YYTHH:mm:ss', CEST_OFFSET_DAYLIGHTSAVINGS);
        convertedUTC.should.equal('2013-10-01T00:30:00+00:00');

        done();
      });
      it('should throw expection when offset parameter is not included',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        (function(){
          tpDateTime.convertToAdjustedUTC(FIRST_OCT_2013_230AM_NO_ZONE, 'MM/DD/YYTHH:mm:ss');
        }).should.throwError('Sorry but userOffsetFromUTC is required');
        
        done();
      });

      it('should not throw an expection when offset is the TidepoolDateTime and not passed ',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        (function(){
          convertedUTC = tpDateTime.convertToAdjustedUTC(TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE);
        }).should.not.throw();
        
        done();
      });
      it('should return utc TidepoolDateTime string when given TidepoolDateTime that contains offset',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        convertedUTC = tpDateTime.convertToAdjustedUTC(TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE);
        isUTC = convertedUTC.indexOf('+00:00') !=-1 ? true : false;

        isUTC.should.be.true;
        
        done();
      });
      it('should return converted dates year as 2013 for raw format of 9/24/13',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        convertedUTC = tpDateTime.convertToAdjustedUTC(TWENTYFORTH_SEPT_2013_230AM_NO_ZONE, 'MM/DD/YYTHH:mm:ss',CEST_OFFSET_DAYLIGHTSAVINGS);
        convertedUTC.should.equal('2013-09-24T00:30:00+00:00');

        done();
      });
      it('should return converted dates year as 2013 for raw format of 12/10/2013',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        convertedUTC = tpDateTime.convertToAdjustedUTC(DIASEND_TWELVE_OCT_2013_14_NO_ZONE, 'DD/MM/YYYYTHH:mm:ss', CEST_OFFSET_DAYLIGHTSAVINGS);
        
        convertedUTC.should.equal('2013-10-12T12:00:00+00:00');
        
        done();
      });
    });
    describe("getDisplayTime", function() {
      it('should return string in format of local time which is default',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        var val = moment.utc('2013-11-11T14:00:00-00:00');
        var expected = moment('2013-11-11T14:00:00Z');
        val.zone().should.not.equal(expected.zone());
        tpDateTime.getDisplayTime(val).should.equal(expected.format(TidepoolDateTime.FORMAT_LOCAL));

        done();
      });
      it('should return string in format YYYY-MM-DDTHH:mm:ss that I have specified',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();

        var val = moment.utc('2013-11-11T14:00:00-00:00');
        var expected = moment('2013-11-11T14:00:00Z');
        val.zone().should.not.equal(expected.zone());

        var valDisplay = tpDateTime.getDisplayTime(val, TidepoolDateTime.FORMAT_YYYY_MM_DD_HH_MM_SS);
        var expectedDisplay = expected.format(TidepoolDateTime.FORMAT_YYYY_MM_DD_HH_MM_SS);
        valDisplay.should.equal(expectedDisplay);

        done();
      });
    });
    describe("isValidDateTime", function() {
      it('should return true for Oct 1 2013 2:30 AM',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        tpDateTime.isValidDateTime('Oct 1 2013 2:30 AM').should.be.true;
        
        done();
      });
      it('should return true for 22/09/2013 11:11',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
    
        tpDateTime.isValidDateTime('22/09/2013 11:11').should.be.true;
        
        done();
      });
      it('should return false for junk',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        tpDateTime.isValidDateTime('junk').should.be.false;
        
        done();
      });
      it('should return false for empty',function(done){
        var TidepoolDateTime, tpDateTime, convertedUTC, isUTC, displayDate;

        TidepoolDateTime = require('../lib/');

        tpDateTime = new TidepoolDateTime();
        
        tpDateTime.isValidDateTime('').should.be.false;
        
        done();
      });
    });
  });
});