/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
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

import {
  getDelivered,
  getProgrammed,
  getRecommended,
} from './bolus';

import { classifyBgValue } from './bloodglucose.js';

/**
 * Classification functions for tagging constious types of data
 *
 * @export
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds
 * @returns {Object} classifiers - functions keyed by data type
 */
export default function generateClassifiers(bgPrefs) {
  const { bgBounds } = bgPrefs;

  const classifers = {
    basal: (datum) => {
      if (_.includes(['scheduled', 'automated'], datum.deliveryType)) {
        return [];
      }

      return [datum.deliveryType];
    },

    bolus: (datum) => {
      const tags = [];
      const delivered = getDelivered(datum);
      const programmed = getProgrammed(datum);

      if (datum.wizard && !_.isEmpty(datum.wizard)) {
        const recommended = getRecommended(datum.wizard);
        tags.push('wizard');
        if (!isNaN(recommended)) {
          if (recommended > Math.max(delivered, programmed)) {
            tags.push('underride');
          } else if (Math.max(delivered, programmed) > recommended) {
            tags.push('override');
          }

          if (datum.wizard.recommended.correction > 0 &&
              datum.wizard.recommended.carb === 0) {
            tags.push('correction');
          }
        }
      } else {
        tags.push('manual');
      }

      if (programmed !== delivered) {
        tags.push('interrupted');
      }

      if (datum.extended > 0) {
        tags.push('extended');
      }

      return tags;
    },

    smbg: (datum) => {
      const tags = [];
      const bgCategory = classifyBgValue(bgBounds, datum.value, 'fiveWay');

      if (datum.subType && datum.subType === 'manual') {
        tags.push(datum.subType);
      } else {
        tags.push('meter');
      }

      switch (bgCategory) {
        case 'veryLow':
          tags.push('veryLow');
          break;
        case 'veryHigh':
          tags.push('veryHigh');
          break;
        default:
          break;
      }
      return tags;
    },
  };

  return classifers;
}
