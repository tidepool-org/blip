var expect = chai.expect;

var Nav = require('../../app/components/nav');

describe('Nav', function() {
  var component;

  beforeEach(function() {
    component = Nav();
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