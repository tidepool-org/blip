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

import React, { useCallback } from "react";

import { Snackbar as SnackbarUI } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import { ApiAlert } from "../../lib/useSnackbar";

interface SnackbarsProps {
  params: {
    apiAlert: ApiAlert;
    removeAlert: (apiAlertId: ApiAlert["id"]) => void;
  };
}

export const Snackbar = ({ params: { apiAlert, removeAlert } }: SnackbarsProps): JSX.Element | null => {
  const onCloseAlert = useCallback(
    (id: ApiAlert["id"]) => (_: React.SyntheticEvent | MouseEvent, reason?: string) => {
      // We don't want the snackbar to be closed by any random click on the page
      if (reason === "clickaway") {
        return;
      }
      removeAlert(id);
    },
    [removeAlert]
  );

  return apiAlert ? (
    <SnackbarUI
      key={apiAlert.id}
      open={apiAlert !== null}
      autoHideDuration={6000}
      onClose={onCloseAlert(apiAlert?.id)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <Alert onClose={onCloseAlert(apiAlert?.id)} severity={apiAlert?.severity}>
        {apiAlert?.message}
      </Alert>
    </SnackbarUI>
  ) : null;
};
