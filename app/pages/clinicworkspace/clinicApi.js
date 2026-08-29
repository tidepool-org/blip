import { RTKQueryApi } from '../../redux/api/baseApi';

export const tagTypes = {
  CURRENT_CLINIC: 'CURRENT_CLINIC',
};

const { CURRENT_CLINIC } = tagTypes;

RTKQueryApi.enhanceEndpoints({ addTagTypes: [CURRENT_CLINIC] });

const clinicApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getClinic: builder.query({
      query: ({ clinicId }) => {
        return { url: `/clinics/${clinicId}` };
      },
      transformResponse: (response, _meta, arg) => ({
        ...response,
        resolvedClinicId: arg.clinicId,
      }),
      providesTags: [CURRENT_CLINIC],
    }),
    getClinicsForClinician: builder.query({
      query: ({ userId }) => {
        return { url: `/clinicians/${userId}/clinics` };
      },
      providesTags: [CURRENT_CLINIC],
    }),
  }),
});

export const {
  useGetClinicQuery,
  useGetClinicsForClinicianQuery,
} = clinicApi;
