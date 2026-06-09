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

  const url = 'blob:tidepool.test/abcd-1234-efgh-7689';

  beforeEach(() => {
    setToast = jest.fn();
    useToasts.mockReturnValue({ set: setToast });

    mockWindow = {
      document: { write: jest.fn() },
      location: { href: '' },
      closed: false,
      close: jest.fn(),
    };

    openStub = jest.spyOn(window, 'open').mockReturnValue(mockWindow);
  });

  afterEach(() => {
    openStub.mockRestore();
    jest.clearAllMocks();
  });

  describe('openPrintWindow', () => {
    it('opens a new window and writes the waiting message', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });

      expect(window.open).toHaveBeenCalledTimes(1);
      expect(window.open).toHaveBeenCalledWith();
      expect(mockWindow.document.write).toHaveBeenCalledWith(
        expect.stringContaining('Please wait while Tidepool generates your PDF report.')
      );
    });

    it('does not open a second window if one is already open', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => {
        result.current.openPrintWindow();
        result.current.openPrintWindow();
      });

      expect(window.open).toHaveBeenCalledTimes(1);
    });

    it('opens a new window if the existing window has been closed', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });
      mockWindow.closed = true;

      act(() => { result.current.openPrintWindow(); });

      expect(window.open).toHaveBeenCalledTimes(2);
    });
  });

  describe('openPDF', () => {
    it('reuses an existing open window by setting its location href', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });
      act(() => { result.current.openPDF(url); });

      expect(window.open).toHaveBeenCalledTimes(1);
      expect(mockWindow.location.href).toBe(url);
    });

    it('opens a new window with the pdf url when no window is currently open', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPDF(url); });

      expect(window.open).toHaveBeenCalledWith(url);
    });

    it('does nothing when no url is provided', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPDF(); });

      expect(window.open).not.toHaveBeenCalled();
      expect(setToast).not.toHaveBeenCalled();
    });

    it('does not focus or print the window', () => {
      mockWindow.focus = jest.fn();
      mockWindow.print = jest.fn();
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });
      act(() => { result.current.openPDF(url); });

      expect(mockWindow.focus).not.toHaveBeenCalled();
      expect(mockWindow.print).not.toHaveBeenCalled();
    });

    it('shows a warning toast with a retry action when the window is blocked by a popup blocker', () => {
      openStub.mockReturnValue(null);
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPDF(url); });

      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A popup blocker is preventing your report from opening.',
        })
      );
    });
  });

  describe('closePrintWindow', () => {
    it('closes the open window', () => {
      const { result } = renderHook(() => usePrintWindow());

      act(() => { result.current.openPrintWindow(); });
      act(() => { result.current.closePrintWindow(); });

      expect(mockWindow.close).toHaveBeenCalledTimes(1);
    });

    it('does not throw when there is no open window', () => {
      const { result } = renderHook(() => usePrintWindow());

      expect(() => {
        act(() => { result.current.closePrintWindow(); });
      }).not.toThrow();
    });
  });
});
