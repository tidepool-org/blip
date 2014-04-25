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

/* jshint expr: true, -W015 */
'use strict';

// Require to attach things to Rx prototype
require('../../app/core/lib/devicedata');

var Rx = window.Rx;

var expect = require('salinity').expect;

describe('dataHelpers', function(){
  describe('tidepoolConvertBolus', function(){
    it('combines boluses', function(done){
      Rx.Observable.fromArray(
        [{
           _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 3.6,
           type: 'bolus', subType: 'dual/normal', joinKey: 'myJoinKey',
           source: 'demo'
         },
         {
           _id: 'abcde', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'myJoinKey',
           duration: 14400000, source: 'demo'
         },
         {
           _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
           type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey',
           source: 'demo'
         },
         {
           _id: '12345', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'yourJoinKey',
           duration: 14400000, source: 'demo'
         }])
        .tidepoolConvertBolus()
        .toArray()
        .subscribe(
        function(converted) {
          expect(converted).deep.equals(
            [{
               _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 5.3,
               type: 'bolus',
               duration: 14400000,
               extended: true, initialDelivery: 3.6, extendedDelivery: 1.7,
               source: 'demo'
             },
             {
               _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 1.8,
               type: 'bolus',
               duration: 14400000,
               extended: true, initialDelivery: 0.1, extendedDelivery: 1.7,
               source: 'demo'
             }]
          );
          done();
        }
      );
    });

    it('fails if it gets something with the same subType before completing its current bolus', function(done){
      Rx.Observable.fromArray(
          [{
             _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 3.6,
             type: 'bolus', subType: 'dual/normal', joinKey: 'myJoinKey'
           },
           {
             _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
             type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey'
           },
           {
             _id: 'abcde', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
             type: 'bolus', subType: 'dual/square', joinKey: 'myJoinKey',
             duration: 14400000
           },
           {
             _id: '12345', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
             type: 'bolus', subType: 'dual/square', joinKey: 'yourJoinKey',
             duration: 14400000
           }])
        .tidepoolConvertBolus()
        .subscribe(
        function(e){
          done(new Error('onNext should never get called'));
        },
        function(err){
          expect(err).to.exist;
          done();
        },
        function(){
          done(new Error('onComplete should never get called'));
        }
      );
    });

    it('fails if it gets events with different joinKeys before completing its current bolus', function(done){
      Rx.Observable.fromArray(
        [{
           _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 3.6,
           type: 'bolus', subType: 'dual/normal', joinKey: 'myJoinKey'
         },
         {
           _id: '12345', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'yourJoinKey',
           duration: 14400000
         },
         {
           _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
           type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey'
         },
         {
           _id: 'abcde', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'myJoinKey',
           duration: 14400000
         }])
        .tidepoolConvertBolus()
        .subscribe(
        function(e){
          done(new Error('onNext should never get called'));
        },
        function(err){
          expect(err).to.exist;
          done();
        },
        function(){
          done(new Error('onComplete should never get called'));
        }
      );
    });

    it('passes through incomplete bolus records when completed', function(done){
      Rx.Observable.fromArray(
        [{
           _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 3.6,
           type: 'bolus', subType: 'dual/normal', joinKey: 'myJoinKey',
           source: 'demo'
         },
         {
           _id: 'abcde', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'myJoinKey',
           duration: 14400000, source: 'demo'
         },
         {
           _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
           type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey',
           source: 'demo'
         }])
        .tidepoolConvertBolus()
        .toArray()
        .subscribe(
        function(converted) {
          expect(converted).deep.equals(
            [{
               _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 5.3,
               type: 'bolus',
               duration: 14400000,
               extended: true, initialDelivery: 3.6, extendedDelivery: 1.7,
               source: 'demo'
             },
             {
               _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
               type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey',
               _unmatched: true, source: 'demo'
             }]
          );
          done();
        }
      );
    });

    it('lets non-boluses pass through', function(done){
      Rx.Observable.fromArray(
        [{
           _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 3.6,
           type: 'bolus', subType: 'dual/normal', joinKey: 'myJoinKey',
           source: 'demo'
         },
         { _id: 'billy', type: 'howdy-ho'},
         {
           _id: 'abcde', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'myJoinKey',
           source: 'demo', duration: 14400000
         },
         { _id: 'sally', type: 'you\'re cute'},
         {
           _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 0.1,
           type: 'bolus', subType: 'dual/normal', joinKey: 'yourJoinKey',
           source: 'demo'
         },
         { _id: 'billy2', type: 'well, thank you.  Here\'s my number, call me maybe?'},
         { _id: 'sally2', type: 'Ok Maybe.  I\'m Sally'},
         {
           _id: '12345', deviceTime: '2014-01-01T01:00:00Z', value: 1.7,
           type: 'bolus', subType: 'dual/square', joinKey: 'yourJoinKey',
           duration: 14400000, source: 'demo'
         },
         { _id: 'billy3', type: 'Do you consider yourself a comedian?' }])
        .tidepoolConvertBolus()
        .toArray()
        .subscribe(
        function(converted) {
          expect(converted).deep.equals(
            [{
               _id: 'abcd', deviceTime: '2014-01-01T01:00:00', value: 5.3,
               type: 'bolus',
               duration: 14400000,
               extended: true, initialDelivery: 3.6, extendedDelivery: 1.7,
               source: 'demo'
             },
             { _id: 'billy', type: 'howdy-ho'},
             { _id: 'sally', type: 'you\'re cute'},
             {
               _id: '1234', deviceTime: '2014-01-01T01:00:00', value: 1.8,
               type: 'bolus',
               duration: 14400000,
               extended: true, initialDelivery: 0.1, extendedDelivery: 1.7,
               source: 'demo'
             },
             { _id: 'billy2', type: 'well, thank you.  Here\'s my number, call me maybe?'},
             { _id: 'sally2', type: 'Ok Maybe.  I\'m Sally'},
             { _id: 'billy3', type: 'Do you consider yourself a comedian?' }]
          );
          done();
        }
      );
    });
  });

  describe('convertBasal', function(){
    it('combines basals', function(done){
      Rx.Observable.fromArray(
        [{
           _id: 'abcd', type: 'basal', deliveryType: 'scheduled',
           deviceTime: '2014-03-07T01:00:00', value: 0.65,
           scheduleName: 'night-shift', source: 'carelink'
         },
         {
           _id: 'abcde', type: 'basal', deliveryType: 'temp',
           deviceTime: '2014-03-07T01:38:27', value: 1.7,
           duration: 3600000, source: 'carelink'
         },
         {
           _id: 'abcdef', type: 'basal', deliveryType: 'scheduled',
           deviceTime: '2014-03-07T04:00:00', value: 0.32,
           scheduleName: 'night-shift', source: 'carelink'
         },
         {
           _id: 'abcdefg', type: 'basal', deliveryType: 'scheduled',
           deviceTime: '2014-03-07T12:00:00', value: 1.02,
           scheduleName: 'night-shift', source: 'carelink'
         }])
        .tidepoolConvertBasal()
        .toArray()
        .subscribe(
        function(converted) {
          expect(converted).deep.equals(
            [{
               _id: 'abcd', type: 'basal-rate-segment', deliveryType: 'scheduled',
               deviceTime: '2014-03-07T01:00:00', start: '2014-03-07T01:00:00',
               end: '2014-03-07T04:00:00', value: 0.65,
               scheduleName: 'night-shift', source: 'carelink'
             },
             {
               _id: 'abcde', type: 'basal-rate-segment', deliveryType: 'temp',
               deviceTime: '2014-03-07T01:38:27', start: '2014-03-07T01:38:27',
               end: '2014-03-07T02:38:27', value: 1.7,
               duration: 3600000, source: 'carelink'
             },
             {
               _id: 'abcdef', type: 'basal-rate-segment', deliveryType: 'scheduled',
               deviceTime: '2014-03-07T04:00:00', start: '2014-03-07T04:00:00',
               end: '2014-03-07T12:00:00', value: 0.32,
               scheduleName: 'night-shift', source: 'carelink'
             },
             {
               _id: 'abcdefg', type: 'basal-rate-segment', deliveryType: 'scheduled',
               deviceTime: '2014-03-07T12:00:00', start: '2014-03-07T12:00:00',
               end: null, value: 1.02,
               scheduleName: 'night-shift', source: 'carelink'
             }
            ]
          );
          done();
        }
      );
    });
  });
});
