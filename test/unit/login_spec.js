var expect = chai.expect;
var React = window.React;

var Login = require('../../app/login');

describe('Login', function() {
  var component, container;

  beforeEach(function() {
    component = Login();
    container = document.createElement('div');
    document.documentElement.appendChild(container);
    React.renderComponent(component, container);
  });

  afterEach(function() {
    React.unmountComponentAtNode(container);
    document.documentElement.removeChild(container);
  });

  it('should disable login button when logging in', function() {
    component.setProps({loggingIn: true});
    var disabled = component.refs.button.props.disabled;

    expect(disabled).to.be.true;
  });
});