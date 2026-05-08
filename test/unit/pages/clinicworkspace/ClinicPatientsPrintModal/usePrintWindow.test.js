import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import { useToasts } from '../../../../../app/providers/ToastProvider';
import usePrintWindow from '../../../../../app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/usePrintWindow';

jest.mock('../../../../../app/providers/ToastProvider', () => {
  const actual = jest.requireActual('../../../../../app/providers/ToastProvider');
  return {
    ...actual,
    useToasts: jest.fn(),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('usePrintWindow', () => {
  let setToast;
  let openStub;
  let mockWindow;

  beforeEach(() => {
    setToast = jest.fn();
    useToasts.mockReturnValue({ set: setToast });

    mockWindow = {
      document: { write: jest.fn() },
      location: { href: '' },
      closed: false,
      focus: jest.fn(),
      print: jest.fn(),
    };

    openStub = jest.spyOn(window, 'open').mockReturnValue(mockWindow);
    jest.useFakeTimers();
  });

  afterEach(() => {
    openStub.mockRestore();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('openPrintWindow', () => {
    it('opens a new window and writes the waiting message', async () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });

      expect(window.open).toHaveBeenCalledTimes(1);
      expect(window.open).toHaveBeenCalledWith();
      expect(mockWindow.document.write).toHaveBeenCalledWith(
        expect.stringContaining('Please wait while Tidepool generates your PDF report.')
      );
    });

    it('does not open a second window if one is already open', async () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => {
        result.current.openPrintWindow();
        result.current.openPrintWindow();
      });

      expect(window.open).toHaveBeenCalledTimes(1);
    });

    it('opens a new window if the existing window has been closed', async () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });
      mockWindow.closed = true;

      act(() => { result.current.openPrintWindow(); });

      expect(window.open).toHaveBeenCalledTimes(2);
    });
  });

  describe('triggerPrint', () => {
    it('reuses an existing open window by setting its location href', async () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });

      const pdf = { combined: { url: 'blob:tidepool.test/abcd-1234-efgh-7689' } };

      act(() => {
        result.current.triggerPrint(pdf);
        jest.runAllTimers();
      });

      expect(window.open).toHaveBeenCalledTimes(1);
      expect(mockWindow.location.href).toBe(pdf.combined.url);
      expect(mockWindow.focus).toHaveBeenCalled();
      expect(mockWindow.print).toHaveBeenCalled();
    });

    it('opens a new window with the pdf url when no window is currently open', async () => {
      const { result } = renderHook(() => usePrintWindow());

      const pdf = { combined: { url: 'blob:tidepool.test/abcd-1234-efgh-7689' } };

      act(() => {
        result.current.triggerPrint(pdf);
        jest.runAllTimers();
      });

      expect(window.open).toHaveBeenCalledWith(pdf.combined.url);
      expect(mockWindow.focus).toHaveBeenCalled();
      expect(mockWindow.print).toHaveBeenCalled();
    });

    it('shows a warning toast with a retry action when the window is blocked by a popup blocker', async () => {
      openStub.mockReturnValue(null);
      const { result } = renderHook(() => usePrintWindow());

      const pdf = { combined: { url: 'blob:tidepool.test/abcd-1234-efgh-7689' } };

      act(() => {
        result.current.triggerPrint(pdf);
        jest.runAllTimers();
      });

      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A popup blocker is preventing your report from opening.',
        })
      );
    });
  });
});
