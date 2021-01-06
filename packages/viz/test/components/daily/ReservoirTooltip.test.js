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

import React from 'react';

import { mount } from 'enzyme';

import { formatClassesAsSelector } from '../../helpers/cssmodules';

import ReservoirTooltip from '../../../src/components/daily/reservoirtooltip/ReservoirTooltip';
import styles from '../../../src/components/daily/reservoirtooltip/ReservoirTooltip.css';
import { DEFAULT_MANUFACTURER } from '../../../src/utils/constants';

const normal = {
  type: 'deviceEvent',
  subType: 'reservoirChange',
  pump: { manufacturer: [DEFAULT_MANUFACTURER]}
};

const normalCartridge = {
  type: 'deviceEvent',
  subType: 'reservoirChange',
  pump: { manufacturer: 'Roche'}
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

describe('reservoirTooltip', () => {
  it('should render without issue when all properties provided for Default manufacturer', () => {
    const wrapper = mount(<ReservoirTooltip {...props} reservoir={normal} />);
    expect(wrapper.find(formatClassesAsSelector(styles.pa))).to.have.length(1);
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(0)
      .find(formatClassesAsSelector(styles.label))
      .text()).to.equal('Infusion site change');
    });

  it('should render without issue when all properties provided for Roche manufacturer', () => {
    const wrapper = mount(<ReservoirTooltip {...props} reservoir={normalCartridge} />);
    expect(wrapper.find(formatClassesAsSelector(styles.pa))).to.have.length(1);
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(0)
      .find(formatClassesAsSelector(styles.label))
      .text()).to.equal('Reservoir Change');
    });
  
  });
