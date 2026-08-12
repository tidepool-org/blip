/* global jest */

// Stubs the RTK Query hook for suites on redux-mock-store (no api middleware). Defaults to no
// data; override per-test with useGetMfaStatusQuery.mockReturnValue({ data }).
export const useGetMfaStatusQuery = jest.fn(() => ({ data: undefined }));
