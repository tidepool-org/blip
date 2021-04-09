/**
 * Copyright (c) 2021, Diabeloop
 * Add a patient for an HCP - Dialog
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

import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import NativeSelect from "@material-ui/core/NativeSelect";
import TextField from "@material-ui/core/TextField";

import { REGEX_EMAIL } from "../../../lib/utils";
import DiabeloopUrl from "../../../lib/diabeloop-url";
import { makeButtonsStyles } from "../../../components/theme";
import { AddPatientDialogContentProps } from "../types";

export interface AddDialogProps {
  actions: AddPatientDialogContentProps | null;
}

const makeButtonsClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-add-patient-buttons" });
const dialogStyles = makeStyles(
  (theme: Theme) => {
    return {
      dialog: {
        display: "flex",
        flexDirection: "column",
        width: "25rem",
      },
      textFieldEmail: {
        flexGrow: 1,
        marginBottom: theme.spacing(2),
      },
      formControlSelectTeam: {
        flexGrow: 1,
        marginBottom: theme.spacing(2),
      },
      buttonCancel: {
        marginRight: theme.spacing(2),
      },
    };
  },
  { name: "ylp-hcp-add-patient-dialog" }
);

function AddDialog(props: AddDialogProps): JSX.Element {
  const buttonsClasses = makeButtonsClasses();
  const classes = dialogStyles();
  const { t, i18n } = useTranslation("yourloops");
  const [email, setEmail] = React.useState<string>("");
  const [teamId, setTeamId] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isValidEmail = (mail = email): boolean => mail.length > 0 && REGEX_EMAIL.test(mail);
  const resetDialog = () => {
    setTimeout(() => {
      setEmail("");
      setTeamId("");
      setErrorMessage(null);
    }, 100);
  };
  const handleClose = () => {
    props.actions?.onDialogResult(null);
    resetDialog();
  };
  const handleClickAdd = () => {
    if (isValidEmail() && teamId.length > 0) {
      props.actions?.onDialogResult({ email, teamId });
      resetDialog();
    } else {
      setErrorMessage(t("invalid-email"));
    }
  };
  const handleVerifyEmail = () => {
    if (email.length > 0 && !isValidEmail()) {
      setErrorMessage(t("invalid-email"));
    }
  };
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = event.target.value.trim();
    if (errorMessage !== null && isValidEmail(inputEmail)) {
      setErrorMessage(null);
    }
    setEmail(inputEmail);
  };
  const handleChangeTeam = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>): void => {
    setTeamId(e.target.value as string);
  };

  const dialogIsOpen = props.actions !== null;
  const buttonAddDisabled = errorMessage !== null || !isValidEmail() || teamId.length < 1;
  const optionsTeamsElements: JSX.Element[] = [
    <option id="patient-list-dialog-add-team-option-none" aria-label={t("aria-none")} value="" key="none" />,
  ];
  const teams = props.actions?.teams ?? [];
  for (const team of teams) {
    optionsTeamsElements.push(
      <option id={`patient-list-dialog-add-team-option-${team.id}`} value={team.id} key={team.id} aria-label={team.name}>
        {team.name}
      </option>
    );
  }

  const termsOfUse = t("terms-and-conditions");
  const linkTerms = (
    <Link id="patient-list-dialog-add-warning-link" aria-label={termsOfUse} href={DiabeloopUrl.getTermsUrL(i18n.language)} target="_blank" rel="noreferrer">
      {termsOfUse}
    </Link>
  );
  return (
    <Dialog id="patient-list-dialog-add" aria-labelledby={t("add-patient")} open={dialogIsOpen} onClose={handleClose}>
      <DialogTitle id="patient-list-dialog-add-title">
        <strong>{t("modal-add-patient")}</strong>
      </DialogTitle>

      <DialogContent className={classes.dialog}>
        <TextField
          id="patient-list-dialog-add-email"
          className={classes.textFieldEmail}
          margin="normal"
          label={t("email")}
          variant="outlined"
          value={email}
          required
          error={errorMessage !== null}
          onBlur={handleVerifyEmail}
          onChange={handleChangeEmail}
          helperText={errorMessage}
        />
        <FormControl className={classes.formControlSelectTeam}>
          <InputLabel id="patient-list-dialog-add-team-label" htmlFor="patient-list-dialog-add-team-input">
            {t("team")}
          </InputLabel>
          <NativeSelect
            value={teamId}
            onChange={handleChangeTeam}
            inputProps={{
              name: "teamid",
              id: "patient-list-dialog-add-team-input",
            }}>
            {optionsTeamsElements}
          </NativeSelect>
        </FormControl>
        <Trans
          id="patient-list-dialog-add-warning"
          i18nKey="modal-add-patient-warning"
          t={t}
          components={{ linkTerms }}
          values={{ termsOfUse }}
          parent={DialogContentText}>
          By inviting a patient, you recognize that you have the right to do so per our {linkTerms}
        </Trans>
      </DialogContent>

      <DialogActions style={{ marginBottom: "0.5em", marginRight: " 0.5em" }}>
        <Button
          id="patient-list-dialog-add-button-cancel"
          onClick={handleClose}
          className={`${classes.buttonCancel} ${buttonsClasses.buttonCancel}`}
          color="secondary"
          variant="contained">
          {t("common-cancel")}
        </Button>
        <Button
          id="patient-list-dialog-add-button-add"
          onClick={handleClickAdd}
          disabled={buttonAddDisabled}
          className={buttonsClasses.buttonOk}
          variant="contained"
          color="primary">
          {t("button-invite")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddDialog;
