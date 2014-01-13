var expect = chai.expect;

var LoginForm = require('../../app/components/loginform');

describe('LoginForm', function() {
  var component;

  beforeEach(function() {
    component = LoginForm();
    helpers.mountComponent(component);
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should disable login button when logging in', function() {
    component.setProps({loggingIn: true});
    var disabled = component.refs.button.props.disabled;

    expect(disabled).to.be.true;
  });
});