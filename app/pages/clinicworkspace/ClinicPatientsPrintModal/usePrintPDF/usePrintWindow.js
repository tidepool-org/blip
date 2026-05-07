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

  const openPrintWindow = () => {
    if (!printWindowRef.current || printWindowRef.current?.closed) {
      printWindowRef.current = window.open();
      printWindowRef.current.document.write(waitHTML);
    }
  };

  const triggerPrint = (pdf) => {
    if (!pdf?.combined?.url) return;

    if (printWindowRef.current && !printWindowRef.current?.closed) {
      // If we already have a ref to a PDF window, (re)use it
      printWindowRef.current.location.href = pdf.combined.url;
    } else {
      // Otherwise, we create and open a new PDF window ref.
      printWindowRef.current = window.open(pdf.combined.url);
    }

    setTimeout(() => {
      if (printWindowRef.current) {
        printWindowRef.current.focus();
        printWindowRef.current.print();
      } else {
        if (!pdf?.combined?.url) return;

        setToast({
          message: t('A popup blocker is preventing your report from opening.'),
          variant: 'warning',
          autoHideDuration: null,
          action: (
            <Button
              p={0}
              sx= {{ lineHeight: 1.5, fontSize: 1 }}
              variant="textPrimary"
              onClick={() => {
                const printWindow = window.open(pdf.combined.url);

                if (!printWindow) return;

                printWindowRef.current = printWindow;
                printWindowRef.current.focus();
                printWindowRef.current.print();
                setToast(null);
              }}
            >
              {t('Open it anyway')}
            </Button>
          ),
        });
      }
    });
  };

  return { openPrintWindow, triggerPrint };
};

export default usePrintWindow;
