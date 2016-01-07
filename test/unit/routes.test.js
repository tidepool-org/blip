/* global chai */
/* global sinon */
/* global describe */
/* global it */

import { 
  requireAuth, requireNoAuth, hashToUrl, onIndexRouteEnter 
} from '../../app/routes';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import createHistory from 'history/lib/createMemoryHistory';
import { Router } from 'react-router'


var expect = chai.expect;

describe('routes', () => {

  describe('requireAuth', () => {
    
    it('should update route to /login if user is not authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      requireAuth(api)(null, replaceState);

      expect(replaceState.withArgs(null, '/login').callCount).to.equal(1);
    });

    it('should not update route if user is authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      requireAuth(api)(null, replaceState);

      expect(replaceState.callCount).to.equal(0);
    });
  });

  describe('requireNoAuth', () => {
    it('should update route to /patients if user is authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);
      
      requireNoAuth(api)(null, replaceState);

      expect(replaceState.withArgs(null, '/patients').callCount).to.equal(1);
    });

    it('should not update route if user is not authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      requireNoAuth(api)(null, replaceState);

      expect(replaceState.callCount).to.equal(0);
    });
  });

  describe('hashToUrl', () => {
    it('should update route to hash if no pathname but hash present', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: '#/foobar'
        }
      }

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      hashToUrl(nextState, replaceState);

      expect(replaceState.withArgs(null, '/foobar').callCount).to.equal(1);
    });

    it('should not update route to hash if pathname and hash present', () => {
      let nextState = {
        location: {
          pathname: '/foo',
          hash: '#/foobar'
        }
      }

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      hashToUrl(nextState, replaceState);

      expect(replaceState.callCount).to.equal(0);
    });

    it('should not update route to hash if pathname present and no hash', () => {
      let nextState = {
        location: {
          pathname: '/foo',
          hash: ''
        }
      }

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      hashToUrl(nextState, replaceState);

      expect(replaceState.callCount).to.equal(0);
    });
  });

  describe('onIndexRouteEnter', () => {
    it('should update route to /patients when #/patients present', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: '#/patients'
        }
      }

      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replaceState);

      expect(replaceState.withArgs(null, '/patients').callCount).to.equal(1);
    });

    it('should update route to /patient/435/data when #/patient/435/data present', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: '#/patient/435/data'
        }
      }

      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replaceState);

      expect(replaceState.withArgs(null, '/patient/435/data').callCount).to.equal(1);
    });

    it('should update route to /patients when logged in', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: ''
        }
      }

      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replaceState);

      expect(replaceState.withArgs(null, '/patients').callCount).to.equal(1);
    });

    it('should update not route to /patients when not logged in', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: ''
        }
      }

      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replaceState);

      expect(replaceState.callCount).to.equal(0);
    });
  });

});
