import { RTKQueryApi } from './baseApi';

// Base URL of the standalone export/print service. Hardcoded for local
// development; promote to config (e.g. config.EXPORT_API) once the service is
// reachable through the API gateway.
export const EXPORT_API_HOST = 'http://localhost:9300';

// Inject into the existing RTKQueryApi so we reuse its reducer, middleware, and
// `prepareHeaders` (which attaches the x-tidepool-session-token + trace headers).
// fetchBaseQuery ignores the configured baseUrl when an endpoint returns an
// absolute URL, so this single endpoint can target the export service host
// directly while still inheriting auth.
export const reportApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `${EXPORT_API_HOST}/export/report/${patientId}`,
        method: 'POST',
        body,
        // The service streams the PDF as application/octet-stream; read it as a
        // Blob rather than letting RTK Query attempt to JSON-parse the body.
        responseHandler: (response) => response.blob(),
      }),
      // Report generation is expensive (full data fetch + Viz render). Avoid
      // silently re-running it on transient failures.
      extraOptions: { maxRetries: 0 },
    }),
  }),
  overrideExisting: false,
});

export const { useGenerateReportMutation } = reportApi;
