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

import { getChart } from '../../../../src/utils/settings/factory';
import { MGDL_UNITS } from '../../../../src/utils/constants';

const animasFlatRateData = require('../../../../data/pumpSettings/animas/flatrate.json');
const animasMultiRateData = require('../../../../data/pumpSettings/animas/multirate.json');
const omnipodFlatRateData = require('../../../../data/pumpSettings/omnipod/flatrate.json');
const omnipodMultiRateData = require('../../../../data/pumpSettings/omnipod/multirate.json');
const medtronicMultiRateData = require('../../../../data/pumpSettings/medtronic/multirate.json');

const timePrefs = { timezoneAware: false, timezoneName: null };

describe('NonTandem', () => {
  const activeAtUploadText = 'Active at upload';

  describe('Animas', () => {
    const Animas = getChart('Animas');
    it('should render without problems when bgUnits and pumpSettings provided', () => {
      console.error = sinon.stub();
      mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a header', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Animas as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Animas');
    });

    it('should have four Tables', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Table')).to.have.length(4);
    });

    it('should have three CollapsibleContainers', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('CollapsibleContainer')).to.have.length(3);
    });

    it('should preserve user capitalization of schedule name', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasFlatRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search('normal') !== -1)))
        .to.be.true;
      expect(wrapper.find('.label').someWhere(n => (n.text().search('Weekday') !== -1)))
        .to.be.true;
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <Animas
          bgUnits={MGDL_UNITS}
          pumpSettings={animasMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });

  describe('Insulet', () => {
    const Insulet = getChart('Insulet');
    it('should render without problems when bgUnits and pumpSettings provided', () => {
      console.error = sinon.stub();
      mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a header', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have OmniPod as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('OmniPod');
    });

    it('should have four Tables', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Table')).to.have.length(4);
    });

    it('should have two CollapsibleContainers', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('CollapsibleContainer')).to.have.length(2);
    });

    it('should preserve user capitalization of schedule name', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodFlatRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search('normal') !== -1)))
        .to.be.true;
    });

    it('should have `Active at Upload` text somewhere', () => {
      const wrapper = mount(
        <Insulet
          bgUnits={MGDL_UNITS}
          pumpSettings={omnipodMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });

  describe('Medtronic', () => {
    const Medtronic = getChart('Medtronic');
    it('should render without problems when bgUnits and pumpSettings provided', () => {
      console.error = sinon.stub();
      mount(
        <Medtronic
          bgUnits={MGDL_UNITS}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(console.error.callCount).to.equal(0);
    });

    it('should have a header', () => {
      const wrapper = mount(
        <Medtronic
          bgUnits={MGDL_UNITS}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header')).to.have.length(1);
    });

    it('should have Medtronic as the Header deviceDisplayName', () => {
      const wrapper = mount(
        <Medtronic
          bgUnits={MGDL_UNITS}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('Header').props().deviceDisplayName).to.equal('Medtronic');
    });

    it('should capitalize all basal schedule names', () => {
      const wrapper = mount(
        <Medtronic
          bgUnits={MGDL_UNITS}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
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
        <Medtronic
          bgUnits={MGDL_UNITS}
          pumpSettings={medtronicMultiRateData}
          timePrefs={timePrefs}
        />
      );
      expect(wrapper.find('.label').someWhere(n => (n.text().search(activeAtUploadText) !== -1)))
        .to.be.true;
    });
  });
});
