/* global chai */
/* global sinon */
/* global describe */
/* global it */

import {
  requiresChrome,
  requireAuth,
  requireAuthAndNoPatient,
  requireNoAuth,
  requireNotVerified,
  onUploaderPasswordReset,
  hashToUrl,
  onIndexRouteEnter,
  onOtherRouteEnter,
  onLogoutEnter,
  ensureNoAuth
} from '../../app/routes';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import createHistory from 'history/lib/createMemoryHistory';
import { Router } from 'react-router'
import config from '../../app/config';

var expect = chai.expect;

describe('routes', () => {
  describe('requiresChrome', () => {
    it('should not redirect and call next when isChrome is true', () => {
      let utils = {
        isChrome: sinon.stub().returns(true)
      };

      let next = sinon.stub();
      let replace = sinon.stub();
      let nextState = {};
      let cb = sinon.stub();

      requiresChrome(utils, next)(nextState, replace, cb);

      expect(utils.isChrome.callCount).to.equal(1);
      expect(replace.callCount).to.equal(0);
      expect(cb.callCount).to.equal(0);
      expect(next.withArgs(nextState, replace, cb).callCount).to.equal(1);
    });

    it('should redirect and call cb when isChrome is false', () => {
      let utils = {
        isChrome: sinon.stub().returns(false)
      };

      let next = sinon.stub();
      let replace = sinon.stub();
      let nextState = {};
      let cb = sinon.stub();

      requiresChrome(utils, next)(nextState, replace, cb);

      expect(utils.isChrome.callCount).to.equal(1);
      expect(replace.withArgs('/browser-warning').callCount).to.equal(1);
      expect(cb.callCount).to.equal(1);
      expect(next.callCount).to.equal(0);
    });
  });

  describe('requireAuth', () => {
    it('should update route to /login if user is not authenticated', (done) => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api, store)(null, replace, () => {
        expect(replace.withArgs('/login').callCount).to.equal(1);
        done()
      });
    });

    it('should not update route if user is authenticated and has accepted the latest terms', (done) => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                profile: {
                  patient: {}
                },
                termsAccepted: '2015-01-01T00:00:00-08:00'
              }
            );
          }
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: sinon.stub()
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                profile: {
                  patient: {}
                },
                termsAccepted: '2015-01-01T00:00:00-08:00'
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        expect(api.user.get.callCount).to.equal(0);
        done();
      });
    });

    it('should update route to /terms if user is authenticated and has not ever accepted the terms', (done) => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                profile: {
                  patient: {}
                },
                termsAccepted: ''
              }
            );
          }
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api, store)({location: {pathname: 'test'}}, replace, () => {
        expect(replace.withArgs('/terms').callCount).to.equal(1);
        done();
      });
    });

    it('should update route to /terms if user is authenticated and has not accepted the latest terms', (done) => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                profile: {
                  patient: {}
                },
                termsAccepted: '2013-12-30T00:00:00-08:00'
              }
            );
          }
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuth(api, store)({location: {pathname: 'test'}}, replace, () => {
        expect(replace.withArgs('/terms').callCount).to.equal(1);
        done();
      });
    });
  });

  describe('requireAuthAndNoPatient', () => {
    it('should update the route to /login if the user is not authenticated', (done) => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.withArgs('/login').callCount).to.equal(1);
        done();
      });
    });

    it('should update the route to /patients if the user is authenticated and already has accepted TOS and has data storage set up', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                termsAccepted: '2016-01-01T05:00:00-08:00',
                profile: {
                  patient: {}
                }
              }
            );
          },
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                termsAccepted: '2016-01-01T05:00:00-08:00',
                profile: {
                  patient: {}
                }
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
        done();
      });
    });

    it('should update the route to /terms if the user has not yet accepted the TOS', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(null, {
              userid: 'a1b2c3',
              termsAccepted: ''
            });
          },
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.withArgs('/terms').callCount).to.equal(1);
        done();
      });
    });

    it('should update the route to /terms if the user has not yet accepted the TOS', (done) => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                termsAccepted: ''
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.withArgs('/terms').callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
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
                termsAccepted: '2016-01-01T05:00:00-08:00',
                profile: {
                  about: 'Foo bar'
                }
              }
            );
          },
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                termsAccepted: '2016-01-01T05:00:00-08:00',
                profile: {
                  about: 'Foo bar'
                }
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireAuthAndNoPatient(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        expect(api.user.get.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('ensureNoAuth', () => {
    it('should call api.user.logout', () => {
      let api = {
        user: {
          logout: sinon.stub().callsArg(0)
        }
      };

      let cb = sinon.stub();

      ensureNoAuth(api)(null, null, cb);

      expect(api.user.logout.callCount).to.equal(1);
      expect(cb.callCount).to.equal(1);
    });
  });

  describe('requireNoAuth', () => {
    it('should update route to /patients if user is authenticated', () => {
      let api = {
        user: {
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
        user: {
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

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });

    it('should update the route to /patients if user has already verified e-mail and accepted the most recent terms', (done) => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                emailVerified: true,
                termsAccepted: '2015-01-01T00:00:00-08:00'
              }
            );
          }
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api, store)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      let api = {
        user: {
          get: sinon.stub()
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                emailVerified: true,
                termsAccepted: '2015-01-01T00:00:00-08:00'
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api, store)(null, replace, () => {
        expect(replace.withArgs('/patients').callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
        done();
      });
    });

    it('should update route to /terms if user has already verified e-mail and has not accepted the terms', (done) => {
      let api = {
        user: {
          get: (cb) => {
            cb(
              null,
              {
                userid: 'a1b2c3',
                emailVerified: true,
                termsAccepted: ''
              }
            );
          }
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      requireNotVerified(api, store)({location: {pathname: 'test'}}, replaceState, () => {
        expect(replaceState.withArgs('/terms').callCount).to.equal(1);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      let api = {
        user: {
          get: sinon.stub()
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                emailVerified: true,
                termsAccepted: ''
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replaceState = sinon.stub();

      expect(replaceState.callCount).to.equal(0);

      requireNotVerified(api, store)({location: {pathname: 'test'}}, replaceState, () => {
        expect(replaceState.withArgs('/terms').callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
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

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        done();
      });
    });

    it('[ditto &] should use state from the store instead of calling the API when available', (done) => {
      let api = {
        log: () => {},
        user: {
          get: sinon.stub(),
          logout: sinon.stub()
        }
      };

      let store = {
        getState: () => ({
          blip: {
            allUsersMap: {
              a1b2c3: {
                userid: 'a1b2c3',
                emailVerified: false
              }
            },
            loggedInUserId: 'a1b2c3'
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      requireNotVerified(api, store)(null, replace, () => {
        expect(replace.callCount).to.equal(0);
        expect(api.user.get.callCount).to.equal(0);
        expect(api.user.logout.callCount).to.equal(1);
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
      };

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
      };

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
      };

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
      };

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            isLoggedIn: true
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api, store)(nextState, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
    });

    it('should update route to /patient/435/data when #/patient/435/data present', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: '#/patient/435/data'
        }
      };

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            isLoggedIn: false
          }
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api, store)(nextState, replace);

      expect(replace.withArgs('/patient/435/data').callCount).to.equal(1);
    });

    it('should update route to /patient/435/data when #/patient/435/data present and call provided callback', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: '#/patient/435/data'
        }
      };

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {
            isLoggedIn: false
          }
        })
      };

      let replace = sinon.stub();
      let cb = sinon.stub();

      expect(replace.callCount).to.equal(0);
      expect(cb.callCount).to.equal(0);

      onIndexRouteEnter(api, store)(nextState, replace, cb);

      expect(replace.withArgs('/patient/435/data').callCount).to.equal(1);
      expect(cb.callCount).to.equal(1);
    });

    it('should update route to /patients when logged in', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: ''
        }
      };

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api, store)(nextState, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
    });

    it('should not update route to /patients when not logged in', () => {
      let nextState = {
        location: {
          pathname: '/',
          hash: ''
        }
      };

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let store = {
        getState: () => ({
          blip: {}
        })
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onIndexRouteEnter(api, store)(nextState, replace);

      expect(replace.callCount).to.equal(0);
    });
  });

  describe('onOtherRouteEnter', () => {
    it('should update route to /patients if user is authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onOtherRouteEnter(api)(null, replace);

      expect(replace.withArgs('/patients').callCount).to.equal(1);
    });

    it('should update route to /login if user is not authenticated', () => {

      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false)
        }
      };

      let replace = sinon.stub();

      expect(replace.callCount).to.equal(0);

      onOtherRouteEnter(api)(null, replace);

      expect(replace.withArgs('/login').callCount).to.equal(1);
    })
  });
});
