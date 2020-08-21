import React from 'react';
import get from 'lodash/get';

import Toast from '../components/elements/Toast';

const ToastContext = React.createContext();

/* Provider */
export function ToastProvider({ children }) {
  const [toast, setToast] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (toast) setOpen(get(toast, 'open', true));
  }, [toast]);

  const set = toast => setToast(toast);
  const clear = () => setToast({ ...toast, open: false });

  return (
    <ToastContext.Provider value={{ set, clear }}>
      {children}
      {toast && <Toast onClose={clear} open={open} {...toast}/>}
    </ToastContext.Provider>
  );
}

/* Consumer */
export const useToasts = () => React.useContext(ToastContext);
