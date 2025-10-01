import React, { useEffect, useState } from 'react';

const DEBOUNCE_DELAY_MS = 200;

const useDebounce = (value) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};

const DateRangeTitle = ({ title = null }) => {
  const debouncedTitle = useDebounce(title);

  return <span>{debouncedTitle}</span>;
};

export default DateRangeTitle;
