// c.f. https://github.com/gaearon/todos/tree/03-persisting-state-to-local-storage
export const loadLocalState = () => {
  try {
    const serializedState = localStorage.getItem('blipState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveLocalState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('blipState', serializedState);
  } catch (err) {
    console.error(err);
  }
};
