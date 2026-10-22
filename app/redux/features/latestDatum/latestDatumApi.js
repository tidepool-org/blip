import moment from 'moment';
import maxBy from 'lodash/maxBy';
import config from '../../../config';
import { RTKQueryApi } from '../../api/baseApi';
import { DIABETES_DATA_TYPES } from '../../../core/constants';

const LATEST_DATUM_TYPES = [...DIABETES_DATA_TYPES, 'pumpSettings', 'upload'];

const latestDatumApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getLatestDatumTimeByUpload: builder.query({
      // Patient data reads use the unversioned /data/:userId route, outside the /v1/ base path
      query: ({ patientId, uploadId }) => ({
        url: `${config.API_HOST}/data/${patientId}`,
        params: { uploadId, type: LATEST_DATUM_TYPES.join(','), latest: 1 },
        // A 404 means the upload has no matching data
        validateStatus: ({ ok, status }) => ok || status === 404,
        responseHandler: 'content-type',
      }),
      transformResponse: (datums) => {
        if (!Array.isArray(datums)) return null;
        const time = maxBy(datums, 'time')?.time;
        return time ? moment(time).valueOf() : null;
      },
    }),
  }),
});

export const { useGetLatestDatumTimeByUploadQuery } = latestDatumApi;
