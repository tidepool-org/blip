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
import _ from 'lodash';
import i18next from 'i18next';
import * as data from './data';
import { pumpVocabulary, AUTOMATED_DELIVERY } from '../constants';

const t = i18next.t.bind(i18next);

/**
 * basalSchedules
 * @param  {Object} settings    object with basal schedule properties
 *
 * @return {Array}              array of basal schedule names
 */
export function basalSchedules(settings) {
  return data.getScheduleNames(settings.basalSchedules);
}

/**
 * deviceMeta
 * @param  {Object} settingsData all settings data
 * @param  {Object} timePrefs    timezone preferences object
 *
 * @return {Object}              filtered meta data
 */
export function deviceMeta(settings, timePrefs) {
  return data.getDeviceMeta(settings, timePrefs);
}

/**
 * bolusTitle
 * @param  {String} manufacturer one of: animas, carelink, insulet, medtronic
 *
 * @return {String}              bolus title for given manufacturer
 */
export function bolusTitle(manufacturer) {
  const BOLUS_SETTINGS_LABEL_BY_MANUFACTURER = {
    animas: t('ezCarb ezBG'),
    insulet: t('Bolus Calculator'),
    medtronic: t('Bolus Wizard'),
  };
  return BOLUS_SETTINGS_LABEL_BY_MANUFACTURER[manufacturer];
}

/**
 * deviceName
 * @param  {String} manufacturer one of: animas, insulet, medtronic, diabeloop
 *
 * @return {String}              name for given manufacturer
 */
export function deviceName(manufacturer) {
  const DEVICE_DISPLAY_NAME_BY_MANUFACTURER = {
    animas: 'Animas',
    insulet: 'OmniPod',
    medtronic: 'Medtronic',
    diabeloop: 'Diabeloop',
  };
  return DEVICE_DISPLAY_NAME_BY_MANUFACTURER[manufacturer];
}

/**
 * scheduleLabel
 * @private
 */
function scheduleLabel(scheduleName, activeScheduleName, manufacturer, noUnits) {
  return data.getScheduleLabel(scheduleName, activeScheduleName, manufacturer, noUnits);
}

/**
 * basalRows
 * @private
 */
function basalRows(schedule, settings) {
  return data.processBasalRateData(settings.basalSchedules[schedule]);
}

/**
 * basalColumns
 * @private
 */
function basalColumns() {
  return data.startTimeAndValue('rate');
}

/**
 * basal
 *
 * @param  {Object} settings       object with pump settings data
 * @param  {String} manufacturer   one of: animas, carelink, insulet, medtronic, diabeloop
 * @return {Object}                object with basal title, columns and rows
 */
export function basal(schedule, settings, manufacturer) {
  const name = settings.basalSchedules[schedule].name;
  const lookupKey = (manufacturer === 'carelink') ? 'medtronic' : manufacturer;

  const isAutomated = _.get(pumpVocabulary, [
    data.deviceName(lookupKey),
    AUTOMATED_DELIVERY,
  ]) === name;

  return {
    scheduleName: name,
    activeAtUpload: (name === settings.activeSchedule),
    isAutomated,
    title: scheduleLabel(name, settings.activeSchedule, manufacturer, isAutomated),
    columns: isAutomated ? [] : basalColumns(),
    rows: isAutomated ? [] : basalRows(schedule, settings),
  };
}

/**
 * sensitivityTitle
 * @private
 */
function sensitivityTitle(manufacturer) {
  const ISF_BY_MANUFACTURER = {
    animas: t('ISF'),
    insulet: t('Correction factor'),
    medtronic: t('Sensitivity'),
    diabeloop: t('Sensitivity'),
  };
  return ISF_BY_MANUFACTURER[manufacturer];
}

/**
 * sensitivityColumns
 * @private
 */
function sensitivityColumns() {
  return data.startTimeAndValue('amount');
}

/**
 * sensitivityRows
 * @private
 */
function sensitivityRows(settings, units) {
  return data.processSensitivityData(
    settings.insulinSensitivity,
    units,
  );
}

/**
 * sensitivity
 *
 * @param  {Object} settings       object with pump settings data
 * @param  {String} manufacturer   one of: animas, carelink, insulet, medtronic, diabeloop
 * @param  {String} units          MGDL_UNITS or MMOLL_UNITS
 * @return {Object}                object with sensitivity title, columns and rows
 */
export function sensitivity(settings, manufacturer, units) {
  return {
    title: sensitivityTitle(manufacturer),
    columns: sensitivityColumns(),
    rows: sensitivityRows(settings, units),
  };
}

/**
 * ratioTitle
 * @private
 */
function ratioTitle(manufacturer) {
  const CARB_RATIO_BY_MANUFACTURER = {
    animas: t('I:C Ratio'),
    insulet: t('IC ratio'),
    medtronic: t('Carb Ratios'),
    diabeloop: t('Carb Ratios'),
  };
  return CARB_RATIO_BY_MANUFACTURER[manufacturer];
}

/**
 * ratioColumns
 * @private
 */
function ratioColumns() {
  return data.startTimeAndValue('amount');
}

/**
 * ratioRows
 * @private
 */
function ratioRows(settings) {
  return data.processCarbRatioData(settings.carbRatio);
}

/**
 * ratio
 *
 * @param  {Object} settings       object with pump settings data
 * @param  {String} manufacturer   one of: animas, carelink, insulet, medtronic, diabeloop
 * @return {Object}                object with ratio title, columns and rows
 */
export function ratio(settings, manufacturer) {
  return {
    title: ratioTitle(manufacturer),
    columns: ratioColumns(),
    rows: ratioRows(settings),
  };
}

/**
 * targetTitle
 * @private
 */
function targetTitle(manufacturer) {
  const BG_TARGET_BY_MANUFACTURER = {
    animas: t('BG Target'),
    insulet: t('Target BG'),
    medtronic: t('BG Target'),
    diabeloop: t('BG Target'),
  };
  return BG_TARGET_BY_MANUFACTURER[manufacturer];
}

/**
 * targetColumns
 * @private
 */
function targetColumns(manufacturer) {
  const BG_TARGET_COLS_BY_MANUFACTURER = {
    animas: [
      { key: 'start', label: t('Start time') },
      { key: 'columnTwo', label: t('Target') },
      { key: 'columnThree', label: t('Range') },
    ],
    insulet: [
      { key: 'start', label: t('Start time') },
      { key: 'columnTwo', label: t('Target') },
      { key: 'columnThree', label: t('Correct Above') },
    ],
    medtronic: [
      { key: 'start', label: t('Start time') },
      { key: 'columnTwo', label: t('Low') },
      { key: 'columnThree', label: t('High') },
    ],
    diabeloop: [
      { key: 'start', label: t('Start time') },
      { key: 'columnTwo', label: t('Low') },
      { key: 'columnThree', label: t('High') },
    ],
  };
  return BG_TARGET_COLS_BY_MANUFACTURER[manufacturer];
}

/**
 * targetRows
 * @private
 */
function targetRows(settings, units, manufacturer) {
  const BG_TARGET_ACCESSORS_BY_MANUFACTURER = {
    animas: { columnTwo: 'target', columnThree: 'range' },
    insulet: { columnTwo: 'target', columnThree: 'high' },
    medtronic: { columnTwo: 'low', columnThree: 'high' },
    diabeloop: { columnTwo: 'low', columnThree: 'high' },
  };
  return data.processBgTargetData(
    settings.bgTarget,
    units,
    BG_TARGET_ACCESSORS_BY_MANUFACTURER[manufacturer],
  );
}

/**
 * target
 *
 * @param  {Object} settings       object with pump settings data
 * @param  {String} manufacturer   one of: animas, carelink, insulet, medtronic, diabeloop
 * @param  {String} units          MGDL_UNITS or MMOLL_UNITS
 * @return {Object}                object with target title, columns and rows
 */
export function target(settings, manufacturer, units) {
  return {
    title: targetTitle(manufacturer),
    columns: targetColumns(manufacturer),
    rows: targetRows(settings, units, manufacturer),
  };
}
