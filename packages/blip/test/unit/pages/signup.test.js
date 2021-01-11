import React from 'react';
import TestUtils from 'react-dom/test-utils';
import mutationTracker from 'object-invariant-test-helper';
import { mount } from 'enzyme';
import sundial from 'sundial';
import sinon from 'sinon';
import { expect, assert } from 'chai';
import _ from 'lodash';

import config from '../../../app/config';
import { SignupPage as Signup, mapStateToProps } from '../../../app/pages/signup';

describe('Signup', function () {

  before(() => {
    // This config value is changed by other tests
    config.ALLOW_SIGNUP_PATIENT = true;
  });

  it('should be exposed as a module and be of type function', function() {
    expect(Signup).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      sinon.spy(console, 'error');
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
      console.error.restore();
    });

    it('should render signup-selection when no key is set and no key is configured', function () {
      var props = {
        inviteKey: '',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupSelection = TestUtils.scryRenderedDOMComponentsWithClass(render, 'signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when key is set and validates', function () {
      var props = {
        inviteKey: 'foobar',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupSelection = TestUtils.scryRenderedDOMComponentsWithClass(render, 'signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when both key and email are set, even if key doesn\'t match configured key', function () {
      var props = {
        inviteKey: 'wrong-key',
        inviteEmail: 'gordonmdent@gmail.com',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupSelection = TestUtils.scryRenderedDOMComponentsWithClass(render, 'signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when key is valid and email is empty', function () {
      var props = {
        inviteKey: 'foobar',
        inviteEmail: '',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupSelection = TestUtils.scryRenderedDOMComponentsWithClass(render, 'signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-form when selection has been made', function () {
      var props = {
        inviteKey: '',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      render.setState({madeSelection:true});
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render the personal signup-form when personal was selected', function () {
      var props = {
        inviteKey: '',
        location: { pathname: 'signup' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      wrapper.instance().setState({madeSelection:true, selected: 'personal'});
      wrapper.update();

      expect(wrapper.find('.signup-form').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').text()).to.have.string('Create');
      expect(wrapper.find('.signup-title-condensed').text()).to.have.string('Account');
    });

    it('should render the clinician signup-form when clinician was selected', function () {
      var props = {
        location: { pathname: 'signup' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      wrapper.instance().setState({ madeSelection: true, selected: 'clinician'});
      wrapper.update();

      expect(wrapper.find('.signup-form').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').text()).to.match(/Create(.*)Account/);
    });

    it('should render the correct fields for the personal signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      expect(wrapper.find('input#fullName').length).to.equal(1);
      expect(wrapper.find('input#username').length).to.equal(1);
      expect(wrapper.find('input#password').length).to.equal(1);
      expect(wrapper.find('input#passwordConfirm').length).to.equal(1);
      expect(wrapper.find('input#termsAccepted').length).to.equal(0);
    });

    it('should render the correct fields for the clinician signup form', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      expect(wrapper.find('input#fullName').length).to.equal(0);
      expect(wrapper.find('input#username').length).to.equal(1);
      expect(wrapper.find('input#password').length).to.equal(1);
      expect(wrapper.find('input#passwordConfirm').length).to.equal(1);
      expect(wrapper.find('input#termsAccepted').length).to.equal(1);
    });

    it('should render a link from the personal form to the clinician form, and vice-versa', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      const typeSwitch = wrapper.find('.signup-formTypeSwitch');
      const link = wrapper.find('.type-switch');

      expect(typeSwitch.length).to.equal(1);
      expect(link.length).to.equal(1);

      link.simulate('click');
      expect(wrapper.instance().state.selected).to.equal('clinician');

      link.simulate('click');
      expect(wrapper.instance().state.selected).to.equal('personal');
    });

    it('should render the proper submit button text for each signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      const submitButton = wrapper.find('.simple-form-submit');

      expect(submitButton.text()).to.equal('Create Personal Account');

      wrapper.setProps({
        location: { pathname: '/signup/clinician' },
      });

      expect(submitButton.text()).to.equal('Create Clinician Account');
    });

    it('should render the proper submit button text for each signup form while the form is submitting', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        working: true,
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      const submitButton = wrapper.find('.simple-form-submit');

      expect(submitButton.text()).to.equal('Creating Personal Account...');

      wrapper.setProps({
        location: { pathname: '/signup/clinician' },
      });

      expect(submitButton.text()).to.equal('Creating Clinician Account...');
    });
  });

  describe('Diabeloop', () => {
    const props = {
      location: { pathname: '/signup/clinician' },
      acknowledgeNotification: _.noop,
      api: {},
      onSubmit: _.noop,
      trackMetric: _.noop,
      working: false,
      t: (v) => v,
    };

    before(() => {
      config.BRANDING = 'diabeloop';
    });
    after(() => {
      config.BRANDING = 'tidepool';
    });

    it('Should render the correct privacy links', () => {
      const wrapper = mount(<Signup {...props} />);
      let a = wrapper.find('#signup-terms-link');
      expect(a.is('a')).to.be.true;
      let aProps = a.props();
      expect(aProps.href).to.be.equal('https://example.com/terms.en.pdf');
      expect(aProps.children[0]).to.be.equal('Diabeloop Applications Terms of Use');

      a = wrapper.find('#signup-privacy-link');
      expect(a.is('a')).to.be.true;
      aProps = a.props();
      expect(aProps.href).to.be.equal('https://example.com/data-privacy.en.pdf');
      expect(aProps.children[0]).to.be.equal('Privacy Policy');
    });
  });

  describe('Initial State', function() {
    it('should return expected initial state', function() {
      var props = {
        inviteEmail: 'gordonmdent@gmail.com',
        location: { pathname: 'signup' },
        t: (v) => v,
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.state;

      expect(state.loading).to.equal(false); // once rendered, loading has been set to false
      expect(state.formValues.username).to.equal(props.inviteEmail);
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should set the state to show the personal form according to the location pathname', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      expect(wrapper.find('.signup-form').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').text()).to.match(/Create(.*)Account/);
    });

    it('should set the state to show the clinician form according to the location pathname', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
        t: (v) => v,
      };

      var wrapper = mount(
        <Signup {...props} />
      );

      expect(wrapper.find('.signup-form').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1);
      expect(wrapper.find('.signup-title-condensed').text()).to.equal('Create Clinician Account');
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        signingUp: {
          inProgress: true,
          notification: {msg: 'Nothing to see here...'}
        }
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.signingUp.notification to notification', () => {
      expect(result.notification).to.deep.equal(state.working.signingUp.notification);
    });

    it('should map working.signingUp.inProgress to working', () => {
      expect(result.working).to.equal(state.working.signingUp.inProgress);
    });
  });

  describe('handleChange', function() {
    it('should be update the form values in state when an input is changed', function() {
      const username = 'jill@gmail.com';

      const props = {
        location: { pathname: '/signup/clinician' },
        t: (v) => v,
      };

      const formValues = {
        username: '',
        password: '',
        passwordConfirm: '',
        termsAccepted: false,
      };

      const wrapper = mount(
        <Signup {...props} />
      );

      const input = wrapper.find('.simple-form').first().find('.input-group').first().find('input');
      expect(input.length).to.equal(1);
      expect(wrapper.instance().state.formValues).to.eql(formValues);

      input.simulate('change', { target: { name: 'username', value: username } });

      const changedFormValues = wrapper.instance().state.formValues;
      expect(changedFormValues, JSON.stringify([changedFormValues, { ...formValues, username }])).to.eql({ ...formValues, username });
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    let acceptedDate = new Date().toISOString();
    let dateStub;

    before(function() {
      dateStub = sinon.stub(sundial, 'utcDateString').returns(acceptedDate);
    });

    after(function() {
      dateStub.reset();
    });

    it('should be prepare the form values for submission of the personal signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        t: (v) => v,
      };

      const formValues = {
        username: 'jill@gmail.com',
        fullName: 'Jill Jellyfish',
        termsAccepted: true,
        password: 'secret',
        passwordConfirm: 'secret',
      };

      const elem = React.createElement(Signup, props);
      const rendered = TestUtils.renderIntoDocument(elem);

      const expectedformattedValues = {
        username: formValues.username,
        emails: [ formValues.username ],
        password: formValues.password,
        roles: [],
        profile: {
          fullName: formValues.fullName,
        },
      };

      const formattedValues = rendered.prepareFormValuesForSubmit(formValues);

      expect(formattedValues).to.eql(expectedformattedValues);
    });

    it('should be prepare the form values for submission of the clinician signup form', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
        t: (v) => v,
      };

      const formValues = {
        username: 'jill@gmail.com',
        fullName: 'Jill Jellyfish',
        termsAccepted: true,
        password: 'secret',
        passwordConfirm: 'secret',
      };

      const elem = React.createElement(Signup, props);
      const rendered = TestUtils.renderIntoDocument(elem);

      const expectedformattedValues = {
        username: formValues.username,
        emails: [ formValues.username ],
        termsAccepted: acceptedDate,
        password: formValues.password,
        roles: [ 'clinic' ],
      };

      const formattedValues = rendered.prepareFormValuesForSubmit(formValues);

      expect(formattedValues).to.eql(expectedformattedValues);
    });
  });
});
