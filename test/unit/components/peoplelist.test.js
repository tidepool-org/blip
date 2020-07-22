/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;
var mount = require('enzyme').mount;
var BrowserRouter = require('react-router-dom').BrowserRouter;

var PeopleList = require('../../../app/components/peoplelist');

describe('PeopleList', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var elem = mount(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>)

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('initial state', function() {
    it('should return object with expected properties', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var elem = mount(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>).find(PeopleList).instance().getWrappedInstance();
      var state = elem.state;
      expect(state.editing).to.equal(false);
    });
  });

  describe('sorting of people list', function() {
    it('should be sorted by fullName, with logged-in user at top if has data storage acct', function() {
      var props = {
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
      var wrapper = mount(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      var fullNames = wrapper.find('.patientcard-fullname');

      expect(fullNames.length).to.equal(5);
      expect(fullNames.at(0).prop('title')).to.equal('Zoe Doe');
      expect(fullNames.at(1).prop('title')).to.equal('amanda jones');
      expect(fullNames.at(2).prop('title')).to.equal('Anna Zork');
      expect(fullNames.at(3).prop('title')).to.equal('John Doe');
      expect(fullNames.at(4).prop('title')).to.equal('Tucker Doe');
    });

    it('should use a patients fullName to sort if present and isOtherPerson', function() {
      var props = {
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
      var wrapper = mount(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      var fullNames = wrapper.find('.patientcard-fullname');
      expect(fullNames.length).to.equal(5);
      expect(fullNames.at(0).prop('title')).to.equal('Zoe Doe');
      expect(fullNames.at(1).prop('title')).to.equal('Alan Rickman');
      expect(fullNames.at(2).prop('title')).to.equal('Anna Zork');
      expect(fullNames.at(3).prop('title')).to.equal('Christian Bale');
      expect(fullNames.at(4).prop('title')).to.equal('John Doe');
    });


    it('should be sorted by fullName, no logged-in user present (b/c not data storage acct)', function() {
      var props = {
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
      var wrapper = mount(<BrowserRouter><PeopleList {...props}></PeopleList></BrowserRouter>);
      var fullNames = wrapper.find('.patientcard-fullname');
      expect(fullNames.length).to.equal(3);
      expect(fullNames.at(0).prop('title')).to.equal('Anna Zork');
      expect(fullNames.at(1).prop('title')).to.equal('John Doe');
      expect(fullNames.at(2).prop('title')).to.equal('Tucker Doe');
    });
  });
});
