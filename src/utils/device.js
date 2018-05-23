import _ from 'lodash';

import { AUTOMATED_BASAL_DEVICE_MODELS } from './constants';

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
  return _.includes(_.get(AUTOMATED_BASAL_DEVICE_MODELS, manufacturer, []), deviceModel);
}
