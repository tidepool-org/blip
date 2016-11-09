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
// because the component is wrapped, can't use shallow
import { mount, shallow } from 'enzyme';

import CollapsibleContainer from '../../../src/components/settings/common/CollapsibleContainer';
import NonTandem from '../../../src/components/settings/NonTandem';
import { MGDL_UNITS } from '../../../src/utils/constants';

const animasMultiRateData = require('../../../data/pumpSettings/animas/multirate.json');
const omnipodMultiRateData = require('../../../data/pumpSettings/omnipod/multirate.json');
const medtronicMultiRateData = require('../../../data/pumpSettings/medtronic/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: 'Europe/London' };

describe('NonTandem', () => {
  const activeAtUploadText = 'Active at upload';

  describe('Animas', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Animas as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Animas');
    });

    // these tables are the bolus settings + basal schedules
    it('should have six Tables', () => {
      const wrapper = shallow(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Table')).to.have.length(6);
    });

    // these containers are the basal schedules
    it('should have three CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(3);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });

  describe('Insulet', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have OmniPod as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('OmniPod');
    });

    // these tables are the bolus settings + basal schedules
    it('should have five Tables', () => {
      const wrapper = shallow(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Table')).to.have.length(5);
    });

    // these containers are the basal schedules
    it('should have two CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(2);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });

  describe('CareLink/Medtronic', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Medtronic as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Medtronic');
    });

    // these tables are the bolus settings + basal schedules
    it('should have six Tables', () => {
      const wrapper = shallow(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'carelink'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Table')).to.have.length(6);
    });

    // these containers are the basal schedules
    it('should have three CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'carelink'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(3);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });

    it('should also render w/o error with `medtronic` as the deviceKey', () => {
      console.error = sinon.spy();
      expect(console.error.callCount).to.equal(0);
      shallow(
        <NonTandem
          bgUnits={MGDL_UNITS}
          deviceKey={'medtronic'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(console.error.callCount).to.equal(0);
    });
  });
});
