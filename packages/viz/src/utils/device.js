import _ from 'lodash';

import { AUTOMATED_BASAL_DEVICE_MODELS, getPumpVocabularies } from './constants';
import { deviceName as getDeviceName } from './settings/data';

/**
 * Get the latest upload datum
 * @param {Array} uploadData Array of Tidepool upload data
 * @returns {Object} The latest upload datum
 */
export function getLatestPumpUpload(uploadData = []) {
  return _.findLast(uploadData, { deviceTags: ['insulin-pump'] });
}

/**
 * Check if the provided upload datum was for an automated basal device
 * @param {String} manufacturer Manufacturer name
 * @param {String} deviceModel Device model number
 * @returns {Boolean}
 */
export function isAutomatedBasalDevice(manufacturer, deviceModel) {
  const models = _.get(AUTOMATED_BASAL_DEVICE_MODELS, getDeviceName(manufacturer), false);
  return (_.isBoolean(models) && models) || (_.isArray(models) && _.includes(models, deviceModel));
}

/**
 * Get a pump terminology vocabulary, with default fallbacks for missing keys
 * @param {String} manufacturer Manufacturer name
 * @returns {Object} pump vocabulary
 */
export function getPumpVocabulary(manufacturer) {
  const pumpVocabularies = getPumpVocabularies();
  const deviceName = getDeviceName(manufacturer);
  if (deviceName in pumpVocabularies) {
    return pumpVocabularies[deviceName];
  }
  console.warn(`Missing ${deviceName} in pumpVocabularies`);
  return pumpVocabularies.default;
}
