/* global jest */

// Stubs the RTK Query hook with no data for suites on redux-mock-store (no api middleware)
export const useGetProductInfoQuery = jest.fn(() => ({ data: undefined, isFetching: false, isError: false }));
