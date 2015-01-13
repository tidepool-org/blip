/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('lodash');

var dt = require('../../js/data/util/datetime');

var nurseshark = require('../../plugins/nurseshark');

describe('local-only tests', function() {
  describe('nurseshark', function() {
    describe('on real data', function() {
      var data = require('../../example/data/blip-input.json');
      it('should succeed without error', function() {
        var res = nurseshark.processData(data);
        assert.isArray(res.processedData);
        var ok = 0;
        for (var i = 0; i < res.erroredData.length; ++i) {
          var error = res.erroredData[i];
          if (error.errorMessage === 'Bad pump status deviceMeta.') {
            ok += 1;
          }
          else if (error.errorMessage === 'Overlapping CareLink upload.') {
            ok += 1;
          }
          else if (error.errorMessage === 'Basal with null/zero duration.') {
            ok += 1;
          }
        }
        expect(res.erroredData.length - ok).to.equal(0);
      });
    });
  });
});