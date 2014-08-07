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
    component = helpers.mountComponent(InputGroup(props));
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should show correct label', function() {
    var expectedLabel = props.label;
    var label = component.refs.label.props.children;

    expect(label).to.equal(expectedLabel);
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

  it('should allow textarea type', function() {
    var expectedType = 'textarea';

    component.setProps({type: expectedType});
    var type = component.refs.control.getDOMNode().nodeName.toLowerCase();

    expect(type).to.equal(expectedType);
  });

  it('should handle checkbox with boolean value', function() {
    component.setProps({
      type: 'checkbox',
      value: true
    });
    var checked = component.refs.control.getDOMNode().checked;

    expect(checked).to.be.ok;
  });

  it('should handle radios with multiple items', function() {
    component.setProps({
      type: 'radios',
      items: [
        {value: 'yes', label: 'Yes'},
        {value: 'no', label: 'No'}
      ],
      value: 'yes'
    });

    var radio1 = component.refs.control0.getDOMNode();
    var radio2 = component.refs.control1.getDOMNode();

    expect(radio1.value).to.equal('yes');
    expect(radio2.value).to.equal('no');
    expect(radio1.checked).to.be.ok;
  });


  it('should disable input', function() {
    component.setProps({disabled: true});
    var disabled = component.refs.control.props.disabled;

    expect(disabled).to.be.ok;
  });
});
