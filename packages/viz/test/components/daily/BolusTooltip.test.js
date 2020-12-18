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
import { expect } from 'chai';

import { formatClassesAsSelector } from '../../helpers/cssmodules';

import BolusTooltip from '../../../src/components/daily/bolustooltip/BolusTooltip';
import styles from '../../../src/components/daily/bolustooltip/BolusTooltip.css';

const normal = {
  type: 'bolus',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelled = {
  type: 'bolus',
  normal: 2,
  expectedNormal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelled = {
  type: 'bolus',
  normal: 0,
  expectedNormal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const override = {
  type: 'wizard',
  bolus: {
    type: 'bolus',
    normal: 2,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 0,
    correction: 0,
  },
};

const underride = {
  type: 'wizard',
  bolus: {
    type: 'bolus',
    normal: 1,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 1,
    correction: 0.5,
  },
};

const withdblFull = {
  type: 'wizard',
  bolus: {
    type: 'bolus',
    normal: 5,
    subType: 'normal',
    normalTime: '2017-11-11T05:45:52.000Z',
    prescriptor: 'hybrid',
  },
  recommended: {
    carb: 5,
    net: 5,
  },
  inputTime: '2017-11-11T05:40:00.000Z',
  carbInput: 75,
  inputMeal: {
    fat: 'yes'
  },
};

const penBolus = {
  type: 'bolus',
  subType: 'pen',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const normalPrescriptor = {
  type: 'bolus',
  subType: 'normal',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
  prescriptor: 'auto',
};

const normalNoPrescriptor = {
  type: 'bolus',
  subType: 'normal',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
  prescriptor: 'manual',
};

const normalPrescriptorIob = {
  type: 'bolus',
  subType: 'normal',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
  prescriptor: 'hybrid',
  insulinOnBoard: 10.1
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

describe('BolusTooltip', () => {
  it('should render without issue when all properties provided', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={normal} />);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render delivered and subType for pen bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={penBolus} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bolus))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render delivered, subType and prescriptor for normal bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={normalPrescriptor} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bolus))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.prescriptor))).to.have.length(1);
  });

  it('should render delivered, subType and no prescriptor for normal bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={normalNoPrescriptor} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bolus))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.prescriptor))).to.have.length(0);
  });

  it('should render delivered, subType and prescriptor for normal bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={normalPrescriptorIob} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bolus))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.prescriptor))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.iob))).to.have.length(1);
  });

  it('should render programmed, undelivered and delivered for cancelled bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={cancelled} />);
    expect(wrapper.find(formatClassesAsSelector(styles.undelivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render programmed, undelivered and delivered for immediately cancelled bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={immediatelyCancelled} />);
    expect(wrapper.find(formatClassesAsSelector(styles.undelivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render suggested, override and delivered for override bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={override} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render suggested, underride and delivered for underride bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={underride} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render bolus type, delivered, inputTime, prescriptor and fat meal for normal bolus with wizard', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={withdblFull} />);
    expect(wrapper.find(formatClassesAsSelector(styles.bolus))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.input))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.prescriptor))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.fat))).to.have.length(1);
  });
});
