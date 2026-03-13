// c.f. https://github.com/gaearon/todos/tree/03-persisting-state-to-local-storage
export const loadLocalState = (key = 'blipState') => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveLocalState = (state, key = 'blipState') => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error(err);
  }
};

export const getDeviceIssuesFiltersKey = (userId, clinicId) => {
  return `deviceIssuesFilters/${userId}/${clinicId}`;
};
