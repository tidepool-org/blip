/* global chai */
/* global sinon */
/* global describe */
/* global it */

import { 
  requireAuth, requireAuthAndNoPatient, requireNoAuth, requireNotVerified, onUploaderPasswordReset, hashToUrl, onIndexRouteEnter
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api)(null, replace);

      expect(replace.withArgs('/login').callCount).to.equal(1);
    });

    it('should not update route if user is authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api)(null, replace);

      expect(replace.callCount).to.equal(0);
    });
  });

  describe('requireAuthAndNoPatient', () => {
    it('should update the route to /login if the user is not authenticated', (done) => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api)(null, replace, () => {
        expect(replace.withArgs('/login').callCount).to.equal(1);
        done();
      });
    });

    it('should update the route to /patients if the user is authenticated and already has data storage set up', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                profile: {
                  patient: {}
                }
              }
            );
          },
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        done();
      });
    });

    it('should not update the route if the user is authenticated and does not have data storage set up', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                profile: {
                  about: 'Foo bar'
                }
              }
            );
          },
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('requireNoAuth', () => {
    it('should update route to /patients if user is authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);
      
      requireNoAuth(api)(null, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
    });

    it('should not update route if user is not authenticated', () => {
      let api = {
        user : {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNoAuth(api)(null, replace);

      expect(replace.callCount).to.equal(0);
    });
  });

  describe('requireNotVerified', () => {
    it('should not update route if user is not logged in', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb({
              status: 401
            });
          }
        },
        logout: sinon.stub()
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });

    it('should update the route to /patients if user has already verified e-mail', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                emailVerified: true
              }
            );
          }
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        done();
      });
    });

    it('should not update the route if user has not yet verified e-mail and should \"logout\" user', (done) => {
      let api = {
        log: () => {},
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                emailVerified: false
              }
            );
          },
          logout: (cb) => { cb(); }
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('onUploaderPasswordReset', () => {
    it('should not update route if user is not logged in', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onUploaderPasswordReset(api)(null, replace);

      expect(replace.callCount).to.equal(0);
    });

    it('should update the route to /profile if the user is authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onUploaderPasswordReset(api)(null, replace);

      expect(replace.withArgs('/profile').callCount).to.equal(1);
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      hashToUrl(nextState, replace);

      expect(replace.withArgs('/foobar').callCount).to.equal(1);
    });

    it('should not update route to hash if pathname and hash present', () => {
      let nextState = {
        location: {
          pathname: '/foo',
          hash: '#/foobar'
        }
      }

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      hashToUrl(nextState, replace);

      expect(replace.callCount).to.equal(0);
    });

    it('should not update route to hash if pathname present and no hash', () => {
      let nextState = {
        location: {
          pathname: '/foo',
          hash: ''
        }
      }

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      hashToUrl(nextState, replace);

      expect(replace.callCount).to.equal(0);
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replace);

      expect(replace.withArgs('/patient/435/data').callCount).to.equal(1);
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
    });

    it('should not update route to /patients when not logged in', () => {
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

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api)(nextState, replace);

      expect(replace.callCount).to.equal(0);
    });
  });

});
