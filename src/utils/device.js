import _ from 'lodash';

import { AUTOMATED_BASAL_DEVICE_MODELS, pumpVocabulary } from './constants';
import { deviceName } from './settings/data';

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
  return _.includes(
    _.get(AUTOMATED_BASAL_DEVICE_MODELS, deviceName(manufacturer), []),
    deviceModel
  );
}

/**
 * Get a pump terminology vocabulary, with default fallbacks for missing keys
 * @param {String} manufacturer Manufacturer name
 * @returns {Object} pump vocabulary
 */
export function getPumpVocabulary(manufacturer) {
  return _.defaults(
    _.get(pumpVocabulary, deviceName(manufacturer), {}),
    pumpVocabulary.default
  );
}
