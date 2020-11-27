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

var device = require('../js/data/util/device');
var constants = require('../plugins/blip/basics/logic/constants');

describe('device utility functions', function() {
  describe('getLatestPumpUpload', function() {
    it('should return a pump with proper data', function() {
      var data = [
        {
          deviceTags: ['bgm'],
          source: 'BGM',
        },
        {
          deviceTags: ['insulin-pump'],
          source: constants.TANDEM,
        },
        {
          deviceTags: ['insulin-pump', 'bgm'],
          source: constants.INSULET,
        },
        {
          deviceTags: ['cgm'],
          source: 'CGM',
        },
      ];

      expect(device.getLatestPumpUpload(data)).to.eql(data[2]);
    });

    it('should return `undefined` without proper data', function() {
      var patientData = {
        grouped: {
          pumpSettings: [],
        },
      };

      expect(device.getLatestPumpUpload(patientData)).to.equal(undefined);
      expect(device.getLatestPumpUpload([])).to.equal(undefined);
    });
  });

  describe('isAutomatedBasalDevice', function() {
    it('should return `true` for an upload record for a pump with automated basal delivery capabilities', function() {
      var upload = {
        deviceModel: '1780',
        source: constants.MEDTRONIC,
      };

      expect(device.isAutomatedBasalDevice(upload)).to.be.true;
    });

    it('should return `false` for an upload record for a pump without automated basal delivery capabilities', function() {
      var upload = {
        deviceModel: '723',
        source: constants.MEDTRONIC,
      };

      expect(device.isAutomatedBasalDevice(upload)).to.be.false;
    });
  });
});
