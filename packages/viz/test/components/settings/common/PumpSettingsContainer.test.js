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

 /* eslint no-console:0, max-len:0 */

import React from 'react';

import { mount } from 'enzyme';
import _ from 'lodash';

import { PumpSettingsContainer, mapStateToProps, mapDispatchToProps }
  from '../../../../src/components/settings/common/PumpSettingsContainer';
import NonTandem from '../../../../src/components/settings/NonTandem';
import Tandem from '../../../../src/components/settings/Tandem';
import { MGDL_UNITS } from '../../../../src/utils/constants';

const animasSettings = require('../../../../data/pumpSettings/animas/multirate.json');
const medtronicSettings = require('../../../../data/pumpSettings/medtronic/multirate.json');
const medtronicAutomatedSettings = require('../../../../data/pumpSettings/medtronic/automated.json');
const omnipodSettings = require('../../../../data/pumpSettings/omnipod/multirate.json');
const tandemSettings = require('../../../../data/pumpSettings/tandem/multirate.json');

describe('PumpSettingsContainer', () => {
  const user = {
    profile: {
      fullName: 'Mary Smith',
      patient: {
        diagnosisDate: '1990-01-31',
        birthday: '1983-01-31',
      },
    },
  };

  describe('PumpSettingsContainer (w/o redux connect()ion)', () => {
    const markSettingsViewed = sinon.spy();
    const toggleSettingsSection = sinon.spy();

    const props = {
      bgUnits: MGDL_UNITS,
      copySettingsClicked: sinon.spy(),
      currentPatientInViewId: 'a1b2c3',
      markSettingsViewed,
      timePrefs: {
        timezoneAware: false,
        timezoneName: null,
      },
      toggleSettingsSection,
    };

    const untouched = (pumpSettings, manufacturerKey) => ({
      [manufacturerKey]: {
        [pumpSettings.activeSchedule]: true,
      },
      touched: false,
    });

    const touched = (pumpSettings, manufacturerKey) => ({
      [manufacturerKey]: {
        [pumpSettings.activeSchedule]: true,
      },
      touched: true,
    });

    afterEach(() => {
      markSettingsViewed.resetHistory();
      toggleSettingsSection.resetHistory();
    });

    describe('componentWillMount', () => {
      it('should mark device settings view as `touched` & set opened section state', () => {
        expect(markSettingsViewed.callCount).to.equal(0);
        expect(toggleSettingsSection.callCount).to.equal(0);
        const manufacturerKey = 'animas';
        mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={animasSettings}
            settingsState={untouched(animasSettings, manufacturerKey)}
          />
        );
        expect(markSettingsViewed.callCount).to.equal(1);
        expect(toggleSettingsSection.callCount).to.equal(1);
        expect(toggleSettingsSection.args[0][0]).to.equal(manufacturerKey);
        expect(toggleSettingsSection.args[0][1]).to.equal(animasSettings.activeSchedule);
      });

      it('should not mark device settings as `touched`, etc. if already `touched`', () => {
        expect(markSettingsViewed.callCount).to.equal(0);
        expect(toggleSettingsSection.callCount).to.equal(0);
        const manufacturerKey = 'animas';
        mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={animasSettings}
            settingsState={touched(animasSettings, manufacturerKey)}
          />
        );
        expect(markSettingsViewed.callCount).to.equal(0);
        expect(toggleSettingsSection.callCount).to.equal(0);
      });

      // eslint-disable-next-line max-len
      it('should call `toggleSettingsSection` with `lastManualBasalSchedule` when available', () => {
        sinon.assert.notCalled(toggleSettingsSection);

        const manufacturerKey = 'medtronic';

        mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={medtronicAutomatedSettings}
            settingsState={untouched(medtronicAutomatedSettings, manufacturerKey)}
          />
        );

        sinon.assert.calledOnce(toggleSettingsSection);
        sinon.assert.calledWith(
          toggleSettingsSection,
          manufacturerKey,
          'Standard'
        );
      });

      // eslint-disable-next-line max-len
      it('should call `toggleSettingsSection` with `activeSchedule` when `lastManualBasalSchedule` is not available', () => {
        sinon.assert.notCalled(toggleSettingsSection);

        const manufacturerKey = 'medtronic';
        const medtronicAutomatedSettingsWithoutManual = _.assign({}, medtronicAutomatedSettings, {
          lastManualBasalSchedule: undefined,
        });

        mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={medtronicAutomatedSettingsWithoutManual}
            settingsState={untouched(medtronicAutomatedSettingsWithoutManual, manufacturerKey)}
          />
        );

        sinon.assert.calledOnce(toggleSettingsSection);
        sinon.assert.calledWith(
          toggleSettingsSection,
          manufacturerKey,
          'Auto Mode'
        );
      });
    });

    describe('render', () => {
      it('should render nothing if `settingsState` is empty', () => {
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            pumpSettings={animasSettings}
            settingsState={{}}
          />
        );
        expect(wrapper.html()).to.be.null;
      });

      it('should render `NonTandem` for manufacturerKey of `animas`', () => {
        const manufacturerKey = 'animas';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={animasSettings}
            settingsState={touched(animasSettings, manufacturerKey)}
          />
        );
        expect(wrapper.find(NonTandem)).to.have.length(1);
        expect(wrapper.find(NonTandem).prop('deviceKey')).to.equal('animas');
      });

      it('should render `NonTandem` for manufacturerKey of `carelink`', () => {
        const manufacturerKey = 'carelink';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={medtronicSettings}
            settingsState={touched(medtronicSettings, manufacturerKey)}
          />
        );
        expect(wrapper.find(NonTandem)).to.have.length(1);
        expect(wrapper.find(NonTandem).prop('deviceKey')).to.equal('carelink');
      });

      it('should render `NonTandem` for manufacturerKey of `insulet`', () => {
        const manufacturerKey = 'insulet';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={omnipodSettings}
            settingsState={touched(omnipodSettings, manufacturerKey)}
          />
        );
        expect(wrapper.find(NonTandem)).to.have.length(1);
        expect(wrapper.find(NonTandem).prop('deviceKey')).to.equal('insulet');
      });

      it('should render `NonTandem` for manufacturerKey of `medtronic`', () => {
        const manufacturerKey = 'medtronic';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={medtronicSettings}
            settingsState={touched(medtronicSettings, manufacturerKey)}
          />
        );
        expect(wrapper.find(NonTandem)).to.have.length(1);
        expect(wrapper.find(NonTandem).prop('deviceKey')).to.equal('medtronic');
      });

      it('should render `Tandem` for manufacturerKey of `tandem`', () => {
        const manufacturerKey = 'tandem';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={tandemSettings}
            settingsState={touched(tandemSettings, manufacturerKey)}
          />
        );
        expect(wrapper.find(Tandem)).to.have.length(1);
      });

      it('should console.warn and render `null` if unknown manufacturerKey provided', () => {
        console.warn = sinon.spy();
        expect(console.warn.callCount).to.equal(0);
        const manufacturerKey = 'foo';
        const wrapper = mount(
          <PumpSettingsContainer
            {...props}
            manufacturerKey={manufacturerKey}
            pumpSettings={animasSettings}
            settingsState={untouched(animasSettings, manufacturerKey)}
          />
        );
        expect(wrapper.html()).to.be.null;
        expect(console.warn.callCount).to.equal(1);
        expect(console.warn.args[0][0]).to.equal('Unknown manufacturer key: [foo]!');
      });
    });
  });

  describe('mapStateToProps', () => {
    const manufacturerKey = 'insulet';
    const userId = 'a1b2c3';
    const state = {
      viz: {
        settings: {
          [userId]: {
            [manufacturerKey]: {
              Weekday: true,
              Weekend: false,
            },
            touched: true,
          },
        },
      },
      blip: {
        allUsersMap: {
          [userId]: { user },
        },
      },
    };

    it('should map state.viz.settings[currentPatientInViewId] to `settingsState`', () => {
      expect(mapStateToProps(state, { currentPatientInViewId: userId }).settingsState)
        .to.deep.equal(state.viz.settings[userId]);
    });
    it('should map state.blip.allUsersMap[currentPatientInViewId] to `user`', () => {
      expect(mapStateToProps(state, { currentPatientInViewId: userId }).user)
        .to.deep.equal(state.blip.allUsersMap[userId]);
    });
  });

  describe('mapDispatchToProps', () => {
    const ownProps = { currentPatientInViewId: 'a1b2c3' };

    it('should return an objet with a `markSettingsViewed` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('markSettingsViewed');
    });

    it('should return an objet with a `toggleSettingsSection` key', () => {
      expect(mapDispatchToProps(sinon.stub(), ownProps)).to.have.property('toggleSettingsSection');
    });
  });
});
