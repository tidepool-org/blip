import React from 'react';
import { mount } from 'enzyme';
import { prescriptionForm, PrescriptionForm } from '../../../../app/pages/prescription/PrescriptionForm';
import i18next from '../../../../app/core/language';
import { withFormik } from 'formik';

const t = i18next.t.bind(i18next);

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('PrescriptionForm', () => {
  let wrapper;

  let defaultProps = {
    t,
    creatingPrescription: { inProgress: false, completed: false },
    creatingPrescriptionRevision: { inProgress: false, completed: false },
  }

  beforeEach(() => {
    const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...defaultProps} {...formikProps} />);
    wrapper = mount(<Element {...defaultProps} />);
  });

  it('should render the prescription form with a submit handler', () => {
    const form = wrapper.find('form#prescription-form');
    expect(form).to.have.length(1);
    expect(form.props().onSubmit).to.be.a('function');
  });

  it('should render a hidden field mapped to formik `id` field via the name attribute', () => {
    const idField = wrapper.find('input[name="id"][type="hidden"]');
    expect(idField).to.have.length(1);
  });

  it('should render the form steps', () => {
    const stepper = wrapper.find('#prescription-form-steps').hostNodes();
    expect(stepper).to.have.length(1);

    const steps = stepper.find('.MuiStep-root');
    expect(steps).to.have.length(4);

    expect(steps.at(0).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Create Patient Account');
    expect(steps.at(0).hasClass('active')).to.be.true;

    expect(steps.at(1).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Complete Patient Profile');
    expect(steps.at(2).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Enter Therapy Settings');
    expect(steps.at(3).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Review and Save Prescription');
  });

  it('should render the form actions, with only the `next` button on the first step', () => {
    const actions = wrapper.find('.step-actions').hostNodes();
    expect(actions).to.have.length(1);

    const nextButton = actions.find('button.step-next').hostNodes();
    expect(nextButton).to.have.length(1);

    const backButton = actions.find('button.step-back').hostNodes();
    expect(backButton).to.have.length(0);
  });
});
