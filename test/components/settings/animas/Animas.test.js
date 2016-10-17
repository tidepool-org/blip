/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Animas from '../../../../src/components/settings/animas/Animas';

const multirateData = require('../../../../data/pumpSettings/animas/multirate.json');
const timePrefs = { timezoneAware: false, timezoneName: null };

const badSettingsNoActiveSchedule = {
  units: { bg: '', carbs: '' },
  deviceId: '123',
  basalSchedules: [{ name: 'one', value: [{ start: 0, rate: 0.8 }] }],
  carbRatio: [{ start: 0, amount: 1.1 }],
  insulinSensitivity: [{ start: 0, amount: 1.1 }],
  bgTarget: [{ start: 0, target: 5.5, range: 1.3 }],
};

describe('Animas', () => {
  it('should render with one error when pumpSettings not valid', () => {
    console.error = sinon.stub();
    shallow(
      <Animas
        bgUnits="mg/dL"
        pumpSettings={badSettingsNoActiveSchedule}
        timePrefs={timePrefs}
      />
    );
    expect(console.error.callCount).to.equal(1);
  });
  it('should render with one error when bgUnits not provided', () => {
    console.error = sinon.stub();
    shallow(
      <Animas
        pumpSettings={multirateData}
        timePrefs={timePrefs}
      />
    );
    expect(console.error.callCount).to.equal(1);
  });
  it('should render without problems when bgUnits and pumpSettings provided', () => {
    console.error = sinon.stub();
    shallow(
      <Animas
        pumpSettings={multirateData}
        bgUnits="mg/dL"
        timePrefs={timePrefs}
      />
    );
    expect(console.error.callCount).to.equal(0);
  });
  it('should find a header', () => {
    const wrapper = shallow(
      <Animas
        pumpSettings={multirateData}
        bgUnits="mg/dL"
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Header')).to.have.length(1);
  });
  it('should find have the header deviceId as Animas', () => {
    const wrapper = shallow(
      <Animas
        pumpSettings={multirateData}
        bgUnits="mg/dL"
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Header').props().deviceType).to.equal('Animas');
  });
  it('should have six tables', () => {
    const wrapper = shallow(
      <Animas
        pumpSettings={multirateData}
        bgUnits="mg/dL"
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('Table')).to.have.length(6);
  });
  it('should have three collapsible containers', () => {
    const wrapper = shallow(
      <Animas
        pumpSettings={multirateData}
        bgUnits="mg/dL"
        timePrefs={timePrefs}
      />
    );
    expect(wrapper.find('CollapsibleContainer')).to.have.length(3);
  });
});
