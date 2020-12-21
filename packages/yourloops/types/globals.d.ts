/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { AppConfig } from "../lib/config";

declare global {
  // var window: Window & typeof globalThis & ExtendedWindow;
  interface Window {
    _jipt: any;
    _paq: any[];
    zE: (...args: any) => void;
    config?: AppConfig;
  }
  const BUILD_CONFIG: string;
}
