import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import RpmReportConfigForm, { exportRpmReport } from '../../../../app/components/clinic/RpmReportConfigForm';
import mockRpmReportPatients from '../../../fixtures/mockRpmReportPatients.json';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('RpmReportConfigForm', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {},
    onFormChange: sinon.stub(),
    open: true,
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
  });

  after(() => {
    mount.cleanUp();
  });

  const fetchedDataState = {
    blip: {
      allUsersMap: {
        clinicianUserId123: {
          emails: ['clinic@example.com'],
          roles: ['clinic'],
          userid: 'clinicianUserId123',
          username: 'clinic@example.com',
          profile: {
            fullName: 'Example Clinic',
            clinic: {
              role: 'clinic_manager',
            },
          },
        },
      },
      clinics: {
        clinicID456: {
          timezone: 'US/Eastern',
          clinicians: {
            clinicianUserId123: {
              name: 'John Doe',
              email: 'clinic@example.com',
              id: 'clinicianUserId123',
              roles: ['CLINIC_MEMBER'],
              createdTime: '2021-10-05T18:00:00Z',
              updatedTime: '2021-10-05T18:00:00Z',
            },
          },
          patients: {},
          id: 'clinicID456',
          address: '1 Address Ln, City Zip',
          name: 'new_clinic_name',
          email: 'new_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 555-5555',
              type: 'Office',
            },
          ],
        },
      },
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinicID456',
      pendingSentInvites: [],
    },
  };

  let store = mockStore(fetchedDataState);

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    wrapper = mount(
      <Provider store={store}>
        <div id="rpmReportConfigInner">
          <RpmReportConfigForm {...defaultProps} />
        </div>
      </Provider>
    );
  });

  describe('exportRpmReport', () => {
    it('should export an RPM csv report from the provided report data', () => {
      const rpmReportPatients = {
        ...mockRpmReportPatients,
        config: {
          ...mockRpmReportPatients.config,
          clinicId: 'clinicID123',
          rawConfig: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            timezone: 'US/Eastern',
          },
        },
      };

      const expectedCsvRows = [
        [
         'Name',
         'Date of Birth',
         'MRN',
         '# Days With Qualifying Data between 01/01/2024 and 01/31/2024',
         'Sufficient Data for CPT-99454',
        ],
        [
          '"Jill Jellyfish"',
          '"01/01/2000"',
          '"123456"',
          '17',
          'TRUE',
        ],
        [
          '"James Flounder"',
          '"03/01/1988"',
          '"423234"',
          '0',
          'FALSE',
        ],
        [
          '"Jonathan Seabass"',
          '"04/12/1993"',
          '"994249"',
          '16',
          'TRUE',
        ],
        [
          '"Timithon Saltflat"',
          '"11/11/1977"',
          '"994423"',
          '29',
          'TRUE',
        ],
        [
          '"Jimithon Nodata"',
          'N/A',
          'N/A',
          '0',
          'FALSE',
        ],
        [
          '"Flotsam N. Jetsam"',
          '"02/29/2000"',
          '"994234"',
          '30',
          'TRUE',
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'RPM Report (01-01-2024 - 01-31-2024).csv';

      const createBlobSpy = sinon.spy(window, 'Blob');

      const createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      const createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportRpmReport(rpmReportPatients);
      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;

      createElementStub.restore();
      createObjectURLStub.restore();
      createBlobSpy.restore();
    });
  });
});
