/**
 * Copyright (c) 2021, Diabeloop
 * Switch role from caregiver to HCP dialog
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
import { useTranslation } from "react-i18next";

import { useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { SwitchRoleConsequencesDialogProps } from "./models";

function SwitchRoleConsequencesDialog(props: SwitchRoleConsequencesDialogProps): JSX.Element {
  const { title, open, onAccept, onCancel } = props;
  const { t } = useTranslation("yourloops");
  const theme = useTheme();
  const isXSBreakpoint: boolean = useMediaQuery(theme.breakpoints.only("xs"));

  return (
    <Dialog
      id="switch-role-consequences-dialog"
      maxWidth="sm"
      open={open}
      onClose={onCancel}
      fullScreen={isXSBreakpoint}
    >
      <DialogTitle id="switch-role-consequences-dialog-title">
        <strong>{t(title)}</strong>
      </DialogTitle>

      <DialogContent id="switch-role-consequences-dialog-content">
        <DialogContentText id="modal-switch-hcp-info-1" color="textPrimary">
          {t("modal-switch-hcp-info")}
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-list-3" component={"div"} color="textPrimary">
          <span id="modal-switch-hcp-info-3">{t("modal-switch-hcp-info-3")}</span>
          <ul>
            <li id="modal-switch-hcp-list-1">{t("modal-switch-hcp-list-1")}</li>
            <li id="modal-switch-hcp-list-2">{t("modal-switch-hcp-list-2")}</li>
            <li id="modal-switch-hcp-list-3">{t("modal-switch-hcp-list-3")}</li>
          </ul>
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-4" color="textPrimary">
          {t("modal-switch-hcp-info-4")}
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-5" color="textPrimary">
          {t("modal-switch-hcp-info-5")}
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-2" color="textPrimary">
          <strong>{t("modal-switch-hcp-info-2")}</strong>
        </DialogContentText>
      </DialogContent>

      <DialogActions id="switch-role-consequences-dialog-actions">
        <Button
          id="switch-role-consequences-dialog-button-cancel"
          onClick={onCancel}
        >
          {t("button-cancel")}
        </Button>
        <Button
          id="switch-role-consequences-dialog-button-ok"
          onClick={onAccept}
          variant="contained"
          color="primary"
        >
          {t("modal-switch-hcp-action")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchRoleConsequencesDialog;
