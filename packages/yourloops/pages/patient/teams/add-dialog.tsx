/**
 * Copyright (c) 2021, Diabeloop
 * Team dialog to add a team
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

import _ from "lodash";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { makeStyles, Theme } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";

import { useTeam, Team } from "../../../lib/team";
import diabeloopUrl from "../../../lib/diabeloop-url";
import { makeButtonsStyles } from "../../../components/theme";
import { AddTeamDialogContentProps } from "./types";

export interface AddTeamDialogProps {
  actions: null | AddTeamDialogContentProps;
}

export interface EnterIdentificationCodeProps {
  handleClose: () => void;
  handleSetIdCode: (code: string) => void;
}

export interface ConfirmTeamProps {
  team: Team;
  handleClose: () => void;
  handleAccept: () => void;
}

export interface DisplayErrorMessageProps {
  message: string;
  handleClose: () => void;
}

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "YlpLeaveTeamDialogButtons" });
const leaveTeamDialogClasses = makeStyles(
  (theme: Theme) => {
    return {
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "YlpLeaveTeamDialog" }
);

function DisplayErrorMessage(props: DisplayErrorMessageProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const buttonClasses = makeButtonsClasses();

  return (
    <React.Fragment>
      <DialogTitle id="team-add-dialog-error-title">
        <strong>{t("modal-add-medical-team")}</strong>
      </DialogTitle>

      <DialogContent>
        <strong>{t("modal-patient-add-team-failure")}</strong>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          className={buttonClasses.buttonOk}
          id="team-add-dialog-error-button-ok"
          onClick={props.handleClose}
          color="primary"
          variant="contained">
          {t("common-ok")}
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

export function EnterIdentificationCode(props: EnterIdentificationCodeProps): JSX.Element {
  const MAX_CODE_LEN = 9;
  const SEP_POS = [2, 5]; // eslint-disable-line no-magic-numbers
  const { t } = useTranslation("yourloops");
  const dialogClasses = leaveTeamDialogClasses();
  const buttonClasses = makeButtonsClasses();
  const [idCode, setIdCode] = React.useState("");
  const reIdCode = /^[0-9]{3} - [0-9]{3} - [0-9]{3}$/;

  const getNumericCode = (value: string): string => {
    let numericCode = "";
    for (let i = 0; i < value.length; i++) {
      if (value[i].match(/^[0-9]$/)) {
        numericCode += value[i];
      }
    }
    return numericCode;
  };

  const handleChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericCode = getNumericCode(event.target.value);
    let displayCode = "";
    const codeLen = Math.min(numericCode.length, MAX_CODE_LEN);
    for (let i = 0 | 0; i < codeLen; i++) {
      displayCode += numericCode[i];
      if (SEP_POS.includes(i) && i + 1 < codeLen) {
        displayCode += " - ";
      }
    }
    setIdCode(displayCode);
  };

  const handleClickJoinTeam = () => {
    props.handleSetIdCode(getNumericCode(idCode));
  };

  const buttonJoinDisabled = idCode.match(reIdCode) === null;

  return (
    <React.Fragment>
      <DialogTitle id="team-add-dialog-title">
        <strong>{t("modal-add-medical-team")}</strong>
      </DialogTitle>

      <DialogContent>
        <InputLabel color="primary" id="team-add-dialog-label-code" htmlFor="team-add-dialog-field-code">
          {t("modal-add-medical-team-code")}
        </InputLabel>
        <TextField id="team-add-dialog-field-code" value={idCode} onChange={handleChangeCode} />
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="team-add-dialog-button-cancel"
          onClick={props.handleClose}
          className={`${dialogClasses.buttonCancel} ${buttonClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button
          id="team-add-dialog-button-add-team"
          onClick={handleClickJoinTeam}
          disabled={buttonJoinDisabled}
          className={buttonClasses.buttonOk}
          variant="contained">
          {t("button-add-team")}
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

export function ConfirmTeam(props: ConfirmTeamProps): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const dialogClasses = leaveTeamDialogClasses();
  const buttonClasses = makeButtonsClasses();

  const { address } = props.team;
  let teamAddress: JSX.Element | null = null;
  if (typeof address === "object") {
    teamAddress = (
      <React.Fragment>
        {address.line1}
        <br />
        {address.line2 ?? ""}
        {_.isEmpty(address.line2) ? null : <br />}
        {address.zip} {address.city}
        <br />
      </React.Fragment>
    );
  }

  const privacyPolicy = t("footer-link-url-privacy-policy");
  const linkPrivacyPolicy = (
    <Link aria-label={privacyPolicy} href={diabeloopUrl.getPrivacyPolicyUrL(i18n.language)} target="_blank" rel="noreferrer">
      {privacyPolicy}
    </Link>
  );

  return (
    <React.Fragment>
      <DialogTitle id="team-add-dialog-confirm-title">
        <strong>{t("modal-patient-share-team-title")}</strong>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="team-add-dialog-confirm-info" color="textPrimary">
          {t("modal-patient-add-team-info")}
        </DialogContentText>
        <DialogContentText id="team-add-dialog-confirm-team-infos" color="textPrimary">
          {props.team.name}
          <br />
          {teamAddress}
          {props.team.code}
        </DialogContentText>

        <DialogContentText id="team-add-dialog-confirm-team-warning" color="textPrimary">
          <strong>{t("modal-patient-team-warning")}</strong>
        </DialogContentText>

        <DialogContentText id="team-add-dialog-confirm-team-privacy" color="textPrimary">
          {t("modal-patient-share-team-privacy")}
        </DialogContentText>

        <DialogContentText id="team-add-dialog-config-team-privacy-read-link" color="textPrimary">
          <Trans
            i18nKey="modal-patient-team-privacy-2"
            t={t}
            components={{ linkPrivacyPolicy }}
            values={{ privacyPolicy }}
            parent={React.Fragment}>
            Read our {linkPrivacyPolicy} for more information.
          </Trans>
        </DialogContentText>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="team-add-dialog-confirm-team-button-cancel"
          onClick={props.handleClose}
          className={`${dialogClasses.buttonCancel} ${buttonClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button
          id="team-add-dialog-confirm-team-button-add-team"
          onClick={props.handleAccept}
          className={buttonClasses.buttonOk}
          variant="contained">
          {t("button-add-medical-team")}
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

function AddTeamDialog(props: AddTeamDialogProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const teamHook = useTeam();
  const [idCode, setIdCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<boolean>(false);
  const [team, setTeam] = React.useState<Team | null>(null);

  const { actions } = props;
  const dialogIsOpen = actions !== null;

  const resetDialog = () => {
    setTimeout(() => {
      setIdCode("");
      setTeam(null);
      setErrorMessage(false);
    }, 100);
  };

  const handleClose = () => {
    actions?.onDialogResult(null);
    resetDialog();
  };

  const handleAccept = () => {
    actions?.onDialogResult(team?.id ?? null);
    resetDialog();
  };

  let content: JSX.Element;
  if (idCode === "") {
    content = <EnterIdentificationCode handleClose={handleClose} handleSetIdCode={setIdCode} />;
  } else if (errorMessage) {
    content = <DisplayErrorMessage handleClose={handleClose} message={t("modal-patient-add-team-failure")} />;
  } else if (team === null) {
    content = (
      <DialogContent>
        <CircularProgress id="team-add-dialog-loading-progress" disableShrink />
      </DialogContent>
    );
    teamHook
      .getTeamFromCode(idCode)
      .then((team) => {
        if (team === null) {
          setErrorMessage(true);
        } else {
          setTeam(team);
        }
      })
      .catch((reason: unknown) => {
        console.error(reason);
        setErrorMessage(true);
      });
  } else {
    content = <ConfirmTeam team={team} handleClose={handleClose} handleAccept={handleAccept} />;
  }

  return (
    <Dialog id="team-add-dialog" open={dialogIsOpen} aria-labelledby={t("modal-add-medical-team")} onClose={handleClose}>
      {content}
    </Dialog>
  );
}

export default AddTeamDialog;
