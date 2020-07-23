import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';

import {
  generateTherapySettingsOrderText,
  prescriptionForm,
  PrescriptionForm,
} from '../../../../app/pages/prescription/PrescriptionForm';

import { withFormik } from 'formik';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('PrescriptionForm', () => {
  let wrapper;
  const today = moment().format('MMM D, YYYY');

  let defaultProps = {
    t: sinon.stub().callsFake(string => string.replace('{{today}}', today)),
    creatingPrescription: { inProgress: false, completed: false },
    creatingPrescriptionRevision: { inProgress: false, completed: false },
    trackMetric: sinon.stub(),
  }

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

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

  describe('generateTherapySettingsOrderText', () => {
    it('should generate the therapy settings order text', () => {
      const patientRows = [
        {
          label: 'Name',
          value: 'Foo McBar'
        },
        {
          label: 'Email Address',
          value: 'foo@mc.bar'
        },
      ];

      const therapySettingsRows = [
        {
          label: 'Suspend Threshold',
          value: '115 mg/dL',
        },
        {
          label: 'Basal Schedules',
          value: [
            {
              label: '00:00',
              value: '0.25 U/hr',
            },
            {
              label: '02:30',
              value: '0.2 U/hr',
            },
          ],
        },
      ];

      const textString = generateTherapySettingsOrderText(patientRows, therapySettingsRows);

      const expectedHeaderText = [
        'Tidepool Loop therapy settings order',
        `Exported from Tidepool: ${today}`,
      ].join('\n');

      const expectedProfileText = [
        'Patient Profile',
        'Name: Foo McBar',
        'Email Address: foo@mc.bar',
      ].join('\n');

      const expectedTherapySettingsText = [
        'Suspend Threshold: 115 mg/dL',
        '',
        'Basal Schedules',
        '00:00: 0.25 U/hr',
        '02:30: 0.2 U/hr',
      ].join('\n');

      expect(textString).to.equal(`${expectedHeaderText}\n\n${expectedProfileText}\n\n${expectedTherapySettingsText}\n`);
    });
  });

  describe('handleCopyTherapySettingsClicked', () => {
    let wrapper;
    let reviewStepProps = {
      ...defaultProps,
      location: { search: '?prescription-form-steps-step=3,0' },
    };

    beforeEach(() => {
      const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...reviewStepProps} {...formikProps} />);
      wrapper = mount(<Element {...reviewStepProps} />);
    });

    it('should track a metric when copy as text button is clicked', () => {
      const copyButton = wrapper.find('button[title="For email or notes"]');
      sinon.assert.notCalled(defaultProps.trackMetric);
      copyButton.simulate('click');
      sinon.assert.calledWith(defaultProps.trackMetric, 'Clicked Copy Therapy Settings Order');
    });
  });
});
