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

import React, { Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Breadcrumbs,
  Button,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Toolbar,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";

import HeaderBar from "../../components/header-bar";
import { Password } from "../../components/utils/password";
import { REGEX_BIRTHDATE, REGEX_EMAIL } from "../../lib/utils";
import apiClient from "../../lib/auth/api";
import { getCurrentLocaleName, getLocaleShortname, availableLocales } from "../../lib/language";
import { Preferences, Profile, Roles, Settings, Units, User } from "../../models/shoreline";
import { useAuth } from "../../lib/auth/hook/use-auth";
import { Alert } from "@material-ui/lab";

interface Errors {
  firstName: boolean;
  name: boolean;
  mail: boolean;
  password: boolean;
  passwordConfirmation: boolean;
  birthDate: boolean;
}
interface ApiReturnAlert {
  message: string;
  severity: "error" | "warning" | "info" | "success";
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: { margin: "2em 1em" },
    formControl: { marginTop: "1em", minWidth: 120 },
    homeIcon: {
      marginRight: "0.5em",
    },
    breadcrumbLink: {
      display: "flex",
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
      textAlign: "center",
      color: theme.palette.primary.main,
      margin: "16px",
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

const ProfileHeader = () => {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();

  return (
    <Fragment>
      <HeaderBar />
      <AppBar position="static" color="secondary">
        <Toolbar className={classes.toolBar}>
          <Breadcrumbs aria-label={t("breadcrumb")}>
            <Link className={classes.breadcrumbLink} color="textPrimary" href="/hcp">
              <HomeIcon className={classes.homeIcon} />
              {t("account-preferences")}
            </Link>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>
    </Fragment>
  );
};

export const ProfilePage: FunctionComponent = () => {
  const { t, i18n } = useTranslation("yourloops");
  const classes = useStyles();
  const history = useHistory();
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [locale, setLocale] = useState<string>(
    getCurrentLocaleName(i18n.language.split("-")[0] as Preferences["displayLanguageCode"])
  );
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [unit, setUnit] = useState<Units>(Units.gram);
  const [role, setRole] = useState<Roles | null>(null);
  const [birthDate, setBirthDate] = useState<string>("");
  const [hbA1c, setHbA1c] = useState<string>("8.5%"); // TODO
  const [hasProfileChanged, setHasProfileChanged] = useState<boolean>(false);
  const [haveSettingsChanged, setHaveSettingsChanged] = useState<boolean>(false);
  const [havePreferencesChanged, setHavePreferencesChanged] = useState<boolean>(false);
  const [apiReturnAlert, setApiReturnAlert] = useState<ApiReturnAlert | null>(null);

  const handleUserUpdate = useCallback(
    (promises: Promise<void>[], newUser: User, callbacks: React.Dispatch<React.SetStateAction<boolean>>[]): void => {
      Promise.all(promises)
        .then(() => {
          callbacks.forEach((callback) => callback(false));
          setUser(newUser);
          setApiReturnAlert({ message: t("profile-updated"), severity: "success" });
        })
        .catch(() => setApiReturnAlert({ message: t("profile-update-failed"), severity: "error" }));
    },
    [t]
  );

  useEffect(() => {
    if (user?.profile?.firstName) {
      setFirstName(user.profile.firstName);
    }
    if (user?.profile?.lastName) {
      setName(user.profile.lastName);
    }
    if (user?.roles && user.roles.length) {
      setRole(user.roles[0]);
    }
    if (user?.emails && user.emails.length) {
      setMail(user.emails[0]);
    }
    if (user?.settings?.units?.bg) {
      setUnit(user?.settings?.units?.bg);
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

  const errors: Errors = useMemo(
    () => ({
      firstName: _.isEmpty(firstName),
      name: _.isEmpty(name),
      mail: !REGEX_EMAIL.test(mail),
      // eslint-disable-next-line no-magic-numbers
      password: password.length > 0 && password.length < 10, // TODO: define rules
      passwordConfirmation: passwordConfirmation !== password,
      birthDate: role === Roles.patient && !REGEX_BIRTHDATE.test(birthDate),
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
      };
      setHasProfileChanged(!_.isEqual(user.profile, newProfile));
    } else {
      setHaveSettingsChanged(false);
      setHavePreferencesChanged(false);
      setHasProfileChanged(false);
    }
  }, [firstName, name, unit, locale, user]);

  const onSave = useCallback(() => {
    if (user) {
      const localeShortname = getLocaleShortname(locale);
      const promises: Promise<void>[] = [];
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
            }
          : user.profile,
      };
      if (havePreferencesChanged) {
        if (i18n) {
          const lang = i18n.language.split("-")[0] as Preferences["displayLanguageCode"];
          if (getCurrentLocaleName(lang) !== locale) {
            i18n.changeLanguage(localeShortname!);
          }
        }
        promises.push(apiClient.updateUserPreferences(newUser));
        callbacks.push(setHavePreferencesChanged);
      }

      if (haveSettingsChanged) {
        promises.push(apiClient.updateUserSettings(newUser));
        callbacks.push(setHaveSettingsChanged);
      }

      if (hasProfileChanged) {
        promises.push(apiClient.updateUserProfile(newUser));
        callbacks.push(setHasProfileChanged);
      }
      if (promises.length) {
        handleUserUpdate(promises, newUser, callbacks);
      }
    }
  }, [user, haveSettingsChanged, havePreferencesChanged, hasProfileChanged, firstName, name, locale, i18n, unit, setUser]);

  const onCancel = (): void => history.goBack();
  const onCloseAlert = (): void => setApiReturnAlert(null);

  return (
    <Fragment>
      <ProfileHeader />
      <Container className={classes.container} maxWidth="sm">
        <div style={{ display: "flex", flexDirection: "column", margin: "16px" }}>
          <div className={classes.title}>{t("account-preferences-title")}</div>
          <TextField
            id="firstName"
            label={t("First name")}
            value={firstName}
            onChange={handleChange(setFirstName)}
            error={errors.firstName}
            helperText={errors.firstName && t("required-field")}
            className={classes.textField}
          />
          <TextField
            id="lastName"
            label={t("Last name")}
            value={name}
            onChange={handleChange(setName)}
            error={errors.name}
            helperText={errors.name && t("required-field")}
            className={classes.textField}
          />

          {role === Roles.clinic ? (
            <Fragment>
              <TextField
                id="mail"
                label={t("Email")}
                value={mail}
                disabled
                onChange={handleChange(setMail)}
                error={errors.mail}
                helperText={errors.mail && t("Invalid email address.")}
                className={classes.textField}
              />
              <Password
                id="password"
                label="password"
                value={password}
                error={errors.password}
                helperText={t("password-too-weak")}
                setState={setPassword}
              />
              <Password
                id="passwordConfirmation"
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
                id="birthDate"
                label={t("Date of birth")}
                value={birthDate}
                onChange={handleChange(setBirthDate)}
                error={errors.birthDate}
                helperText={errors.birthDate && t("required-field")}
              />
              <TextField
                id="hbA1c"
                label={t("initial-hbA1c")}
                disabled
                value={hbA1c}
                onChange={handleChange(setHbA1c)}
                className={classes.textField}
              />
            </Fragment>
          )}
          <FormControl className={classes.formControl}>
            <InputLabel id="units-input-label">{t("units")}</InputLabel>
            <Select
              disabled={role !== Roles.clinic}
              labelId="unit-selector"
              id="unit-selector"
              value={unit}
              onChange={handleUnitChange}>
              <MenuItem value={Units.mole}>{Units.mole}</MenuItem>
              <MenuItem value={Units.gram}>{Units.gram}</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="language-input-label">{t("Language")}</InputLabel>
            <Select labelId="locale-selector" id="locale-selector" value={locale} onChange={handleLocaleChange}>
              {availableLocales.map((locale) => (
                <MenuItem key={locale} value={locale}>
                  {locale}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" color="secondary" onClick={onCancel} className={classes.button}>
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={(!hasProfileChanged && !haveSettingsChanged && !havePreferencesChanged) || isAnyError}
              color="primary"
              onClick={onSave}
              className={classes.button}>
              {t("Save")}
            </Button>
          </div>
        </div>
      </Container>
      <Snackbar
        open={apiReturnAlert !== null}
        autoHideDuration={6000}
        onClose={onCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={onCloseAlert} severity={apiReturnAlert?.severity}>
          {apiReturnAlert?.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};
