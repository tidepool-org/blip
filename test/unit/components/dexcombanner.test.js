/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { DexcomBanner } from '../../../app/components/dexcombanner';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import { URL_DEXCOM_CONNECT_INFO } from '../../../app/core/constants';
import Button from '../../../app/components/elements/Button';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('DexcomBanner', () => {
  const props = {
    onClick: sinon.stub(),
    onClose: sinon.stub(),
    patient: { userid: 'patient1' },
    trackMetric: sinon.stub(),
    push: sinon.stub(),
    api: {
      clinics: {
        sendPatientDexcomConnectRequest: sinon.stub().callsArgWith(2, null, { lastRequestedDexcomConnectTime: '2022-02-02T00:00:00.000Z'}),
      },
    },
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const blipState = {
    blip: {
      working: {
        sendingPatientDexcomConnectRequest: defaultWorkingState,
      },
      timePrefs: {
        timezoneName: 'UTC'
      },
    },
  };

  const clinicPatient = {
    id: 'clinicPatient123',
    email: 'patient1@test.ca',
    fullName: 'patient1',
    birthDate: '1999-01-01',
    lastRequestedDexcomConnectTime: '2021-10-19T16:27:59.504Z',
    dataSources: [
      { providerName: 'dexcom', state: 'error' },
    ],
  };

  let store = mockStore(blipState);

  let wrapper;

  const createWrapper = (props) => {
    return wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <DexcomBanner
            {...props}
          />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    wrapper = createWrapper(props);
  });

  afterEach(() => {
    props.onClose.reset();
    props.onClick.reset();
    props.trackMetric.reset();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.dexcomBanner')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.onClose);
    sinon.assert.calledWith(props.onClose, props.patient.userid);
  });

  it('should track the appropriate metric when the close link is clicked for the banner', () => {
    const closeLink = wrapper.find('a.close');
    closeLink.simulate('click');
    sinon.assert.calledOnce(props.trackMetric);
    sinon.assert.calledWith(props.trackMetric, 'dismiss Dexcom OAuth banner');
  });

  describe('render', function () {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.dexcomBanner')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    context('initial connection banner', () => {
      it('should track the appropriate metric when the learn more link is clicked', () => {
        const moreLink = wrapper.find('a.message-link');
        moreLink.simulate('click');
        sinon.assert.calledOnce(props.trackMetric);
        sinon.assert.calledWith(props.trackMetric, 'clicked learn more Dexcom OAuth banner');
      });

      it('should call the submit handler when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledOnce(props.onClick);
      });

      it('should track the metrics when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledOnce(props.trackMetric);
        sinon.assert.calledWith(props.trackMetric, 'clicked get started on Dexcom banner');
      });

      it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
        const closeLink = wrapper.find('a.close');
        closeLink.simulate('click');
        sinon.assert.calledOnce(props.onClose);
        sinon.assert.calledWith(props.onClose, props.patient.userid);
      });

      it('should render the correct dexcom connection message', () => {
        const expectedText = 'Using Dexcom G5 Mobile on Android? See your data in Tidepool.'
        const messageText = wrapper.find('.message-text');

        expect(messageText).to.have.length(1);
        expect(messageText.text()).contains(expectedText);
      });

      it('should render a link to the dexcom connect info on the website', () => {
        const expectedText = 'Learn More'
        const messageLink = wrapper.find('.message-link');

        expect(messageLink).to.have.length(1);
        expect(messageLink.find({ href: URL_DEXCOM_CONNECT_INFO })).to.have.length(1);
        expect(messageLink.text()).contains(expectedText);
      });

      it('should render a get started button', () => {
        const expectedText = 'Get Started'
        const button = wrapper.find('.dexcomBanner-action button');

        expect(button).to.have.length(1);
        expect(button.text()).contains(expectedText);
      });

      it('should render a close link to dismiss the banner', () => {
        const closeLink = wrapper.find('a.close');
        expect(closeLink).to.have.length(1);
      });
    });

    context('reconnection required banner - user viewing own data', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          ...props,
          dataSourceState: 'error',
          userIsCurrentPatient: true,
        });
      });

      it('should call the submit handler when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledOnce(props.onClick);
        sinon.assert.calledWith(props.onClick, props.patient.userid);
      });

      it('should track the metrics when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledOnce(props.trackMetric);
        sinon.assert.calledWith(props.trackMetric, 'clicked reconnect on Dexcom banner');
      });

      it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
        const closeLink = wrapper.find('a.close');
        closeLink.simulate('click');
        sinon.assert.calledOnce(props.onClose);
        sinon.assert.calledWith(props.onClose, props.patient.userid);
      });

      it('should render the correct dexcom connection message', () => {
        const expectedText = 'Tidepool is no longer receiving CGM data for your account.'
        const messageText = wrapper.find('.message-text');

        expect(messageText).to.have.length(1);
        expect(messageText.text()).contains(expectedText);
      });

      it('should render a "Fix in My Data Sources" button', () => {
        const expectedText = 'Fix in My Data Sources'
        const button = wrapper.find('.dexcomBanner-action button');

        expect(button).to.have.length(1);
        expect(button.text()).contains(expectedText);
      });

      it('should render a close link to dismiss the banner', () => {
        const closeLink = wrapper.find('a.close');
        expect(closeLink).to.have.length(1);
      });
    });

    context('reconnection required banner - clinician user viewing patient data', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          ...props,
          clinicPatient,
          dataSourceState: 'error',
          userIsCurrentPatient: false,
          selectedClinicId: 'clinicID123',
        });
      });

      it('should call the submit handler when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledOnce(props.onClick);
        sinon.assert.calledWith(props.onClick, 'clinicPatient123');
      });

      it('should track the metrics when the dexcom button is clicked', () => {
        const button = wrapper.find('.dexcomBanner-action button');
        button.simulate('click');
        sinon.assert.calledTwice(props.trackMetric);
        sinon.assert.calledWith(props.trackMetric, 'Clinic - Resend Dexcom connect email', {
          clinicId: 'clinicID123',
          dexcomConnectState: 'error',
          source: 'banner',
        });
        sinon.assert.calledWith(props.trackMetric, 'clicked request reconnection on Dexcom banner');
      });

      it('should call the dismiss handler with the patient userid when the close link is clicked', () => {
        const closeLink = wrapper.find('a.close');
        closeLink.simulate('click');
        sinon.assert.calledOnce(props.onClose);
        sinon.assert.calledWith(props.onClose, 'clinicPatient123');
      });

      it('should render the correct dexcom connection message', () => {
        const expectedText = 'Tidepool is no longer receiving CGM data for this account.'
        const messageText = wrapper.find('.message-text');

        expect(messageText).to.have.length(1);
        expect(messageText.text()).contains(expectedText);
      });

      it('should render a "Request Reconnection" button', () => {
        const expectedText = 'Request Reconnection'
        const button = wrapper.find('.dexcomBanner-action button');

        expect(button).to.have.length(1);
        expect(button.text()).contains(expectedText);
      });

      it('should open a confirmation dialog to resend the reconnection email', () => {
        const resendButton = () => wrapper.find('.dexcomBanner-action button');
        const resendDialog = () => wrapper.find('#resendDexcomConnectRequest').at(1);
          expect(resendDialog().props().open).to.be.false;
          resendButton().simulate('click');
          expect(resendDialog().props().open).to.be.true;

          expect(resendDialog().text()).to.have.string('10/19/2021 at 4:27 pm');

          const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
          expect(resendInvite).to.have.length(1);

          const expectedActions = [
            {
              type: 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST',
            },
            {
              type: 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS',
              payload: {
                clinicId: 'clinicID123',
                lastRequestedDexcomConnectTime: '2022-02-02T00:00:00.000Z',
                patientId: 'clinicPatient123',
              },
            },
          ];

          store.clearActions();
          resendInvite.props().onClick();
          expect(store.getActions()).to.eql(expectedActions);
          sinon.assert.calledWith(
            props.api.clinics.sendPatientDexcomConnectRequest,
            'clinicID123',
            'clinicPatient123'
          );
      });

      it('should render a close link to dismiss the banner', () => {
        const closeLink = wrapper.find('a.close');
        expect(closeLink).to.have.length(1);
      });
    });
  });
});
