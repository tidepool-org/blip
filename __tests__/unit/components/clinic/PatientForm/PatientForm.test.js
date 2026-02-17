import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import theme from '../../../../../app/themes/baseTheme';
import PatientForm from '../../../../../app/components/clinic/PatientForm/PatientForm';
import { ToastProvider } from '../../../../../app/providers/ToastProvider';

const MockSelect = ({ isDisabled, ...props }) => (
  <div data-testid={props['data-testid']} data-is-disabled={isDisabled ? 'true' : 'false'}>
    {props.children}
  </div>
);

jest.mock('../../../../../app/components/clinic/PatientForm/SelectDiabetesType', () => (props) => (
  <MockSelect {...props} data-testid="SelectDiabetesType">SelectDiabetesType</MockSelect>
));
jest.mock('../../../../../app/components/clinic/PatientForm/SelectGlycemicRanges', () => (props) => (
  <MockSelect {...props} data-testid="SelectGlycemicRanges">SelectGlycemicRanges</MockSelect>
));
jest.mock('../../../../../app/components/clinic/PatientForm/SelectTags', () => (props) => (
  <MockSelect {...props} data-testid="SelectTags">SelectTags</MockSelect>
));
jest.mock('../../../../../app/components/clinic/PatientForm/SelectSites', () => (props) => (
  <MockSelect {...props} data-testid="SelectSites">SelectSites</MockSelect>
));

const initialState = {
  blip: {
    selectedClinicId: 'clinic123',
    clinics: {
      clinic123: {
        id: 'clinic123',
        mrnSettings: { required: false },
        entitlements: {
          patientTags: true,
          clinicSites: true,
          summaryDashboard: true,
        },
        patientTags: [{ id: 'tag1', name: 'Tag 1' }],
        sites: [{ id: 'site1', name: 'Site 1' }],
      },
    },
    clinicMRNsForPatientFormValidation: [],
    working: {
      fetchingClinicMRNsForPatientFormValidation: { inProgress: false },
    },
    loggedInUserId: 'user123',
  },
};

const defaultProps = {
  t: (key) => key,
  action: 'edit',
  api: {
    clinics: {
      getPatientFromClinic: jest.fn(),
      getPatientsForClinic: jest.fn(),
    },
  },
  invite: {},
  onFormChange: jest.fn(),
  patient: {
    id: 'patient123',
    fullName: 'John Doe',
    birthDate: '1990-01-01',
    mrn: 'MRN123',
    email: 'john@example.com',
    permissions: { custodian: {} },
  },
  trackMetric: jest.fn(),
  searchDebounceMs: 0,
};

const renderPatientForm = (props = {}, storeState = initialState) => {
  const reducer = (state = storeState, action) => state;
  const store = createStore(reducer, applyMiddleware(thunk));

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <PatientForm {...defaultProps} {...props} />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

describe('PatientForm', () => {
  it('renders with editable fields by default (isReadOnly=false)', () => {
    renderPatientForm({ isReadOnly: false });

    // Inputs
    expect(screen.getByLabelText('Full Name')).toBeEnabled();
    expect(screen.getByLabelText('Email (optional)')).toBeEnabled();
    expect(screen.getByLabelText('MRN (optional)')).toBeEnabled();
    expect(screen.getByLabelText('Birthdate')).toBeEnabled();

    // Selects
    expect(screen.getByTestId('SelectDiabetesType')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectGlycemicRanges')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectTags')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectSites')).toHaveAttribute('data-is-disabled', 'false');
  });

  it('renders with disabled fields when isReadOnly=true', () => {
    renderPatientForm({ isReadOnly: true });

    // Inputs
    expect(screen.getByLabelText('Full Name')).toBeDisabled();
    expect(screen.getByLabelText('Email (optional)')).toBeDisabled();
    expect(screen.getByLabelText('MRN (optional)')).toBeDisabled();
    expect(screen.getByLabelText('Birthdate')).toBeDisabled();

    // Selects
    expect(screen.getByTestId('SelectDiabetesType')).toHaveAttribute('data-is-disabled', 'true');
    expect(screen.getByTestId('SelectGlycemicRanges')).toHaveAttribute('data-is-disabled', 'true');
    expect(screen.getByTestId('SelectTags')).toHaveAttribute('data-is-disabled', 'true');
    expect(screen.getByTestId('SelectSites')).toHaveAttribute('data-is-disabled', 'true');
  });

  it('renders with editable fields when isReadOnly is not provided (default false)', () => {
    renderPatientForm();

    expect(screen.getByLabelText('Full Name')).toBeEnabled();
    expect(screen.getByLabelText('Email (optional)')).toBeEnabled();
    expect(screen.getByLabelText('MRN (optional)')).toBeEnabled();
    expect(screen.getByLabelText('Birthdate')).toBeEnabled();

    expect(screen.getByTestId('SelectDiabetesType')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectGlycemicRanges')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectTags')).toHaveAttribute('data-is-disabled', 'false');
    expect(screen.getByTestId('SelectSites')).toHaveAttribute('data-is-disabled', 'false');
  });
});
