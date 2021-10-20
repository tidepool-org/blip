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

export interface ApiAlert {
  message: string;
  severity: AlertSeverity;
  id?: string;
  action?: JSX.Element | null;
}

export interface SnackbarContext {
  /** Add a new snackbar alert, return the alert id */
  error: (message: string, action?: JSX.Element | null, replace?: boolean, id?: string) => string;
  warning: (message: string, action?: JSX.Element | null, replace?: boolean, id?: string) => string;
  info: (message: string, action?: JSX.Element | null, replace?: boolean, id?: string) => string;
  success: (message: string, action?: JSX.Element | null, replace?: boolean, id?: string) => string;
  /** Remove an alert with it's id */
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  alerts: Readonly<ApiAlert[]>;
}

export interface SnackbarProvider {
  children: React.ReactNode;
  context: () => SnackbarContext;
}

const log = bows("Snackbar");
export function DefaultSnackbarContext(): SnackbarContext {
  const [alerts, setAlerts] = React.useState<ApiAlert[]>([]);

  const addAlert = (severity: AlertSeverity, message: string, action?: JSX.Element | null, replace?: boolean, id?: string): string => {
    const alert = { severity, message, id: id ?? _.uniqueId(), action };
    if (replace) {
      setAlerts([alert]);
    } else {
      const a = Array.from(alerts);
      a.push(alert);
      setAlerts(a);
    }
    log.debug("addAlert", alert);
    return alert.id;
  };
  const error = (message: string, action?: JSX.Element | null, replace?: boolean, id?: string): string => {
    return addAlert(AlertSeverity.error, message, action, replace, id);
  };
  const warning = (message: string, action?: JSX.Element | null, replace?: boolean, id?: string): string => {
    return addAlert(AlertSeverity.warning, message, action, replace, id);
  };
  const info = (message: string, action?: JSX.Element | null, replace?: boolean, id?: string): string => {
    return addAlert(AlertSeverity.info, message, action, replace, id);
  };
  const success = (message: string, action?: JSX.Element | null, replace?: boolean, id?: string): string => {
    return addAlert(AlertSeverity.success, message, action, replace, id);
  };
  const removeAlert = (id: string): void => {
    log.debug("removeAlert", id);
    setAlerts(alerts.filter((a) => a.id !== id));
  };
  const clearAlerts = (): void => {
    log.debug("clearAlerts", alerts);
    setAlerts([]);
  };

  return { error, warning, info, success, removeAlert, clearAlerts, alerts };
}

function getAlertTimeout(numAlerts: number, haveAction: boolean): number {
  if (numAlerts > 1) {
    return 1000;
  }
  if (haveAction) {
    return 12000; // eslint-disable-line no-magic-numbers
  }
  return 6000; // eslint-disable-line no-magic-numbers
}

export const Snackbar = (props: SnackbarContext): JSX.Element => {
  const { alerts, removeAlert } = props;
  const [currentAlert, onCloseAlert] = React.useMemo(() => {
    if (alerts.length > 0) {
      const currentAlert = alerts[0];
      const onCloseAlert = () => {
        if (typeof currentAlert.id === "string") {
          removeAlert(currentAlert.id);
        }
      };
      return [currentAlert, onCloseAlert];
    }
    return [null, _.noop];
  }, [alerts, removeAlert]);

  const alertUI = React.useMemo(() => {
    if (currentAlert !== null) {
      return (
        <Alert id="alert-message" onClose={onCloseAlert} severity={currentAlert.severity} action={currentAlert.action}>
          {currentAlert.message}
        </Alert>
      );
    }
    return undefined;
  }, [currentAlert, onCloseAlert]);

  return (
    <SnackbarUI open={currentAlert !== null}
      autoHideDuration={getAlertTimeout(alerts.length, Boolean(currentAlert?.action))}
      onClose={onCloseAlert}
      key={currentAlert?.id ?? Number.MAX_SAFE_INTEGER}
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
  clearAlerts: _.noop,
  removeAlert: _.noop,
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
