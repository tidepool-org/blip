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
/* global it */

import _ from 'lodash';
import * as Constants from '../../../../app/core/constants';

const expect = chai.expect;

describe('constants', function() {
  it('should export an object', function() {
    expect(Constants).to.be.an('object');
  });

  it('should define correct labels for BG unit types', function() {
    expect(Constants.MGDL_UNITS).to.equal('mg/dL');
    expect(Constants.MMOLL_UNITS).to.equal('mmol/L');
  });

  it('should define common time spans in milliseconds values', function() {
    expect(Constants.MS_IN_DAY).to.equal(864e5);
    expect(Constants.MS_IN_HOUR).to.equal(864e5 / 24);
    expect(Constants.MS_IN_MIN).to.equal(864e5 / 24 / 60);
  });

  it('should define the glucose mmoll conversion factor as 18.01559', function() {
    expect(Constants.MGDL_PER_MMOLL).to.equal(18.01559);
  });

  it('should define the lbs per kg conversion factor as 2.2046226218', function() {
    expect(Constants.LBS_PER_KG).to.equal(2.2046226218);
  });

  it('should define the tidepool big data donation account email', function() {
    expect(Constants.TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL).to.equal('bigdata@tidepool.org');
  });

  it('should define the list of tidepool big data donation nonprofit partners', function() {
    expect(Constants.SUPPORTED_ORGANIZATIONS_OPTIONS).to.be.an('array');
    expect(_.map(Constants.SUPPORTED_ORGANIZATIONS_OPTIONS, 'value')).to.eql([
      'ADCES Foundation',
      'Beyond Type 1',
      'Breakthrough T1D',
      'Children With Diabetes',
      'DiabetesSisters',
      'Diabetes Youth Families (DYF)',
      'The Diabetes Link',
      'The diaTribe Foundation',
    ]);
  });

  it('should define the list of diabetes diagnosis types', function() {
    expect(Constants.DIABETES_TYPES()).to.be.an('array'); // eslint-disable-line new-cap
    expect(_.map(Constants.DIABETES_TYPES(), 'value')).to.eql([ // eslint-disable-line new-cap
      'type1',
      'type2',
      'type3c',
      'gestational',
      'prediabetes',
      'lada',
      'mody',
      'other',
    ]);
  });

  it('should define the list of bg data types', function() {
    expect(Constants.BG_DATA_TYPES).to.eql([
      'cbg',
      'smbg',
    ]);
  });

  it('should define the list of diabetes data types', function() {
    expect(Constants.DIABETES_DATA_TYPES).to.eql([
      'cbg',
      'smbg',
      'basal',
      'bolus',
      'wizard',
      'food',
    ]);
  });

  it('should define the list of all fetched data types', function() {
    expect(Constants.ALL_FETCHED_DATA_TYPES).to.eql([
      'cbg',
      'smbg',
      'basal',
      'bolus',
      'wizard',
      'food',
      'cgmSettings',
      'deviceEvent',
      'dosingDecision',
      'insulin',
      'physicalActivity',
      'pumpSettings',
      'reportedState',
      'upload',
      'water',
    ]);
  });

  it('should define DEFAULT_CLINIC_TIER', () => {
    expect(Constants.DEFAULT_CLINIC_TIER).to.equal('tier0100');
  });

  it('should define DEFAULT_CLINIC_PATIENT_COUNT_HARD_LIMIT', () => {
    expect(Constants.DEFAULT_CLINIC_PATIENT_COUNT_HARD_LIMIT).to.equal(250);
  });

  it('should define CLINIC_REMAINING_PATIENTS_WARNING_THRESHOLD', () => {
    expect(Constants.CLINIC_REMAINING_PATIENTS_WARNING_THRESHOLD).to.equal(40);
  });

  it('should define DEFAULT_CGM_SAMPLE_INTERVAL', () => {
    expect(Constants.DEFAULT_CGM_SAMPLE_INTERVAL).to.equal(5 * Constants.MS_IN_MIN);
  });

  it('should define DEFAULT_CGM_SAMPLE_INTERVAL_RANGE', () => {
    expect(Constants.DEFAULT_CGM_SAMPLE_INTERVAL_RANGE).to.eql([Constants.DEFAULT_CGM_SAMPLE_INTERVAL, Infinity]);
  });

  it('should define ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE', () => {
    expect(Constants.ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE).to.eql([Constants.MS_IN_MIN, Constants.MS_IN_MIN]);
  });
});
