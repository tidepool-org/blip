var PeopleList = require('../../app/components/peoplelist');
var testPatients = _.toArray(window.data.patients);

describe('PeopleList', function() {
  var component;

  beforeEach(function() {
    component = PeopleList();
    helpers.mountComponent(component);
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

  it('should render people list items', function() {
    var patients = testPatients;

    component.setProps({people: patients});
    var count = component.getDOMNode().children.length;

    expect(count).to.equal(patients.length);
  });

  it('should render empty list items', function() {
    var patients = [{}, {}];

    component.setProps({people: patients});
    var count = component.getDOMNode().children.length;
    var listItem = component.getDOMNode().children[0];

    expect(count).to.equal(patients.length);
    expect(listItem.className).to.contain('people-list-item-empty');
  });
});
