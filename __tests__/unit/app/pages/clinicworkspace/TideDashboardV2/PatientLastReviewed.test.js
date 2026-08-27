/* global jest, beforeAll, beforeEach, afterEach, afterAll, describe, it, expect */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import moment from 'moment';

import { setupStore } from '@tests/utils/setupStore';
import blipReducer from '@app/redux/reducers';
import { ToastProvider } from '@app/providers/ToastProvider';
import { CATEGORY } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';
import { useGetTideDashboardPatientsQuery } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardApi';
import PatientLastReviewed from '@app/pages/clinicworkspace/TideDashboardV2/PatientLastReviewed';

const TEST_TIMEOUT_MS = 30_000;

describe('TideDashboardV2 PatientLastReviewed', () => {
  const today = moment().toISOString();
  const yesterday = moment().subtract(1, 'day').toISOString();

  const reviewsUrl = 'http://app.tidepool.test/v1/clinics/c123/patients/p1/reviews';
  const patientsUrl = 'http://app.tidepool.test/v1/clinics/c123/patients';
  let store;

  const fetchPatients = jest.fn();

  const server = setupServer(
    http.put(reviewsUrl, ({ request }) => HttpResponse.json([{ clinicianId: 'clinician123', time: today }])),

    http.delete(reviewsUrl, ({ request }) => HttpResponse.json([{ clinicianId: 'clinician123', time: yesterday }])),

    http.get(patientsUrl, () => {
      fetchPatients(); // Log each this GET request is made

      return HttpResponse.json({
        data: [{ id: 'p1', fullName: 'Moses Itauma' }],
        meta: { count: 1 },
      });
    }),
  );

  const TideDashboardPatientList = () => {
    const { data } = useGetTideDashboardPatientsQuery({ clinicId: 'c123', offset: 0, limit: 12, category: CATEGORY.DEFAULT, summaryPeriod: '14d' });

    return <div>{data?.data?.[0]?.fullName}</div>;
  };

  const ui = ({ patient = { id: 'p1', reviews: [] } } = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <ToastProvider>
          <TideDashboardPatientList />
          <PatientLastReviewed patient={patient} />
        </ToastProvider>
      </MemoryRouter>
    </Provider>
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeAll(() => server.listen());

  beforeEach(() => {
    store = setupStore(
      { blip: { selectedClinicId: 'c123', loggedInUserId: 'clinician123' } },
      { blip: blipReducer },
    );

    fetchPatients.mockClear();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('marks the patient as reviewed and shows the review returned by the api', async () => {
    renderComponent({ patient: { id: 'p1', reviews: [] } });

    expect(screen.getByText('-')).toBeInTheDocument();
    await waitFor(() => expect(fetchPatients).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    expect(await screen.findByText('Today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

    await waitFor(() => expect(fetchPatients).toHaveBeenCalledTimes(2)); // Refetch should have triggered
  }, TEST_TIMEOUT_MS);

  it('undoes the review and shows the preceding review returned by the api', async () => {
    renderComponent({
      patient: {
        id: 'p1',
        reviews: [{ clinicianId: 'clinician123', time: today }, { clinicianId: 'clinician123', time: yesterday }],
      },
    });

    expect(screen.getByText('Today')).toBeInTheDocument();
    await waitFor(() => expect(fetchPatients).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(await screen.findByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Reviewed' })).toBeInTheDocument();

    await waitFor(() => expect(fetchPatients).toHaveBeenCalledTimes(2)); // Refetch should have triggered
  }, TEST_TIMEOUT_MS);
});
