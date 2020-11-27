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
import Loader from '../../../../src/components/common/loader/Loader';
import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import styles from '../../../../src/components/common/loader/Loader.css';

describe('Loader', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Loader />);
  });

  it('should render with defaut props when no properties provided', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.loaderDots))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.hidden))).to.have.length(0);
    expect(wrapper.find(formatClassesAsSelector(styles.overlay))).to.have.length(0);
    expect(wrapper.find(formatClassesAsSelector(styles.loaderText))).to.have.length(1);
    expect(wrapper.find(formatClassesAsSelector(styles.loaderText)).text()).to.equal('Loading...');
  });

  it('should render with an overlay when `overlay` prop is true', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.overlay))).to.have.length(0);

    wrapper.setProps({
      overlay: true,
    });

    expect(wrapper.find(formatClassesAsSelector(styles.overlay))).to.have.length(1);
  });

  it('should hide the loader when `show` prop is false', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.hidden))).to.have.length(0);

    wrapper.setProps({
      show: false,
    });

    expect(wrapper.find(formatClassesAsSelector(styles.hidden))).to.have.length(1);
  });

  it('should render custom loading text as provided by the `text` prop', () => {
    expect(wrapper.find(formatClassesAsSelector(styles.loaderText)).text()).to.equal('Loading...');

    wrapper.setProps({
      text: 'Yeah :)',
    });

    expect(wrapper.find(formatClassesAsSelector(styles.loaderText)).text()).to.equal('Yeah :)');
  });
});
