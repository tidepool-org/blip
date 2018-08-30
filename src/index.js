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

require('./styles/colors.css');

import CBGDateTraceLabel from './components/trends/cbg/CBGDateTraceLabel';
import FocusedRangeLabels from './components/trends/common/FocusedRangeLabels';
import FocusedSMBGPointLabel from './components/trends/smbg/FocusedSMBGPointLabel';
import Loader from './components/common/loader/Loader';
import RangeSelect from './components/trends/cbg/RangeSelect';
import TwoOptionToggle from './components/common/controls/TwoOptionToggle';
import PumpSettingsContainer from './components/settings/common/PumpSettingsContainer';
import TrendsContainer from './components/trends/common/TrendsContainer';
import Tooltip from './components/common/tooltips/Tooltip';
import BolusTooltip from './components/daily/bolustooltip/BolusTooltip';
import SMBGTooltip from './components/daily/smbgtooltip/SMBGTooltip';
import CBGTooltip from './components/daily/cbgtooltip/CBGTooltip';

import reducers from './redux/reducers/';

import { formatBgValue } from './utils/format';
import { reshapeBgClassesToBgBounds } from './utils/bloodglucose';
import { selectDailyViewData } from './utils/print/data';

const i18next = require('i18next');

if (i18next.options.returnEmptyString === undefined) {
  // Return key if no translation is present
  i18next.init({ returnEmptyString: false, nsSeparator: '|' });
}

const components = {
  CBGDateTraceLabel,
  FocusedRangeLabels,
  FocusedSMBGPointLabel,
  Loader,
  RangeSelect,
  TwoOptionToggle,
  Tooltip,
  BolusTooltip,
  SMBGTooltip,
  CBGTooltip,
};

const containers = {
  PumpSettingsContainer,
  TrendsContainer,
};

const utils = {
  formatBgValue,
  reshapeBgClassesToBgBounds,
  selectDailyViewData,
};

export {
  components,
  containers,
  utils,
  reducers,
};
