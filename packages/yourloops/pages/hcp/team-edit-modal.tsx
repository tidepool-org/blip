/**
 * Copyright (c) 2021, Diabeloop
 * Modal (pop-up) displayed to create or edit a team
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

import { makeStyles, Theme } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Modal from "@material-ui/core/Modal";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import locales from '../../../../locales/languages.json';
import { t } from "../../lib/language";
import { REGEX_EMAIL } from "../../lib/utils";
import { Team } from "../../models/team";
import { useAuth } from "../../lib/auth/hook/use-auth";

interface LocalesCountries {
  [code: string]: {
    name: string;
  };
}

interface TeamEditModalProps {
  action: "edit" | "create";
  team: Partial<Team>;
  modalOpened: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveTeam: (team: Partial<Team>) => Promise<void>;
}

const modalStyles = makeStyles((theme: Theme) => {
  return {
    modal: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    divMain: {
      display: "block",
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      width: theme.breakpoints.width("sm"),
    },
    form: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(2),
      maxHeight: "30em",
      overflowY: "scroll",
    },
    formChild: {
      marginBottom: theme.spacing(2),
    },
    divModalButtons: {
      display: "flex",
      flexDirection: "row",
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(4), // eslint-disable-line no-magic-numbers
    },
    divModalButtonCancel: {
      marginLeft: "auto",
      marginRight: theme.spacing(1),
    },
  };
});

function TeamEditModal(props: TeamEditModalProps): JSX.Element {
  const { action, team, modalOpened, setModalOpen, onSaveTeam } = props;
  const modalBackdropTimeout = 300;

  const classes = modalStyles();
  const auth = useAuth();

  console.info("TeamEditModal", auth.user?.settings?.country);

  const [ teamName, setTeamName ] = React.useState(team.name ?? "");
  const [ teamPhone, setTeamPhone ] = React.useState(team.phone ?? "");
  const [ teamEmail, setTeamEmail ] = React.useState(team.email ?? "");
  const [ addrLine1, setAddrLine1 ] = React.useState(team.address?.line1 ?? "");
  const [ addrLine2, setAddrLine2 ] = React.useState(team.address?.line2 ?? "");
  const [ addrZipCode, setAddrZipCode ] = React.useState(team.address?.zip ?? "");
  const [ addrCity, setAddrCity ] = React.useState(team.address?.city ?? "");
  const [ addrCountry, setAddrCountry ] = React.useState(auth.user?.settings?.country ?? "FR");
  const [ formIsIncomplete, setFormIsIncomplete ] = React.useState(true);

  const ariaModal = action === "create" ? t("aria-modal-team-add") : t("aria-modal-team-edit");
  const modalTitle = action === "create" ? t("modal-team-add-title") : t("modal-team-edit-title");
  const modalButtonValidate = action === "create" ? t("modal-team-button-create") : t("modal-team-button-edit");

  const countries: LocalesCountries = locales.countries;
  const optionsCountries: JSX.Element[] = [];
  for (const entry in countries) {
    if (Object.prototype.hasOwnProperty.call(countries, entry)) {
      const { name } = countries[entry];
      optionsCountries.push(<option value={entry} key={name} aria-label={name}>{name}</option>);
    }
  }
  optionsCountries.sort((a: JSX.Element, b: JSX.Element) => {
    const aName = a.key as string;
    const bName = b.key as string;
    return aName.localeCompare(bName);
  });

  const isFormIsIncomplete = (): boolean => {
    let valid = teamName.length > 1;
    valid = valid && teamPhone.length > 1;
    valid = valid && addrLine1.length > 1;
    valid = valid && addrZipCode.length > 1;
    valid = valid && addrCity.length > 1;
    valid = valid && addrCountry.length > 1;
    valid = valid && (teamEmail.length < 1 || REGEX_EMAIL.test(teamEmail));
    return !valid;
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
  };
  const handleValidateModal = (): void => {
    setModalOpen(false);

    team.name = teamName;
    team.phone = teamPhone;

    if (teamEmail.length > 0) {
      team.email = teamEmail;
    } else {
      delete team.email;
    }

    team.address = {
      line1: addrLine1,
      line2: addrLine2,
      zip: addrZipCode,
      city: addrCity,
      country: addrCountry,
    };
    if (addrLine2.length < 1) {
      delete team.address?.line2;
    }
    onSaveTeam(team);
  };
  const handleChangeTeamName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setTeamName(e.target.value);
  };
  const handleChangeTeamPhone = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setTeamPhone(e.target.value);
  };
  const handleChangeTeamEmail = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setTeamEmail(e.target.value);
  };
  const handleChangeAddrLine1 = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setAddrLine1(e.target.value);
  };
  const handleChangeAddrLine2 = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setAddrLine2(e.target.value);
  };
  const handleChangeAddrZip = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setAddrZipCode(e.target.value);
  };
  const handleChangeAddrCity = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setAddrCity(e.target.value);
  };
  const handleChangeAddrCountry = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>): void => {
    const country = e.target.value as string;
    setAddrCountry(country);
  };

  if (formIsIncomplete !== isFormIsIncomplete()) {
    setFormIsIncomplete(!formIsIncomplete);
  }

  return (
    <Modal id="team-modal-edit" aria-labelledby={ariaModal} className={classes.modal} open={modalOpened} BackdropComponent={Backdrop} BackdropProps={{ timeout: modalBackdropTimeout }}>
      <Fade in={modalOpened}>
        <div className={classes.divMain}>
          <h2 id="team-modal-edit-title">{modalTitle}</h2>
          <form noValidate autoComplete="off" className={classes.form}>
            <TextField id="team-modal-edit-field-name" className={classes.formChild} variant="outlined" onChange={handleChangeTeamName} name="name" value={teamName} label={t("team-modal-edit-placeholder-name")} required={true} aria-required="true" />

            <TextField id="team-modal-edit-field-line1" className={classes.formChild} variant="outlined" onChange={handleChangeAddrLine1} name="addr-line1" value={addrLine1} label={t("team-modal-edit-placeholder-addr-line1")} required={true} aria-required="true" />
            <TextField id="team-modal-edit-field-line2" className={classes.formChild} variant="outlined" onChange={handleChangeAddrLine2} name="addr-line2" value={addrLine2} label={t("team-modal-edit-placeholder-addr-line2")} required={false} aria-required="false" />
            <TextField id="team-modal-edit-field-zip" className={classes.formChild} variant="outlined" onChange={handleChangeAddrZip} name="addr-zip" value={addrZipCode} label={t("team-modal-edit-placeholder-addr-zip")} required={true} aria-required="true" />
            <TextField id="team-modal-edit-field-city" className={classes.formChild} variant="outlined" onChange={handleChangeAddrCity} name="addr-city" value={addrCity} label={t("team-modal-edit-placeholder-addr-city")} required={true} aria-required="true" />
            <FormControl className={classes.formChild} required={true} variant="outlined">
              <InputLabel htmlFor="team-modal-edit-select-country">{t("team-modal-edit-placeholder-addr-country")}</InputLabel>
              <Select
                native
                label={t("team-modal-edit-placeholder-addr-country")}
                value={addrCountry}
                onChange={handleChangeAddrCountry}
                inputProps={{ name: "country", id: "team-modal-edit-select-country" }}>
                {optionsCountries}
              </Select>
            </FormControl>

            <TextField id="team-modal-edit-field-phone" className={classes.formChild} variant="outlined" onChange={handleChangeTeamPhone} name="phone" value={teamPhone} label={t("team-modal-edit-placeholder-phone")} required={true} aria-required="true" />
            <TextField id="team-modal-edit-field-email" className={classes.formChild} variant="outlined" onChange={handleChangeTeamEmail} name="email" value={teamEmail} label={t("team-modal-edit-placeholder-email")} required={false} aria-required="false" />
          </form>
          <div className={classes.divModalButtons}>
            <Button id="team-modal-edit-button-close" className={classes.divModalButtonCancel} variant="contained" onClick={handleCloseModal}>{t("Cancel")}</Button>
            <Button id="team-modal-edit-button-create" disabled={formIsIncomplete} onClick={handleValidateModal} color="primary" variant="contained">{modalButtonValidate}</Button>
          </div>
        </div>
      </Fade>
    </Modal>
  );
}

export default TeamEditModal;
