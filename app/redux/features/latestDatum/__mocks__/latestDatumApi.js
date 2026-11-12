/* global jest */

// Stubs the RTK Query hook for suites on redux-mock-store (no api middleware). Defaults to no
// data; override per-test with useGetLatestDatumTimeByUploadQuery.mockReturnValue({ currentData }).
export const useGetLatestDatumTimeByUploadQuery = jest.fn(() => ({ currentData: undefined }));
