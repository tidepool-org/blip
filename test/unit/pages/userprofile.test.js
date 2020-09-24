import React from 'react';
import _ from 'lodash';
import TestUtils from 'react-dom/test-utils';
import mutationTracker from 'object-invariant-test-helper';
import sinon from 'sinon';
import chai from 'chai';
import { shallow } from 'enzyme';

import { UserProfile, mapStateToProps } from '../../../app/pages/userprofile';

const { assert, expect } = chai;

describe('UserProfile', function () {
  const props = {
    fetchingUser: false,
    router: {
      goBack: sinon.stub()
    },
    onSubmit: sinon.stub(),
    trackMetric: sinon.stub(),
    user: {
      username: 'foo@bar.com',
      userid: 'abcd',
      profile: {
        fullName: 'Gordon Dent',
        firstName: 'Gordon',
        lastName: 'Dent'
      },
    },
  };

  before(() => {
    // FIXME: sinon.spy(console, 'error');
    console.error = sinon.stub();
  });
  after(() => {
    sinon.restore();
  });

  afterEach(() => {
    props.router.goBack.reset();
    props.onSubmit.reset();
    props.trackMetric.reset();
  });

  it('should be exposed as a module and be of type function', () => {
    expect(UserProfile).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', () => {
      const elem = <UserProfile {...props} />;
      TestUtils.renderIntoDocument(elem);
      // @ts-ignore
      const message = _.get(console.error.getCall(0), 'args', undefined);
      expect(console.error.callCount, 'console.error').to.equal(0, message);
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', () => {
      const elem = shallow(<UserProfile {...props} />);
      const state = elem.state();

      expect(state.formValues.username).to.equal('foo@bar.com');
      expect(state.formValues.firstName).to.equal('Gordon');
      expect(state.formValues.lastName).to.equal('Dent');
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should take a step back through router on clicking back button', () => {
      var elem = <UserProfile {...props} />;
      var render = TestUtils.renderIntoDocument(elem);
      var backButton = TestUtils.findRenderedDOMComponentWithClass(render, 'js-back');

      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.router.goBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.trackMetric.callCount).to.equal(2);
      expect(props.router.goBack.callCount).to.equal(1);
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

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

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
