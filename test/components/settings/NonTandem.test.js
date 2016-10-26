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
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import NonTandem from '../../../src/components/settings/NonTandem';
import { MGDL_UNITS } from '../../../src/utils/constants';

const animasMultiRateData = require('../../../data/pumpSettings/animas/multirate.json');
const omnipodMultiRateData = require('../../../data/pumpSettings/omnipod/multirate.json');
const medtronicMultiRateData = require('../../../data/pumpSettings/medtronic/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: 'Europe/London' };

describe('NonTandem', () => {
  const activeAtUploadText = 'Active at upload';
  const mockStore = configureStore()();

  describe('Animas', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'animas'}
          pumpSettings={animasMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Animas as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'animas'}
          pumpSettings={animasMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Animas');
    });

    it('should have four Tables', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'animas'}
          pumpSettings={animasMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Table')).to.have.length(4);
    });

    it('should have three CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'animas'}
          pumpSettings={animasMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('CollapsibleContainer')).to.have.length(3);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          pumpSettings={animasMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
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
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'insulet'}
          pumpSettings={omnipodMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have OmniPod as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'insulet'}
          pumpSettings={omnipodMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('OmniPod');
    });

    it('should have four Tables', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'insulet'}
          pumpSettings={omnipodMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Table')).to.have.length(4);
    });

    it('should have two CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'insulet'}
          pumpSettings={omnipodMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('CollapsibleContainer')).to.have.length(2);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          pumpSettings={omnipodMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });

  describe('Medtronic', () => {
    it('should have a header', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'carelink'}
          pumpSettings={medtronicMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Medtronic as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'carelink'}
          pumpSettings={medtronicMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Medtronic');
    });

    it('should have four CollapsibleContainers', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'carelink'}
          pumpSettings={medtronicMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Table')).to.have.length(4);
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <NonTandem
          bgUnits={MGDL_UNITS}
          currentPatientInViewId="a1b2c3"
          manufacturerKey={'carelink'}
          pumpSettings={medtronicMultiRateData}
          store={mockStore}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });
});
