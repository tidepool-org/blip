import { getfetchedPatientDataRange as selector } from '../../../../app/redux/selectors';

/* global describe */
/* global it */
/* global expect */

describe('getfetchedPatientDataRange', () => {
  it('should retrieve the fetched patient diabetes data range and associated meta', () => {
    const patientId = 1234;

    const state = {
      blip: {
        patientDataMap: {
          [patientId]: [
            {
              time: '2018-02-10T00:00:00.000Z',
              type: 'basal',
            },
            {
              time: '2018-02-08T00:00:00.000Z',
              type: 'basal',
            },
            {
              time: '2018-02-01T00:00:00.000Z',
              type: 'basal',
            },
            {
              time: '2018-01-20T00:00:00.000Z',
              type: 'deviceEvent',
            },
          ],
          [`${patientId}_fetchedUntil`]: '2018-01-01T00:00:00.000Z',
        },
      },
    };

    const props = {
      routeParams: { id: patientId },
    };

    const result = selector(state, props);

    expect(result).to.eql({
      start: '2018-02-01T00:00:00.000Z',
      end: '2018-02-10T00:00:00.000Z',
      spanInDays: 9,
      count: 3,
      fetchedUntil: '2018-01-01T00:00:00.000Z'
    });
  });
});
