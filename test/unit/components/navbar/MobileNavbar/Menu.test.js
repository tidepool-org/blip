import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
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
  let mount;

  const patientProps = {
    userid: '1234',
    profile: {
      fullName: 'Vasyl Lomachenko',
      patient: { birthday: '2010-10-20', mrn: '567890' },
    },
  };

  const clinicPatientProps = {
    id: '1234',
    birthDate: '1965-01-01',
    fullName: 'Vasyl Lomachenko',
    mrn: '999999',
  };

  const defaultProps = {
    user: { roles: [] },
    trackMetric: sinon.stub(),
    api: {},
    patient: { ...patientProps, permissions: { root: {} } },
    clinicPatient: { ...clinicPatientProps },
    permsOfLoggedInUser: {},
  };

  let wrapper;

  const handleViewData = sinon.stub();
  const handleViewSettingsChart = sinon.stub();
  const handleShare = sinon.stub();
  const handleSelectWorkspace = sinon.stub();
  const handleViewAccountSettings = sinon.stub();
  const handleLogout = sinon.stub();

  before(() => {
    mount = createMount();
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
  });

  after(() => {
    Menu.__ResetDependency__('useNavigation');
    mount.cleanUp();
  });

  afterEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  describe('Component Visibility', () => {
    it('should show Share button when user has correct permissions', () => {
      wrapper = mount(<Menu {...defaultProps} />);
      expect(wrapper.find('Button#mobileNavbar_shareButton').exists()).to.be.true;
    });

    it('should hide Share button when user no permissions', () => {
      const testProps = _.cloneDeep(defaultProps);
      delete testProps.patient.permissions.root;

      wrapper = mount(<Menu {...testProps} />);
      expect(wrapper.find('Button#mobileNavbar_shareButton').exists()).to.be.false;
    });
  });

  describe('Button Actions', () => {
    beforeEach(() => {
      wrapper = mount(<Menu {...defaultProps} />);
    });

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
