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
import _ from 'lodash';

import { mount, shallow } from 'enzyme';

import { formatClassesAsSelector } from '../../helpers/cssmodules';

import BolusTooltip from '../../../src/components/daily/bolustooltip/BolusTooltip';
import styles from '../../../src/components/daily/bolustooltip/BolusTooltip.css';

const normal = {
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelled = {
  normal: 2,
  expectedNormal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelled = {
  normal: 0,
  expectedNormal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const override = {
  type: 'wizard',
  bolus: {
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
    normal: 1,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 1,
    correction: 0.5,
  },
};

const combo = {
  normal: 1,
  extended: 2,
  duration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledInNormalCombo = {
  normal: 0.2,
  expectedNormal: 1,
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledInExtendedCombo = {
  normal: 1,
  extended: 0.5,
  expectedExtended: 2,
  duration: 9e5,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const comboOverride = {
  type: 'wizard',
  bolus: {
    normal: 1.5,
    extended: 2.5,
    duration: 36e5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 3,
  },
};

const comboUnderrideCancelled = {
  type: 'wizard',
  bolus: {
    normal: 1,
    extended: 1,
    expectedExtended: 3,
    duration: 1200000,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
  },
};

const comboUnderrideCancelledWithBG = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 1,
    extended: 1,
    expectedExtended: 3,
    duration: 1200000,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    net: 5,
    carb: 5,
    correction: 2,
  },
  carbInput: 75,
  bgInput: 280,
  insulinSensitivity: 70,
  insulinCarbRatio: 15,
};

const extended = {
  extended: 2,
  duration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const cancelledExtended = {
  extended: 0.2,
  expectedExtended: 2,
  duration: 36e4,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const immediatelyCancelledExtended = {
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const extendedAnimas = {
  extended: 1.2,
  duration: 18000000,
  normalTime: '2017-11-11T05:45:52.000Z',
  annotations: [
    { code: 'animas/bolus/extended-equal-split' },
  ],
};

const extendedAnimasUnderride = {
  type: 'wizard',
  bolus: {
    extended: 1.2,
    duration: 18000000,
    normalTime: '2017-11-11T05:45:52.000Z',
    annotations: [
      { code: 'animas/bolus/extended-equal-split' },
    ],
  },
  recommended: {
    correction: 3.5,
  },
};

const extendedUnderride = {
  type: 'wizard',
  bolus: {
    extended: 3,
    duration: 36e5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    correction: 3.5,
  },
};

const withCarbInput = {
  type: 'wizard',
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withBGInputAndIOB = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  bgInput: 280,
  insulinSensitivity: 70,
  insulinOnBoard: 0.5,
};

const withAutoTarget = {
  type: 'wizard',
  annotations: [
    { code: 'wizard/target-automated' },
  ],
  bgInput: 180,
  bgTarget: {
    low: 60,
    high: 180,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withMedtronicTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    low: 60,
    high: 180,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withMedtronicSameTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    low: 100,
    high: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withAnimasTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
    range: 40,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withInsuletTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
    high: 180,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};

const withTandemTarget = {
  type: 'wizard',
  bgInput: 180,
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 5,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
  insulinCarbRatio: 15,
};
const withdblFull = {
  type: 'wizard',
  bolus: {
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
  subType: 'pen',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
};

const normalPrescriptor = {
  subType: 'normal',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
  prescriptor: 'auto',
};

const normalNoPrescriptor = {
  subType: 'normal',
  normal: 5,
  normalTime: '2017-11-11T05:45:52.000Z',
  prescriptor: 'manual',
};

const normalPrescriptorIob = {
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
  
  it('should render programmed, interrupted and delivered for cancelled bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={cancelled} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
  });

  it('should render programmed, interrupted and delivered for immediately cancelled bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={immediatelyCancelled} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
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

  it('should render delivered, normal and extended for combo bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={combo} />);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render programmed, interrupted, normal, extended and delivered for cancelled in normal combo bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={cancelledInNormalCombo} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render programmed, interrupted, normal, extended and delivered for cancelled in extended combo bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={cancelledInExtendedCombo} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render suggested, normal, extended, override and delivered for override combo bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={comboOverride} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render suggested, interrupted, override, delivered, normal and extended for underride interrupted combo bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={comboUnderrideCancelled} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render suggested, bg, interrupted, override, delivered, normal, extended, carbRatio, isf and target for underride interrupted combo with BG bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={comboUnderrideCancelledWithBG} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.bg))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.normal))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.carbRatio))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.isf))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.target))).to.have.length(1);
  });

  it('should render delivered and extended for extended bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={extended} />);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render programmed, interrupted, delivered and extendedDuraation for interrupted extended bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={cancelledExtended} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render programmed, interrupted and extended for immediately cancelled extended bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={immediatelyCancelledExtended} />);
    expect(wrapper.find(formatClassesAsSelector(styles.programmed))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.interrupted))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render delivered, extended and annotation for extended Animas bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={extendedAnimas} />);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.annotation))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render suggested, override, delivered, extended and annotation for extended underride Animas bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={extendedAnimasUnderride} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.annotation))).to.have.length(1);
  });

  // eslint-disable-next-line max-len
  it('should render suggested, override, delivered and extended for extended underide bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={extendedUnderride} />);
    expect(wrapper.find(formatClassesAsSelector(styles.suggested))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.override))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.extended))).to.have.length(1);
  });

  it('should render carbRatio for bolus with carb input', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={withCarbInput} />);
    expect(wrapper.find(formatClassesAsSelector(styles.carbRatio))).to.have.length(1);
  });

  it('should render delivered, bg, iob, isf and target for bg and iob bolus', () => {
    const wrapper = mount(<BolusTooltip {...props} bolus={withBGInputAndIOB} />);
    expect(wrapper.find(formatClassesAsSelector(styles.delivered))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.bg))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.iob))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.isf))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.target))).to.have.length(1);
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

  describe('getTarget', () => {
    // eslint-disable-next-line max-len
    const targetValue = `${formatClassesAsSelector(styles.target)} ${formatClassesAsSelector(styles.value)}`;
    it('should return a single div for Medtronic style target', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withMedtronicTarget} />);
      expect(shallow(wrapper.instance().getTarget()).type()).to.equal('div');
      expect(wrapper.find(targetValue).text()).to.equal('60-180');
    });
    it('should return a single div and single value for Medtronic style same value target', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withMedtronicSameTarget} />);
      expect(shallow(wrapper.instance().getTarget()).type()).to.equal('div');
      expect(wrapper.find(targetValue).text()).to.equal('100');
    });
    it('should return an array for Animas style target', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withAnimasTarget} />);
      expect(_.isArray(wrapper.instance().getTarget())).to.be.true;
      expect(wrapper.instance().getTarget().length).to.equal(2);
      expect(wrapper.find(targetValue).first().text()).to.equal('100');
      expect(wrapper.find(targetValue).last().text()).to.equal('40');
    });
    it('should return an array for Insulet style target', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withInsuletTarget} />);
      expect(_.isArray(wrapper.instance().getTarget())).to.be.true;
      expect(wrapper.instance().getTarget().length).to.equal(2);
      expect(wrapper.find(targetValue).first().text()).to.equal('100');
      expect(wrapper.find(targetValue).last().text()).to.equal('180');
    });
    it('should return a single div for Tandem style target', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withTandemTarget} />);
      expect(shallow(wrapper.instance().getTarget()).type()).to.equal('div');
      expect(wrapper.find(targetValue).text()).to.equal('100');
    });
    it('should return "Auto" for a bolus with an automated wizard annotation', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={withAutoTarget} />);
      expect(shallow(wrapper.instance().getTarget()).type()).to.equal('div');
      expect(wrapper.find(targetValue).text()).to.equal('Auto');
    });
  });

  describe('isAnimasExtended', () => {
    it('should return true if annotations include Animas extended equal split', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={extendedAnimas} />);
      expect(wrapper.instance().isAnimasExtended()).to.be.true;
    });
    it('should return false for non-annotated boluse', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={normal} />);
      expect(wrapper.instance().isAnimasExtended()).to.be.false;
    });
    it('should return false for non-Animas annotated boluse', () => {
      const wrapper = mount(<BolusTooltip
        {...props}
        bolus={
          _.extend(
            normal, { annotations: [{ code: 'some/awesome-annotation' }] }
          )
        }
      />);
      expect(wrapper.instance().isAnimasExtended()).to.be.false;
    });
  });

  describe('getExtended', () => {
    const extendedStyle = formatClassesAsSelector(styles.extended);
    const normalStyle = formatClassesAsSelector(styles.normal);
    const label = formatClassesAsSelector(styles.label);
    it('should return a single div for Animas extended', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={extendedAnimas} />);
      expect(shallow(wrapper.instance().getExtended()).type()).to.equal('div');
      expect(wrapper.find(`${extendedStyle} ${label}`).text()).to.equal('Extended Over*');
    });
    it('should return an array for normal extended', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={extended} />);
      expect(_.isArray(wrapper.instance().getExtended())).to.be.true;
      expect(wrapper.instance().getExtended().length).to.equal(2);
      expect(wrapper.instance().getExtended()[0]).to.be.false;
      expect(wrapper.find(`${extendedStyle} ${label}`).text()).to.equal('Over 1 hr ');
    });
    it('should return an array for combo extended', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={combo} />);
      expect(_.isArray(wrapper.instance().getExtended())).to.be.true;
      expect(wrapper.instance().getExtended().length).to.equal(2);
      expect(wrapper.find(`${normalStyle} ${label}`).text()).to.equal('Up Front (33%)');
      expect(wrapper.find(`${extendedStyle} ${label}`).text()).to.equal('Over 1 hr (67%)');
    });
    it('should return null for normal bolus', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={normal} />);
      expect(wrapper.instance().getExtended()).to.be.null;
    });
  });

  describe('animasExtendedAnnotationMessage', () => {
    it('should return a div for Animas extended', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={extendedAnimas} />);
      expect(shallow(wrapper.instance().animasExtendedAnnotationMessage()).type()).to.equal('div');
    });
    it('should return null for normal bolus', () => {
      const wrapper = mount(<BolusTooltip {...props} bolus={normal} />);
      expect(wrapper.instance().animasExtendedAnnotationMessage()).to.be.null;
    });
  });
});
