import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Menu from '../../../../../app/components/navbar/MobileNavbar/Menu';
import { useNavigation } from '../../../../../app/core/navutils';

jest.mock('../../../../../app/core/navutils', () => {
  const actual = jest.requireActual('../../../../../app/core/navutils');
  return {
    ...actual,
    useNavigation: jest.fn(),
  };
});

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global afterEach */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('MobileNavbar/Menu', () => {
  const store = mockStore({
    blip: {
      clinicFlowActive: false,
      selectedClinicId: null,
      currentPatientInViewId: '1234-abcd',
      permissionsOfMembersInTargetCareTeam: { '1234-abcd': { root: {} } },
      loggedInUserId: '1234-abcd',
      allUsersMap: {
        '1234-abcd': {
          userid: '1234',
          profile: {
            fullName: 'Vasyl Lomachenko',
            patient: { birthday: '2010-10-20', mrn: '567890' },
          },
        },
      },
    },
  });

  const defaultProps = {
    user: { roles: [] },
    trackMetric: sinon.stub(),
    api: {},
  };

  let container;

  const handleViewData = sinon.stub();
  const handleViewSettingsChart = sinon.stub();
  const handleShare = sinon.stub();
  const handleSelectWorkspace = sinon.stub();
  const handleViewAccountSettings = sinon.stub();
  const handleLogout = sinon.stub();

  beforeEach(() => {
    useNavigation.mockReturnValue({
      handleViewData,
      handleViewSettingsChart,
      handleShare,
      handleSelectWorkspace,
      handleViewAccountSettings,
      handleLogout,
    });

    handleViewData.resetHistory();
    handleViewSettingsChart.resetHistory();
    handleShare.resetHistory();
    handleSelectWorkspace.resetHistory();
    handleViewAccountSettings.resetHistory();
    handleLogout.resetHistory();

    const rendered = render(
      <Provider store={store}>
        <Menu {...defaultProps} />
      </Provider>
    );
    container = rendered.container;
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  const openMenu = () => {
    fireEvent.click(container.querySelector('#mobile-navigation-menu-trigger'));
  };

  describe('Component Visibility', () => {
    it('should show Share button when user has correct permissions', () => {
      openMenu();
      expect(!!document.querySelector('#mobileNavbar_shareButton')).to.be.true;
    });

    it('should show Devices button when user has correct context', () => {
      openMenu();
      expect(!!document.querySelector('#mobileNavbar_settingsChartButton')).to.be.true;
    });
  });

  describe('Button Actions', () => {
    it('should navigate to view data when button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_viewDataButton'));
      expect(handleViewData.calledOnce).to.be.true;
    });

    it('should navigate to view settings when button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_settingsChartButton'));
      expect(handleViewSettingsChart.calledOnce).to.be.true;
    });

    it('should navigate to share page button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_shareButton'));
      expect(handleShare.calledOnce).to.be.true;
    });

    it('should navigate to private workspace when button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_workspaceButton'));
      expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
    });

    it('should navigate to account settings when button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_accountSettingsButton'));
      expect(handleViewAccountSettings.calledOnce).to.be.true;
    });

    it('should logout when button is pressed', () => {
      openMenu();
      fireEvent.click(document.querySelector('#mobileNavbar_logoutButton'));
      expect(handleLogout.calledOnce).to.be.true;
    });
  });
});
