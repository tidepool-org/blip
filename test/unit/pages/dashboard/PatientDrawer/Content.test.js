/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import Content from '../../../../../app/pages/dashboard/PatientDrawer/Content';
import { STATUS } from '../../../../../app/pages/dashboard/PatientDrawer/useAgpCGM';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientDrawer/Content', () => {
  const store = mockStore({
    blip: {
      selectedClinicId: '5678-efgh',
      clinics: { '5678-efgh': { patients: { '1234-abcd': { fullName: 'Naoya Inoue' } } } }
    }
  })

  const props = {
    api: { foo: 'bar' },
    patientId: '1234-abcd',
  }
  
  const useAgpCGM = sinon.stub();
  Content.__Rewire__('useAgpCGM', useAgpCGM);

  afterEach(() => {
    useAgpCGM.reset();
  });

  describe('When patient has no data in the platform', () => {
    useAgpCGM.returns({ status: STATUS.NO_PATIENT_DATA })

    const wrapper = mount(<Provider store={store}> <Content {...props} /> </Provider>);

    it('shows no data fields and an appropriate message to the user', () => {
      const wrapperText = wrapper.text();

      expect(wrapperText).to.include('Naoya Inoue does not have any data yet')
      expect(wrapperText).not.to.include('Time in Ranges');
      expect(wrapperText).not.to.include('Ambulatory Glucose Profile (AGP)');
      expect(wrapperText).not.to.include('Daily Glucose Profiles');
    })
  });

  describe('shows no data fields and an appropriate message to the user', () => {
    useAgpCGM.returns({ status: STATUS.INSUFFICIENT_DATA })

    const wrapper = mount(<Provider store={store}> <Content {...props} /> </Provider>);

    it('shows the correct info and actions', () => {
      const wrapperText = wrapper.text();

      expect(wrapperText).to.include('Insufficient data to generate AGP Report.')
      expect(wrapperText).not.to.include('Time in Ranges');
      expect(wrapperText).not.to.include('Ambulatory Glucose Profile (AGP)');
      expect(wrapperText).not.to.include('Daily Glucose Profiles');
    })
  });

  describe('When AGP is still loading', () => {
    useAgpCGM.returns({ status: STATUS.PATIENT_LOADED }) // any intermediate state prior to 'SVGS_GENERATED'

    const wrapper = mount(<Provider store={store}> <Content {...props} /> </Provider>);

    it('shows a loader', () => {
      const wrapperText = wrapper.text();

      expect(wrapper.find('.loader').exists()).to.be.true;
      expect(wrapperText).not.to.include('Time in Ranges');
      expect(wrapperText).not.to.include('Ambulatory Glucose Profile (AGP)');
      expect(wrapperText).not.to.include('Daily Glucose Profiles');
    })
  });

  describe('When AGP is fully loaded', () => {
    context('When enough data to render AGP Graph', () => {
      useAgpCGM.returns({ 
        status: STATUS.SVGS_GENERATED, // any intermediate state prior to 'SVGS_GENERATED'
        svgDataURLS: {
          agpCGM: {
            percentInRanges: 'percentInRanges.img.jpg',
            ambulatoryGlucoseProfile: 'ambulatoryGlucoseProfile.img.jpg',
            dailyGlucoseProfiles: ['daily.top.img.jpg', 'daily.bot.img.jpg']
          }
        },
        agpCGM: null,
      }) 
  
      const wrapper = mount(<Provider store={store}> <Content {...props} /> </Provider>);
  
      it('shows the AGP Report with all images', () => {
        const wrapperText = wrapper.text();
  
        expect(wrapperText).to.include('Time in Ranges');
        expect(wrapperText).to.include('Ambulatory Glucose Profile (AGP)');
        expect(wrapperText).to.include('Daily Glucose Profiles');
        expect(wrapper.find('img[src="percentInRanges.img.jpg"]').exists()).to.be.true;
        expect(wrapper.find('img[src="ambulatoryGlucoseProfile.img.jpg"]').exists()).to.be.true;
        expect(wrapper.find('img[src="daily.top.img.jpg"]').exists()).to.be.true;
        expect(wrapper.find('img[src="daily.bot.img.jpg"]').exists()).to.be.true;
      });
    });

    context('When not enough data to render AGP Graph', () => {
      useAgpCGM.returns({ 
        status: STATUS.SVGS_GENERATED, // any intermediate state prior to 'SVGS_GENERATED'
        svgDataURLS: {
          agpCGM: {
            percentInRanges: 'percentInRanges.img.jpg',
            ambulatoryGlucoseProfile: undefined,
            dailyGlucoseProfiles: ['daily.top.img.jpg', 'daily.bot.img.jpg']
          }
        },
        agpCGM: null,
      }) 
  
      const wrapper = mount(<Provider store={store}> <Content {...props} /> </Provider>);
  
      it('shows the AGP Report with all images', () => {
        const wrapperText = wrapper.text();
  
        expect(wrapperText).to.include('Time in Ranges');
        expect(wrapperText).to.include('Ambulatory Glucose Profile (AGP)');
        expect(wrapperText).to.include('Daily Glucose Profiles');
        expect(wrapperText).to.include('Insufficient CGM data to generate AGP graph');
        expect(wrapper.find('img[src="percentInRanges.img.jpg"]').exists()).to.be.true;
        expect(wrapper.find('img[src="ambulatoryGlucoseProfile.img.jpg"]').exists()).to.be.false;
        expect(wrapper.find('img[src="daily.top.img.jpg"]').exists()).to.be.true;
        expect(wrapper.find('img[src="daily.bot.img.jpg"]').exists()).to.be.true;
      });
    });
  });
});
