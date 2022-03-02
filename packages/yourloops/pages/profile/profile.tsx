/**
 * Copyright (c) 2021, Diabeloop
 * Profile page
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
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AccountCircle from "@material-ui/icons/AccountCircle";
import Assignment from "@material-ui/icons/Assignment";
import Tune from "@material-ui/icons/Tune";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
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
import { Preferences, Profile, UserRoles, Settings } from "../../models/shoreline";
import BasicDropdown from "../../components/dropdown/basic-dropdown";
import { getLangName, getCurrentLang, availableLanguageCodes } from "../../lib/language";
import { REGEX_BIRTHDATE, getUserFirstName, getUserLastName, setPageTitle } from "../../lib/utils";
import { User, useAuth } from "../../lib/auth";
import appConfig from "../../lib/config";
import metrics from "../../lib/metrics";
import { checkPasswordStrength, CheckPasswordStrengthResults } from "../../lib/auth/helpers";
import { useAlert } from "../../components/utils/snackbar";
import { ConsentFeedback } from "../../components/consents";
import SecondaryHeaderBar from "./secondary-bar";
import SwitchRoleDialogs from "../../components/switch-role";
import { Errors } from "./models";
import PatientProfileForm from "./patient-form";
import AuthenticationForm from "./auth-form";
import { HcpProfession, HcpProfessionList } from "../../models/hcp-profession";
import ProSanteConnectButton from "../../components/buttons/pro-sante-connect-button";
import CertifiedProfessionalIcon from "../../components/icons/certified-professional-icon";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type TextChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type SelectChangeEvent = React.ChangeEvent<{ name?: string; value: unknown }>;
type HandleChange<E> = (event: E) => void;
type CreateHandleChange<T, E> = (setState: SetState<T>) => HandleChange<E>;

interface ProfilePageProps {
  defaultURL: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginLeft: theme.spacing(2),
    },
    formControl: {
      marginTop: theme.spacing(2),
    },
    textField: {
      "marginTop": "1em",
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
      marginTop: "32px",
      padding: 0,
      [theme.breakpoints.up("sm")]: {
        border: "solid",
        borderRadius: "15px",
        borderColor: theme.palette.grey[300],
        borderWidth: "1px",
        padding: "0 64px",
      },
    },
    uppercase: {
      textTransform: "uppercase",
    },
    halfWide: {
      [theme.breakpoints.up("sm")]: {
        width: "calc(50% - 16px)",
      },
    },
    inputContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      [theme.breakpoints.only("xs")]: {
        flexDirection: "column",
      },
    },
    categoryLabel: {
      "display": "flex",
      "alignItems": "center",
      "marginTop": theme.spacing(5),
      "& > :nth-child(2)": {
        marginLeft: theme.spacing(1),
      },
    },
  })
);

const log = bows("ProfilePage");
// TODO Need to split this too big component, see YLP-1256 (https://diabeloop.atlassian.net/browse/YLP-1256)
// eslint-disable-next-line complexity
const ProfilePage = (props: ProfilePageProps): JSX.Element => {
  const { t, i18n } = useTranslation("yourloops");
  const classes = useStyles();
  const history = useHistory();
  const alert = useAlert();
  const {
    user,
    setUser,
    updatePreferences,
    updateProfile,
    updateSettings,
    updatePassword,
    redirectToProfessionalAccountLogin,
  } = useAuth();

  if (!user) {
    throw new Error("User must be looged-in");
  }

  const role = user.role;
  const showFeedback = role === UserRoles.hcp;

  const [firstName, setFirstName] = React.useState<string>(getUserFirstName(user));
  const [lastName, setLastName] = React.useState<string>(getUserLastName(user));
  const [currentPassword, setCurrentPassword] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState<string>("");
  const [unit, setUnit] = React.useState<Units>(user.settings?.units?.bg ?? Units.gram);
  const [birthDate, setBirthDate] = React.useState<string>(user.profile?.patient?.birthday ?? "");
  const [switchRoleOpen, setSwitchRoleOpen] = React.useState<boolean>(false);
  const [lang, setLang] = React.useState<LanguageCodes>(user.preferences?.displayLanguageCode ?? getCurrentLang());
  const [hcpProfession, setHcpProfession] = React.useState<HcpProfession>(user.profile?.hcpProfession ?? HcpProfession.empty);
  const [feedbackAccepted, setFeedbackAccepted] = React.useState(Boolean(user?.profile?.contactConsent?.isAccepted));

  let passwordCheckResults: CheckPasswordStrengthResults;
  if (password.length > 0) {
    passwordCheckResults = checkPasswordStrength(password);
  } else {
    passwordCheckResults = { onError: false, helperText: "", score: -1 };
  }

  React.useEffect(() => {
    // To be sure we have the locale:
    if (!availableLanguageCodes.includes(lang)) {
      setLang(getCurrentLang());
    }
    setPageTitle(t("account-preferences"));
  }, [lang, t]);

  React.useEffect(() => {
    // ISO date format is required from the user: It's not a very user-friendly format in all countries, We should change it
    if (role === UserRoles.patient && !!birthDate) {
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
    // If we set the deps, the patient won't be able to change its birthday.
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
    if (user.role === UserRoles.hcp) {
      updatedProfile.hcpProfession = hcpProfession;
    }
    if (showFeedback && Boolean(user?.profile?.contactConsent?.isAccepted) !== feedbackAccepted) {
      updatedProfile.contactConsent = {
        isAccepted: feedbackAccepted,
        acceptanceTimestamp: new Date().toISOString(),
      };
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
  const createHandleSelectChange = <T extends Units | LanguageCodes | HcpProfession>(setState: SetState<T>): HandleChange<SelectChangeEvent> => (event) => setState(event.target.value as T);

  const handleSwitchRoleOpen = () => {
    setSwitchRoleOpen(true);
    metrics.send("switch_account", "display_switch_preferences");
  };
  const handleSwitchRoleCancel = () => setSwitchRoleOpen(false);

  const errors: Errors = React.useMemo(
    () => ({
      firstName: _.isEmpty(firstName),
      lastName: _.isEmpty(lastName),
      hcpProfession: role === UserRoles.hcp && hcpProfession === HcpProfession.empty,
      currentPassword: password.length > 0 && currentPassword.length < appConfig.PWD_MIN_LENGTH,
      password: passwordCheckResults.onError,
      passwordConfirmation: passwordConfirmation !== password,
      birthDate: role === UserRoles.patient && !REGEX_BIRTHDATE.test(birthDate),
    }),
    [firstName, lastName, hcpProfession, password, currentPassword.length, passwordCheckResults.onError, passwordConfirmation, role, birthDate]
  );

  const isAnyError = React.useMemo(() => _.some(errors), [errors]);
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
      const updatedUser = new User(user);
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
      alert.error(t("profile-update-failed"));
    } else {
      alert.success(t("profile-updated"));
    }
  };

  const onCancel = (): void => history.push(props.defaultURL);

  return (
    <React.Fragment>
      <SecondaryHeaderBar defaultURL={props.defaultURL} />
      <Container className={classes.container} maxWidth="sm">
        <Box display="flex" flexDirection="column" margin={2}>
          <DialogTitle className={classes.title} id="profile-title">
            {t("account-preferences")}
          </DialogTitle>

          <Box className={classes.categoryLabel}>
            <AccountCircle color="primary" style={{ margin: "0" }} />
            <strong className={classes.uppercase}>{t("personal-information")}</strong>
            {user.frProId && <CertifiedProfessionalIcon id={`certified-professional-icon-${user.userid}`} />}
          </Box>

          <Box className={classes.inputContainer}>
            <TextField
              id="profile-textfield-firstname"
              label={t("firstname")}
              value={firstName}
              onChange={createHandleTextChange(setFirstName)}
              error={errors.firstName}
              helperText={errors.firstName && t("required-field")}
              className={`${classes.textField} ${classes.halfWide}`}
            />
            <TextField
              id="profile-textfield-lastname"
              label={t("lastname")}
              value={lastName}
              onChange={createHandleTextChange(setLastName)}
              error={errors.lastName}
              helperText={errors.lastName && t("required-field")}
              className={`${classes.textField} ${classes.halfWide}`}
            />
          </Box>

          {role === UserRoles.hcp &&
            <Box className={classes.inputContainer}>
              <Box className={`${classes.formControl} ${classes.halfWide}`}>
                <BasicDropdown
                  onSelect={setHcpProfession}
                  defaultValue={hcpProfession}
                  disabledValues={[HcpProfession.empty]}
                  values={HcpProfessionList.filter(item => item !== HcpProfession.empty)}
                  id="profession"
                  inputTranslationKey="hcp-profession"
                  errorTranslationKey="profession-dialog-title"
                />
              </Box>

              {appConfig.ECPS_ENABLED && user.settings?.country === "FR" &&
                <React.Fragment>
                  {user.frProId ?
                    <TextField
                      id="professional-account-number-text-field"
                      value={user.getParsedFrProId()}
                      label={t("professional-account-number")}
                      disabled
                      className={classes.formControl}
                    />
                    :
                    <FormControl className={`${classes.formControl} ${classes.halfWide}`}>
                      <ProSanteConnectButton onClick={redirectToProfessionalAccountLogin} />
                    </FormControl>
                  }
                </React.Fragment>
              }
            </Box>
          }

          {role === UserRoles.patient ?
            <PatientProfileForm
              user={user}
              classes={classes}
              errors={errors}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
            />
            :
            <React.Fragment>
              <div className={classes.categoryLabel}>
                <Assignment color="primary" style={{ margin: "0" }} />
                <strong className={classes.uppercase}>{t("my-credentials")}</strong>
              </div>
              <AuthenticationForm
                user={user}
                classes={classes}
                errors={errors}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                password={password}
                setPassword={setPassword}
                passwordConfirmation={passwordConfirmation}
                setPasswordConfirmation={setPasswordConfirmation}
                passwordCheckResults={passwordCheckResults}
              />
            </React.Fragment>
          }

          <Box className={classes.categoryLabel}>
            <Tune color="primary" style={{ margin: "0" }} />
            <strong className={classes.uppercase}>{t("preferences")}</strong>
          </Box>

          <Box className={classes.inputContainer}>
            <FormControl className={`${classes.formControl} ${classes.halfWide}`}>
              <InputLabel id="profile-units-input-label">{t("units")}</InputLabel>
              <Select
                disabled={role === UserRoles.patient}
                labelId="unit-selector"
                id="profile-units-selector"
                value={unit}
                onChange={createHandleSelectChange(setUnit)}
              >
                <MenuItem id="profile-units-mmoll" value={Units.mole}>
                  {Units.mole}
                </MenuItem>
                <MenuItem id="profile-units-mgdl" value={Units.gram}>
                  {Units.gram}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl className={`${classes.formControl} ${classes.halfWide}`}>
              <InputLabel id="profile-language-input-label">{t("language")}</InputLabel>
              <Select
                labelId="locale-selector"
                id="profile-locale-selector"
                value={lang}
                onChange={createHandleSelectChange(setLang)}>
                {availableLanguageCodes.map((languageCode) => (
                  <MenuItem id={`profile-locale-item-${languageCode}`} key={languageCode} value={languageCode}>
                    {getLangName(languageCode)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {showFeedback &&
            <ConsentFeedback
              id="profile"
              userRole={role}
              checked={feedbackAccepted}
              style={{ marginLeft: -9, marginRight: 0, marginTop: "1em", marginBottom: 0 }}
              onChange={() => setFeedbackAccepted(!feedbackAccepted)}
            />
          }

          <Box display="flex" justifyContent="flex-end" my={3}>
            <Button
              id="profile-button-cancel"
              onClick={onCancel}
            >
              {t("button-cancel")}
            </Button>
            <Button
              id="profile-button-save"
              variant="contained"
              disabled={!canSave}
              color="primary"
              onClick={onSave}
              className={classes.button}
            >
              {t("button-save")}
            </Button>
          </Box>

          {UserRoles.caregiver === role &&
            <Link id="profile-link-switch-role" component="button" onClick={handleSwitchRoleOpen}>
              {t("modal-switch-hcp-title")}
            </Link>
          }
        </Box>
      </Container>
      <SwitchRoleDialogs open={switchRoleOpen} onCancel={handleSwitchRoleCancel} />
    </React.Fragment>
  );
};

export default ProfilePage;
