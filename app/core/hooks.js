import {useCallback, useRef, useEffect, useState} from 'react'
import update from 'immutability-helper'

import { useField, useFormikContext } from 'formik';
import { isPlainObject } from 'lodash';

// c.f. https://gist.github.com/joshsalverda/d808d92f46a7085be062b2cbde978ae6
// Avoids some performance issues in Formik's native <FieldArray />
// Solution stems from this issue on Formik's GH: https://github.com/jaredpalmer/formik/issues/1476
export const useFieldArray = (props, formikContext) => {
  formikContext = formikContext ?? useFormikContext();
  const [field, meta] = useField(props);
  const fieldArray = useRef(field.value);
  const { setFieldValue } = formikContext;

  useEffect(() => {
    fieldArray.current = field.value;
  }, [field.value]);

  const push = useCallback(value => {
    fieldArray.current = update(fieldArray.current, {
      $push: [value],
    });

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  const swap = useCallback((indexA, indexB) => {
    const swapA = fieldArray.current[indexA];
    const swapB = fieldArray.current[indexB];

    fieldArray.current = update(fieldArray.current, {
      $splice: [[indexA, 1, swapB], [indexB, 1, swapA]],
    });

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  const move = useCallback((from, to) => {
    const toMove = fieldArray.current[from];

    fieldArray.current = update(fieldArray.current, {
      $splice: [[from, 1], [to, 0, toMove]],
    });

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  const insert = useCallback((index, value) => {
    fieldArray.current = update(fieldArray.current, {
      $splice: [[index, 0, value]],
    });

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  const unshift = useCallback(value => {
    fieldArray.current = update(fieldArray.current, {
      $unshift: [value],
    })

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  const remove = useCallback(index => {
    const removedItem = fieldArray.current[index];

    fieldArray.current = update(fieldArray.current, {
      $splice: [[index, 1]],
    });

    setFieldValue(field.name, fieldArray.current);
    return removedItem;
  }, [field.name, setFieldValue]);

  const pop = useCallback(() => {
    const lastIndex = fieldArray.current.length - 1;
    const poppedItem = fieldArray.current[lastIndex];

    fieldArray.current = update(fieldArray.current, {
      $splice: [[lastIndex, 1]],
    });

    setFieldValue(field.name, fieldArray.current);
    return poppedItem;
  }, [field.name, setFieldValue]);

  const replace = useCallback((index, value) => {
    fieldArray.current = update(fieldArray.current, {
      $splice: [[index, 1, value]],
    });

    setFieldValue(field.name, fieldArray.current);
  }, [field.name, setFieldValue]);

  return [
    field,
    meta,
    {
      push,
      swap,
      move,
      insert,
      unshift,
      remove,
      pop,
      replace,
    },
  ];
};

// c.f. https://usehooks.com/usePrevious/
export const usePrevious = value => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// c.f. https://usehooks.com/useLocalStorage/
export const useLocalStorage = (key, defaultValue, mergeLocalWithDefault = false) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      let item = window.localStorage.getItem(key);

      // Parse and return stored json
      if (item) {
        item = JSON.parse(item);
        return (mergeLocalWithDefault && isPlainObject(item)) ? { ...defaultValue, ...item } : item;
      }

      // If missing, return defaultValue
      return defaultValue;
    } catch (error) {
      // If error, return defaultValue
      console.log(error);
      return defaultValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export const useInitialFocusedInput = () => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [ref.current]);

  return ref;
};

export const useIsFirstRender = () => {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  return isFirstRenderRef.current;
};
