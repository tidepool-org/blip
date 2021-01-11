// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import config from '../../../app/config';
import i18n from '../../../app/core/language';
import { ClinicianDetails } from '../../../app/pages/cliniciandetails/cliniciandetails';

describe('ClinicianDetails', function () {
  const { expect } = chai;
  const props = {
    fetchingUser: false,
    onSubmit: sinon.spy(),
    trackMetric: sinon.spy(),
    user: {},
    working: false,
  };

  before(() => {
    sinon.spy(console, 'error');
  });

  after(() => {
    console.error.restore();
    config.ALLOW_SELECT_COUNTRY = true;
  });

  describe('render', () => {
    let container = null;
    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });
    afterEach(() => {
      document.body.removeChild(container);
      container = null;
      console.error.resetHistory();
    });

    it('should render with no error with the rights props', (done) => {
      ReactDOM.render(<ClinicianDetails {...props} />, container, () => {
        try {
          expect(console.error.called, console.error.getCalls()).to.be.false;
          expect(props.trackMetric.calledOnce).to.be.true;
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not propose to set the country if the preference is not set', (done) => {
      config.ALLOW_SELECT_COUNTRY = false;
      ReactDOM.render(<ClinicianDetails {...props} />, container, () => {
        try {
          expect(document.getElementById('country')).to.be.null;
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should propose to set the country if the preference is set', (done) => {
      config.ALLOW_SELECT_COUNTRY = true;
      ReactDOM.render(<ClinicianDetails {...props} />, container, () => {
        try {
          expect(document.getElementById('country')).to.be.not.null;
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe('submit', () => {
    const formValues = {
      firstName: 'John',
      lastName: 'Doe',
      clinicalRole: 'clinic_manager',
      country: 'FR',
    };
    const fullName = 'John Doe';

    beforeEach(() => {
      props.onSubmit.resetHistory();
      props.trackMetric.resetHistory();
    });

    it('should submit country when ALLOW_SELECT_COUNTRY is set to true', (done) => {
      config.ALLOW_SELECT_COUNTRY = true;
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ formValues }, () => {
        try {
          instance.handleSubmit(formValues);
          expect(props.onSubmit.calledOnceWith({
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            fullName,
            profile: {
              fullName,
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              clinic: {
                role: formValues.clinicalRole
              }
            },
            preferences: {
              displayLanguageCode: i18n.language,
            },
            settings: {
              country: formValues.country,
            }
          })).to.be.true;
          expect(_.isEmpty(instance.state.validationErrors)).to.be.true;
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not submit country when ALLOW_SELECT_COUNTRY is set to false', (done) => {
      config.ALLOW_SELECT_COUNTRY = false;
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ formValues }, () => {
        try {
          instance.handleSubmit(formValues);
          expect(props.onSubmit.calledOnceWith({
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            fullName,
            profile: {
              fullName,
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              clinic: {
                role: formValues.clinicalRole
              }
            },
            preferences: {
              displayLanguageCode: i18n.language,
            },
          })).to.be.true;
          expect(_.isEmpty(instance.state.validationErrors)).to.be.true;
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not submit if first name is missing', (done) => {
      config.ALLOW_SELECT_COUNTRY = true;
      const partialValues = _.omit(formValues, 'firstName');
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ partialValues }, () => {
        try {
          instance.handleSubmit(partialValues);
          expect(props.onSubmit.notCalled).to.be.true;
          expect(instance.state.validationErrors).to.be.deep.equals(
            { firstName: 'First name is required.' },
            `Expected ${JSON.stringify(instance.state.validationErrors)}`
          );
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not submit if last name is missing', (done) => {
      const partialValues = _.omit(formValues, 'lastName');
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ partialValues }, () => {
        try {
          instance.handleSubmit(partialValues);
          expect(props.onSubmit.notCalled).to.be.true;
          expect(instance.state.validationErrors).to.be.deep.equals(
            { lastName: 'Last name is required.' },
            `Expected ${JSON.stringify(instance.state.validationErrors)}`
          );
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not submit if clinical role is missing', (done) => {
      const partialValues = _.omit(formValues, 'clinicalRole');
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ partialValues }, () => {
        try {
          instance.handleSubmit(partialValues);
          expect(props.onSubmit.notCalled).to.be.true;
          expect(instance.state.validationErrors).to.be.deep.equals(
            { clinicalRole: 'Clinical role is required.' },
            `Expected ${JSON.stringify(instance.state.validationErrors)}`
          );
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should not submit if country is missing and ALLOW_SELECT_COUNTRY is set to true', (done) => {
      config.ALLOW_SELECT_COUNTRY = true;
      const partialValues = _.omit(formValues, 'country');
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ partialValues }, () => {
        try {
          instance.handleSubmit(partialValues);
          expect(props.onSubmit.notCalled).to.be.true;
          expect(instance.state.validationErrors).to.be.deep.equals(
            { country: 'Country is required.' },
            `Expected ${JSON.stringify(instance.state.validationErrors)}`
          );
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should submit if country is missing and ALLOW_SELECT_COUNTRY is set to false', (done) => {
      config.ALLOW_SELECT_COUNTRY = false;
      const partialValues = _.omit(formValues, 'country');
      const wrapper = shallow(<ClinicianDetails {...props} />);
      const instance = wrapper.instance();
      instance.setState({ partialValues }, () => {
        try {
          instance.handleSubmit(partialValues);
          expect(props.onSubmit.called).to.be.true;
          expect(instance.state.validationErrors).to.be.deep.equals({});
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
