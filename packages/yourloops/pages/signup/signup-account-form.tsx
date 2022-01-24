/**
 * Copyright (c) 2021, Diabeloop
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
import React from "react";
import { useTranslation } from "react-i18next";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { errorTextFromException, REGEX_EMAIL } from "../../lib/utils";
import { checkPasswordStrength } from "../../lib/auth/helpers";
import metrics from "../../lib/metrics";
import SignUpFormProps from "./signup-form-props";
import { useAuth } from "../../lib/auth";
import { getCurrentLang } from "../../lib/language";
import { useAlert } from "../../components/utils/snackbar";
import { useSignUpFormState } from "./signup-formstate-context";
import { PasswordStrengthMeter } from "../../components/utils/password-strength-meter";
import Password from "../../components/utils/password";


interface Errors {
  username: boolean;
  newPassword: boolean;
  confirmNewPassword: boolean;
}

/**
 * SignUpAccount Form
 */
function SignUpAccountForm(props: SignUpFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const auth = useAuth();
  const alert = useAlert();
  const { state, dispatch } = useSignUpFormState();
  const { handleBack, handleNext } = props;

  const [username, setUsername] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [inProgress, setInProgress] = React.useState(false);
  const [usernameTextFieldFocused, setUsernameTextFieldFocused] = React.useState(false);

  const passwordCheck = checkPasswordStrength(newPassword);

  const errors: Errors = React.useMemo(
    () => ({
      username: _.isEmpty(username.trim()) || !REGEX_EMAIL.test(username),
      newPassword: passwordCheck.onError,
      confirmNewPassword: _.isEmpty(confirmNewPassword.trim()) || confirmNewPassword !== newPassword,
    }), [confirmNewPassword, newPassword, passwordCheck.onError, username]
  );

  React.useEffect(() => {
    dispatch({ type: "EDIT_FORMVALUE", key: "accountPassword", value: newPassword });
    dispatch({ type: "EDIT_FORMVALUE", key: "accountUsername", value: username });
  }, [dispatch, newPassword, username]);

  const onNext = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!errors.username && !errors.newPassword && !errors.confirmNewPassword) {
      // submit to api
      try {
        setInProgress(true);
        state.formValues.preferencesLanguage = getCurrentLang();
        await auth.signup(state.formValues);
        handleNext();
        metrics.send("registration", "complete_signup", state.formValues.accountRole);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        alert.error(t(errorMessage));
      } finally {
        setInProgress(false);
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <TextField
        id="username"
        autoComplete="username"
        margin="normal"
        label={t("email")}
        variant="outlined"
        value={username}
        required
        error={errors.username && username.length > 0 && !usernameTextFieldFocused}
        onBlur={() => setUsernameTextFieldFocused(false)}
        onFocus={() => setUsernameTextFieldFocused(true)}
        onChange={(e) => setUsername(e.target.value)}
        helperText={errors.username && username.length > 0 && !usernameTextFieldFocused && t("invalid-email")}
      />
      <Password
        id="password"
        label={t("new-password")}
        value={newPassword}
        onChange={(password) => setNewPassword(password)}
        error={errors.newPassword && newPassword.length > 0}
        autoComplete="new-password"
        variant="outlined"
        margin="normal"
        checkStrength
        required
        helperText={
          newPassword.length > 0 &&
          <PasswordStrengthMeter
            force={passwordCheck.score}
            error={errors.newPassword}
            helperText={passwordCheck.helperText}
          />
        }
      />
      <Password
        id="confirm-password"
        label={t("confirm-new-password")}
        value={confirmNewPassword}
        onChange={(password) => setConfirmNewPassword(password)}
        error={errors.confirmNewPassword && confirmNewPassword.length > 0}
        helperText={errors.confirmNewPassword && t("password-dont-match")}
        autoComplete="new-password"
        variant="outlined"
        margin="normal"
        required
      />
      <Box
        id="signup-accountform-button-group"
        display="flex"
        justifyContent="space-evenly"
        mx={2}
        mt={4}
      >
        <Button
          id="button-signup-steppers-back"
          onClick={handleBack}
          classes={{ label: "button-signup-steppers-back-label" }}
        >
          {t("signup-steppers-back")}
        </Button>
        <Button
          id="button-signup-steppers-create"
          variant="contained"
          color="primary"
          disabled={_.some(errors) || inProgress}
          onClick={onNext}
          classes={{ label: "button-signup-steppers-create-account-label" }}
        >
          {t("signup-steppers-create-account")}
        </Button>
      </Box>
    </Box>
  );
}

export default SignUpAccountForm;
