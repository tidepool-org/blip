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

/* eslint-env node, mocha */

import React from 'react';

import { shallow } from 'enzyme';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import FocusedCBGSliceTime from '../../../../src/components/trends/cbg/FocusedCBGSliceTime';
import styles from '../../../../src/components/trends/cbg/FocusedCBGSliceTime.css';

describe('FocusedCBGSliceTime', () => {
  const focusedSlice = {
    slice: {
      msFrom: 0,
      msTo: 3600000,
    },
    position: {
      topOptions: {
        max: 300,
      },
      left: 180,
    },
  };

  describe('when no focused slice', () => {
    it('should render nothing', () => {
      const wrapper = shallow(<FocusedCBGSliceTime />);
      expect(wrapper.html()).to.be.null;
    });
  });

  describe('when a slice is focused', () => {
    it('should render a time label', () => {
      const wrapper = shallow(<FocusedCBGSliceTime focusedSlice={focusedSlice} />);
      expect(wrapper.find(formatClassesAsSelector(styles.container))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.text))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.text)).text()).not.to.be.empty;
    });
  });
});
