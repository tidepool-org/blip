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
import _ from 'lodash';

import CollapsibleContainer from '../../../src/components/settings/common/CollapsibleContainer';
import NonTandem from '../../../src/components/settings/NonTandem';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../src/utils/constants';
import { formatDecimalNumber } from '../../../src/utils/format';

import { formatClassesAsSelector } from '../../helpers/cssmodules';
import styles from '../../../src/components/settings/NonTandem.css';

const animasFlatRateData = require('../../../data/pumpSettings/animas/flatrate.json');
const animasMultiRateData = require('../../../data/pumpSettings/animas/multirate.json');
const omnipodFlatRateData = require('../../../data/pumpSettings/omnipod/flatrate.json');
const omnipodMultiRateData = require('../../../data/pumpSettings/omnipod/multirate.json');
const medtronicMultiRateData = require('../../../data/pumpSettings/medtronic/multirate.json');
const medtronicAutomatedData = require('../../../data/pumpSettings/medtronic/automated.json');

const timePrefs = { timezoneAware: false, timezoneName: 'Europe/London' };
const user = {
  profile: {
    fullName: 'Mary Smith',
    patient: {
      diagnosisDate: '1990-01-31',
      birthday: '1983-01-31',
    },
  },
};

describe('NonTandem', () => {
  let copySettingsClicked = null;
  const activeAtUploadText = 'Active at upload';

  before(() => {
    copySettingsClicked = sinon.spy();
  });

  afterEach(() => {
    copySettingsClicked.resetHistory();
  });

  describe('Animas', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Animas as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(3);
    });

    it('should preserve user capitalization of schedule name', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasFlatRateData.activeSchedule]: true }}
          pumpSettings={animasFlatRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search('normal') !== -1)))
        .to.be.true;
      expect(wrapper.find('.label').someWhere(n => (n.text().search('Weekday') !== -1)))
        .to.be.true;
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });

    it('should have a button to copy settings', () => {
      const mounted = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'animas'}
          openedSections={{ [animasMultiRateData.activeSchedule]: true }}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      const clipBoardButton = mounted.find(formatClassesAsSelector(styles.copyButton)).at(0);
      expect(copySettingsClicked.callCount).to.equal(0);
      clipBoardButton.simulate('click');
      expect(copySettingsClicked.callCount).to.equal(1);
    });
    describe('bolus settings', () => {
      it('should surface the expected value for ISF', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'animas'}
            openedSections={{ [animasMultiRateData.activeSchedule]: true }}
            pumpSettings={animasMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const isfTable = wrapper.find('table').filterWhere(n => (n.text().search('ISF') !== -1));
        expect(isfTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(animasMultiRateData.insulinSensitivity[0].amount, 1)
          ) !== -1)
        )).to.be.true;
      });

      it('should surface the expected target & range values for BG Target', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'animas'}
            openedSections={{ [animasMultiRateData.activeSchedule]: true }}
            pumpSettings={animasMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const bgTargetTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('BG Target') !== -1));
        expect(bgTargetTable.someWhere(
          n => (n.text()
            .search(formatDecimalNumber(animasMultiRateData.bgTarget[0].target), 1) !== -1)
        )).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text()
            .search(formatDecimalNumber(animasMultiRateData.bgTarget[0].range), 1) !== -1)
        )).to.be.true;
      });

      it('should surface the expected value for I:C Ratio', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'animas'}
            openedSections={{ [animasMultiRateData.activeSchedule]: true }}
            pumpSettings={animasMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const carbRatioTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('I:C Ratio') !== -1));
        expect(carbRatioTable.someWhere(
          n => (n.text().search(animasMultiRateData.carbRatio[0].amount) !== -1)
        )).to.be.true;
      });
    });
  });

  describe('Insulet', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have OmniPod as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(2);
    });

    it('should preserve user capitalization of schedule name', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodFlatRateData.activeSchedule]: true }}
          pumpSettings={omnipodFlatRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search('normal') !== -1)))
        .to.be.true;
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'insulet'}
          openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });

    describe('bolus settings', () => {
      it('should surface the expected value for Correction factor', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'insulet'}
            openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
            pumpSettings={omnipodMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const isfTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('Correction factor') !== -1));
        expect(isfTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(omnipodMultiRateData.insulinSensitivity[0].amount, 1)
          ) !== -1)
        )).to.be.true;
      });

      it('should surface the expected target & correct above values for Target BG', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'insulet'}
            openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
            pumpSettings={omnipodMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const bgTargetTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('Target BG') !== -1));

        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(omnipodMultiRateData.bgTarget[0].target, 1)
          ) !== -1)
        )).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(omnipodMultiRateData.bgTarget[0].high, 1)
          ) !== -1)
        )).to.be.true;
      });

      it('should surface the expected value for IC ratio', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'insulet'}
            openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
            pumpSettings={omnipodMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const carbRatioTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('IC ratio') !== -1));
        expect(carbRatioTable.someWhere(
          n => (n.text().search(omnipodMultiRateData.carbRatio[0].amount) !== -1)
        )).to.be.true;
      });

      it('should have a button to copy settings', () => {
        const mounted = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'insulet'}
            openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
            pumpSettings={omnipodMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const clipBoardButton = mounted.find(formatClassesAsSelector(styles.copyButton)).at(0);
        expect(copySettingsClicked.callCount).to.equal(0);
        clipBoardButton.simulate('click');
        expect(copySettingsClicked.callCount).to.equal(1);
      });
    });
  });

  describe('CareLink/Medtronic', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Medtronic as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find(CollapsibleContainer)).to.have.length(3);
    });

    it('should capitalize all basal schedule names', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search('Standard') !== -1)))
        .to.be.true;
      expect(wrapper.find('.label').someWhere(n => (n.text().search('Pattern A') !== -1)))
        .to.be.true;
      expect(wrapper.find('.label').someWhere(n => (n.text().search('Pattern B') !== -1)))
        .to.be.true;
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
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
          copySettingsClicked={copySettingsClicked}
          deviceKey={'medtronic'}
          openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a button to copy settings', () => {
      const mounted = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          copySettingsClicked={copySettingsClicked}
          deviceKey={'carelink'}
          openedSections={{}}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
          user={user}
          toggleBasalScheduleExpansion={() => {}}
        />
      );
      const clipBoardButton = mounted.find(formatClassesAsSelector(styles.copyButton)).at(0);
      expect(copySettingsClicked.callCount).to.equal(0);
      clipBoardButton.simulate('click');
      expect(copySettingsClicked.callCount).to.equal(1);
    });

    describe('automated basal', () => {
      it('should display the automated basal heading when active at upload', () => {
        const mounted = mount(
          <NonTandem
            bgUnits={MGDL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'medtronic'}
            openedSections={{}}
            pumpSettings={medtronicAutomatedData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );

        const autoBasalHeading = mounted.find(
          formatClassesAsSelector(styles.automatedBasalHeaderBackground)
        );

        expect(autoBasalHeading.length).to.equal(1);
        expect(autoBasalHeading.text()).contains('Auto Mode');
        expect(autoBasalHeading.text()).contains('active at upload');
      });

      it('should display the automated basal heading when and deviceKey is carelink', () => {
        const mounted = mount(
          <NonTandem
            bgUnits={MGDL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'carelink'}
            openedSections={{}}
            pumpSettings={medtronicAutomatedData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );

        const autoBasalHeading = mounted.find(
          formatClassesAsSelector(styles.automatedBasalHeaderBackground)
        );

        expect(autoBasalHeading.length).to.equal(1);
        expect(autoBasalHeading.text()).contains('Auto Mode');
        expect(autoBasalHeading.text()).contains('active at upload');
      });

      it('should not display the automated basal heading when inactive at upload', () => {
        const nonActiveMedtronicAutomatedData = _.assign({}, medtronicAutomatedData, {
          activeSchedule: 'Standard',
        });

        const mounted = mount(
          <NonTandem
            bgUnits={MGDL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'medtronic'}
            openedSections={{}}
            pumpSettings={nonActiveMedtronicAutomatedData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );

        const autoBasalHeading = mounted.find(formatClassesAsSelector(
          styles.automatedBasalHeaderBackground)
        );

        expect(autoBasalHeading.length).to.equal(0);
      });
    });

    describe('bolus settings', () => {
      it('should surface the expected value for Sensitivity', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'medtronic'}
            openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
            pumpSettings={medtronicMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const isfTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('Sensitivity') !== -1));
        expect(isfTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.insulinSensitivity[0].amount, 1)
          ) !== -1)
        )).to.be.true;
      });

      it('should surface the expected low & high values for BG Target', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'medtronic'}
            openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
            pumpSettings={medtronicMultiRateData}
            timePrefs={timePrefs}
            user={user}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const bgTargetTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('BG Target') !== -1));

        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[0].low), 1)
          ) !== -1)
        ).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[0].high), 1)
          ) !== -1)
        ).to.be.true;

        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[1].low), 1)
          ) !== -1)
        ).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[1].high), 1)
          ) !== -1)
        ).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[2].low), 1)
          ) !== -1)
        ).to.be.true;
        expect(bgTargetTable.someWhere(
          n => (n.text().search(
            formatDecimalNumber(medtronicMultiRateData.bgTarget[2].high), 1)
          ) !== -1)
        ).to.be.true;
      });

      it('should surface the expected values for Carb Ratios', () => {
        const wrapper = mount(
          <NonTandem
            bgUnits={MMOLL_UNITS}
            copySettingsClicked={copySettingsClicked}
            deviceKey={'medtronic'}
            openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
            pumpSettings={medtronicMultiRateData}
            timePrefs={timePrefs}
            toggleBasalScheduleExpansion={() => {}}
          />
        );
        const carbRatioTable = wrapper.find('table')
          .filterWhere(n => (n.text().search('Carb Ratios') !== -1));


        expect(carbRatioTable.someWhere(
          n => (n.text().search(medtronicMultiRateData.carbRatio[0].amount) !== -1)
        )).to.be.true;
        expect(carbRatioTable.someWhere(
          n => (n.text().search(medtronicMultiRateData.carbRatio[1].amount) !== -1)
        )).to.be.true;
        expect(carbRatioTable.someWhere(
          n => (n.text().search(medtronicMultiRateData.carbRatio[2].amount) !== -1)
        )).to.be.true;
        expect(carbRatioTable.someWhere(
          n => (n.text().search(medtronicMultiRateData.carbRatio[3].amount) !== -1)
        )).to.be.true;
      });
    });
  });
});
