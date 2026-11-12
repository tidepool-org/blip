/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import _ from 'lodash';

import ExportDialog from '@app/components/ExportDialog';
import { MGDL_UNITS } from '@app/core/constants';

describe('ExportDialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-02-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const reduxState = {
    blip: {
      loggedInUserId: 'user-123',
      currentPatientInViewId: 'patient-456',
      allUsersMap: {
        'user-123': {
          userid: 'user-123',
        },
        'patient-456': {
          userid: 'patient-456',
          settings: { units: { bg: 'mg/dL' } },
        },
      },
      permissionsOfMembersInTargetCareTeam: {
        'patient-456': { view: {}, upload: {} },
      },
    },
  };

  const mockApi = {
    tidepool: {
      getExportDataURL: jest.fn(),
    },
  };

  const mockStore = configureStore([thunk]);
  const store = mockStore(reduxState);

  const props = {
    open: true,
    onClose: jest.fn(),
    api: mockApi,
    trackMetric: jest.fn(),
  };

  describe('When selecting specific days', () => {
    it('calls the API with the expected args', async () => {
      render(
        <Provider store={store}>
          <ExportDialog {...props} />
        </Provider>
      );

      expect(screen.getByRole('heading', { name: /Export Patient Data/ })).toBeInTheDocument();

      // 14 days should be selected initially
      expect(screen.getByRole('button', { name: /14 days/ })).toHaveClass('selected');
      expect(screen.getByRole('button', { name: /30 days/ })).not.toHaveClass('selected');
      expect(screen.getByRole('button', { name: /90 days/ })).not.toHaveClass('selected');

      const mgdlRadioButton = screen.getByLabelText('mg/dL');
      const mmollRadioButton = screen.getByLabelText('mmol/L');
      const excelRadioButton = screen.getByLabelText('Excel');
      const jsonRadioButton = screen.getByLabelText('JSON');

      // mg/dL should be selected initially
      expect(mgdlRadioButton).toBeChecked();
      expect(mmollRadioButton).not.toBeChecked();

      // Excel should be selected initially
      expect(excelRadioButton).toBeChecked();
      expect(jsonRadioButton).not.toBeChecked();

      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');

      expect(startDateInput).toHaveValue('Jan 18, 2030');
      expect(endDateInput).toHaveValue('Feb 1, 2030');

      // Action: User selects 90 days, JSON, and mmoll
      fireEvent.click(screen.getByRole('button', { name: /90 days/ }));
      fireEvent.click(mmollRadioButton);
      fireEvent.click(jsonRadioButton);

      // Values should be changed
      expect(startDateInput).toHaveValue('Nov 3, 2029');
      expect(endDateInput).toHaveValue('Feb 1, 2030');

      // Correct buttons / radio options should be selected
      expect(screen.getByRole('button', { name: /14 days/ })).not.toHaveClass('selected');
      expect(screen.getByRole('button', { name: /30 days/ })).not.toHaveClass('selected');
      expect(screen.getByRole('button', { name: /90 days/ })).toHaveClass('selected');

      expect(mgdlRadioButton).not.toBeChecked();
      expect(mmollRadioButton).toBeChecked();

      expect(excelRadioButton).not.toBeChecked();
      expect(jsonRadioButton).toBeChecked();

      // API is expected to be called with correct args
      expect(mockApi.tidepool.getExportDataURL).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /Export/}));

      expect(mockApi.tidepool.getExportDataURL).toHaveBeenCalledWith(
        'patient-456',
        'user-123',
        {
          startDate: '2029-11-03T00:00:00.000Z',
          endDate: '2030-02-01T23:59:59.999Z',
          bgUnits: 'mmol/L',
          format: 'json',
        },
        expect.any(Function)
      );
    });
  });
});

describe('ExportDialog contents and actions', () => {
  const state = {
    blip: {
      allUsersMap: {
        patient123: { userid: 'patient123', settings: { units: { bg: MGDL_UNITS } } },
        clinician456: { userid: 'clinician456' },
      },
      currentPatientInViewId: 'patient123',
      loggedInUserId: 'clinician456',
      permissionsOfMembersInTargetCareTeam: {},
    },
  };

  const mockStore = configureStore([thunk]);

  const defaultProps = {
    api: { tidepool: { getExportDataURL: jest.fn() } },
    patient: { userid: 'patient123' },
    user: { userid: 'clinician456' },
    onClose: jest.fn(),
    trackMetric: jest.fn(),
    timePrefs: { timezoneName: 'UTC' },
  };

  const renderDialog = (props = {}) => render(
    <Provider store={mockStore(state)}>
      <ExportDialog {...defaultProps} open {...props} />
    </Provider>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mount the dialog contents only when open', () => {
    const { rerender } = render(
      <Provider store={mockStore(state)}>
        <ExportDialog {...defaultProps} open={false} />
      </Provider>
    );
    expect(screen.queryByText('Export Patient Data')).not.toBeInTheDocument();

    rerender(
      <Provider store={mockStore(state)}>
        <ExportDialog {...defaultProps} open />
      </Provider>
    );
    expect(screen.getByText('Export Patient Data')).toBeInTheDocument();
  });

  it('should compose the dialog from title, content controls, and footer actions when open', () => {
    renderDialog();

    expect(screen.getByText('Export Patient Data')).toBeInTheDocument();

    // Date-range presets
    expect(document.getElementById('export-days-0')).toBeInTheDocument();
    expect(document.getElementById('export-days-2')).toBeInTheDocument();

    // Units and file-type selections
    expect(document.querySelectorAll('input[name="bgUnits"]')).toHaveLength(2);
    expect(document.querySelectorAll('input[name="format"]')).toHaveLength(2);

    // Footer actions
    expect(document.querySelector('.export-cancel')).toBeInTheDocument();
    expect(document.querySelector('.export-submit')).toBeInTheDocument();
  });

  it('should request the export with the selected format and units when submit is clicked', async () => {
    renderDialog();

    await userEvent.click(document.querySelector('.export-submit'));

    expect(defaultProps.api.tidepool.getExportDataURL).toHaveBeenCalledTimes(1);
    const [patientId, userId, opts] = defaultProps.api.tidepool.getExportDataURL.mock.calls[0];
    expect(patientId).toBe('patient123');
    expect(userId).toBe('clinician456');
    expect(opts).toMatchObject({ format: 'excel', bgUnits: MGDL_UNITS });
    expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clicked "export data"');
  });

  it('should close without exporting when Cancel is clicked', async () => {
    renderDialog();

    await userEvent.click(document.querySelector('.export-cancel'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.api.tidepool.getExportDataURL).not.toHaveBeenCalled();
  });
});
