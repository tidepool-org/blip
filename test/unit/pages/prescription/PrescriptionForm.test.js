import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { withFormik } from 'formik';
import defaults from 'lodash/defaults';

import {
  clearCalculator,
  clearCalculatorInputs,
  clearCalculatorResults,
  generateTherapySettingsOrderText,
  prescriptionForm,
  PrescriptionForm,
  default as PF,
} from '../../../../app/pages/prescription/PrescriptionForm';

import { ToastProvider } from '../../../../app/providers/ToastProvider';
import LDClientMock from '../../../fixtures/LDClientMock';
import { deviceIdMap } from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global before */
/* global after */
/* global context */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PrescriptionForm', () => {
  let wrapper;
  const today = moment().format('MMM D, YYYY');

  let defaultProps = {
    t: sinon.stub().callsFake(string => string.replace('{{today}}', today)),
    creatingPrescription: { inProgress: false, completed: false },
    creatingPrescriptionRevision: { inProgress: false, completed: false },
    devices: {
      cgm: [{ id: deviceIdMap.dexcomG6 }],
      pumps: [{ id: deviceIdMap.palmtree }],
    },
    trackMetric: sinon.stub(),
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const defaultState = mockStore({
    blip: {
      loggedInUserId: 'clinician123',
      working: {
        fetchingDevices: completedState,
        fetchingClinicPrescriptions: completedState,
        creatingPrescription: defaultWorkingState,
        creatingPrescriptionRevision: defaultWorkingState,
      },
    },
  });

  before(() => {
    PF.__Rewire__('useLDClient', sinon.stub().returns(new LDClientMock()));

    PF.__Rewire__('useFlags', sinon.stub().returns({
      showPrescriptions: true,
    }));
  });

  after(() => {
    PF.__ResetDependency__('useLDClient');
    PF.__ResetDependency__('useFlags');
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...defaultProps} {...formikProps} />);
    wrapper = mount(
      <Provider store={defaultState}>
        <ToastProvider>
            <MemoryRouter initialEntries={['/prescriptions/new']}>
              <Route path='/prescriptions/new' children={() => <Element />} />
            </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
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

  it('should render the all the form steps when skippedFieldsProps is provided as an empty array', () => {
    const noSkippedFieldsProps = {
      ...defaultProps,
      devices: {
        cgm: [{ id: deviceIdMap.dexcomG6 }],
        pumps: [{ id: deviceIdMap.palmtree }],
      },
      skippedFields: [],
    };

    const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...noSkippedFieldsProps} {...formikProps} />);
    wrapper = mount(
      <Provider store={defaultState}>
        <ToastProvider>
            <MemoryRouter initialEntries={['/prescriptions/new']}>
              <Route path='/prescriptions/new' children={() => <Element />} />
            </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const stepper = wrapper.find('#prescription-form-steps').hostNodes();
    expect(stepper).to.have.length(1);

    const steps = stepper.find('.MuiStep-root');
    expect(steps).to.have.length(5);

    expect(steps.at(0).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Create Patient Account');
    expect(steps.at(0).hasClass('active')).to.be.true;

    expect(steps.at(1).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Complete Patient Profile');
    expect(steps.at(2).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Therapy Settings Calculator');
    expect(steps.at(3).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Enter Therapy Settings');
    expect(steps.at(4).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Review and Save Tidepool Loop Start Order');
  });

  it('should not render the calculator form steps when using the default-provided skipFields props', () => {
    const defaultSkippedFieldProps = {
      ...defaultProps,
      devices: {
        cgm: [{ id: deviceIdMap.dexcomG6 }],
        pumps: [{ id: deviceIdMap.palmtree }],
      },
      skippedFields: undefined,
    };

    const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...defaultSkippedFieldProps} {...formikProps} />);
    wrapper = mount(
      <Provider store={defaultState}>
        <ToastProvider>
            <MemoryRouter initialEntries={['/prescriptions/new']}>
              <Route path='/prescriptions/new' children={() => <Element />} />
            </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const stepper = wrapper.find('#prescription-form-steps').hostNodes();
    expect(stepper).to.have.length(1);

    const steps = stepper.find('.MuiStep-root');
    expect(steps).to.have.length(4);

    expect(steps.at(0).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Create Patient Account');
    expect(steps.at(0).hasClass('active')).to.be.true;

    expect(steps.at(1).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Complete Patient Profile');
    expect(steps.at(2).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Enter Therapy Settings');
    expect(steps.at(3).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Review and Save Tidepool Loop Start Order');
  });

  it('should render the calculator form steps when using custom skipFields prop that does not exclude calculator', () => {
    const skippedFieldProps = {
      ...defaultProps,
      devices: {
        cgm: [{ id: deviceIdMap.dexcomG6 }],
        pumps: [{ id: deviceIdMap.palmtree }],
      },
      skippedFields: ['mrn'],
    };

    const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...skippedFieldProps} {...formikProps} />);
    wrapper = mount(
      <Provider store={defaultState}>
        <ToastProvider>
            <MemoryRouter initialEntries={['/prescriptions/new']}>
              <Route path='/prescriptions/new' children={() => <Element />} />
            </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const stepper = wrapper.find('#prescription-form-steps').hostNodes();
    expect(stepper).to.have.length(1);

    const steps = stepper.find('.MuiStep-root');
    expect(steps).to.have.length(5);

    expect(steps.at(0).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Create Patient Account');
    expect(steps.at(0).hasClass('active')).to.be.true;

    expect(steps.at(1).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Complete Patient Profile');
    expect(steps.at(2).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Therapy Settings Calculator');
    expect(steps.at(3).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Enter Therapy Settings');
    expect(steps.at(4).find('.MuiStepLabel-label').hostNodes().text()).to.equal('Review and Save Tidepool Loop Start Order');
  });

  it('should render the form actions, with only the `next` button on the first step', () => {
    const actions = wrapper.find('.step-actions').hostNodes();
    expect(actions).to.have.length(1);

    const nextButton = actions.find('button.step-next').hostNodes();
    expect(nextButton).to.have.length(1);

    const backButton = actions.find('button.step-back').hostNodes();
    expect(backButton).to.have.length(0);
  });

  describe('clearCalculatorInputs', () => {
    const formikContext = {
      setFieldValue: sinon.stub(),
      setFieldTouched: sinon.stub(),
    }

    it('should clear all calculator input values', () => {
      clearCalculatorInputs(formikContext);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.totalDailyDose', undefined, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.totalDailyDose', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.totalDailyDoseScaleFactor', 1, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.totalDailyDoseScaleFactor', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.weight', undefined, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.weight', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.weightUnits', 'kg', false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.weightUnits', false);
    });
  });

  describe('clearCalculatorResults', () => {
    const formikContext = {
      setFieldValue: sinon.stub(),
      setFieldTouched: sinon.stub(),
    }

    it('should clear all calculator result values', () => {
      clearCalculatorResults(formikContext);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedBasalRate', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedBasalRate', false)
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedInsulinSensitivity', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedInsulinSensitivity', false)
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedCarbohydrateRatio', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedCarbohydrateRatio', false)
    });
  });

  describe('clearCalculator', () => {
    const formikContext = {
      setFieldValue: sinon.stub(),
      setFieldTouched: sinon.stub(),
    }

    it('should clear all calculator values', () => {
      clearCalculator(formikContext);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.method', undefined, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.method', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.totalDailyDose', undefined, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.totalDailyDose', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.totalDailyDoseScaleFactor', 1, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.totalDailyDoseScaleFactor', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.weight', undefined, false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.weight', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.weightUnits', 'kg', false);
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.weightUnits', false);
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedBasalRate', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedBasalRate', false)
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedInsulinSensitivity', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedInsulinSensitivity', false)
      sinon.assert.calledWithExactly(formikContext.setFieldValue, 'calculator.recommendedCarbohydrateRatio', undefined, false)
      sinon.assert.calledWithExactly(formikContext.setFieldTouched, 'calculator.recommendedCarbohydrateRatio', false)
    });
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

  describe('persistent storage', () => {
    let wrapper;
    let Element;
    let mockedLocalStorage = {};

    context('prescription create flow', () => {
      const props = {
        ...defaultProps,
        location: { search: '?prescription-form-steps-step=0,1' },
        prescription: { state: 'draft' },
      };

      const formikContext = {
        setValues: sinon.stub(),
        setStatus: sinon.stub(),
        validateForm: sinon.stub(),
        values: props.prescription,
        status: { hydratedValues: {} },
      };

      before(() => {
        PF.__Rewire__('useLocalStorage', sinon.stub().callsFake(key => {
          defaults(mockedLocalStorage, { [key]: {} });
          return [
            mockedLocalStorage[key],
            sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
          ];
        }));

        PF.__Rewire__('useFormikContext', sinon.stub().returns(formikContext));
      });

      beforeEach(() => {
        formikContext.setValues.resetHistory();

        mockedLocalStorage = {
          prescriptionForm: {
            accountType: 'patient',
            foo: 'bar',
          },
        };

        Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...props} {...formikProps} />);
      });

      after(() => {
        PF.__ResetDependency__('useLocalStorage');
        PF.__ResetDependency__('useFormikContext');
      })

      it('should hydrate from localstorage if there is no stored `id` and there are active step query params', () => {
        wrapper = mount(
          <Provider store={defaultState}>
            <ToastProvider>
              <MemoryRouter initialEntries={['/prescriptions/new']}>
                <Route path='/prescriptions/new' children={() => <Element {...props} />} />
              </MemoryRouter>
            </ToastProvider>
          </Provider>
        );

        sinon.assert.callCount(formikContext.setValues, 1);
        sinon.assert.calledWith(formikContext.setValues, sinon.match({
          ...props.prescription,
          accountType: 'patient',
          foo: 'bar',
        }));
      });

      it('should not hydrate from localstorage if there is a stored `id`', () => {
        mockedLocalStorage = {
          prescriptionForm: {
            accountType: 'patient',
            foo: 'bar',
            id: 'rxId123',
          },
        };

        wrapper = mount(
          <Provider store={defaultState}>
            <ToastProvider>
              <MemoryRouter initialEntries={['/prescriptions/new']}>
                <Route path='/prescriptions/new' children={() => <Element {...props} />} />
              </MemoryRouter>
            </ToastProvider>
          </Provider>
        );

        sinon.assert.notCalled(formikContext.setValues);
      });
    });

    context('prescription edit flow', () => {
      const prescriptionId = 'rxId123';

      const props = {
        ...defaultProps,
        prescription: { state: 'draft', id: prescriptionId },
      };

      const formikContext = {
        setValues: sinon.stub(),
        setStatus: sinon.stub(),
        validateForm: sinon.stub(),
        values: props.prescription,
        status: { hydratedValues: {} },
      };

      before(() => {
        PF.__Rewire__('useLocalStorage', sinon.stub().callsFake(key => {
          defaults(mockedLocalStorage, { [key]: {} });
          return [
            mockedLocalStorage[key],
            sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
          ];
        }));

        PF.__Rewire__('useFormikContext', sinon.stub().returns(formikContext));
      });

      beforeEach(() => {
        formikContext.setValues.resetHistory();

        mockedLocalStorage = {
          prescriptionForm: {
            id: prescriptionId,
            accountType: 'patient',
            foo: 'bar',
          },
        };

        Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...props} {...formikProps} />);
      });

      after(() => {
        PF.__ResetDependency__('useLocalStorage');
        PF.__ResetDependency__('useFormikContext');
      })

      it('should hydrate from localstorage if stored `id` matches the URL `id` param', () => {
        wrapper = mount(
          <Provider store={defaultState}>
            <ToastProvider>
              <MemoryRouter initialEntries={[`/prescriptions/${prescriptionId}`]}>
                <Route path='/prescriptions/:id' children={() => <Element {...props} />} />
              </MemoryRouter>
            </ToastProvider>
          </Provider>
        );

        sinon.assert.callCount(formikContext.setValues, 1);
        sinon.assert.calledWith(formikContext.setValues, sinon.match({
          ...props.prescription,
          accountType: 'patient',
          foo: 'bar',
        }));
      });

      it('should not hydrate from localstorage if stored `id` does not match the URL `id` param', () => {
        const nonMatchingPrescriptionId = 'rxId456';

        wrapper = mount(
          <Provider store={defaultState}>
            <ToastProvider>
              <MemoryRouter initialEntries={[`/prescriptions/${nonMatchingPrescriptionId}`]}>
                <Route path='/prescriptions/:id' children={() => <Element {...props} />} />
              </MemoryRouter>
            </ToastProvider>
          </Provider>
        );

        sinon.assert.notCalled(formikContext.setValues);
      });
    });
  });

  describe('handleCopyTherapySettingsClicked', () => {
    let wrapper;
    let reviewStepProps = {
      ...defaultProps,
      location: { search: '?prescription-form-steps-step=3,0' },
      prescription: { state: 'submitted' }
    };

    beforeEach(() => {
      const Element = withFormik(prescriptionForm())(formikProps => <PrescriptionForm {...reviewStepProps} {...formikProps} />);
      wrapper = mount(
        <Provider store={defaultState}>
          <ToastProvider>
            <MemoryRouter initialEntries={['/prescriptions/new']}>
              <Route path='/prescriptions/new' children={() => <Element {...reviewStepProps} />} />
            </MemoryRouter>
          </ToastProvider>
        </Provider>
      );
    });

    it('should track a metric when copy as text button is clicked', () => {
      const copyButton = wrapper.find('button[title="Copy therapy settings order as text"]').at(0);
      sinon.assert.notCalled(defaultProps.trackMetric);
      copyButton.simulate('click');
      sinon.assert.calledWith(defaultProps.trackMetric, 'Clicked Copy Therapy Settings Order');
    });
  });
});
