/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2020, Diabeloop
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

import React from 'react';
import i18next from 'i18next';
import { mount } from 'enzyme';

import { formatClassesAsSelector } from '../../helpers/cssmodules';

import ConfidentialToolTip from '../../../src/components/daily/confidentialtooltip/ConfidentialTooltip';
import styles from '../../../src/components/daily/confidentialtooltip/ConfidentialTooltip.css';
import tooltipStyles from '../../../src/components/common/tooltips/Tooltip.css';

const ToolTip = {
  type: 'deviceEvent',
  subType: 'confidential',
  duration: {
    units: 'hours',
    value: 3,
  },
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

describe('ConfidentialTooltip', () => {
  it('should render without issue with 2 items and 1 icon', () => {
    const t = i18next.t.bind(i18next);

    const wrapper = mount(<ConfidentialToolTip {...props} confidential={ToolTip} />);
    expect(wrapper.
      find(formatClassesAsSelector(tooltipStyles.content)))
      .to.have.length(1);
    expect(wrapper.
      find(formatClassesAsSelector('MuiGrid-item')))
      .to.have.length(2);
    expect(wrapper
      .find(formatClassesAsSelector('MuiSvgIcon-root'))
      .at(0)
      .find(formatClassesAsSelector(styles.icon)))
      .to.have.length(1);
    expect(wrapper
      .find(formatClassesAsSelector('MuiGrid-item'))
      .at(1)
      .text())
      .to.equal(t('Confidential mode'));
    });

});
