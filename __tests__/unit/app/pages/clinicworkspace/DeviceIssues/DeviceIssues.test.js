/* global jest, expect, describe, it, beforeAll, beforeEach, afterAll, afterEach */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import deviceIssuesReducer from '@app/pages/clinicworkspace/DeviceIssues/deviceIssuesSlice';
import DeviceIssues from '@app/pages/clinicworkspace/DeviceIssues/DeviceIssues';

const CLINIC_ID = 'clinic123';
const API_URL = `http://app.tidepool.test/v1/clinics/${CLINIC_ID}/patients`;

const clinicPatientTags = [
  { id: 'tag1', name: 'Diabetes' },
  { id: 'tag2', name: 'Hypertension' },
];

const mockPatients = {
  data: [
    { fullName: 'Jane Doe', birthDate: '1990-01-15', mrn: 'MRN001', tags: ['tag1', 'tag2'] },
    { fullName: 'John Smith', birthDate: '1985-06-20', mrn: 'MRN002', tags: ['tag1'] },
  ],
  meta: { count: 30 },
};

const blipReducer = combineReducers({
  selectedClinicId: (state = CLINIC_ID) => state,
  clinics: (state = { [CLINIC_ID]: { patientTags: clinicPatientTags } }) => state,
  deviceIssues: deviceIssuesReducer,
});

const server = setupServer();

describe('DeviceIssues', () => {
  let store;
  let capturedRequests;

  beforeAll(() => server.listen());

  beforeEach(() => {
    capturedRequests = [];
    store = setupStore({}, { blip: blipReducer });

    server.use(
      http.get(API_URL, async ({ request }) => {
        const url = new URL(request.url);
        capturedRequests.push(Object.fromEntries(url.searchParams));
        await delay(50);
        return HttpResponse.json(mockPatients);
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <DeviceIssues />
      </Provider>
    );

  it('makes the correct HTTP call with default args on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0]).toEqual({
      offset: '0',
      category: 'DEFAULT',
      limit: '12',
    });
  });

  it('changes the HTTP call category arg when clicking a different category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Stale Data'));

    await waitFor(() => {
      expect(capturedRequests.length).toBeGreaterThanOrEqual(2);
    });

    const lastRequest = capturedRequests[capturedRequests.length - 1];
    expect(lastRequest.category).toBe('STALE_DATA');
    expect(lastRequest.offset).toBe('0');
  });

  it('changes the HTTP call offset arg when clicking a pagination button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // meta.count=30 with limit=12 gives 3 pages; click page 2
    await userEvent.click(screen.getByText('2'));

    await waitFor(() => {
      expect(capturedRequests.length).toBeGreaterThanOrEqual(2);
    });

    const lastRequest = capturedRequests[capturedRequests.length - 1];
    expect(lastRequest.offset).toBe('12');
    expect(lastRequest.limit).toBe('12');
  });

  describe('table cells', () => {
    it('displays patient detail demographics', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });

      const cell0 = within(screen.getByTestId('deviceIssuesPatientsTable-row-0-fullName'));

      // Patient 1 - first row
      expect(cell0.getByText('Jane Doe')).toBeInTheDocument();
      expect(cell0.getByText(/DOB:/)).toBeInTheDocument();
      expect(cell0.getByText(/1990-01-15/)).toBeInTheDocument();
      expect(cell0.getByText(/MRN001/)).toBeInTheDocument();

      const cell1 = within(screen.getByTestId('deviceIssuesPatientsTable-row-1-fullName'));

      // Patient 2 - second row
      expect(cell1.getByText('John Smith')).toBeInTheDocument();
      expect(cell1.getByText(/DOB:/)).toBeInTheDocument();
      expect(cell1.getByText(/1985-06-20/)).toBeInTheDocument();
      expect(cell1.getByText(/MRN002/)).toBeInTheDocument();
    });

    it('displays the per-patient tag list', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });

      const cell0 = within(screen.getByTestId('deviceIssuesPatientsTable-row-0-tags'));

      // Patient 1 has both tags
      expect(cell0.getByText('Diabetes')).toBeInTheDocument();
      expect(cell0.getByText('Hypertension')).toBeInTheDocument();

      const cell1 = within(screen.getByTestId('deviceIssuesPatientsTable-row-1-tags'));

      // Patient 2 has only Diabetes
      expect(cell1.getByText('Diabetes')).toBeInTheDocument();
      expect(cell1.queryByText('Hypertension')).not.toBeInTheDocument();
    });
  });
});
