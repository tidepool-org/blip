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

/* eslint no-console:0 */

import React from 'react';
import { mount, shallow } from 'enzyme';

import Tandem from '../../../src/components/settings/Tandem';
import { MGDL_UNITS } from '../../../src/utils/constants';

const multirateData = require('../../../data/pumpSettings/tandem/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: null };

describe('Tandem', () => {
  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(console.error.callCount).to.equal(0);
  });

  it('should have a header', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });

  it('should have Tandem as the Header deviceType', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Header').props().deviceType).to.equal('Tandem');
  });

  it('should have three Tables', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Table')).to.have.length(3);
  });

  it('should have three CollapsibleContainers', () => {
    const wrapper = shallow(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('CollapsibleContainer')).to.have.length(3);
  });

  it('should have `Active at Upload` text somewhere', () => {
    const activeAtUploadText = 'Active at upload';
    // must use mount to search far enough down in tree!
    const wrapper = mount(
      <Tandem
        pumpSettings={multirateData}
        bgUnits={MGDL_UNITS}
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
      .to.be.true;
  });
});
