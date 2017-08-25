/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import sundial from 'sundial';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

import SettingsPrintView from '../../../app/components/printview';
import PrintHeader from '../../../app/components/printheader';
import { MMOLL_UNITS } from '../../../app/core/constants';

const expect = chai.expect;

describe('SettingsPrintView', () => {
  const pumpSettingsData = {
    source: 'animas',
    type: 'pumpSettings',
    activeSchedule: 'normal',
    basalSchedules: [
      {
        name: 'normal',
        value: [
          {
            start: 0,
            rate: 0.85
          }
        ]
      }
    ],
    units: {
      carbs: 'grams',
      bg: MMOLL_UNITS,
    },
    bgTarget: [
      {
        start: 0,
        target: 4.9956731919409805,
        range: 1.3876869977613833
      }
    ],
    carbRatio: [
      {
        amount: 9,
        start: 0
      }
    ],
    insulinSensitivity: [
      {
        amount: 2.9418964352541326,
        start: 0
      }
    ],
    clockDriftOffset: 0,
    conversionOffset: 0,
    deviceId: 'DevId0987654321',
    deviceTime: '2016-08-22T13:31:55',
    guid: '5886768b-012e-453d-8e3e-2c5280995c47',
    id: '8372053933d14de3974c8d183c2a433d',
    time: '2016-08-22T01:31:55.605Z',
    timezoneOffset: 720,
    uploadId: 'SampleUploadId'
  };
  const props = {
    bgPrefs: {},
    currentPatientInViewId: '12ab32',
    timePrefs: {},
    patient: {
      profile: {
        fullName: 'Aaradhya Agarwal'
      },
      permissions: {
        note: {},
        view: {}
      }
    },
    patientData: {
      grouped: { pumpSettings: [pumpSettingsData]}
    },
  };

  it('should be a function', function() {
    expect(SettingsPrintView).to.be.a('function');
  });

  describe('render', function() {
    it('provides a settings container', function () {
      const wrapper = shallow(<SettingsPrintView {...props}/>);
      expect(wrapper.find(PumpSettingsContainer)).to.have.length(1);
    });
    it('provides a print header', function () {
      const wrapper = shallow(<SettingsPrintView {...props}/>);
      expect(wrapper.find(PrintHeader)).to.have.length(1);
    });
  });
});
