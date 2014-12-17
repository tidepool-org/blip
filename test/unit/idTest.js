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
var expect = require('salinity').expect;

var id = require('./../../lib/id');

describe('id generator', function () {
  it('fails when item is null', function (done) {
    try{
      id.generateId(['here',null,'this',]);
    }catch(error){
      expect(error).exists;
      done();
    }
  });

  it('works when given all it needs', function (done) {
    try{
      var myId = id.generateId(['here','is','opps']);
      expect(myId).is.not.empty;
      done();
    }catch(error){
      expect(error).is.empty;
    }
  });

  it('works when item is empty', function (done) {
    try{
      var myId = id.generateId(['here','is','opps','']);
      expect(myId).is.not.empty;
      done();
    }catch(error){
      expect(error).is.empty;
    }
  });

  it('makes diff ids', function (done) {
    try{
      var myIdOne = id.generateId(['carelink','token']);
      expect(myIdOne).is.not.empty;
      var myIdTwo = id.generateId(['carelinkto','ken']);
      expect(myIdTwo).is.not.empty;
      expect(myIdOne).to.not.equal(myIdTwo);
      done();
    }catch(error){
      expect(error).is.empty;
    }
  });
});