/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global sinon */
/* global jest */

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import _ from 'lodash';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import * as navutils from '../../../app/core/navutils';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('navutils', () => {
  describe('useNavigation', () => {
    const { useNavigation, uploadUtils } = navutils;

    const getWrapper = (store) => ({ children }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          {children}
        </MemoryRouter>
      </Provider>);

    const api = { user: { logout: sinon.stub() } };
    const trackMetric = sinon.stub();
    const launchCustomProtocolStub = sinon.stub(uploadUtils, 'launchCustomProtocol');

    const state = {
      blip: {
        clinicFlowActive: false,
        selectedClinicId: null,
        currentPatientInViewId: '1234-abcd',
        allUsersMap: { '1234-abcd': { name: 'Emanuel Augustus' } },
      },
    };

    let store;
    let wrapper;

    beforeEach(() => {
      store = mockStore(state);
      wrapper = getWrapper(store);
    });

    afterEach(() => {
      trackMetric.resetHistory();
      launchCustomProtocolStub.resetHistory();
      store.clearActions();
    });

    context('When patient is in state', () => {
      it('handles the back action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleBack } = result.current;

        handleBack();

        expect(store.getActions()).to.eql([{
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { args: ['/patients'], method: 'push' },
        }]);
      });

      it('launches the uploader correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleLaunchUploader } = result.current;

        handleLaunchUploader();

        expect(trackMetric.calledOnceWithExactly('Clicked Navbar Upload Data')).to.be.true;
        expect(launchCustomProtocolStub.calledOnceWithExactly('tidepoolupload://open')).to.be.true;
      });


      it('handles the view data action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleViewData } = result.current;

        handleViewData();

        expect(store.getActions()).to.eql([{
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { args: ['/patients/1234-abcd/data'], method: 'push' },
        }]);
      });

      it('handles the view settings chart action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleViewSettingsChart } = result.current;

        handleViewSettingsChart();

        expect(store.getActions()).to.eql([{
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { args: ['/patients/1234-abcd/data/settings'], method: 'push' },
        }]);
      });

      it('handles the share action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleShare } = result.current;

        handleShare();

        expect(store.getActions()).to.eql([{
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { args: ['/patients/1234-abcd/share'], method: 'push' },
        }]);
      });

      it('handles the select workspace action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleSelectWorkspace } = result.current;

        handleSelectWorkspace(null);

        expect(store.getActions()).to.eql([
          {
            type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT',
            payload: { textInput: '' },
          },
          {
            type: 'SET_IS_PATIENT_LIST_VISIBLE',
            payload: { isVisible: false },
          },
          {
            type: 'SELECT_CLINIC_SUCCESS',
            payload: { clinicId: null }, // null is appropriate for switch to private workspace
          },
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              args: ['/patients', { selectedClinicId: null }],
              method: 'push',
            },
          },
        ]);
      });

      it('handles the view manage workspaces action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleViewManageWorkspaces } = result.current;

        handleViewManageWorkspaces(null);

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              args: ['/workspaces'],
              method: 'push',
            },
          },
        ]);
      });

      it('handles the view account settings action correctly', () => {
        const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
        const { handleViewAccountSettings } = result.current;

        handleViewAccountSettings();

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              args: ['/profile'],
              method: 'push',
            },
          },
        ]);
      });
    });

    it('handles the logout action correctly', () => {
      const { result } = renderHook(() => useNavigation(api, trackMetric), { wrapper });
      const { handleLogout } = result.current;

      handleLogout();

      expect(api.user.logout.calledOnce).to.be.true;
    });
  });
});
