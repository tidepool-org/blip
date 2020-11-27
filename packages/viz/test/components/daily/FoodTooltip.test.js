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

import FoodTooltip from '../../../src/components/daily/foodtooltip/FoodTooltip';
import styles from '../../../src/components/daily/foodtooltip/FoodTooltip.css';
import { PRESCRIPTOR_AUTO, PRESCRIPTOR_MODIFIED} from '../../../src/utils/constants';

const normal = {
  type: 'food',
  nutrition: {
    carbohydrate: {
      net: 5,
      units: 'grams',
    },
  },
};

const large = {
  type: 'food',
  nutrition: {
    carbohydrate: {
      net: 200,
      units: 'grams',
    },
  },
};

const nonCarb = {
  type: 'food',
  nutrition: {
    fat: {
      total: 10,
      units: 'grams',
    },
  },
};

const rescuecarbsAuto = {
  type: 'food',
  meal: 'rescuecarbs',
  nutrition: {
    carbohydrate: {
      net: 20,
      units: 'grams',
    },
  },
  prescriptor: "auto"
};

const rescuecarbsModified = {
  type: 'food',
  meal: 'rescuecarbs',
  nutrition: {
    carbohydrate: {
      net: 20,
      units: 'grams',
    },
  },
  prescribedNutrition: {
    carbohydrate : {
      net: 15,
      units: "grams"
    }
  },
  prescriptor: "hybrid"
};

const props = {
  position: { top: 200, left: 200 },
  timePrefs: { timezoneAware: false },
};

describe('FoodTooltip', () => {
  it('should render without issue when all properties provided', () => {
    const wrapper = mount(<FoodTooltip {...props} food={normal} />);
    expect(wrapper.find(formatClassesAsSelector(styles.carb))).to.have.length(1);
  });

  it('should not render prescribed nutrition when not provided', () => {
    const wrapper = mount(<FoodTooltip {...props} food={normal} />);
    expect(wrapper.find(formatClassesAsSelector(styles.prescribed))).to.have.length(0);
  });

  it('should render prescribed nutrition when provided', () => {
    const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsAuto} />);
    expect(wrapper.find(formatClassesAsSelector(styles.prescribed))).to.have.length(1);
  });

  describe('getCarbs', () => {
    // eslint-disable-next-line max-len
    const carbValue = `${formatClassesAsSelector(styles.carb)} ${formatClassesAsSelector(styles.value)}`;
    it('should return 5 for a 5 gram net food value', () => {
      const wrapper = mount(<FoodTooltip {...props} food={normal} />);
      expect(wrapper.instance().getCarbs(normal)).to.equal(5);
      expect(wrapper.find(carbValue).text()).to.equal('5');
    });
    it('should return 200 for a 200 gram net food value', () => {
      const wrapper = mount(<FoodTooltip {...props} food={large} />);
      expect(wrapper.instance().getCarbs(large)).to.equal(200);
      expect(wrapper.find(carbValue).text()).to.equal('200');
    });
    it('should return 0 for a non-carbohydrate food value', () => {
      const wrapper = mount(<FoodTooltip {...props} food={nonCarb} />);
      expect(wrapper.instance().getCarbs(nonCarb)).to.equal(0);
      expect(wrapper.find(carbValue).text()).to.equal('0');
    });
  });

  describe('getPrescribedCarbs', () => {
    // eslint-disable-next-line max-len
    const prescribedValue = `${formatClassesAsSelector(styles.prescribed)} ${formatClassesAsSelector(styles.value)}`;
    it('should return 20 for a 20 gram net prescribed food value', () => {
      const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsAuto} />);
      expect(wrapper.instance().getPrescribedCarbs(rescuecarbsAuto)).to.be.undefined;
      expect(wrapper.instance().getCarbs(rescuecarbsAuto)).to.equal(20);
      expect(wrapper.find(prescribedValue).text()).to.equal('20');
    });
    it('should return 15 for a 20 gram net prescribed food value modified by user to 15', () => {
      const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsModified} />);
      expect(wrapper.instance().getPrescribedCarbs(rescuecarbsModified)).to.equal(15);
      expect(wrapper.find(prescribedValue).text()).to.equal('15');
    });

  });

  describe('isPrescribed', () => {
    it('should return true when prescriptor is provided', () => {
      const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsAuto} />);
      expect(wrapper.instance().isPrescribed(rescuecarbsAuto)).to.equal(true);
    });
    it('should return false when prescriptor is not provided', () => {
      const wrapper = mount(<FoodTooltip {...props} food={normal} />);
      expect(wrapper.instance().isPrescribed(normal)).to.equal(false);
    });
  });

  describe('getPrescriptor', () => {
    it('should return auto when prescriptor is set to auto', () => {
      const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsAuto} />);
      expect(wrapper.instance().getPrescriptor(rescuecarbsAuto)).to.equal(PRESCRIPTOR_AUTO);
    });
    it('should return false when prescriptor is set to modified', () => {
      const wrapper = mount(<FoodTooltip {...props} food={rescuecarbsModified} />);
      expect(wrapper.instance().getPrescriptor(rescuecarbsModified)).to.equal(PRESCRIPTOR_MODIFIED);
    });
  });

});
