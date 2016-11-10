import React from 'react';

import { storiesOf } from '@kadira/storybook';

import { MMOLL_UNITS } from '../../../src/utils/constants';
import NonTandem from '../../../src/components/settings/NonTandem';
import Tandem from '../../../src/components/settings/Tandem';

const animasFlatRateData = require('../../../data/pumpSettings/animas/flatrate.json');
const animasMultiRateData = require('../../../data/pumpSettings/animas/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: 'Europe/London' };

storiesOf('Device Settings [Animas]', module)
  .add('flat rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'animas'}
      openedSections={{ [animasFlatRateData.activeSchedule]: true }}
      pumpSettings={animasFlatRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ))
  .add('multi rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'animas'}
      openedSections={{ [animasMultiRateData.activeSchedule]: true }}
      pumpSettings={animasMultiRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ));

const medtronicFlatRateData = require('../../../data/pumpSettings/medtronic/flatrate.json');
const medtronicMultiRateData = require('../../../data/pumpSettings/medtronic/multirate.json');

storiesOf('Device Settings [Medtronic]', module)
  .add('flat rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'medtronic'}
      openedSections={{ [medtronicFlatRateData.activeSchedule]: true }}
      pumpSettings={medtronicFlatRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ))
  .add('multi rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'medtronic'}
      openedSections={{ [medtronicMultiRateData.activeSchedule]: true }}
      pumpSettings={medtronicMultiRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ));

const omnipodFlatRateData = require('../../../data/pumpSettings/omnipod/flatrate.json');
const omnipodMultiRateData = require('../../../data/pumpSettings/omnipod/multirate.json');

storiesOf('Device Settings [OmniPod]', module)
  .add('flat rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'insulet'}
      openedSections={{ [omnipodFlatRateData.activeSchedule]: true }}
      pumpSettings={omnipodFlatRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ))
  .add('multi rate', () => (
    <NonTandem
      bgUnits={MMOLL_UNITS}
      deviceKey={'insulet'}
      openedSections={{ [omnipodMultiRateData.activeSchedule]: true }}
      pumpSettings={omnipodMultiRateData}
      timePrefs={timePrefs}
      toggleBasalScheduleExpansion={() => {}}
    />
  ));

const tandemFlatRateData = require('../../../data/pumpSettings/tandem/flatrate.json');
const tandemMultiRateData = require('../../../data/pumpSettings/tandem/multirate.json');

storiesOf('Device Settings [Tandem]', module)
  .add('flat rate', () => (
    <Tandem
      bgUnits={MMOLL_UNITS}
      openedSections={{ [tandemFlatRateData.activeSchedule]: true }}
      pumpSettings={tandemFlatRateData}
      timePrefs={timePrefs}
      toggleProfileExpansion={() => {}}
    />
  ))
  .add('multi rate', () => (
    <Tandem
      bgUnits={MMOLL_UNITS}
      openedSections={{ [tandemMultiRateData.activeSchedule]: true }}
      pumpSettings={tandemMultiRateData}
      timePrefs={timePrefs}
      toggleProfileExpansion={() => {}}
    />
  ));
