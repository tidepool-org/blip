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

/* eslint-disable lodash/prefer-lodash-method */

import _ from 'lodash';

import PrintView from './PrintView';

import {
  getDeviceMeta,
} from '../../utils/settings/data';

class SettingsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.manufacturer = _.get(data, 'source', '').toLowerCase();
    this.deviceMeta = getDeviceMeta(data, opts.timePrefs);
  }

  render() {
    // console.log('data', this.data);
    // console.log('deviceMeta', this.deviceMeta);
    this.doc.addPage();
    this.renderDeviceMeta();
    this.renderBasalSettings();
  }

  renderDeviceMeta() {
    this.doc
      .font(this.boldFont)
      .fontSize(this.defaultFontSize)
      .text(this.data.source, { continued: true })
      .font(this.font)
      .text(` Uploaded on ${this.deviceMeta.uploaded}`, { continued: true })
      .text(` › Serial Number: ${this.deviceMeta.serial}`)
      .moveDown();

    this.resetText();
  }

  renderBasalSettings() {
    this.renderSectionHeading('Basal Rates');
  }
}

export default SettingsPrintView;
