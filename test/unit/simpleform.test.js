var SimpleForm = require('../../app/components/simpleform');

describe('SimpleForm', function() {
  var component;
  var initialProps = {
    inputs: [
      {name: 'username', label: 'Email', type: 'text'},
      {name: 'password', label: 'Password', type: 'password'}
    ]
  };

  beforeEach(function() {
    component = helpers.mountComponent(SimpleForm(initialProps));
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should render all inputs', function() {
    var inputs = component.refs.inputs.props.children;

    expect(inputs.length).to.equal(initialProps.inputs.length);
  });

  it('should set input attributes', function() {
    var expectedInputAttr = initialProps.inputs[0];

    var inputAttr = component.refs.inputs.props.children[0].props;

    expect(inputAttr.name).to.equal(expectedInputAttr.name);
    expect(inputAttr.label).to.equal(expectedInputAttr.label);
    expect(inputAttr.type).to.equal(expectedInputAttr.type);
  });

  it('should set form values', function() {
    var expectedValue = 'foo';
    var formValues = {};
    formValues[initialProps.inputs[0].name] = expectedValue;

    component.setProps({formValues: formValues});
    var inputValue = component.refs.inputs.props.children[0].props.value;

    expect(inputValue).to.equal(expectedValue);
  });

  it('should set submit button text', function() {
    var expectedText = 'go';

    component.setProps({submitButtonText: expectedText});
    var text = component.refs.submitButton.props.children;

    expect(text).to.equal(expectedText);
  });

  it('should disable submit button', function() {
    component.setProps({submitDisabled: true});
    var buttonProps = component.refs.submitButton.props;

    expect(buttonProps.disabled).to.be.ok;
  });

  it('should call callback with form values when submit clicked', function() {
    var handleSubmit = sinon.spy();
    var formValues = {};
    _.forEach(initialProps.inputs, function(input) {
      formValues[input.name] = 'foo';
    });

    component.setProps({
      formValues: formValues,
      onSubmit: handleSubmit
    });
    var clickSubmit = component.refs.submitButton.props.onClick;
    clickSubmit();

    expect(handleSubmit).to.have.been.calledWith(formValues);
  });

  it('should show notification message', function() {
    var expectedText = 'all good';
    var notification = {message: expectedText};

    component.setProps({notification: notification});
    var text = component.refs.notification.props.children;

    expect(text).to.equal(expectedText);
  });

  it('should render correct notification type', function() {
    var expectedType = 'success';
    var notification = {
      message: 'all good',
      type: expectedType
    };

    component.setProps({notification: notification});
    var notificationClassName = component.refs.notification.props.className;

    expect(notificationClassName).to.contain(expectedType);
  });

  it('should disable form', function() {
    component.setProps({disabled: true});
    var inputDisabled = component.refs.inputs.props.children[0].props.disabled;
    var buttonDisabled = component.refs.submitButton.props.disabled;

    expect(inputDisabled).to.be.ok;
    expect(buttonDisabled).to.be.ok;
  });
});
