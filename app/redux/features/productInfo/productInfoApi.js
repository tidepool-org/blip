import config from '../../../config';
import { RTKQueryApi } from '../../api/baseApi';

const productInfoApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductInfo: builder.query({
      // The API caps clientVersion at 12 characters; prerelease builds such as
      // 1.101.1-web-4722-merged-clinic-share-codes.1 send only major.minor.patch
      query: () => ({ url: 'udi', method: 'POST', body: { clientVersion: config.VERSION.split(/[-+]/)[0] } }),
      // Reopening the dialog is the retry
      extraOptions: { maxRetries: 0 },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetProductInfoQuery } = productInfoApi;
