/**
 * Copyright (c) 2020, Diabeloop
 * Profile page
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

import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import moment from "moment-timezone";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import { Units } from "../../models/generic";
import { Preferences, Profile, UserRoles, Settings, User } from "../../models/shoreline";
import { getCurrentLocaleName, getLocaleShortname, availableLocales } from "../../lib/language";
import { REGEX_BIRTHDATE, REGEX_EMAIL, errorTextFromException } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import appConfig from "../../lib/config";
import { AlertSeverity, useSnackbar } from "../../lib/useSnackbar";
import sendMetrics from "../../lib/metrics";
import { Password } from "../../components/utils/password";
import { Snackbar } from "../../components/utils/snackbar";

import SecondaryHeaderBar from "./secondary-bar";
import SwitchRoleConsequencesDialog from "../../components/switch-role/switch-role-consequences-dialog";
import SwitchRoleConsentDialog from "../../components/switch-role/switch-role-consent-dialog";

interface ProfilePageProps {
  defaultURL: string;
}

interface Errors {
  firstName: boolean;
  name: boolean;
  mail: boolean;
  password: boolean;
  passwordConfirmation: boolean;
  birthDate: boolean;
}

enum SwitchRoleToHcpSteps {
  none,
  consequences,
  consent,
  update, // Update in progress => backend API call
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginLeft: "1em",
    },
    formControl: { marginTop: "1em", minWidth: 120 },
    homeIcon: {
      marginRight: "0.5em",
    },
    breadcrumbText: {
      display: "flex",
      cursor: "default",
    },
    toolBar: {
      display: "grid",
      gridTemplateRows: "auto",
      gridTemplateColumns: "auto auto auto",
      paddingLeft: "6em",
      paddingRight: "6em",
    },
    textField: {
      marginTop: "1em",
      "& input:disabled": {
        backgroundColor: "white",
      },
    },
    title: {
      color: theme.palette.primary.main,
      textAlign: "center",
      width: "100%",
    },
    container: {
      backgroundColor: "white",
      border: "solid",
      borderRadius: "15px",
      marginTop: "32px",
      // eslint-disable-next-line no-magic-numbers
      borderColor: theme.palette.grey[300],
      borderWidth: "1px",
      padding: "0 64px",
    },
  })
);

const ProfilePage = (props: ProfilePageProps): JSX.Element => {
  const { t, i18n } = useTranslation("yourloops");
  const classes = useStyles();
  const history = useHistory();
  const { user, setUser, updatePreferences, updateProfile, updateSettings, switchRoleToHCP } = useAuth();
  const { openSnackbar, snackbarParams } = useSnackbar();

  const [firstName, setFirstName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [locale, setLocale] = useState<string>(
    getCurrentLocaleName(i18n.language.split("-")[0] as Preferences["displayLanguageCode"])
  );
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [unit, setUnit] = useState<Units>(Units.gram);
  const [birthDate, setBirthDate] = useState<string>("");
  const [hbA1c, setHbA1c] = useState<Settings["a1c"] | null>(null);
  const [hasProfileChanged, setHasProfileChanged] = useState<boolean>(false);
  const [haveSettingsChanged, setHaveSettingsChanged] = useState<boolean>(false);
  const [havePreferencesChanged, setHavePreferencesChanged] = useState<boolean>(false);
  const [switchRoleStep, setSwitchRoleStep] = React.useState<SwitchRoleToHcpSteps>(SwitchRoleToHcpSteps.none);

  if (user === null) {
    throw new Error("User must be looged-in");
  }

  const role = user.role;

  const handleUserUpdate = useCallback(
    (promises: Promise<unknown>[], newUser: User, callbacks: React.Dispatch<React.SetStateAction<boolean>>[]): void => {
      Promise.all(promises)
        .then(() => {
          callbacks.forEach((callback) => callback(false));
          setUser(newUser);
          openSnackbar({ message: t("profile-updated"), severity: AlertSeverity.success });
        })
        .catch(() => openSnackbar({ message: t("profile-update-failed"), severity: AlertSeverity.error }));
    },
    [t, openSnackbar, setUser]
  );

  useEffect(() => {
    if (user?.profile?.firstName) {
      setFirstName(user.profile.firstName);
    }
    if (user?.profile?.lastName) {
      setName(user.profile.lastName);
    }
    if (user?.emails && user.emails.length) {
      setMail(user.emails[0]);
    }
    if (user?.settings?.units?.bg) {
      setUnit(user?.settings?.units?.bg);
    }
    if (user?.settings?.a1c) {
      setHbA1c({ date: moment.utc(user.settings.a1c.date).format("L"), value: user.settings.a1c.value });
    }
    if (user?.profile?.patient?.birthday) {
      setBirthDate(user.profile.patient.birthday.split("T")[0]);
    }
  }, [user]);

  const handleChange = (
    setState: React.Dispatch<React.SetStateAction<string>>
  ): ((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void) => (event) => setState(event.target.value);

  const handleLocaleChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: string | unknown;
    }>
  ): void => {
    setLocale(event.target.value as string);
  };

  const handleUnitChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: string | unknown;
    }>
  ): void => {
    setUnit(event.target.value as Units);
  };

  const handleSwitchRoleToConsequences = () => {
    sendMetrics("user-switch-role", { from: role, to: "hcp", step: SwitchRoleToHcpSteps.consequences });
    setSwitchRoleStep(SwitchRoleToHcpSteps.consequences);
  };
  const handleSwitchRoleToConditions = (accept: boolean): void => {
    sendMetrics("user-switch-role", { from: role, to: "hcp", step: SwitchRoleToHcpSteps.consent, cancel: !accept });
    if (accept) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.consent);
    } else {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  };
  const handleSwitchRoleToUpdate = (accept: boolean): void => {
    sendMetrics("user-switch-role", { from: role, to: "hcp", step: SwitchRoleToHcpSteps.update, cancel: !accept });
    if (accept) {
      setSwitchRoleStep(SwitchRoleToHcpSteps.update);

      switchRoleToHCP()
        .then(() => {
          sendMetrics("user-switch-role", {
            from: role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: true,
          });
        })
        .catch((reason: unknown) => {
          openSnackbar({ message: t("modal-switch-hcp-failure"), severity: AlertSeverity.error });
          sendMetrics("user-switch-role", {
            from: role,
            to: "hcp",
            step: SwitchRoleToHcpSteps.update,
            success: false,
            error: errorTextFromException(reason),
          });
        });
    } else {
      setSwitchRoleStep(SwitchRoleToHcpSteps.none);
    }
  };

  const errors: Errors = useMemo(
    () => ({
      firstName: _.isEmpty(firstName),
      name: _.isEmpty(name),
      mail: !REGEX_EMAIL.test(mail),
      // eslint-disable-next-line no-magic-numbers
      password: password.length > 0 && password.length < appConfig.PASSWORD_MIN_LENGTH,
      passwordConfirmation: passwordConfirmation !== password,
      birthDate: role === UserRoles.patient && !REGEX_BIRTHDATE.test(birthDate),
    }),
    [firstName, name, mail, password, passwordConfirmation, birthDate, role]
  );

  const isAnyError: boolean = useMemo(() => _.some(errors), [errors]);

  useEffect(() => {
    if (user) {
      const newSettings: Settings = {
        ...user.settings,
        units: { bg: unit },
      };
      setHaveSettingsChanged(!_.isEqual(user.settings, newSettings));

      const newPreferences: Preferences = { ...user.preferences, displayLanguageCode: getLocaleShortname(locale) };
      setHavePreferencesChanged(!_.isEqual(user.preferences, newPreferences));

      const newProfile: Profile = {
        ...user.profile,
        fullName: firstName + " " + name,
        firstName,
        lastName: name,
        patient: { birthday: birthDate }
      };
      setHasProfileChanged(!_.isEqual(user.profile, newProfile));
    } else {
      setHaveSettingsChanged(false);
      setHavePreferencesChanged(false);
      setHasProfileChanged(false);
    }
  }, [firstName, name, birthDate, unit, locale, user]);

  const onSave = useCallback(() => {
    if (user) {
      const localeShortname = getLocaleShortname(locale);
      const promises: Promise<unknown>[] = [];
      const callbacks: React.Dispatch<React.SetStateAction<boolean>>[] = [];
      const newUser: User = {
        ...user,
        preferences: havePreferencesChanged ? { ...user.preferences, displayLanguageCode: localeShortname } : user.preferences,
        settings: haveSettingsChanged ? { ...user.settings, units: { bg: unit } } : user.settings,
        profile: hasProfileChanged
          ? {
              ...user.profile,
              fullName: firstName + " " + name,
              firstName,
              lastName: name,
              patient: { birthday: birthDate },
            }
          : user.profile,
      };
      if (havePreferencesChanged) {
        if (i18n) {
          const lang = i18n.language.split("-")[0] as Preferences["displayLanguageCode"];
          if (getCurrentLocaleName(lang) !== locale && localeShortname) {
            i18n.changeLanguage(localeShortname);
          }
        }
        promises.push(updatePreferences(newUser));
        callbacks.push(setHavePreferencesChanged);
      }

      if (haveSettingsChanged) {
        promises.push(updateSettings(newUser));
        callbacks.push(setHaveSettingsChanged);
      }

      if (hasProfileChanged) {
        promises.push(updateProfile(newUser));
        callbacks.push(setHasProfileChanged);
      }
      if (promises.length) {
        handleUserUpdate(promises, newUser, callbacks);
      }
    }
  }, [
    user,
    haveSettingsChanged,
    havePreferencesChanged,
    hasProfileChanged,
    firstName,
    name,
    birthDate,
    locale,
    i18n,
    unit,
    handleUserUpdate,
    updatePreferences,
    updateSettings,
    updateProfile,
  ]);

  const onCancel = (): void => history.goBack();

  return (
    <Fragment>
      <SecondaryHeaderBar defaultURL={props.defaultURL} />
      <Snackbar params={snackbarParams} />
      <Container className={classes.container} maxWidth="sm">
        <div style={{ display: "flex", flexDirection: "column", margin: "16px" }}>
          <DialogTitle className={classes.title} id="profile-title">
            {t("menu-account-preferences")}
          </DialogTitle>
          <TextField
            id="profile-textfield-firstname"
            label={t("First name")}
            value={firstName}
            onChange={handleChange(setFirstName)}
            error={errors.firstName}
            helperText={errors.firstName && t("required-field")}
            className={classes.textField}
          />
          <TextField
            id="profile-textfield-lastname"
            label={t("Last name")}
            value={name}
            onChange={handleChange(setName)}
            error={errors.name}
            helperText={errors.name && t("required-field")}
            className={classes.textField}
          />

          {role !== UserRoles.patient ? (
            <Fragment>
              <TextField
                id="profile-textfield-mail"
                label={t("Email")}
                value={mail}
                disabled
                onChange={handleChange(setMail)}
                error={errors.mail}
                helperText={errors.mail && t("Invalid email address.")}
                className={classes.textField}
              />
              <Password
                id="profile-textfield-password"
                label="password"
                value={password}
                error={errors.password}
                helperText={t("password-too-weak")}
                setState={setPassword}
              />
              <Password
                id="profile-textfield-password-confirmation"
                label="confirm-password"
                value={passwordConfirmation}
                error={errors.passwordConfirmation}
                helperText={t("not-matching-password")}
                setState={setPasswordConfirmation}
              />
            </Fragment>
          ) : (
            <Fragment>
              <TextField
                id="profile-textfield-birthdate"
                label={t("hcp-patient-profile-birthdate")}
                value={birthDate}
                onChange={handleChange(setBirthDate)}
                error={errors.birthDate}
                helperText={errors.birthDate && t("required-field")}
              />
              {hbA1c && (
                <TextField
                  id="hbA1c"
                  label={t("hcp-patient-profile-hba1c", { hba1cDate: hbA1c?.date })}
                  disabled
                  value={hbA1c.value + "%"}
                  className={classes.textField}
                />
              )}
            </Fragment>
          )}
          <FormControl className={classes.formControl}>
            <InputLabel id="profile-units-input-label">{t("units")}</InputLabel>
            <Select
              disabled={role === UserRoles.patient}
              labelId="unit-selector"
              id="profile-units-selector"
              value={unit}
              onChange={handleUnitChange}>
              <MenuItem id="profile-units-mmoll" value={Units.mole}>{Units.mole}</MenuItem>
              <MenuItem id="profile-units-mgdl" value={Units.gram}>{Units.gram}</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="profile-language-input-label">{t("Language")}</InputLabel>
            <Select labelId="locale-selector" id="profile-locale-selector" value={locale} onChange={handleLocaleChange}>
              {availableLocales.map((locale) => (
                <MenuItem id={`profile-locale-item-${locale}`} key={locale} value={locale}>
                  {locale}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "2em 0em" }}>
            <Button
              id="profile-button-cancel"
              variant="contained"
              color="secondary"
              onClick={onCancel}
              className={classes.button}>
              {t("common-cancel")}
            </Button>
            <Button
              id="profile-button-save"
              variant="contained"
              disabled={(!hasProfileChanged && !haveSettingsChanged && !havePreferencesChanged) || isAnyError}
              color="primary"
              onClick={onSave}
              className={classes.button}>
              {t("save")}
            </Button>
          </div>
          {UserRoles.caregiver === role ? (
            <Link id="profile-link-switch-role" component="button" onClick={handleSwitchRoleToConsequences}>
              {t("modal-switch-hcp-title")}
            </Link>
          ) : null}
        </div>
      </Container>
      <SwitchRoleConsequencesDialog
        title="modal-switch-hcp-title"
        open={switchRoleStep === SwitchRoleToHcpSteps.consequences}
        onResult={handleSwitchRoleToConditions}
      />
      <SwitchRoleConsentDialog open={switchRoleStep === SwitchRoleToHcpSteps.consent} onResult={handleSwitchRoleToUpdate} />
    </Fragment>
  );
};

export default ProfilePage;
