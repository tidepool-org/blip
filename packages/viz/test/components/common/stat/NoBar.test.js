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
import _ from 'lodash';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import NoBar from '../../../../src/components/common/stat/NoBar';

/**
 * @typedef { import('enzyme').ShallowWrapper } ShallowWrapper
 */

describe('NoBar', () => {
  const defaultProps = {
    data: [
      {
        id: 'bolus',
        value: 9.123,
        valueString: '9.1',
        units: 'U',
        title: 'Bolus Insulin',
        legendTitle: 'Bolus'
      },
      {
        id: 'basal',
        value: 6.892,
        valueString: '6.9',
        units: 'U',
        title: 'Basal Insulin',
        legendTitle: 'Basal'
      }
    ],
    id: 'test'
  };

  it('Should render without problem', () => {
    const wrapper = shallow(<NoBar {...defaultProps} />);
    expect(wrapper.find('#nobar-test').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-bolus-title').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-bolus-value').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-bolus-percent').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-basal-title').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-basal-value').length).to.be.equals(1);
    expect(wrapper.find('#nobar-test-basal-percent').length).to.be.equals(1);
  });

  it('Should accept if all values <= 0', () => {
    const props = _.cloneDeep(defaultProps);
    props.data[0].value = -1;
    props.data[1].value = -1;
    const wrapper = shallow(<NoBar {...props} />);
    // \u00A0: no-break space
    expect(wrapper.find('#nobar-test-bolus-value').text()).to.be.equals('0\u00A0U');
    expect(wrapper.find('#nobar-test-bolus-percent').childAt(0).text()).to.be.equals('--');
    expect(wrapper.find('#nobar-test-bolus-percent').childAt(1).text()).to.be.equals('%');
    expect(wrapper.find('#nobar-test-basal-value').text()).to.be.equals('0\u00A0U');
    expect(wrapper.find('#nobar-test-basal-percent').childAt(0).text()).to.be.equals('--');
    expect(wrapper.find('#nobar-test-basal-percent').childAt(1).text()).to.be.equals('%');
  });
});
