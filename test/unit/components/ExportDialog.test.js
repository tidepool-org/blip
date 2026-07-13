import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import ExportDialog from '@app/components/ExportDialog';
import { MGDL_UNITS } from '@app/core/constants';

const mockStore = configureStore([thunk]);

describe('ExportDialog', () => {
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

  const defaultProps = {
    api: { tidepool: { getExportDataURL: jest.fn() } },
    patient: { userid: 'patient123' },
    user: { userid: 'clinician456' },
    onClose: jest.fn(),
    trackMetric: jest.fn(),
    timePrefs: { timezoneName: 'UTC' },
  };

  const renderModal = (props = {}) => render(
    <Provider store={mockStore(state)}>
      <ExportDialog {...defaultProps} open {...props} />
    </Provider>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mounts the dialog contents only while open', () => {
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

  it('composes the dialog from title, content controls, and footer actions', () => {
    renderModal();

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

  it('requests the export with the selected format and units on submit', () => {
    renderModal();

    fireEvent.click(document.querySelector('.export-submit'));

    expect(defaultProps.api.tidepool.getExportDataURL).toHaveBeenCalledTimes(1);
    const [patientId, userId, opts] = defaultProps.api.tidepool.getExportDataURL.mock.calls[0];
    expect(patientId).toBe('patient123');
    expect(userId).toBe('clinician456');
    expect(opts).toMatchObject({ format: 'excel', bgUnits: MGDL_UNITS });
    expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clicked "export data"');
  });

  it('closes without exporting when Cancel is clicked', () => {
    renderModal();

    fireEvent.click(document.querySelector('.export-cancel'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.api.tidepool.getExportDataURL).not.toHaveBeenCalled();
  });
});
