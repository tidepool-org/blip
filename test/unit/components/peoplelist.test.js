/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const expect = chai.expect;
const PeopleList = require('../../../app/components/peoplelist');

describe('PeopleList', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const props = {
          trackMetric: function() {}
        };
        const { container } = render(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);

        expect(container.querySelector('.people-list')).to.exist;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('initial state', function() {
    it('should return object with expected properties', function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const WrappedPeopleList = PeopleList.WrappedComponent || PeopleList;
        const instance = new WrappedPeopleList({
        trackMetric: function() {},
        t: (key) => key,
      });

      expect(instance.state.editing).to.equal(false);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('sorting of people list', function() {
    it('should be sorted by fullName, with logged-in user at top if has data storage acct', function() {
      const props = {
        trackMetric: () => {},
        people: [{
          profile: {
            fullName: 'Zoe Doe'
          },
          permissions: {
            root: {}
          }
        }, {
          profile: {
            fullName: 'Tucker Doe'
          }
        }, {
          profile: {
            fullName: 'John Doe'
          }
        }, {
          profile: {
            fullName: 'amanda jones'
          }
        }, {
          profile: {
            fullName: 'Anna Zork'
          }
        }]
      };
      const { container } = render(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      const fullNames = container.querySelectorAll('.patientcard-fullname');

      expect(fullNames.length).to.equal(5);
      expect(fullNames[0].getAttribute('title')).to.equal('Zoe Doe');
      expect(fullNames[1].getAttribute('title')).to.equal('amanda jones');
      expect(fullNames[2].getAttribute('title')).to.equal('Anna Zork');
      expect(fullNames[3].getAttribute('title')).to.equal('John Doe');
      expect(fullNames[4].getAttribute('title')).to.equal('Tucker Doe');
    });

    it('should use a patients fullName to sort if present and isOtherPerson', function() {
      const props = {
        trackMetric: () => {},
        people: [{
          profile: {
            fullName: 'Zoe Doe',
          },
          permissions: {
            root: {}
          }
        }, {
          profile: {
            fullName: 'Professor Snape',
            patient: {
              fullName: 'Alan Rickman',
              isOtherPerson: true
            }
          }
        }, {
          profile: {
            fullName: 'John Doe'
          }
        }, {
          profile: {
            fullName: 'Anna Zork'
          }
        },
        {
          profile: {
            fullName: 'Bruce Wayne',
            patient: {
              fullName: 'Christian Bale',
              isOtherPerson: true
            }
          }
        }]
      };
      const { container } = render(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      const fullNames = container.querySelectorAll('.patientcard-fullname');
      expect(fullNames.length).to.equal(5);
      expect(fullNames[0].getAttribute('title')).to.equal('Zoe Doe');
      expect(fullNames[1].getAttribute('title')).to.equal('Alan Rickman');
      expect(fullNames[2].getAttribute('title')).to.equal('Anna Zork');
      expect(fullNames[3].getAttribute('title')).to.equal('Christian Bale');
      expect(fullNames[4].getAttribute('title')).to.equal('John Doe');
    });


    it('should be sorted by fullName, no logged-in user present (b/c not data storage acct)', function() {
      const props = {
        trackMetric: () => {},
        people: [{
          profile: {
            fullName: 'Tucker Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        }, {
          profile: {
            fullName: 'John Doe'
          },
          permissions: {
            upload: {}
          }
        }, {
          profile: {
            fullName: 'Anna Zork'
          }
        }]
      };
      const { container } = render(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      const fullNames = container.querySelectorAll('.patientcard-fullname');
      expect(fullNames.length).to.equal(3);
      expect(fullNames[0].getAttribute('title')).to.equal('Anna Zork');
      expect(fullNames[1].getAttribute('title')).to.equal('John Doe');
      expect(fullNames[2].getAttribute('title')).to.equal('Tucker Doe');
    });
  });
});
