/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global context */
/* global beforeEach */
/* global afterEach */

var React = require('react');
var _ = require('lodash');
var TestUtils = require('react-dom/test-utils');

import { mount } from 'enzyme';
import mutationTracker from 'object-invariant-test-helper';
import {
  mapStateToProps,
  getFetchers,
} from '../../../app/pages/app/app.js';
import initialState from '../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../app/redux/constants/errorMessages';

var App = require('../../../app/pages/app/app.js').AppComponent;
var api = require('../../../app/core/api');
var personUtils = require('../../../app/core/personutils');

var assert = chai.assert;
var expect = chai.expect;

describe('App', () => {

  api.log = sinon.stub();

  var baseProps = {
    context: {
      DEBUG: false,
      api: {},
      config: {},
      log: sinon.stub(),
      personUtils: personUtils,
      trackMetric: sinon.stub()
    },
  };

  describe('constructor', () => {
    var props = _.assign({}, baseProps, {
      authenticated: false,
      children: (<React.Fragment></React.Fragment>),
      fetchers: [],
      fetchingPatient: false,
      fetchingUser: {
        inProgress: false,
        completed: null,
      },
      fetchingDataSources: {
        inProgress: false,
        completed: null,
      },
      location: '/foo',
      loggingOut: false,
      onAcceptTerms: sinon.stub(),
      onCloseNotification: sinon.stub(),
      onLogout: sinon.stub()
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    it('should set the `dexcomShowBannerMetricTracked` state to false', () => {
      expect(wrapper.state().dexcomShowBannerMetricTracked).to.be.false;
    });

  });

  describe('render', () => {
    it('should render without problems or warnings when required props provided', () => {
      var props = _.assign({}, baseProps, {
        authenticated: false,
        children: (<React.Fragment></React.Fragment>),
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: {
          inProgress: false,
          completed: null,
        },
        fetchingDataSources: {
          inProgress: false,
          completed: null,
        },
        location: '/foo',
        loggingOut: false,
        onAcceptTerms: sinon.stub(),
        onCloseNotification: sinon.stub(),
        onLogout: sinon.stub()
      });

      var elem = TestUtils.renderIntoDocument(<App {...props}/>);
      expect(elem).to.be.ok;
      var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
      expect(app).to.be.ok;
    });


    it('should console.error when required props not provided', () => {
      console.error = sinon.stub();

      var elem = TestUtils.renderIntoDocument(<App {...baseProps}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(11);
      var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
      expect(app).to.be.ok;
    });

    it('should render footer', () => {
      var elem = TestUtils.renderIntoDocument(<App {...baseProps} />);
      var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
      expect(footer).to.be.ok;
    });

    it('should not render a version element when version not set in config', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : null };
      var elem = TestUtils.renderIntoDocument(<App {...props} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(0);
    });

    it('should render version when version present in config', () => {
      var props = _.clone(baseProps);
      props.context.config = { VERSION : 1.4 };
      var elem = TestUtils.renderIntoDocument(<App {...props} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Version');
      expect(versionElems.length).to.equal(1);
    });
  });

  describe('renderShareDataBanner', () => {
    let props = _.assign({}, baseProps, {
      showingShareDataBanner: null,
      onClickShareDataBanner: sinon.stub(),
      onDismissShareDataBanner: sinon.stub(),
      showBanner: sinon.stub(),
      hideBanner: sinon.stub(),
      patient: {},
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    it('should render the banner or not based on the `showingShareDataBanner` prop value', () => {
      wrapper.setProps({ showingShareDataBanner: true });
      expect(wrapper.find('.App-sharedatabanner').length).to.equal(1);

      wrapper.setProps({ showingShareDataBanner: null });
      expect(wrapper.find('.App-sharedatabanner').length).to.equal(0);

      wrapper.setProps({ showingShareDataBanner: false });
      expect(wrapper.find('.App-sharedatabanner').length).to.equal(0);
    });
  });

  describe('renderDonateBanner', () => {
    let props = _.assign({}, baseProps, {
      showingDonateBanner: null,
      onDismissDonateBanner: sinon.stub(),
      onUpdateDataDonationAccounts: sinon.stub(),
      showBanner: sinon.stub(),
      hideBanner: sinon.stub(),
      patient: {},
      userIsDonor: true,
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    it('should render the banner or not based on the `showingDonateBanner` prop value', () => {
      wrapper.setProps({ showingDonateBanner: true });
      expect(wrapper.find('.App-donatebanner').length).to.equal(1);

      wrapper.setProps({ showingDonateBanner: null });
      expect(wrapper.find('.App-donatebanner').length).to.equal(0);

      wrapper.setProps({ showingDonateBanner: false });
      expect(wrapper.find('.App-donatebanner').length).to.equal(0);
    });
  });

  describe('renderDexcomConnectBanner', () => {
    let props = _.assign({}, baseProps, {
      showingDexcomConnectBanner: null,
      onClickDexcomConnectBanner: sinon.stub(),
      onDismissDexcomConnectBanner: sinon.stub(),
      showBanner: sinon.stub(),
      hideBanner: sinon.stub(),
      patient: {},
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    it('should render the banner or not based on the `showingDexcomConnectBanner` prop value', () => {
      wrapper.setProps({ showingDexcomConnectBanner: true });
      expect(wrapper.find('.App-dexcombanner').length).to.equal(1);

      wrapper.setProps({ showingDexcomConnectBanner: null });
      expect(wrapper.find('.App-dexcombanner').length).to.equal(0);

      wrapper.setProps({ showingDexcomConnectBanner: false });
      expect(wrapper.find('.App-dexcombanner').length).to.equal(0);
    });
  });

  describe('renderEmailBanner', () => {
    let props = _.assign({}, baseProps, {
      showingDexcomConnectBanner: null,
      onClickDexcomConnectBanner: sinon.stub(),
      onDismissDexcomConnectBanner: sinon.stub(),
      showBanner: sinon.stub(),
      hideBanner: sinon.stub(),
      patient: {},
      resendEmailVerificationProgress: false,
      resentEmailVerification: false,
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    it('should render the banner or not based on the patient username and permsOfLoggedInUser prop values', () => {
      expect(wrapper.find('.App-addemailbanner').length).to.equal(0);
      expect(wrapper.find('.App-sendverificationbanner').length).to.equal(0);

      wrapper.setProps({ patient: {username: 'someEmail'}, permsOfLoggedInUser: {custodian:{}} });
      expect(wrapper.find('.App-addemailbanner').length).to.equal(0);
      expect(wrapper.find('.App-sendverificationbanner').length).to.equal(1);

      wrapper.setProps({ patient: {}, permsOfLoggedInUser: {custodian:{}} });
      expect(wrapper.find('.App-addemailbanner').length).to.equal(1);
      expect(wrapper.find('.App-sendverificationbanner').length).to.equal(0);

      wrapper.setProps({ patient: {}, permsOfLoggedInUser: {} });
      expect(wrapper.find('.App-addemailbanner').length).to.equal(0);
      expect(wrapper.find('.App-sendverificationbanner').length).to.equal(0);

      wrapper.setProps({ patient: {username: 'someEmail'}, permsOfLoggedInUser: {} });
      expect(wrapper.find('.App-addemailbanner').length).to.equal(0);
      expect(wrapper.find('.App-sendverificationbanner').length).to.equal(0);
    });
  });

  describe('componentWillReceiveProps', () => {
    let props = _.assign({}, baseProps, {
      showBanner: sinon.stub(),
      hideBanner: sinon.stub(),
      context: {
        log: sinon.stub(),
        trackMetric: sinon.stub(),
        config: { VERSION: 1 },
      },
    });

    let wrapper;
    beforeEach(() => {
      wrapper = mount(<App {...props} />);
    });

    afterEach(() => {
      props.showBanner.reset();
      props.hideBanner.reset();
      props.context.trackMetric.reset();
    });

    context('user has uploaded data and has not shared data with a clinician', () => {
      it('should show the share data banner, but only if user is on a patient data view', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });
        sinon.assert.callCount(props.showBanner, 0);

        wrapper.setProps({ location: '/patients/1234/data' })
        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWith(props.showBanner, 'sharedata');
      });

      it('should not show the share data banner if user has dismissed it', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWith(props.showBanner, 'sharedata');
        props.showBanner.reset();

        wrapper.setProps({
          showingShareDataBanner: false,
        });

        sinon.assert.neverCalledWithMatch(props.showBanner, 'sharedata');
      });

      it('should not show the share data banner if user has seen it three times', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          patient: {
            userid: '1234'
          },
          seenShareDataBannerMax: true,
        });

        sinon.assert.neverCalledWithMatch(props.showBanner, 'sharedata');
      });
    });

    context('user has uploaded data and has shared data with a clinician', () => {
      it('should not show the share data banner', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          userHasSharedDataWithClinician: true,
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });

        sinon.assert.neverCalledWithMatch(props.showBanner, 'sharedata');

      });
    });

    context('user has uploaded data, dismissed share data banner, and has not donated data', () => {
      it('should show the donate banner, but only if user is on a patient data view', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          showingShareDataBanner: false,
        });

        sinon.assert.callCount(props.showBanner, 0);

        wrapper.setProps({ location: '/patients/1234/data' })
        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWith(props.showBanner, 'donate');
      });

      it('should not show the donate banner if user has dismissed it', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          showingShareDataBanner: false,
          location: '/patients/1234/data',
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWith(props.showBanner, 'donate');
        props.showBanner.reset();

        wrapper.setProps({
          showingDonateBanner: false,
        });

        sinon.assert.neverCalledWithMatch(props.showBanner, 'donate');
      });
    });

    context('user has not uploaded data and has not donated data', () => {
      it('should not show the banner', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: false,
          showingDonateBanner: true,
          location: '/patients/1234/data',
        });

        sinon.assert.callCount(props.showBanner, 0);
        sinon.assert.callCount(props.hideBanner, 1);
        sinon.assert.calledWith(props.hideBanner, 'donate');
      });
    });

    context('user has uploaded data but is not the current patient in view', () => {
      it('should not show the banner', () => {
        wrapper.setProps({
          userIsCurrentPatient: false,
          userHasData: true,
          showingDonateBanner: true,
          location: '/patients/1234/data',
        });

        sinon.assert.callCount(props.showBanner, 0);
        sinon.assert.callCount(props.hideBanner, 1);
        sinon.assert.calledWith(props.hideBanner, 'donate');
      });
    });

    context('user has dismissed the share data banner, uploaded data and has donated data, but not chosen a nonprofit to share proceeds with', () => {
      it('should show the banner', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          showingShareDataBanner: false,
          showingDonateBanner: true,
          userIsSupportingNonprofit: false,
          location: '/patients/1234/data',
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWith(props.showBanner, 'donate');
      });
    });

    context('user has has dismissed the share data banner, uploaded data and has donated data and has chosen a nonprofit to share proceeds with', () => {
      it('should hide the donate banner', () => {
        wrapper.setProps({
          userHasUploadedData: true,
          showingShareDataBanner: false,
          showingDonateBanner: true,
          userIsSupportingNonprofit: true,
          location: '/patients/1234/data',
        });

        sinon.assert.callCount(props.hideBanner, 1);
        sinon.assert.calledWith(props.hideBanner, 'donate');
      });
    });

    context('donate banner is showing', () => {
      it('should not show the dexcom banner', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingShareDataBanner: false,
          showingDonateBanner: true,
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWithMatch(props.showBanner, 'donate');
        sinon.assert.neverCalledWithMatch(props.showBanner, 'dexcom');
      });
    });

    context('share data and donate banners are not showing', () => {
      beforeEach(() => {
        wrapper.setProps({
          showingDonateBanner: false,
          showingShareDataBanner: false,
        });
      });

      context('user has uploaded data and has not already connected to a datasource', () => {
        it('should show the dexcom banner, but only if user is on a patient data view', () => {
          wrapper.setProps({
            userIsCurrentPatient: true,
            userHasConnectedDataSources: false,
            userHasData: true,
          });

          sinon.assert.callCount(props.showBanner, 0);

          wrapper.setProps({ location: '/patients/1234/data' })
          sinon.assert.callCount(props.showBanner, 1);
          sinon.assert.calledWith(props.showBanner, 'dexcom');
        });

        it('should not show the dexcom banner if user has dismissed it', () => {
          wrapper.setProps({
            userIsCurrentPatient: true,
            userHasConnectedDataSources: false,
            userHasData: true,
            location: '/patients/1234/data',
          });

          sinon.assert.callCount(props.showBanner, 1);
          sinon.assert.calledWith(props.showBanner, 'dexcom');
          props.showBanner.reset();

          wrapper.setProps({
            showingDexcomConnectBanner: false,
          });

          sinon.assert.neverCalledWithMatch(props.showBanner, 'dexcom');
        });
      });

      context('user has not uploaded data and has not connected to a data source', () => {
        it('should not show the dexcom banner', () => {
          wrapper.setProps({
            userIsCurrentPatient: true,
            userHasConnectedDataSources: false,
            userHasData: false,
            location: '/patients/1234/data',
          });

          sinon.assert.neverCalledWithMatch(props.showBanner, 'dexcom')
        });
      });

      context('user has uploaded data but is not the current patient in view', () => {
        it('should not show the dexcom banner', () => {
          wrapper.setProps({
            userIsCurrentPatient: false,
            userHasData: true,
            location: '/patients/1234/data',
          });

          sinon.assert.neverCalledWithMatch(props.showBanner, 'dexcom')
        });
      });

      context('user has uploaded data, but has not connected a data source', () => {
        it('should show the dexcom banner', () => {
          wrapper.setProps({
            userIsCurrentPatient: true,
            userHasData: true,
            userHasConnectedDataSources: false,
            location: '/patients/1234/data',
          });

          sinon.assert.callCount(props.showBanner, 1);
          sinon.assert.calledWith(props.showBanner, 'dexcom');
        });
      });

      context('user has uploaded data and has connected a data source', () => {
        it('should not show the banner', () => {
          wrapper.setProps({
            userHasUploadedData: true,
            userHasConnectedDataSources: true,
            location: '/patients/1234/data',
          });

          sinon.assert.neverCalledWithMatch(props.showBanner, 'dexcom')
        });
      });
    });

    context('dexcom banner is showing', () => {
      it('should track the display banner metric', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingShareDataBanner: false,
          showingDonateBanner: false,
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWithMatch(props.showBanner, 'dexcom');
        sinon.assert.calledWith(props.context.trackMetric, 'Dexcom OAuth banner displayed');
      });

      it('should only track the display banner metric once', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingDonateBanner: false,
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.callCount(props.context.trackMetric, 1);

        wrapper.setProps({});
        wrapper.setProps({});

        sinon.assert.callCount(props.showBanner, 3);
        sinon.assert.callCount(props.context.trackMetric, 1);
      });
    });

    context('share data banner is showing', () => {
      it('should track the display banner metric', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingDonateBanner: false,
          showingDexcomConnectBanner: false,
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWithMatch(props.showBanner, 'sharedata');
        sinon.assert.calledWith(props.context.trackMetric, 'Share Data banner displayed');
      });

      it('should only track the display banner metric once', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingDonateBanner: false,
          showingDexcomConnectBanner: false,
          patient: {
            userid: '1234'
          },
          updateShareDataBannerSeen: sinon.stub(),
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.callCount(props.context.trackMetric, 1);

        wrapper.setProps({});
        wrapper.setProps({});

        sinon.assert.callCount(props.showBanner, 3);
        sinon.assert.callCount(props.context.trackMetric, 1);
      });
    });

    context('donate banner is showing', () => {
      it('should track the display banner metric', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingShareDataBanner: false,
          showingDonateBanner: true,
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.calledWithMatch(props.showBanner, 'donate');
        sinon.assert.calledWith(props.context.trackMetric, 'Big Data banner displayed');
      });

      it('should only track the display banner metric once', () => {
        wrapper.setProps({
          userIsCurrentPatient: true,
          userHasData: true,
          location: '/patients/1234/data',
          showingShareDataBanner: false,
          showingDonateBanner: true,
        });

        sinon.assert.callCount(props.showBanner, 1);
        sinon.assert.callCount(props.context.trackMetric, 1);

        wrapper.setProps({});
        wrapper.setProps({});

        sinon.assert.callCount(props.showBanner, 3);
        sinon.assert.callCount(props.context.trackMetric, 1);
      });
    });
  });

  describe('isPatientVisibleInNavbar', () => {
    it('should return true when page is /patients/a1b2c3/data', () => {
      var context = _.assign({}, baseProps, {location: '/patients/a1b2c3'});
      var elem = TestUtils.renderIntoDocument(<App {...context} />);
      expect(elem).to.be.ok;
      expect(elem.isPatientVisibleInNavbar()).to.be.true;
    });

    it('should return false when page is /patients', () => {
      var elem = TestUtils.renderIntoDocument(<App {...baseProps} />);
      expect(elem).to.be.ok;

      elem.setState({page: '/patients'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });

    it('should return false when page is /profile', () => {
      var elem = TestUtils.renderIntoDocument(<App {...baseProps} />);
      expect(elem).to.be.ok;

      elem.setState({page: '/profile'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });

    it('should return false when page is /foo', () => {
      var elem = TestUtils.renderIntoDocument(<App {...baseProps} />);
      expect(elem).to.be.ok;

      elem.setState({page: '/foo'});
      expect(elem.isPatientVisibleInNavbar()).to.be.false;
    });
  });

  describe('mapStateToProps', () => {
    let tracked;

    beforeEach(() => {
      tracked = mutationTracker.trackObj(initialState);
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    describe('initialState [not logged in]', () => {
      const result = mapStateToProps({blip: initialState});

      it('should not mutate state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map isLoggedIn to authenticated', () => {
        expect(result.authenticated).to.equal(initialState.isLoggedIn);
      });

      it('should map working.fetchingUser to fetchingUser', () => {
        expect(result.fetchingUser).to.eql(initialState.working.fetchingUser);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(initialState.working.fetchingPatient.inProgress);
      });

      it('should map working.loggingOut.inProgress to loggingOut', () => {
        expect(result.loggingOut).to.equal(initialState.working.loggingOut.inProgress);
      });

      it('should return null for termsAccepted', () => {
        expect(result.termsAccepted).to.be.null;
      });

      it('should return null for user', () => {
        expect(result.user).to.be.null;
      });

      it('should return null for patient', () => {
        expect(result.patient).to.be.null;
      });

      it('should return null for permsOfLoggedInUser', () => {
        expect(result.permsOfLoggedInUser).to.be.null;
      });

      it('should map working.resendingEmailVerification.inProgress to resendEmailVerificationInProgress', () => {
        expect(result.resendEmailVerificationInProgress).to.be.false;
      });

      it('should map resentEmailVerification to resentEmailVerification', () => {
        expect(result.resentEmailVerification).to.be.false;
      });
    });

    describe('logged-in state', () => {
      // this is the absolute minimum state that the mapStateToProps function needs
      const loggedIn = {
        allUsersMap: {
          a1b2c3: {
            termsAccepted: 'today'
          },
          d4e5f6: {}
        },
        currentPatientInViewId: 'd4e5f6',
        loggedIn: true,
        loggedInUserId: 'a1b2c3',
        notification: {
          key: 'fetchingPatient',
          link: {
            to: '/patients/foo',
            text: 'Sorry!'
          },
          status: 405
        },
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: {
            view: {},
          },
        },
        dataDonationAccounts: [],
        datasources: [],
        showingDonateBanner: null,
        showingDexcomConnectBanner: null,
        working: {
          fetchingUser: {inProgress: false},
          fetchingPendingSentInvites: {inProgress: false},
          updatingDataDonationAccounts: {inProgress: false},
          fetchingPatient: {inProgress: false, notification: {type: 'error'}},
          loggingOut: {inProgress: false},
          resendingEmailVerification: {inProgress: false},
        },
        resentEmailVerification: false,
      };
      const result = mapStateToProps({blip: loggedIn});

      it('should not mutate state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map isLoggedIn to authenticated', () => {
        expect(result.authenticated).to.equal(loggedIn.isLoggedIn);
      });

      it('should map working.fetchingUser to fetchingUser', () => {
        expect(result.fetchingUser).to.eql(loggedIn.working.fetchingUser);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(loggedIn.working.fetchingPatient.inProgress);
      });

      it('should map working.loggingOut.inProgress to loggingOut', () => {
        expect(result.loggingOut).to.equal(loggedIn.working.loggingOut.inProgress);
      });

      it('[with link] should map notification to a notification for display', () => {
        expect(result.notification.body.message).to.equal(ErrorMessages.ERR_GENERIC);
        expect(result.notification.status).to.equal(loggedIn.notification.status);
        expect(result.notification.type).to.equal('error');
        expect(result.notification.link).to.deep.equal(loggedIn.notification.link);
      });

      // TODO: test the various cases in the switch based on status (401, etc.)

      it('should return the logged-in user\'s TOS acceptance as termsAccepted', () => {
        expect(result.termsAccepted).to.equal(loggedIn.allUsersMap.a1b2c3.termsAccepted);
      });

      it('should return the logged-in user as user', () => {
        expect(result.user).to.equal(loggedIn.allUsersMap.a1b2c3);
      });

      it('should return the current patient in view as patient and empty permissions', () => {
        expect(result.patient).to.deep.equal(Object.assign({}, loggedIn.allUsersMap.d4e5f6, { permissions: {} }));
      });

      it('should return empty permsOfLoggedInUser if user does not have authorization', () => {
        expect(result.permsOfLoggedInUser).to.be.empty;
      });

      context('Care team member with upload permissions', () => {
        const careTeamMemberUpload = {
          allUsersMap: {
            a1b2c3: {
              termsAccepted: 'today'
            },
            d4e5f6: {}
          },
          currentPatientInViewId: 'd4e5f6',
          loggedIn: true,
          loggedInUserId: 'a1b2c3',
          notification: {
            key: 'fetchingPatient',
            link: {
              to: '/patients/foo',
              text: 'Sorry!'
            },
            status: 405
          },
          permissionsOfMembersInTargetCareTeam: {},
          membershipPermissionsInOtherCareTeams: {
            d4e5f6: {
              view: {},
              note: {},
              upload: {},
            }
          },
          dataDonationAccounts: [],
          datasources: [],
          showingDonateBanner: null,
          showingDexcomConnectBanner: null,
          working: {
            fetchingUser: {inProgress: false},
            fetchingPendingSentInvites: {inProgress: false},
            updatingDataDonationAccounts: {inProgress: false},
            fetchingPatient: {inProgress: false, notification: {type: 'error'}},
            loggingOut: {inProgress: false},
            resendingEmailVerification: {inProgress: false},
          }
        };
        const careTeamMemberUploadResult = mapStateToProps({blip: careTeamMemberUpload});

        it('should return correct permsOfLoggedInUser permissions', () => {
          expect(careTeamMemberUploadResult.permsOfLoggedInUser).to.equal(careTeamMemberUpload.membershipPermissionsInOtherCareTeams.d4e5f6);
        });
      });

      context('Care team member without upload permissions', () => {
        const careTeamMemberNoUpload = {
          allUsersMap: {
            a1b2c3: {
              termsAccepted: 'today'
            },
            d4e5f6: {}
          },
          currentPatientInViewId: 'd4e5f6',
          loggedIn: true,
          loggedInUserId: 'a1b2c3',
          notification: {
            key: 'fetchingPatient',
            link: {
              to: '/patients/foo',
              text: 'Sorry!'
            },
            status: 405
          },
          permissionsOfMembersInTargetCareTeam: {},
          membershipPermissionsInOtherCareTeams: {
            d4e5f6: {
              view: {},
              note: {},
            }
          },
          dataDonationAccounts: [],
          datasources: [],
          showingDonateBanner: null,
          showingDexcomConnectBanner: null,
          working: {
            fetchingUser: {inProgress: false},
            fetchingPendingSentInvites: {inProgress: false},
            updatingDataDonationAccounts: {inProgress: false},
            fetchingPatient: {inProgress: false, notification: {type: 'error'}},
            loggingOut: {inProgress: false},
            resendingEmailVerification: {inProgress: false},
          }
        };
        const careTeamMemberNoUploadResult = mapStateToProps({blip: careTeamMemberNoUpload});

        it('should return correct permsOfLoggedInUser permissions', () => {
          expect(careTeamMemberNoUploadResult.permsOfLoggedInUser).to.equal(careTeamMemberNoUpload.membershipPermissionsInOtherCareTeams.d4e5f6);
        });
      });

      describe('getFetchers', () => {
        const stateProps = {
          authenticated: true,
          fetchingUser: {
            inProgress: false,
            completed: null,
          },
          fetchingDataSources: {
            inProgress: false,
            completed: null,
          },
        };

        const dispatchProps = {
          fetchUser: sinon.stub().returns('fetchUser'),
          fetchDataSources: sinon.stub().returns('fetchDataSources'),
        };

        const api = {};

        it('should return an array containing the user fetcher from dispatchProps', () => {
          const result = getFetchers(stateProps, dispatchProps, api);
          expect(result[0]).to.be.a('function');
          expect(result[0]()).to.equal('fetchUser');
          expect(result[1]).to.be.a('function');
          expect(result[1]()).to.equal('fetchDataSources');
        });

        it('should only add the user and data source fetchers if fetches are not already in progress or completed', () => {
          const standardResult = getFetchers(stateProps, dispatchProps, api);
          expect(standardResult.length).to.equal(2);

          const inProgressResult = getFetchers({
            authenticated: true,
            fetchingUser: {
              inProgress: true,
              completed: null,
            },
            fetchingDataSources: {
              inProgress: true,
              completed: null,
            },
          }, dispatchProps, api);

          expect(inProgressResult.length).to.equal(0);

          const completedResult = getFetchers({
            authenticated: true,
            fetchingUser: {
              inProgress: false,
              completed: true,
            },
            fetchingDataSources: {
              inProgress: false,
              completed: true,
            },
          }, dispatchProps, api);
          expect(completedResult.length).to.equal(0);
        });

        it('should return an array containing the data sources fetcher from dispatchProps, but only if authenticated', () => {
          const result = getFetchers(_.assign({}, stateProps, { authenticated: false } ), dispatchProps, api);
          expect(result[1]).to.be.undefined;

          const loggedInResult = getFetchers(_.assign({}, stateProps, { authenticated: true } ), dispatchProps, api);
          expect(loggedInResult[1]).to.be.a('function');
          expect(loggedInResult[1]()).to.equal('fetchDataSources');
        });
      });

      describe('Data donation props', () => {
        context('User has donated data but is not the current patient in view', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              dataDonationAccounts: [
                { email: 'bigdata@tidepool.org' },
                { email: 'bigdata+CWD@tidepool.org' },
              ],
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userIsCurrentPatient).to.be.false;
            expect(result.userIsDonor).to.be.true;
          });
        });

        context('User has donated data and is the current patient in view, and has supported a nonprofit', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              loggedInUserId: '1234',
              currentPatientInViewId: '1234',
              dataDonationAccounts: [
                { email: 'bigdata@tidepool.org' },
                { email: 'bigdata+CWD@tidepool.org' },
              ],
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userIsDonor).to.be.true;
            expect(result.userIsSupportingNonprofit).to.be.true;
            expect(result.userIsCurrentPatient).to.be.true;
          });
        });

        context('User has donated data and is the current patient in view, and has not supported a nonprofit', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              loggedInUserId: '1234',
              currentPatientInViewId: '1234',
              dataDonationAccounts: [
                { email: 'bigdata@tidepool.org' },
              ],
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userIsDonor).to.be.true;
            expect(result.userIsSupportingNonprofit).to.be.false;
            expect(result.userIsCurrentPatient).to.be.true;
          });
        });

        context('User is current patient and has not uploaded data', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              loggedInUserId: '1234',
              currentPatientInViewId: '1234',
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userHasData).to.be.false;
            expect(result.userIsCurrentPatient).to.be.true;
          });
        });

        context('User is not current patient and has uploaded data', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              loggedInUserId: '1234',
              currentPatientInViewId: '5678',
              data: {
                metaData: {
                  patientId: '1234',
                  size: 2,
                },
              },
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userHasData).to.be.true;
            expect(result.userIsCurrentPatient).to.be.false;
          });
        });

        context('User is current patient and has uploaded data', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              loggedInUserId: '1234',
              currentPatientInViewId: '1234',
              data: {
                metaData: {
                  patientId: '1234',
                  size: 2,
                },
              },
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userHasData).to.be.true;
            expect(result.userIsCurrentPatient).to.be.true;
          });
        });
      });

      describe('Dexcom banner props', () => {
        it('should map the `showingDexcomConnectBanner` state to a prop', () => {
          const result = mapStateToProps({ blip: loggedIn });
          expect(result.showingDexcomConnectBanner).to.equal(loggedIn.showingDexcomConnectBanner);
        });

        context('User has connected to a data source', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              dataSources: [
                { id: 'dexcom/oauth' },
              ],
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userHasConnectedDataSources).to.be.true;
          });
        });

        context('User has connected to a data source', () => {
          it('should set props appropriately', () => {
            const state = _.assign({}, loggedIn, {
              datasources: [],
            });

            const result = mapStateToProps({ blip: state });

            expect(result.userHasConnectedDataSources).to.be.false;
          });
        });
      });
    });
  });
});
