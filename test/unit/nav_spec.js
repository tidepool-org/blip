var expect = chai.expect;
var React = window.React;

var Nav = require('../../app/nav');

describe('Nav', function() {
  var component, container;

  beforeEach(function() {
    component = Nav();
    container = document.createElement('div');
    document.documentElement.appendChild(container);
    React.renderComponent(component, container);
  });

  afterEach(function() {
    React.unmountComponentAtNode(container);
    document.documentElement.removeChild(container);
  });

  it('should correctly display app version number', function() {
    var versionNumber = '0.0.0';
    var expectedVersion = 'v' + versionNumber;

    component.setProps({version: versionNumber});
    var renderedVersion = component.refs.version.props.children;

    expect(renderedVersion).to.equal(expectedVersion);
  });
});