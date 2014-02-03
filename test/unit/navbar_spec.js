var expect = chai.expect;
var helpers = require('../lib/unithelpers');

var Navbar = require('../../app/components/navbar');

describe('Navbar', function() {
  var component;

  beforeEach(function() {
    component = Navbar();
    helpers.mountComponent(component);
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should correctly display app version number', function() {
    var versionNumber = '0.0.0';
    var expectedVersion = 'v' + versionNumber;

    component.setProps({version: versionNumber});
    var renderedVersion = component.refs.version.props.children;

    expect(renderedVersion).to.equal(expectedVersion);
  });
});