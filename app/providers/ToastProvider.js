import React, { useCallback, useMemo } from 'react';
import get from 'lodash/get';

import Toast from '../components/elements/Toast';

const ToastContext = React.createContext();

/* Provider */
export function ToastProvider({ children }) {
  const [toast, setToast] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(get(toast, 'open', !!toast));
  }, [toast]);

  const set = useCallback(toast => setToast(toast), []);
  const clear = useCallback(() => setToast(null), []);
  const value = useMemo(() => ({set,clear}), [clear, set]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast onClose={clear} open={open} {...toast}/>}
    </ToastContext.Provider>
  );
}

/* Consumer */
export const useToasts = () => React.useContext(ToastContext);

export default ToastContext;
