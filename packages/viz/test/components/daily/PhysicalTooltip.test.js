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

import PhysicalTooltip from '../../../src/components/daily/physicaltooltip/PhysicalTooltip';
import styles from '../../../src/components/daily/physicaltooltip/PhysicalTooltip.css';

const normal = {
  type: 'physicalActivity',
  duration: {
    units: 'seconds',
    value: 600.0,
  },
  reportedIntensity: 'medium',
};

const normalMinutes = {
  type: 'physicalActivity',
  duration: {
    units: 'minutes',
    value: 60,
  },
  reportedIntensity: 'medium',
};

const normalHours = {
  type: 'physicalActivity',
  duration: {
    units: 'hours',
    value: 1.5,
  },
  reportedIntensity: 'medium',
};

const withInputTime = {
  type: 'physicalActivity',
  duration: {
    units: 'minutes',
    value: 60,
  },
  reportedIntensity: 'medium',
  inputTime: '2020-07-31T15:40:00.000Z',
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

const timePrefsUtc = {
  timezoneAware: true, 
  timezoneName: "UTC", 
  timezoneOffset: 0
};

describe('PhysicalTooltip', () => {
  it('should render without issue when all properties provided', () => {
    const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={normal} />);
    expect(wrapper.find(formatClassesAsSelector(styles.pa))).to.have.length(3);
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(0)
      .find(formatClassesAsSelector(styles.label))
      .text()).to.equal('Physical Activity');
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(1)
      .find(formatClassesAsSelector(styles.label))
      .text()).to.equal('Intensity');
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(1)
      .children()).to.have.length(2);
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(2)
      .find(formatClassesAsSelector(styles.label))
      .text()).to.equal('Duration');
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(2)
      .children()).to.have.length(2);
    });

  describe('Get PhysicalTooltip Duration', () => {
    // eslint-disable-next-line max-len
    it('should return 10 for a 600 seconds physical activity', () => {
      const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={normal} />);
      const d  = { 
        units: 'minutes', 
        value: 10 
      };
      expect(wrapper.instance().getDurationInMinutes(normal)).to.deep.equal(d);
      expect(wrapper
        .find(formatClassesAsSelector(styles.pa))
        .at(2)
        .find(formatClassesAsSelector(styles.value))
        .text()).to.equal(`${d.value} ${d.units}`);
    });
    it('should return 60 for a 60 minutes physical activity', () => {
      const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={normalMinutes} />);
      const d  = { 
        units: 'minutes', 
        value: 60 
      };
      expect(wrapper.instance().getDurationInMinutes(normalMinutes)).to.deep.equal(d);
      expect(wrapper
        .find(formatClassesAsSelector(styles.pa))
        .at(2)
        .find(formatClassesAsSelector(styles.value))
        .text()).to.equal(`${d.value} ${d.units}`);
    });
    it('should return 90 for a 1.5 hours physical activity', () => {
      const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={normalHours} />);
      const d  = { 
        units: 'minutes', 
        value: 90 
      };
      expect(wrapper.instance().getDurationInMinutes(normalHours)).to.deep.equal(d);
      expect(wrapper
        .find(formatClassesAsSelector(styles.pa))
        .at(2)
        .find(formatClassesAsSelector(styles.value))
        .text()).to.equal(`${d.value} ${d.units}`);
    });
  });
  describe('Get PhysicalTooltip intensity', () => {
    it('should return medium-pa for a medium intensity physical activity', () => {
    const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={normal} />);
    const d = 'medium-pa';
    expect(wrapper
      .find(formatClassesAsSelector(styles.pa))
      .at(1)
      .find(formatClassesAsSelector(styles.value))
      .text()).to.equal(`${d}`);
    });
  });
  describe('Get PhysicalTooltip inpuTime when property is available', () => {
    it('should contain the InputTime', () => {
      props.timePrefs = timePrefsUtc;
      const wrapper = mount(<PhysicalTooltip {...props} physicalActivity={withInputTime} />);
      const formattedInputTime = '3:40 pm';
      expect(wrapper.find(formatClassesAsSelector(styles.pa))).to.have.length(4);
      expect(wrapper
        .find(formatClassesAsSelector(styles.pa))
        .at(3)
        .find(formatClassesAsSelector(styles.label))
        .text()).to.equal('Entered at');
      expect(wrapper
        .find(formatClassesAsSelector(styles.pa))
        .at(3)
        .find(formatClassesAsSelector(styles.value))
        .text()).to.equal(`${formattedInputTime}`);
      });
  });
});
