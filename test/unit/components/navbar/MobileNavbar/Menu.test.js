import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Menu from '../../../../../app/components/navbar/MobileNavbar/Menu';
import _ from 'lodash';

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

  let wrapper;

  const handleViewData = sinon.stub();
  const handleViewSettingsChart = sinon.stub();
  const handleShare = sinon.stub();
  const handleSelectWorkspace = sinon.stub();
  const handleViewAccountSettings = sinon.stub();
  const handleLogout = sinon.stub();

  before(() => {
    Menu.__Rewire__('useNavigation', sinon.stub().returns({
      handleViewData,
      handleViewSettingsChart,
      handleShare,
      handleSelectWorkspace,
      handleViewAccountSettings,
      handleLogout,
    }));
  });

  beforeEach(() => {
    handleViewData.resetHistory();
    handleViewSettingsChart.resetHistory();
    handleShare.resetHistory();
    handleSelectWorkspace.resetHistory();
    handleViewAccountSettings.resetHistory();
    handleLogout.resetHistory();

    wrapper = mount(
      <Provider store={store}>
        <Menu {...defaultProps} />
      </Provider>
    );
  });

  after(() => {
    Menu.__ResetDependency__('useNavigation');
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  describe('Component Visibility', () => {
    it('should show Share button when user has correct permissions', () => {
      expect(wrapper.find('Button#mobileNavbar_shareButton').exists()).to.be.true;
    });
  });

  describe('Button Actions', () => {
    it('should navigate to view data when button is pressed', () => {
      wrapper.find('Button#mobileNavbar_viewDataButton').simulate('click');
      expect(handleViewData.calledOnce).to.be.true;
    });

    it('should navigate to view settings when button is pressed', () => {
      wrapper.find('Button#mobileNavbar_settingsChartButton').simulate('click');
      expect(handleViewSettingsChart.calledOnce).to.be.true;
    });

    it('should navigate to share page button is pressed', () => {
      wrapper.find('Button#mobileNavbar_shareButton').simulate('click');
      expect(handleShare.calledOnce).to.be.true;
    });

    it('should navigate to private workspace action when button is pressed', () => {
      wrapper.find('Button#mobileNavbar_workspaceButton').simulate('click');
      expect(handleSelectWorkspace.calledOnceWithExactly(null)).to.be.true;
    });

    it('should navigate to private workspace action when button is pressed', () => {
      wrapper.find('Button#mobileNavbar_accountSettingsButton').simulate('click');
      expect(handleViewAccountSettings.calledOnce).to.be.true;
    });

    it('should navigate to private workspace action when button is pressed', () => {
      wrapper.find('Button#mobileNavbar_logoutButton').simulate('click');
      expect(handleLogout.calledOnce).to.be.true;
    });
  });
});
