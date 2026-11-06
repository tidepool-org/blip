/* global jest */

// Stubs the RTK Query hook for suites on redux-mock-store (no api middleware). Defaults to no
// data; override per-test with useGetProductInfoQuery.mockReturnValue({ data, isLoading, isError }).
export const useGetProductInfoQuery = jest.fn(() => ({ data: undefined, isLoading: false, isError: false }));
