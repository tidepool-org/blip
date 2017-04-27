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

import CollapsibleContainer from '../../../src/components/settings/common/CollapsibleContainer';
import Tandem from '../../../src/components/settings/Tandem';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../src/utils/constants';
import { displayDecimal } from '../../../src/utils/format';

const flatrateData = require('../../../data/pumpSettings/tandem/flatrate.json');
const multirateData = require('../../../data/pumpSettings/tandem/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: null };
const user = {
  profile: {
    fullName: 'Mary Smith',
    patient: {
      diagnosisDate: '1990-01-31',
      birthday: '1983-01-31',
    },
  },
};

describe('Tandem', () => {
  it('should render without problems when required props provided', () => {
    console.error = sinon.spy();
    expect(console.error.callCount).to.equal(0);
    shallow(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(console.error.callCount).to.equal(0);
  });

  it('should have a header', () => {
    const wrapper = shallow(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });

  it('should have Tandem as the Header deviceDisplayName', () => {
    const wrapper = shallow(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Tandem');
  });

  it('should have three Tables', () => {
    const wrapper = shallow(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(wrapper.find('Table')).to.have.length(3);
  });

  it('should have three CollapsibleContainers', () => {
    const wrapper = mount(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(wrapper.find(CollapsibleContainer)).to.have.length(3);
  });

  it('should preserve user capitalization of profile names', () => {
    // must use mount to search far enough down in tree!
    const mounted = mount(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [flatrateData.activeSchedule]: true }}
        pumpSettings={flatrateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
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
    const wrapper = mount(
      <Tandem
        bgUnits={MGDL_UNITS}
        openedSections={{ [multirateData.activeSchedule]: true }}
        pumpSettings={multirateData}
        timePrefs={timePrefs}
        user={user}
        toggleProfileExpansion={() => {}}
      />
    );
    expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
      .to.be.true;
  });

  describe('timed settings', () => {
    let wrapper;
    let sickProfileTable;

    before(() => {
      // must use mount to search far enough down in tree!
      wrapper = mount(
        <Tandem
          bgUnits={MMOLL_UNITS}
          openedSections={{ [flatrateData.activeSchedule]: true }}
          pumpSettings={flatrateData}
          timePrefs={timePrefs}
          user={user}
          toggleProfileExpansion={() => {}}
        />
      );

      sickProfileTable = wrapper.find('table').filterWhere(
        n => (n.text().search('Basal Rates') !== -1)
      );
    });

    it('should surface the expected basal rate value', () => {
      expect(sickProfileTable.someWhere(
        n => (n.text().search(displayDecimal(flatrateData.basalSchedules[1].value[0].rate, 1)))
      )).to.be.true;
    });

    it('should surface the expected target BG value', () => {
      expect(sickProfileTable.someWhere(
        n => (n.text().search(displayDecimal(flatrateData.bgTargets.sick[0].target, 1)))
      )).to.be.true;
    });

    it('should surface the expected carb ratio value', () => {
      expect(sickProfileTable.someWhere(
        n => (n.text().search(displayDecimal(flatrateData.carbRatios.sick[0].target, 1)))
      )).to.be.true;
    });

    it('should surface the expected correction factor value', () => {
      expect(sickProfileTable.someWhere(
        n => (n.text().search(displayDecimal(flatrateData.insulinSensitivities.sick[0].target, 1)))
      )).to.be.true;
    });
  });
});
