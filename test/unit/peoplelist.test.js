var _ = require('lodash');

var PeopleList = require('../../app/components/peoplelist');
var testPatients = [
  {
    'userid': '11',
    'profile': {
      'fullName': 'Mary Smith',
      'patient': {
        'birthday': '1987-03-08',
        'diagnosisDate': '1994-02-01',
        'about': 'Loves swimming and fishing'
      }
    }
  },
  {
    'userid': '31',
    'profile': {
      'fullName': 'Sarah Carter',
      'patient': {
        'isOtherPerson': true,
        'fullName': 'Jessica Carter',
        'birthday': '1999-07-03',
        'diagnosisDate': '2009-08-01'
      }
    }
  }
];

describe('PeopleList', function() {
  var component;

  beforeEach(function() {
    component = helpers.mountComponent(PeopleList());
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should render empty list', function() {
    var patients = null;

    component.setProps({people: patients});
    var count = component.getDOMNode().children.length;

    expect(count).to.equal(0);
  });

  it('should render correct number of people list items', function() {
    var patients = testPatients;

    component.setProps({people: patients});
    var count = component.getDOMNode().children.length;

    expect(count).to.equal(patients.length);
  });

  it('should render correct number of empty list items', function() {
    var patients = [{}, {}];

    component.setProps({people: patients});
    var count = component.getDOMNode().children.length;

    expect(count).to.equal(patients.length);
  });
});
