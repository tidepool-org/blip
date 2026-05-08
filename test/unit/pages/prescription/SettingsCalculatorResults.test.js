import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import SettingsCalculatorResults from '../../../../app/pages/prescription/SettingsCalculatorResults';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../app/core/constants';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
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

  const renderView = formikContext => {
    return render(
      <Formik
        initialValues={{ ...formikContext.values }}
      >
        <SettingsCalculatorResults t={value => value} />
      </Formik>
    );
  };

  it('should not render anything if calculator results are missing', () => {
    const { container } = renderView(noResultsFormikContext);
    expect(container.textContent).to.equal('');
  });

  it('should render results if calculator results are present', () => {
    const { container } = renderView(withResultsFormikContext);
    expect(container.textContent).to.contain('Basal Rate: 0.5 U/hr');
    expect(container.textContent).to.contain('Insulin Sensitivity: 25 mg/dL/U');
    expect(container.textContent).to.contain('Carbohydrate Ratio: 20 g/U');

    const mmollView = renderView({ values: {
      ...withResultsFormikContext.values,
      initialSettings: { bloodGlucoseUnits: MMOLL_UNITS },
    } });

    expect(mmollView.container.textContent).to.contain('Insulin Sensitivity: 25 mmol/L/U');
  });

});
