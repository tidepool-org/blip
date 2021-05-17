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

import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import bows from "bows";
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
import { LanguageCodes } from "../../models/locales";
import { Preferences, Profile, UserRoles, Settings, User } from "../../models/shoreline";
import { getLangName, getCurrentLang, availableLanguageCodes } from "../../lib/language";
import { REGEX_BIRTHDATE, errorTextFromException, getUserFirstName, getUserLastName, getUserEmail } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import appConfig from "../../lib/config";
import { AlertSeverity, useSnackbar } from "../../lib/useSnackbar";
import sendMetrics from "../../lib/metrics";
import { Password } from "../../components/utils/password";
import { Snackbar } from "../../components/utils/snackbar";

import SecondaryHeaderBar from "./secondary-bar";
import SwitchRoleConsequencesDialog from "../../components/switch-role/switch-role-consequences-dialog";
import SwitchRoleConsentDialog from "../../components/switch-role/switch-role-consent-dialog";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type TextChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type SelectChangeEvent = React.ChangeEvent<{ name?: string; value: unknown; }>;
type HandleChange<E> = (event: E) => void;
type CreateHandleChange<T, E> = (setState: SetState<T>) => HandleChange<E>;

interface ProfilePageProps {
  defaultURL: string;
}

interface Errors {
  firstName: boolean;
  lastName: boolean;
  currentPassword: boolean;
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

const log = bows("ProfilePage");
const ProfilePage = (props: ProfilePageProps): JSX.Element => {
  const { t, i18n } = useTranslation("yourloops");
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar, snackbarParams } = useSnackbar();
  const { user, setUser, updatePreferences, updateProfile, updateSettings, updatePassword, switchRoleToHCP } = useAuth();

  if (user === null) {
    throw new Error("User must be looged-in");
  }

  const role = user.role;

  const [firstName, setFirstName] = useState<string>(getUserFirstName(user));
  const [lastName, setLastName] = useState<string>(getUserLastName(user));
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [unit, setUnit] = useState<Units>(user.settings?.units?.bg ?? Units.gram);
  const [birthDate, setBirthDate] = useState<string>(user.profile?.patient?.birthday ?? "");
  const [switchRoleStep, setSwitchRoleStep] = React.useState<SwitchRoleToHcpSteps>(SwitchRoleToHcpSteps.none);
  const [lang, setLang] = useState<LanguageCodes>(user.preferences?.displayLanguageCode ?? getCurrentLang());

  const browserTimezone = useMemo(() => new Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    // To be sure we have the locale:
    if (!availableLanguageCodes.includes(lang)) {
      setLang(getCurrentLang());
    }
  }, [lang]);

  useEffect(() => {
    // ISO date format is required from the user: It's not a very user friendly format
    // in all countries
    // We should change it
    if (role === UserRoles.patient && birthDate !== "") {
      let birthday = birthDate;
      if (birthday.length > 0 && birthday.indexOf("T") > 0) {
        birthday = birthday.split("T")[0];
      }
      if (REGEX_BIRTHDATE.test(birthday)) {
        setBirthDate(birthday);
      } else {
        setBirthDate("");
      }
    }
    // No deps here, because we want the effect only when the component is mounting
    // If we set the deps, the patient won't be able to change it's birthday.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getUpdatedPreferences = (): Preferences => {
    const updatedPreferences = _.cloneDeep(user.preferences ?? {}) as Preferences;
    updatedPreferences.displayLanguageCode = lang;
    return updatedPreferences;
  };

  const getUpdatedProfile = (): Profile => {
    const updatedProfile = _.cloneDeep(user.profile ?? {}) as Profile;
    updatedProfile.firstName = firstName;
    updatedProfile.lastName = lastName;
    updatedProfile.fullName = `${firstName} ${lastName}`;

    if (user.role === UserRoles.patient) {
      _.set(updatedProfile, "patient.birthday", birthDate);
    }

    return updatedProfile;
  };

  const getUpdatedSettings = (): Settings => {
    const updatedSettings = _.cloneDeep(user.settings ?? {}) as Settings;
    _.set(updatedSettings, "units.bg", unit);
    return updatedSettings;
  };

  const preferencesChanged = !_.isEqual(user.preferences, getUpdatedPreferences());
  const profileChanged = !_.isEqual(user.profile, getUpdatedProfile());
  const settingsChanged = !_.isEqual(user.settings, getUpdatedSettings());
  const passwordChanged = password !== "" || passwordConfirmation !== "";

  const createHandleTextChange: CreateHandleChange<string, TextChangeEvent> = (setState) => (event) => setState(event.target.value);
  const createHandleSelectChange = <T extends Units | LanguageCodes>(setState: SetState<T>): HandleChange<SelectChangeEvent> => (event) => setState(event.target.value as T);

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
      lastName: _.isEmpty(lastName),
      currentPassword: password.length > 0 && currentPassword.length < appConfig.PWD_MIN_LENGTH,
      password: password.length > 0 && password.length < appConfig.PWD_MIN_LENGTH,
      passwordConfirmation: passwordConfirmation !== password,
      birthDate: role === UserRoles.patient && !REGEX_BIRTHDATE.test(birthDate),
    }),
    [firstName, lastName, currentPassword, password, passwordConfirmation, birthDate, role]
  );

  const isAnyError = useMemo(() => _.some(errors), [errors]);
  const canSave = (preferencesChanged || profileChanged || settingsChanged || passwordChanged) && !isAnyError;

  const onSave = async (): Promise<void> => {
    let preferences: Preferences | null = null;
    let profile: Profile | null = null;
    let settings: Settings | null = null;
    let updateFailed = false;
    /** Set to true if we need to update the user only (no change needed for the password) */
    let updated = false;

    try {
      if (preferencesChanged) {
        preferences = await updatePreferences(getUpdatedPreferences(), false);
        updated = true;
      }
      if (profileChanged) {
        profile = await updateProfile(getUpdatedProfile(), false);
        updated = true;
      }
      if (settingsChanged) {
        settings = await updateSettings(getUpdatedSettings(), false);
        updated = true;
      }
      if (role !== UserRoles.patient && passwordChanged) {
        await updatePassword(currentPassword, password);
      }
    } catch (err) {
      log.error("Updating:", err);
      updateFailed = true;
    }

    if (updated) {
      const updatedUser = _.cloneDeep(user) as User;
      if (preferences) {
        updatedUser.preferences = preferences;
      }
      if (profile) {
        updatedUser.profile = profile;
      }
      if (settings) {
        updatedUser.settings = settings;
      }

      setUser(updatedUser);
    }

    if (passwordChanged) {
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    }

    if (lang !== getCurrentLang()) {
      i18n.changeLanguage(lang);
    }

    if (updateFailed) {
      openSnackbar({ message: t("profile-update-failed"), severity: AlertSeverity.error });
    } else {
      openSnackbar({ message: t("profile-updated"), severity: AlertSeverity.success });
    }
  };

  const onCancel = (): void => history.push(props.defaultURL);

  let roleDependantPart: JSX.Element | null = null;
  if (role === UserRoles.patient) {
    const a1cDate = user.settings?.a1c?.date;
    const a1cValue = user.settings?.a1c?.value;
    const hba1cMoment = typeof a1cDate === "string" ? moment.tz(a1cDate, browserTimezone) : null;

    let hba1cTextField: JSX.Element | null = null;
    if (_.isNumber(a1cValue) && moment.isMoment(hba1cMoment) && hba1cMoment.isValid()) {
      const hba1cDate = hba1cMoment.format("L");
      hba1cTextField = (
        <TextField
          id="hbA1c"
          label={t("hcp-patient-profile-hba1c", { hba1cDate })}
          disabled
          value={`${a1cValue}%`}
          className={classes.textField}
        />
      );
    }

    roleDependantPart = (
      <Fragment>
        <TextField
          id="profile-textfield-birthdate"
          label={t("hcp-patient-profile-birthdate")}
          value={birthDate ?? ""}
          onChange={createHandleTextChange(setBirthDate)}
          error={errors.birthDate}
          helperText={errors.birthDate && t("required-field")}
        />
        {hba1cTextField}
      </Fragment>
    );
  } else {
    roleDependantPart = (
      <Fragment>
        <TextField
          id="profile-textfield-mail"
          label={t("Email")}
          value={getUserEmail(user)}
          disabled
          className={classes.textField}
        />
        <Password
          id="profile-textfield-password-current"
          label="current-password"
          value={currentPassword}
          error={errors.currentPassword}
          helperText={t("no-password")}
          setState={setCurrentPassword}
        />
        <Password
          id="profile-textfield-password"
          label="new-password"
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
    );
  }

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
            label={t("firstname")}
            value={firstName}
            onChange={createHandleTextChange(setFirstName)}
            error={errors.firstName}
            helperText={errors.firstName && t("required-field")}
            className={classes.textField}
          />
          <TextField
            id="profile-textfield-lastname"
            label={t("lastname")}
            value={lastName}
            onChange={createHandleTextChange(setLastName)}
            error={errors.lastName}
            helperText={errors.lastName && t("required-field")}
            className={classes.textField}
          />

          {roleDependantPart}

          <FormControl className={classes.formControl}>
            <InputLabel id="profile-units-input-label">{t("units")}</InputLabel>
            <Select
              disabled={role === UserRoles.patient}
              labelId="unit-selector"
              id="profile-units-selector"
              value={unit}
              onChange={createHandleSelectChange(setUnit)}>
              <MenuItem id="profile-units-mmoll" value={Units.mole}>{Units.mole}</MenuItem>
              <MenuItem id="profile-units-mgdl" value={Units.gram}>{Units.gram}</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="profile-language-input-label">{t("Language")}</InputLabel>
            <Select labelId="locale-selector" id="profile-locale-selector" value={lang} onChange={createHandleSelectChange(setLang)}>
              {availableLanguageCodes.map((languageCode) => (
                <MenuItem id={`profile-locale-item-${languageCode}`} key={languageCode} value={languageCode}>
                  {getLangName(languageCode)}
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
              disabled={!canSave}
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
