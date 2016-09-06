/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import Medtronic from '../../components/settings/medtronic/Medtronic';
import Tandem from '../../components/settings/tandem/Tandem';
import Omnipod from '../../components/settings/omnipod/Omnipod';
import Animas from '../../components/settings/animas/Animas';

export function getChart(deviceType) {
  const chartType = deviceType.toLowerCase();
  if (chartType === 'carelink') {
    return Medtronic;
  } else if (chartType === 'tandem') {
    return Tandem;
  } else if (chartType === 'insulet') {
    return Omnipod;
  } else if (chartType === 'animas') {
    return Animas;
  }
  return null;
}
