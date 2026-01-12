/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import _ from 'lodash';

import ExportModal from '@app/components/ExportModal';
import userEvent from '@testing-library/user-event';

describe('ExportModal', () => {
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
          <ExportModal {...props} />
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

      // Values should be changes
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
