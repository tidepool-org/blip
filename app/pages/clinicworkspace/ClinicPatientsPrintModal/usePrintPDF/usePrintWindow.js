import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToasts } from '../../../../providers/ToastProvider';
import Button from '../../../../components/elements/Button';

const usePrintWindow = () => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();

  const printWindowRef = useRef(null);

  const waitMessage = t('Please wait while Tidepool generates your PDF report.');
  const waitHTML = `<p align="center" style="margin-top:20px;font-size:16px;font-family:sans-serif">${waitMessage}</p>`;

  // Open a blank window synchronously within the user's click. Opening it now
  // (rather than after the report has been generated) keeps it tied to the user
  // gesture so pop-up blockers allow it, and shows a wait message in the meantime.
  const openWindow = () => {
    if (!printWindowRef.current || printWindowRef.current?.closed) {
      printWindowRef.current = window.open();
      printWindowRef.current?.document?.write(waitHTML);
    }
  };

  const closeWindow = () => {
    printWindowRef.current?.close();
    printWindowRef.current = null;
  };

  const openPDF = (url) => {
    if (!url) return;

    if (printWindowRef.current && !printWindowRef.current?.closed) {
      // Reuse the window we opened on click, replacing the wait message with the PDF.
      printWindowRef.current.location.href = url;
      return;
    }

    // The window we opened on click was blocked or closed; opening one now happens
    // outside the user gesture, so fall back to a toast the user can click if blocked.
    printWindowRef.current = window.open(url);

    if (!printWindowRef.current) {
      setToast({
        message: t('A popup blocker is preventing your report from opening.'),
        variant: 'warning',
        autoHideDuration: null,
        action: (
          <Button
            p={0}
            sx={{ lineHeight: 1.5, fontSize: 1 }}
            variant="textPrimary"
            onClick={() => {
              const printWindow = window.open(url);

              if (!printWindow) return;

              printWindowRef.current = printWindow;
              setToast(null);
            }}
          >
            {t('Open it anyway')}
          </Button>
        ),
      });
    }
  };

  return { openWindow, closeWindow, openPDF };
};

export default usePrintWindow;
