/**
 * Copyright (c) 2021, Diabeloop
 * Snackbar file
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from "react";
import _ from "lodash";
import bows from "bows";

import SnackbarUI from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

export enum AlertSeverity {
  error = "error",
  warning = "warning",
  info = "info",
  success = "success",
}

interface AlertOptions {
  /** Custom action (usually a button) */
  action?: JSX.Element | null;
  /** Replace previous alerts */
  replace?: boolean;
  /** Alter id */
  id?: string;
  /** Infinite timeout: Prevent this alert to automatically disappear */
  infiniteTimeout?: boolean;
  /** Close alert callback */
  onClose?: () => void;
}

export interface ApiAlert {
  message: string;
  severity: AlertSeverity;
  options: AlertOptions;
}

export interface SnackbarContext {
  /** Add a new snackbar alert, return the alert id */
  error: (message: string, options?: AlertOptions) => string;
  warning: (message: string, options?: AlertOptions) => string;
  info: (message: string, options?: AlertOptions) => string;
  success: (message: string, options?: AlertOptions) => string;
  /** Return true if the alert id exists */
  has: (id: string) => boolean;
  /** Remove an alert with it's id */
  remove: (id: string) => void;
  clear: () => void;
  alerts: Readonly<ApiAlert[]>;
}

export interface SnackbarProvider {
  children: React.ReactNode;
  context: () => SnackbarContext;
}

const defaultAlertTimeout = 6000;
const defaultAlertTimeoutWithMoreThanOneAlert = 1000;
const alterTimeoutWithAction = 12000;
const log = bows("Snackbar");

function getAlertTimeout(numAlerts: number, options?: AlertOptions): number | null {
  if (options?.infiniteTimeout) {
    return null;
  }
  if (numAlerts > 1) {
    return defaultAlertTimeoutWithMoreThanOneAlert;
  }
  if (_.isNil(options?.action)) {
    return defaultAlertTimeout;
  }
  return alterTimeoutWithAction;
}

export function DefaultSnackbarContext(): SnackbarContext {
  const [alerts, setAlerts] = React.useState<ApiAlert[]>([]);

  const addAlert = (severity: AlertSeverity, message: string, options?: AlertOptions): string => {
    const opts: AlertOptions = {
      action: options?.action,
      id: options?.id ?? _.uniqueId(),
      replace: options?.replace,
      infiniteTimeout: options?.infiniteTimeout,
      onClose: options?.onClose,
    };
    const alert: ApiAlert = { severity, message, options: opts };
    if (options?.replace) {
      setAlerts([alert]);
    } else {
      const a = Array.from(alerts);
      a.push(alert);
      setAlerts(a);
    }
    log.debug("addAlert", alert);
    return opts.id as string;
  };
  const error = (message: string, options?: AlertOptions): string => {
    return addAlert(AlertSeverity.error, message, options);
  };
  const warning = (message: string, options?: AlertOptions): string => {
    return addAlert(AlertSeverity.warning, message, options);
  };
  const info = (message: string, options?: AlertOptions): string => {
    return addAlert(AlertSeverity.info, message, options);
  };
  const success = (message: string, options?: AlertOptions): string => {
    return addAlert(AlertSeverity.success, message, options);
  };
  const has = (id: string): boolean => {
    return alerts.find((alert) => alert.options.id === id) !== undefined;
  };
  const remove = (id: string): void => {
    log.debug("removeAlert", id);
    setAlerts(alerts.filter((a) => a.options?.id !== id));
  };
  const clear = (): void => {
    log.debug("clearAlerts", alerts);
    setAlerts([]);
  };

  return { error, warning, info, success, remove, clear, has, alerts };
}

export const Snackbar = (props: SnackbarContext): JSX.Element => {
  const { alerts, remove } = props;
  const [currentAlert, onCloseAlert] = React.useMemo(() => {
    if (alerts.length > 0) {
      const currentAlert = alerts[0];
      const onCloseAlert = () => {
        if (typeof currentAlert.options.onClose === "function") {
          currentAlert.options.onClose();
        }
        if (typeof currentAlert.options.id === "string") {
          remove(currentAlert.options.id);
        }
      };
      return [currentAlert, onCloseAlert];
    }
    return [null, _.noop];
  }, [alerts, remove]);

  const alertUI = React.useMemo(() => {
    if (currentAlert !== null) {
      return (
        <Alert id="alert-message" onClose={onCloseAlert} severity={currentAlert.severity} action={currentAlert.options.action}>
          {currentAlert.message}
        </Alert>
      );
    }
    return undefined;
  }, [currentAlert, onCloseAlert]);

  return (
    <SnackbarUI open={currentAlert !== null}
      autoHideDuration={getAlertTimeout(alerts.length, currentAlert?.options)}
      onClose={onCloseAlert}
      key={currentAlert?.options.id ?? Number.MAX_SAFE_INTEGER}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      {alertUI}
    </SnackbarUI>
  );
};

const ReactSnackbarContext = React.createContext<SnackbarContext>({
  error: _.constant(""),
  warning: _.constant(""),
  info: _.constant(""),
  success: _.constant(""),
  has: _.constant(false),
  clear: _.noop,
  remove: _.noop,
  alerts: [],
});

/**
 * Provider component for useAlert().
 *
 * Note: This content is theme dependant.
 * @param props for snackbar provider & children
 */
export function SnackbarContextProvider(props: SnackbarProvider): JSX.Element {
  const { context, children } = props;
  const snackbarContext = context();
  return (
    <ReactSnackbarContext.Provider value={snackbarContext}>
      <Snackbar {...snackbarContext} />
      {children}
    </ReactSnackbarContext.Provider>
  );
}

/**
 * Hook for child components to get the snackbat functionalities
 *
 * Trigger a re-render when it change.
 */
export function useAlert(): SnackbarContext {
  return React.useContext(ReactSnackbarContext);
}
