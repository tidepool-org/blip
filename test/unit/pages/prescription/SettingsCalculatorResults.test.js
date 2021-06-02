import React from 'react';
import { mount } from 'enzyme';
import { Formik } from 'formik';

import SettingsCalculatorResults from '../../../../app/pages/prescription/SettingsCalculatorResults';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../app/core/constants';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global before */
/* global after */
/* global afterEach */
/* global beforeEach */

const expect = chai.expect;

describe('SettingsCalculatorResults', () => {
  const noResultsFormikContext = {
    values: {
      initialSettings: { bloodGlucoseUnits: MGDL_UNITS },
      calculator: {},
    },
  };

  const withResultsFormikContext = {
    values: {
      initialSettings: { bloodGlucoseUnits: MGDL_UNITS },
      calculator: {
        recommendedBasalRate: 0.5,
        recommendedInsulinSensitivity: 25,
        recommendedCarbohydrateRatio: 20,
      },
    },
  };

  const createWrapper = formikContext => {
    SettingsCalculatorResults.__Rewire__('useFormikContext', sinon.stub().returns(formikContext));

    return mount((
      <Formik
        initialValues={{ ...formikContext.values }}
      >
        <SettingsCalculatorResults t={sinon.stub()} />
      </Formik>
    ));
  };

  afterEach(() => {
    SettingsCalculatorResults.__ResetDependency__('useFormikContext');
  });

  it('should not render anything if calulator results are missing', () => {
    const wrapper = createWrapper(noResultsFormikContext);
    expect(wrapper.html()).to.equal('');
  });

  it('should render results anything if calulator results are present', () => {
    const wrapper = createWrapper(withResultsFormikContext);
    expect(wrapper.text()).to.contain('Basal Rate: 0.5 U/hr');
    expect(wrapper.text()).to.contain('Insulin Sensitivity: 25 mg/dL/U');
    expect(wrapper.text()).to.contain('Carbohydrate Ratio: 20 g/U');

    const mmollWrapper = createWrapper({ values: {
      ...withResultsFormikContext.values,
      initialSettings: { bloodGlucoseUnits: MMOLL_UNITS },
    } });

    expect(mmollWrapper.text()).to.contain('Insulin Sensitivity: 25 mmol/L/U');
  });

});
