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

var salinity = require('salinity');
var expect = salinity.expect;
var moment = require('moment');
/*
Timezone offsets from UTC see http://www.timeanddate.com
*/
var CEST_OFFSET_DAYLIGHTSAVINGS = -120;
/*
Raw time as per many devices that give no zone info
*/
var FIRST_OCT_2013_230AM_NO_ZONE = '10/1/13 02:30:00';
/*
Raw time as per many devices that give no zone info
*/
var TWENTYFORTH_SEPT_2013_230AM_NO_ZONE = '9/24/13 02:30:00';
/*
Diasend Raw Time
*/
var DIASEND_TWELVE_OCT_2013_14_NO_ZONE = '12/10/2013 14:00';

/*
Time with zone information
*/
var TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE = '2013-10-22T14:57:09+13:00';

describe('Tidepool Dates', function() {

  var Sundial;
  var sundial;

  beforeEach(function () {
    Sundial = require('../lib/');
    sundial = new Sundial();
  });


  describe('sundial',function(){
    it('should not break require',function(done){
      expect(sundial).exists;
      done();
    });

    it('should have convertToAdjustedUTC method',function(done){
      expect(sundial.convertToAdjustedUTC()).exists;
      done();
    });
    it('should have getDisplayTime method',function(done){
      expect(sundial.getDisplayTime()).exists;
      done();
    });
    it('should have getMoment method',function(done){
      expect(sundial.getMoment()).exists;
      done();
    });
    it('should have getUtcString method',function(done){
      expect(sundial.getUtcString()).exists;
      done();
    });
    it('should have format for local',function(done){
      expect(sundial.FORMAT_LOCAL).exists;
      done();
    });
    it('should have format for YYYY-MM-DDTHH:mm:ss',function(done){
      expect(sundial.FORMAT_YYYY_MM_DD_HH_MM_SS).exists;
      done();
    });
    describe('getMoment', function() {
      it('should return instance of moment',function(done){
        var givenMoment = sundial.getMoment();

        expect(moment.isMoment(givenMoment())).to.be.true;

        done();
      });
    });
    describe('convertToAdjustedUTC', function() {
      it('should convert sundial to utc string',function(done){

        var convertedUTC = sundial.convertToAdjustedUTC(
          FIRST_OCT_2013_230AM_NO_ZONE,
          'MM/DD/YYTHH:mm:ss',
          CEST_OFFSET_DAYLIGHTSAVINGS
        );

        var isUTC = convertedUTC.indexOf('+00:00') !=-1 ? true : false;

        expect(isUTC).to.be.true;

        done();
      });
      it('should convert to UTC time with a timezoneOffset of 0', function(){
        var convertedUTC = sundial.convertToAdjustedUTC('02/05/14T01:01:01', 'MM/DD/YYTHH:mm:ss', 0);
        expect(convertedUTC).to.equal('2014-02-05T01:01:01+00:00');
      });
      it('should use the given offset when the date does no include it and be utc',function(done){

        var convertedUTC = sundial.convertToAdjustedUTC(
          FIRST_OCT_2013_230AM_NO_ZONE,
          'MM/DD/YYTHH:mm:ss',
          CEST_OFFSET_DAYLIGHTSAVINGS
        );

        expect(convertedUTC).to.equal('2013-10-01T00:30:00+00:00');

        done();
      });

      it('should throw expection when offset parameter is not included',function(done){

        expect(function(){
          sundial.convertToAdjustedUTC(FIRST_OCT_2013_230AM_NO_ZONE, 'MM/DD/YYTHH:mm:ss');
        })
          .to
          .throw('Sorry but userOffsetFromUTC is required');

        done();
      });

      it('should not throw an expection when offset is the sundial and not passed ',function(done){

        expect(function(){
          sundial.convertToAdjustedUTC(TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE);
        })
          .to.not
          .throw();

        done();
      });
      it('should return utc sundial string when given sundial that contains offset',function(done){

        var convertedUTC = sundial.convertToAdjustedUTC(TWENTYSECOND_OCT_2013_257PM_WITH_NZDT_ZONE);

        var isUTC = convertedUTC.indexOf('+00:00') !=-1 ? true : false;

        expect(isUTC).to.be.true;

        done();
      });
      it('should return converted dates year as 2013 for raw format of 9/24/13',function(done){

        var convertedUTC = sundial.convertToAdjustedUTC(
          TWENTYFORTH_SEPT_2013_230AM_NO_ZONE,
          'MM/DD/YYTHH:mm:ss',
          CEST_OFFSET_DAYLIGHTSAVINGS
        );

        expect(convertedUTC).to.equal('2013-09-24T00:30:00+00:00');
        done();
      });
      it('should return converted dates year as 2013 for raw format of 12/10/2013',function(done){

        var convertedUTC = sundial.convertToAdjustedUTC(
          DIASEND_TWELVE_OCT_2013_14_NO_ZONE,
          'DD/MM/YYYYTHH:mm:ss',
          CEST_OFFSET_DAYLIGHTSAVINGS
        );

        expect(convertedUTC).to.equal('2013-10-12T12:00:00+00:00');
        done();
      });
    });
    describe('getDisplayTime', function() {
      it('should return string in format of local time which is default',function(done){
        var val = moment.utc('2013-11-11T14:00:00-00:00');
        var expected = moment('2013-11-11T14:00:00Z');
        expect(sundial.getDisplayTime(val)).to.equal(expected.format(Sundial.FORMAT_LOCAL));

        done();
      });
      it('should return string in format YYYY-MM-DDTHH:mm:ss that I have specified',function(done){
        var val = moment.utc('2013-11-11T14:00:00-00:00');
        var expected = moment('2013-11-11T14:00:00Z');

        var valDisplay = sundial.getDisplayTime(val, Sundial.FORMAT_YYYY_MM_DD_HH_MM_SS);
        var expectedDisplay = expected.format(Sundial.FORMAT_YYYY_MM_DD_HH_MM_SS);
        expect(valDisplay).to.equal(expectedDisplay);

        done();
      });
    });
    describe('isValidDateTime', function() {
      it('should return true for Oct 1 2013 2:30 AM',function(done){
        expect(sundial.isValidDateTime('Oct 1 2013 2:30 AM')).to.be.true;

        done();
      });
      it('should return true for 22/09/2013 11:11',function(done){
        expect(sundial.isValidDateTime('22/09/2013 11:11')).to.be.true;

        done();
      });
      it('should return false for junk',function(done){
        expect(sundial.isValidDateTime('junk')).to.be.false;

        done();
      });
      it('should return false for empty',function(done){
        expect(sundial.isValidDateTime('')).to.be.false;

        done();
      });
    });

    describe('getUtcString', function() {
      it('returns a string',function(done){

        var utcString = sundial.getUtcString();
        expect(utcString).is.a.String;
        done();
      });

      it('returns a valid date',function(done){

        var utcString = sundial.getUtcString();
        expect(moment(utcString).isValid()).is.true;

        done();
      });

      it('is an ISO string',function(done){

        var utcString = sundial.getUtcString();
        var expectedString = new Date(utcString).toISOString();

        expect(utcString).to.equal(expectedString);

        done();
      });


    });

  });
});