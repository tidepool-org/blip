import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
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
/* global afterEach */

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
    let createBlobSpy;
    let createElementStub;
    let createObjectURLStub;

    afterEach(() => {
      if (createElementStub) {
        createElementStub.restore();
        createElementStub = null;
      }
      if (createObjectURLStub) {
        createObjectURLStub.restore();
        createObjectURLStub = null;
      }
      if (createBlobSpy) {
        createBlobSpy.restore();
        createBlobSpy = null;
      }
    });

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
        [
          '"CPT99445 True"',
          '"05/15/1990"',
          '"994451"',
          '10',
          'FALSE',
        ],
        [
          '"CPT99445 False Low"',
          '"08/20/1985"',
          '"994452"',
          '1',
          'FALSE',
        ],
        [
          '"CPT99445 False High"',
          '"12/01/1992"',
          '"994453"',
          '16',
          'TRUE',
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'RPM Report (01-01-2024 - 01-31-2024).csv';

      createBlobSpy = sinon.spy(window, 'Blob');

      createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportRpmReport(rpmReportPatients);
      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;
    });

    it('should include CPT-99445 column for reports starting on or after 1/1/2026', () => {
      const rpmReportPatients2026 = {
        ...mockRpmReportPatients,
        config: {
          ...mockRpmReportPatients.config,
          rawConfig: {
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            timezone: 'US/Eastern',
          },
        },
      };

      const expectedCsvRows = [
        [
          'Name',
          'Date of Birth',
          'MRN',
          '# Days With Qualifying Data between 01/01/2026 and 01/31/2026',
          'Sufficient Data for CPT-99454',
          'Sufficient Data for CPT-99445',
        ],
        [
          '"Jill Jellyfish"',
          '"01/01/2000"',
          '"123456"',
          '17',
          'TRUE',
          'FALSE', // 17 days > 15, so FALSE for CPT-99445
        ],
        [
          '"James Flounder"',
          '"03/01/1988"',
          '"423234"',
          '0',
          'FALSE',
          'FALSE', // 0 days < 2, so FALSE for CPT-99445
        ],
        [
          '"Jonathan Seabass"',
          '"04/12/1993"',
          '"994249"',
          '16',
          'TRUE',
          'FALSE', // 16 days > 15, so FALSE for CPT-99445
        ],
        [
          '"Timithon Saltflat"',
          '"11/11/1977"',
          '"994423"',
          '29',
          'TRUE',
          'FALSE', // 29 days > 15, so FALSE for CPT-99445
        ],
        [
          '"Jimithon Nodata"',
          'N/A',
          'N/A',
          '0',
          'FALSE',
          'FALSE', // 0 days < 2, so FALSE for CPT-99445
        ],
        [
          '"Flotsam N. Jetsam"',
          '"02/29/2000"',
          '"994234"',
          '30',
          'TRUE',
          'FALSE', // 30 days > 15, so FALSE for CPT-99445
        ],
        [
          '"CPT99445 True"',
          '"05/15/1990"',
          '"994451"',
          '10',
          'FALSE',
          'TRUE', // 10 days is 2-15, so TRUE for CPT-99445
        ],
        [
          '"CPT99445 False Low"',
          '"08/20/1985"',
          '"994452"',
          '1',
          'FALSE',
          'FALSE', // 1 day < 2, so FALSE for CPT-99445
        ],
        [
          '"CPT99445 False High"',
          '"12/01/1992"',
          '"994453"',
          '16',
          'TRUE',
          'FALSE', // 16 days > 15, so FALSE for CPT-99445
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'RPM Report (01-01-2026 - 01-31-2026).csv';

      createBlobSpy = sinon.spy(window, 'Blob');

      createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportRpmReport(rpmReportPatients2026);
      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;
    });

    it('should NOT include CPT-99445 column for reports before 1/1/2026', () => {
      const rpmReportPatients2025 = {
        ...mockRpmReportPatients,
        config: {
          ...mockRpmReportPatients.config,
          rawConfig: {
            startDate: '2025-12-01',
            endDate: '2025-12-31',
            timezone: 'US/Eastern',
          },
        },
      };

      const expectedCsvRows = [
        [
          'Name',
          'Date of Birth',
          'MRN',
          '# Days With Qualifying Data between 12/01/2025 and 12/31/2025',
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
        [
          '"CPT99445 True"',
          '"05/15/1990"',
          '"994451"',
          '10',
          'FALSE',
        ],
        [
          '"CPT99445 False Low"',
          '"08/20/1985"',
          '"994452"',
          '1',
          'FALSE',
        ],
        [
          '"CPT99445 False High"',
          '"12/01/1992"',
          '"994453"',
          '16',
          'TRUE',
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'RPM Report (12-01-2025 - 12-31-2025).csv';

      createBlobSpy = sinon.spy(window, 'Blob');

      createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportRpmReport(rpmReportPatients2025);
      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;
    });

    it('should correctly calculate CPT-99445 eligibility for edge cases', () => {
      const edgeCaseReport = {
        config: {
          code: 'CPT-99454',
          rawConfig: {
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            timezone: 'US/Eastern',
          },
        },
        results: [
          { 'fullName': 'Exactly 2 Days', 'birthDate': '2000-01-01', 'mrn': 'EDGE001', 'realtimeDays': 2, 'hasSufficientData': false },
          { 'fullName': 'Exactly 15 Days', 'birthDate': '2000-01-01', 'mrn': 'EDGE002', 'realtimeDays': 15, 'hasSufficientData': false },
          { 'fullName': 'Exactly 1 Day', 'birthDate': '2000-01-01', 'mrn': 'EDGE003', 'realtimeDays': 1, 'hasSufficientData': false },
          { 'fullName': 'Exactly 16 Days', 'birthDate': '2000-01-01', 'mrn': 'EDGE004', 'realtimeDays': 16, 'hasSufficientData': true },
        ],
      };

      const expectedCsvRows = [
        [
          'Name',
          'Date of Birth',
          'MRN',
          '# Days With Qualifying Data between 01/01/2026 and 01/31/2026',
          'Sufficient Data for CPT-99454',
          'Sufficient Data for CPT-99445',
        ],
        [
          '"Exactly 2 Days"',
          '"01/01/2000"',
          '"EDGE001"',
          '2',
          'FALSE',
          'TRUE', // 2 days >= 2 && <= 15, so TRUE for CPT-99445
        ],
        [
          '"Exactly 15 Days"',
          '"01/01/2000"',
          '"EDGE002"',
          '15',
          'FALSE',
          'TRUE', // 15 days >= 2 && <= 15, so TRUE for CPT-99445
        ],
        [
          '"Exactly 1 Day"',
          '"01/01/2000"',
          '"EDGE003"',
          '1',
          'FALSE',
          'FALSE', // 1 day < 2, so FALSE for CPT-99445
        ],
        [
          '"Exactly 16 Days"',
          '"01/01/2000"',
          '"EDGE004"',
          '16',
          'TRUE',
          'FALSE', // 16 days > 15, so FALSE for CPT-99445
        ],
      ];

      const expectedCsv = expectedCsvRows.map((row) => row.join(',')).join('\n');
      const expectedBlob = new Blob([expectedCsv], { type: 'text/csv;charset=utf-8;' });
      const expectedUrl = 'mock-url';
      const expectedDownloadFileName = 'RPM Report (01-01-2026 - 01-31-2026).csv';

      createBlobSpy = sinon.spy(window, 'Blob');

      createElementStub = sinon.stub(document, 'createElement').returns({
        href: '',
        download: '',
        click: sinon.stub(),
      });
      createObjectURLStub = sinon.stub(URL, 'createObjectURL').returns(expectedUrl);

      exportRpmReport(edgeCaseReport);
      expect(createBlobSpy.calledOnceWithExactly([expectedCsv], { type: 'text/csv;charset=utf-8;' })).to.be.true;
      expect(createElementStub.calledOnceWithExactly('a')).to.be.true;
      expect(createObjectURLStub.calledOnceWithExactly(expectedBlob)).to.be.true;
      expect(createElementStub.returnValues[0].href).to.equal(expectedUrl);
      expect(createElementStub.returnValues[0].download).to.equal(expectedDownloadFileName);
      expect(createElementStub.returnValues[0].click.calledOnce).to.be.true;
    });
  });
});
