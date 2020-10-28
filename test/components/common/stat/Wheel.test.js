/**
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
 */
import React from 'react';
import chai from 'chai';
import _ from 'lodash';
import { shallow } from 'enzyme';

import Wheel from '../../../../src/components/common/stat/Wheel';
import styles from '../../../../src/components/common/stat/Stat.css';

/**
 * @typedef { import("enzyme").ShallowWrapper } ShallowWrapper
 */

describe('Wheel', () => {
  const { expect } = chai;

  const defaultProps = {
    values: {
      on: 80,
      off: 20,
    },
    className: 'test',
    rawValues: {
      on: '8m',
      off: '2m'
    },
  };

  it('Should render without problem', () => {
    const wrapper = shallow(<Wheel {...defaultProps} />);
    expect(wrapper.find(`.${styles.legendLabelText}`).length).to.be.equal(2);
    expect(wrapper.find('#half-circle-percent-clip').children().length).to.be.equal(1);
    let values = wrapper.find(`.${styles.legendLabelValue}`);
    expect(values.length).to.be.equal(2);
    expect(values.at(0).childAt(0).contains(defaultProps.values.on.toString(10))).to.be.true;
    expect(values.at(1).childAt(0).contains(defaultProps.values.off.toString(10))).to.be.true;

    values = wrapper.find(`.${styles.labelRawValue}`);
    expect(values.length).to.be.equal(2);
    expect(values.at(0).childAt(0).contains(defaultProps.rawValues.on)).to.be.true;
    expect(values.at(1).childAt(0).contains(defaultProps.rawValues.off)).to.be.true;
  });

  it('Should render N/A for invalid values', () => {
    const props = _.cloneDeep(defaultProps);
    props.values.on = Number.NaN;
    const wrapper = shallow(<Wheel {...props} />);
    const values = wrapper.find(`.${styles.legendLabelValue}`);
    expect(values.at(0).childAt(0).contains('N/A')).to.be.true;
  });

  it('Should render correctly for off values > 50', () => {
    const props = _.cloneDeep(defaultProps);
    props.values.on = 20;
    props.values.off = 80;
    const wrapper = shallow(<Wheel {...props} />);
    expect(wrapper.find('#half-circle-percent-clip').children().length).to.be.equal(2);
  });
});
