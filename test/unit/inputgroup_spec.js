var InputGroup = require('../../app/components/inputgroup');

describe('InputGroup', function() {
  var component;

  var props = {
    name: 'myInput',
    label: 'My input',
    value: 'initial value',
    error: null,
    type: null,
    disabled: null,
    onChange: function() {}
  };

  beforeEach(function() {
    component = InputGroup(props);
    helpers.mountComponent(component);
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should show correct label', function() {
    var expectedLabel = props.label;
    var label = component.refs.label.props.children;

    expect(false).to.be.ok;
    // expect(label).to.equal(expectedLabel);
  });

  it('should set initial value', function() {
    var expectedValue = props.value;
    var value = component.refs.control.getDOMNode().value;

    expect(value).to.equal(expectedValue);
  });

  it('should display error message', function() {
    var expectedErrorMessage = 'Bad input';

    component.setProps({error: expectedErrorMessage});
    var errorMessage = component.refs.message.props.children;

    expect(errorMessage).to.equal(expectedErrorMessage);
  });

  it('should set input type', function() {
    var expectedType = 'password';

    component.setProps({type: expectedType});
    var type = component.refs.control.props.type;

    expect(type).to.equal(expectedType);
  });

  it('should disable input', function() {
    component.setProps({disabled: true});
    var disabled = component.refs.control.props.disabled;

    expect(disabled).to.be.ok;
  });
});