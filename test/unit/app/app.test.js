/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

var React = require('react');
var createFragment = require('react-addons-create-fragment');
var _ = require('lodash');
var TestUtils = require('react-addons-test-utils');

import mutationTracker from 'object-invariant-test-helper';

// Need to add this line as app.js includes config
// which errors if window.config does not exist
window.config = {};

import { mapStateToProps } from '../../../app/pages/app/app.js';
import initialState from '../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../app/redux/constants/errorMessages';

var App = require('../../../app/pages/app/app.js').AppComponent;
var api = require('../../../app/core/api');
var personUtils = require('../../../app/core/personutils');

var assert = chai.assert;
var expect = chai.expect;

describe('App',  () => {

  api.log = sinon.stub();

  var baseProps = {
    context: {
      DEBUG: false,
      api: {},
      config: {},
      log: sinon.stub(),
      personUtils: personUtils,
      trackMetric: sinon.stub()
    }
  };

  describe('render', () => {
    it('should render without problems or warnings when required props provided', () => {
      var props = _.assign({}, baseProps, {
        authenticated: false,
        children: createFragment({}),
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
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
      expect(console.error.callCount).to.equal(10);
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

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(initialState.working.fetchingUser.inProgress);
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
        working: {
          fetchingUser: {inProgress: false},
          fetchingPatient: {inProgress: false, notification: {type: 'error'}},
          loggingOut: {inProgress: false}
        }
      };
      const result = mapStateToProps({blip: loggedIn});

      it('should not mutate state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map isLoggedIn to authenticated', () => {
        expect(result.authenticated).to.equal(loggedIn.isLoggedIn);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(loggedIn.working.fetchingUser.inProgress);
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
    });
  });
});