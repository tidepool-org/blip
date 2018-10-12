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

var _ = require('lodash');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var annotations = require('../js/plot/util/annotations/annotationdefinitions');

// change to true when you want to view all produced annotations
var logging = false;

describe('annotation definitions', function() {
  describe('main text', function() {
    Object.keys(annotations.MAIN_TEXT).forEach(function(key) {
      describe(key, function() {
        it('should return a string', function() {
          if (logging) {
            console.log('Main text annotation for', key + ':');
            console.log();
            console.log(annotations.MAIN_TEXT[key]('demo', annotations));
            console.log();
          }
          assert.isString(annotations.MAIN_TEXT[key]('demo', annotations));
        });
      });
    });

    describe('default', function() {
      it('should return a string', function() {
        assert.isString(annotations.default());
      });
      it('should have a source when possible', function() {
        var expected = 'We can\'t be 100% certain of the data displayed here because of how Demo reports the data.';
        expect(annotations.default('demo')).to.equal(expected);
      });
    });
  });

  describe('lead text', function() {
    Object.keys(annotations.LEAD_TEXT).forEach(function(key) {
      describe(key, function() {
        it('should return a string', function() {
          if (logging) {
            console.log('Lead text annotation for', key + ':');
            console.log();
            console.log(annotations.LEAD_TEXT[key]());
            console.log();
          }
          assert.isString(annotations.LEAD_TEXT[key]());
        });
      });
    });
  });

  describe('disabled', function() {
    it('should define an array of disabled annotations', function() {
      expect(annotations.DISABLED).to.eql([
        'basal/auto',
        'bg/out-of-range',
        'medtronic600/smbg/bg-reading-received',
        'medtronic600/smbg/user-accepted-remote-bg',
        'medtronic600/smbg/user-rejected-remote-bg',
        'medtronic600/smbg/remote-bg-acceptance-screen-timeout',
        'medtronic600/smbg/bg-si-pass-result-recd-frm-gst',
        'medtronic600/smbg/bg-si-fail-result-recd-frm-gst',
        'medtronic600/smbg/bg-sent-for-calib',
        'medtronic600/smbg/user-rejected-sensor-calib',
        'medtronic600/smbg/entered-in-bg-entry',
        'medtronic600/smbg/entered-in-meal-wizard',
        'medtronic600/smbg/entered-in-bolus-wizard',
        'medtronic600/smbg/entered-in-sensor-calib',
        'medtronic600/smbg/entered-as-bg-marker',
        'wizard/target-automated',
      ]);
    });
  });
});
