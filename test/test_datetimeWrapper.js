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
    it('should have applyOffset method',function(done){
      expect(datetimeWrapper.applyOffset()).exists;
      done();
    });
    it('should have applyTimezone method',function(done){
      expect(datetimeWrapper.applyTimezone()).exists;
      done();
    });
    it('should have formatDeviceTime method',function(done){
      expect(datetimeWrapper.formatDeviceTime()).exists;
      done();
    });
    it('should have formatForDisplay method',function(done){
      expect(datetimeWrapper.formatForDisplay()).exists;
      done();
    });
    it('should have formatForStorage method',function(done){
      expect(datetimeWrapper.formatForDisplay()).exists;
      done();
    });
    it('should have getDeviceTimezone method',function(done) {
      expect(datetimeWrapper.getDeviceTimezone()).exists;
      done();
    });
    it('should have getMsFromMidnight method',function(done) {
      expect(datetimeWrapper.getMsFromMidnight()).exists;
      done();
    });
    it('should have getOffset method',function(done){
      expect(datetimeWrapper.getOffset()).exists;
      done();
    });
    it('should have getOffsetFromTime method',function(done){
      expect(datetimeWrapper.getOffsetFromTime()).exists;
      done();
    });
    it('should have getTimezones method',function(done){
      expect(datetimeWrapper.getTimezones()).exists;
      done();
    });
    it.skip('[TO REMOVE] should have momentInstance method',function(done){
      expect(datetimeWrapper.momentInstance()).exists;
    });
    it('should have isISODate method',function(done){
      expect(datetimeWrapper.isISODate()).exists;
      done();
    });
    it('should have isValidDate method',function(done){
      expect(datetimeWrapper.isValidDate()).exists;
      done();
    });
    it('should have parseAndApplyTimezone method',function(done){
      expect(datetimeWrapper.parseAndApplyTimezone()).exists;
      done();
    });
    it('should have utcString method',function(done){
      expect(datetimeWrapper.utcDateString()).exists;
      done();
    });

    describe('applyOffset', function() {
      it.skip('applyOffset tests');
    });

    describe('applyTimezone', function() {
      it.skip('applyTimezone tests');
    });

    describe('formatDeviceTime', function() {
      it.skip('formatDeviceTime tests');
    });

    describe('formatForDisplay', function() {
      var isoDateString = '2013-05-09T00:00:00-00:00';
      // formatForDisplay gives a display string in the browser's local timezone
      // so to test we need to create such a string and check
      // that results of formatting a local timezone-naive string
      // are identical to results of formatting an ISO string in the local browser/env
      var localString = testMoment(isoDateString).format('YYYY-MM-DDTHH:mm:ss');
      // get the browser and/or test env's local offset
      var offset = new Date().getTimezoneOffset();
      it('returns a string formated as MMMM D [at] h:mm a',function(done){
        // we expect the isoDateString and the localString to be different
        // except when the env is UTC (i.e., offset 0)
        if (offset !== 0) {
          expect(isoDateString.replace('-00:00', '')).not.to.equal(localString);
        }

        var formattedIsoString = datetimeWrapper.formatForDisplay(isoDateString);
        var formattedLocalString = datetimeWrapper.formatForDisplay(localString);
        expect(formattedIsoString).to.equal(formattedLocalString);
        done();
      });

      it('returns a string formatted to the mask specified',function(done){
        var mask = 'YYYY/MM/DD HH:mm';

        var formattedIsoString = datetimeWrapper.formatForDisplay(isoDateString, mask);
        var formattedLocalString = datetimeWrapper.formatForDisplay(localString, mask);
        expect(formattedIsoString).to.equal(formattedLocalString);
        done();
      });

    });

    describe('formatForStorage', function() {
      var basicTimestamp = '2014-10-03T13:23';
      var offsetMins = 780;

      it('returns a string',function(done){

        var utcString = datetimeWrapper.formatForStorage(basicTimestamp,offsetMins);
        expect(utcString).is.a.String;
        done();
      });

      it('returns a valid date',function(done){

        var utcString = datetimeWrapper.formatForStorage(basicTimestamp,offsetMins);
        expect(testMoment(utcString).isValid()).is.true;

        done();
      });
      it('has the offset from UTC',function(done){

        var utcString = datetimeWrapper.formatForStorage(basicTimestamp,offsetMins);
        var offsetFromTimestap = testMoment.parseZone(utcString).zone();
        expect(offsetFromTimestap).to.equal(offsetMins);

        done();
      });
      it('does not contain the `Z` designator for the zero UTC offset',function(done){

        var utcString = datetimeWrapper.utcDateString();

        expect(utcString).to.not.contain('Z');
        expect(utcString).to.not.contain('z');

        done();
      });
    });

    describe('getDeviceTimezone', function() {

      it('returns a valid timezone object',function(done){
        var timezone = datetimeWrapper.getDeviceTimezone();
        expect(timezone.name).to.have.length.above(0);
        expect(timezone.label).to.have.length.above(0);
        done();
      });
    });

    describe('getMsFromMidnight', function() {
      it.skip('getMsFromMidnight tests');
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

    describe('getTimezones', function() {

      it('returns all timezone objects',function(done){
        expect(datetimeWrapper.getTimezones()).to.have.length(131);
        done();
      });

      it('returns timezone objects with correct properties',function(done){
        datetimeWrapper.getTimezones().forEach(function(timezone){
          expect(timezone.name).to.have.length.above(0);
          expect(timezone.label).to.have.length.above(0);
        });
        done();
      });
    });

    describe('isISODate', function() {
      it('returns false for null',function(done){
        expect(datetimeWrapper.isISODate(null)).is.false;
        done();
      });

      it('returns false for empty string',function(done){
        expect(datetimeWrapper.isISODate('')).is.false;
        done();
      });

      it('returns false for invalid date',function(done){
        expect(datetimeWrapper.isISODate('Junk')).is.false;
        done();
      });

      it('return false for valid but non-ISO (i.e., timezone-naive) date',function(done){
        expect(datetimeWrapper.isISODate(new Date().toISOString().slice(0,-5))).is.false;
        done();
      });

      it('returns true for valid non-Zulu ISO date',function(done){
        expect(datetimeWrapper.isISODate(testMoment().parseZone().format())).is.true;
        done();
      });

      it('returns true for valid Zulu ISO date',function(done){
        expect(datetimeWrapper.isISODate(new Date().toISOString())).is.true;
        done();
      });
    });

    describe('isValidDate', function() {

      it('returns false for null',function(done){
        expect(datetimeWrapper.isValidDate(null)).is.false;
        done();
      });
      it('returns false for empty string',function(done){
        expect(datetimeWrapper.isValidDate('')).is.false;
        done();
      });
      it('returns false for invalid date',function(done){
        expect(datetimeWrapper.isValidDate('Junk')).is.false;
        done();
      });
      it('returns true for a valid date',function(done){
        expect(datetimeWrapper.isValidDate(new Date().toISOString())).is.true;
        done();
      });
    });

    describe('momentInstance', function() {
      it('returns a valid instance of moment',function(done){

        var givenMoment = datetimeWrapper.momentInstance();

        expect(testMoment.isMoment(givenMoment())).to.be.true;

        done();
      });
    });

    describe('parseAndApplyTimezone', function() {
      it.skip('parseAndApplyTimezone tests');
    });

    describe('utcDateString', function() {
      /*
       * http://en.wikipedia.org/wiki/Iso8601#Time_offsets_from_UTC
       */
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
      it('has the offset from UTC',function(done){

        var utcString = datetimeWrapper.utcDateString();

        var zoneOfTestRun = testMoment().zone();
        var offsetFromTimestap = testMoment.parseZone(utcString).zone();
        //may be zero as some of the test run services are configured as if they are in UTC
        expect(offsetFromTimestap).to.equal(zoneOfTestRun);

        done();
      });
      it('does not contain the `Z` designator for the zero UTC offset',function(done){

        var utcString = datetimeWrapper.utcDateString();

        expect(utcString).to.not.contain('Z');
        expect(utcString).to.not.contain('z');

        done();
      });
    });

  });
});
