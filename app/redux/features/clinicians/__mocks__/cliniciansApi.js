/* global jest */

// Stubs the RTK Query hook for suites on redux-mock-store (no api middleware). Defaults to no
// data; override per-test with useGetCliniciansForClinicQuery.mockReturnValue({ data }).
export const useGetCliniciansForClinicQuery = jest.fn(() => ({ data: undefined }));
