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

const chai = require('chai');
var id = require('../lib/id');

const { expect } = chai;

describe('id generator', function () {
  it('fails when item is null', function (done) {
    try{
      id.generateId(['here',null,'this',]);
    }catch(error){
      expect(error).to.exist;
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
      var myIdOne = id.generateId(['carelink','2014-12-17T21:40:21+13:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkdXIiOjM2MDAsImV4cCI6MTQxODgwOTE3MSwic3ZyIjoibm8iLCJ1c3IiOiJmYThiYmU2OTE4In0.372YtFsvoeTBzqLinf8FQC6enzNpiKvToI30P_c4Kpo']);
      expect(myIdOne).is.not.empty;
      var myIdTwo = id.generateId(['carelink','2014-12-17T21:42:19+13:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkdXIiOjM2MDAsImV4cCI6MTQxODgwOTE3MSwic3ZyIjoibm8iLCJ1c3IiOiJmYThiYmU2OTE4In0.372YtFsvoeTBzqLinf8FQC6enzNpiKvToI30P_c4Kpo']);
      expect(myIdTwo).is.not.empty;
      expect(myIdOne).to.not.equal(myIdTwo);
      done();
    }catch(error){
      expect(error).is.empty;
    }
  });

  it('crypto sha1 is the same as other sha1', function (done) {

    /* Python output generated with:
     *
     * python -c "import hashlib; import base64; h=hashlib.sha1(); h.update('abc_def_hij_'); print base64.b64encode(h.digest());"
     */
    var PYTHON_SHA1 = '4uXsTMx01+aqPTIBWjz/WXJdwhg=';

    var ourSha1 = id.generateId(['abc','def','hij']);
    expect(ourSha1).to.equal(PYTHON_SHA1);
    done();
  });
});
