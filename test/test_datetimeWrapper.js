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
var testMoment = require('moment');

describe('Tidepool Dates', function() {

  describe('wrapper',function(){
    var datetimeWrapper;

    beforeEach(function () {
      datetimeWrapper = require('../sundial');
    });

    it('should not break require',function(done){
      expect(datetimeWrapper).exists;
      done();
    });
    it('should have utcString method',function(done){
      expect(datetimeWrapper.utcDateString()).exists;
      done();
    });
    it('should have getOffsetFromTime method',function(done){
      expect(datetimeWrapper.getOffsetFromTime()).exists;
      done();
    });
    it('should have getOffsetFromTime method',function(done){
      expect(datetimeWrapper.getOffsetFromTime()).exists;
      done();
    });
    it('should have getOffset method',function(done){
      expect(datetimeWrapper.getOffset()).exists;
      done();
    });

    it('should have formatForDisplay method',function(done){
      expect(datetimeWrapper.formatForDisplay()).exists;
      done();
    });

    describe('momentInstance', function() {
      it('returns a valid instance of moment',function(done){

        var givenMoment = datetimeWrapper.momentInstance();

        expect(testMoment.isMoment(givenMoment())).to.be.true;

        done();
      });
    });
    describe('getUtcString', function() {
      it('returns a string',function(done){

        var utcString = datetimeWrapper.utcDateString();
        expect(utcString).is.a.String;
        done();
      });

      it('returns a valid date',function(done){

        var utcString = datetimeWrapper.utcDateString();
        expect(testMoment(utcString).isValid()).is.true;

        done();
      });
      it('is an ISO string',function(done){

        var utcString = datetimeWrapper.utcDateString();
        //assume that Date toISOString method is correct
        var expectedString = new Date(utcString).toISOString();

        expect(utcString).to.equal(expectedString);

        done();
      });
    });
    describe('getOffset', function() {
      it('retuns an offset from utc in minutes',function(done){

        var offset = datetimeWrapper.getOffset();
        var usersZone = testMoment().zone();
        expect(offset).to.equal(usersZone);
        done();
      });
    });
    describe('getOffsetFromTime', function() {
      it('retuns an offset from utc in minutes',function(done){

        var timestamp = '2013-01-01T00:00:00-13:00';

        var offset = datetimeWrapper.getOffsetFromTime(timestamp);
        expect(offset).to.equal(780);
        done();
      });
    });
    describe('formatForDisplay', function() {
      it('returns a string formated as specified',function(done){

        var isoDateString = '2013-05-09T00:00:00Z';

        var formatedString = datetimeWrapper.formatForDisplay(isoDateString,'YYYY/MM/DD HH:mm');
        expect(formatedString).to.equal('2013/05/09 00:00');
        done();
      });

      it('returns a string formated as MMMM D [at] h:mm a',function(done){

        var isoDateString = '2013-05-09T00:00:00Z';

        var formatedString = datetimeWrapper.formatForDisplay(isoDateString);
        expect(formatedString).to.equal('May 9 at 12:00 am');
        done();
      });

    });

  });
});