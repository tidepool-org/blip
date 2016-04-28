/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var UserProfile = require('../../../app/pages/userprofile').UserProfile;
import { mapStateToProps } from '../../../app/pages/userprofile';

var assert = chai.assert;
var expect = chai.expect;

describe('UserProfile', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(UserProfile).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        fetchingUser: false,
        history: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(UserProfile, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });

    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<UserProfile />);
      expect(console.error.callCount).to.equal(4);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingUser` was not specified in `UserProfile`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `history` was not specified in `UserProfile`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `UserProfile`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `UserProfile`.')).to.equal(true);
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', function() {
      var props = {
        user: {
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foo@bar.com'
        }
      };
      var elem = React.createElement(UserProfile, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.fullName).to.equal('Gordon Dent');
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });


    it('should take a step back through history on clicking back button', function() {
      var props = {
        history: {
          goBack: sinon.stub()
        },
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(UserProfile, props);
      var render = TestUtils.renderIntoDocument(elem);
      var backButton = TestUtils.findRenderedDOMComponentWithClass(render, 'js-back');

      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.history.goBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.history.goBack.callCount).to.equal(1);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      allUsersMap: {
        a1b2c3: {userid: 'a1b2c3'}
      },
      loggedInUserId: 'a1b2c3',
      working: {
        fetchingUser: {inProgress: false}
      }
    };
    const result = mapStateToProps({blip: state});

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map allUsersMap.a1b2c3 to user', () => {
      expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
    });

    it('should map working.fetchingUser.inProgress to fetchingUser', () => {
      expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
    });
  });
});