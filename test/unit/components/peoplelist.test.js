/* global chai */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var PeopleList = require('../../../app/components/peoplelist');
var PatientCard = require('../../../app/components/patientcard');

describe('PeopleList', function () {
  
  describe('render', function() {
    it('should console.error when required props not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PeopleList/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(1);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PeopleList`.')).to.equal(true);
    });

    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {},
        patient: {}
      };
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {

    it('should return object with expected properties', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);
      var state = elem.getInitialState();

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
            fullName: 'Anna Zork'
          }
        }]
      };
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);
      var renderedDOM = ReactDOM.findDOMNode(elem);
      var fullNames = renderedDOM.querySelectorAll('.patientcard-fullname');
      expect(fullNames.length).to.equal(4);
      expect(fullNames[0].title).to.equal('Zoe Doe');
      expect(fullNames[1].title).to.equal('Anna Zork');
      expect(fullNames[2].title).to.equal('John Doe');
      expect(fullNames[3].title).to.equal('Tucker Doe');
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
      var listElem = React.createElement(PeopleList, props);
      var elem = TestUtils.renderIntoDocument(listElem);
      var renderedDOM = ReactDOM.findDOMNode(elem);
      var fullNames = renderedDOM.querySelectorAll('.patientcard-fullname');
      expect(fullNames.length).to.equal(3);
      expect(fullNames[0].title).to.equal('Anna Zork');
      expect(fullNames[1].title).to.equal('John Doe');
      expect(fullNames[2].title).to.equal('Tucker Doe');
    });
  });
});