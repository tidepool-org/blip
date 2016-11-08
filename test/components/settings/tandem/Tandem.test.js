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

import Tandem from '../../../../src/components/settings/tandem/Tandem';
import { MGDL_UNITS } from '../../../../src/utils/constants';

const flatrateData = require('../../../../data/pumpSettings/tandem/flatrate.json');
const multirateData = require('../../../../data/pumpSettings/tandem/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: null };

describe('Tandem', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <Tandem
        bgUnits={MGDL_UNITS}
        deviceDisplayName={'Tandem'}
        deviceKey={'tandem'}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
      />
    );
  });

  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    expect(console.error.callCount).to.equal(0);
  });

  it('should have a header', () => {
    expect(wrapper.find('Header')).to.have.length(1);
  });

  it('should have Tandem as the Header deviceDisplayName', () => {
    expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Tandem');
  });

  it('should have three Tables', () => {
    expect(wrapper.find('Table')).to.have.length(3);
  });

  it('should have three CollapsibleContainers', () => {
    expect(wrapper.find('CollapsibleContainer')).to.have.length(3);
  });

  it('should preserve user capitalization of profile names', () => {
    // must use mount to search far enough down in tree!
    const mounted = mount(
      <Tandem
        bgUnits={MGDL_UNITS}
        deviceDisplayName={'Tandem'}
        deviceKey={'tandem'}
        pumpSettings={flatrateData}
        timePrefs={timePrefs}
      />
    );
    expect(mounted.find('.label').someWhere(n => (n.text().search('Normal') !== -1)))
      .to.be.true;
    expect(mounted.find('.label').someWhere(n => (n.text().search('sick') !== -1)))
      .to.be.true;
  });

  it('should have `Active at Upload` text somewhere', () => {
    const activeAtUploadText = 'Active at upload';
    // must use mount to search far enough down in tree!
    const mounted = mount(
      <Tandem
        bgUnits={MGDL_UNITS}
        deviceDisplayName={'Tandem'}
        deviceKey={'tandem'}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
      />
    );
    expect(mounted.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
      .to.be.true;
  });
});
