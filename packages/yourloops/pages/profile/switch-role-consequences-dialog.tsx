/**
 * Copyright (c) 2020, Diabeloop
 * Switch role from caregiver to HCP dialog
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import * as React from "react";
import { useTranslation } from "react-i18next";

import { Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { makeButtonsStyles } from "../../components/theme";
import { SwitchRoleDialogProps } from "./models";

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-switch-role-consequences-buttons" });
const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialog: {
        display: "flex",
        flexDirection: "column",
        width: theme.breakpoints.width("sm"),
      },
      switchList: {
        marginTop: 0,
        marginBottom: 0,
      },
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "ylp-dialog-switch-role-consequences" }
);

function SwitchRoleConsequencesDialog(props: SwitchRoleDialogProps): JSX.Element {
  const { open, onResult } = props;
  const buttonsClasses = makeButtonsClasses();
  const classes = dialogStyles();
  const { t } = useTranslation("yourloops");

  const handleClose = () => onResult(false);
  const handleAccept = () => onResult(true);

  return (
    <Dialog id="switch-role-consequences-dialog" open={open} onClose={handleClose}>
      <DialogTitle id="switch-role-consequences-dialog-title">
        <strong>{t("modal-switch-hcp-title")}</strong>
      </DialogTitle>

      <DialogContent id="switch-role-consequences-dialog-content" className={classes.dialog}>
        <DialogContentText id="modal-switch-hcp-info-1">{t("modal-switch-hcp-info")}</DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-2">
          <strong>{t("modal-switch-hcp-info-2")}</strong>
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-list-3" component={'div'}>
          <span id="modal-switch-hcp-info-3">{t("modal-switch-hcp-info-3")}</span>
          <ul className={classes.switchList}>
            <li id="modal-switch-hcp-list-1">{t("modal-switch-hcp-list-1")}</li>
            <li id="modal-switch-hcp-list-2">{t("modal-switch-hcp-list-2")}</li>
            <li id="modal-switch-hcp-list-3">{t("modal-switch-hcp-list-3")}</li>
          </ul>
        </DialogContentText>
        <DialogContentText id="modal-switch-hcp-info-4">{t("modal-switch-hcp-info-4")}</DialogContentText>
      </DialogContent>

      <DialogActions id="switch-role-consequences-dialog-actions" style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="switch-role-consequences-dialog-button-cancel"
          onClick={handleClose}
          className={`${classes.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button id="switch-role-consequences-dialog-button-ok" onClick={handleAccept} className={buttonsClasses.buttonOk} variant="contained">
          {t("modal-switch-hcp-action")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchRoleConsequencesDialog;
