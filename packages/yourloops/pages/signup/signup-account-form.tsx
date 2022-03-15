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
import Typography from "@material-ui/core/Typography";
import InfoIcon from "@material-ui/icons/Info";
import { makeStyles, Theme } from "@material-ui/core/styles";

import { errorTextFromException, REGEX_EMAIL } from "../../lib/utils";
import metrics from "../../lib/metrics";
import { useAuth } from "../../lib/auth";
import { getCurrentLang } from "../../lib/language";
import { useAlert } from "../../components/utils/snackbar";
import { PasswordConfirm } from "../../components/password/password-confirm";
import { useSignUpFormState } from "./signup-formstate-context";
import SignUpFormProps from "./signup-form-props";

interface Errors {
  username: boolean;
  password: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  backButton: {
    marginRight: theme.spacing(2),
  },
}));

/**
 * SignUpAccount Form
 */
function SignUpAccountForm(props: SignUpFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = useStyles();
  const auth = useAuth();
  const alert = useAlert();
  const { state, dispatch } = useSignUpFormState();
  const { handleBack, handleNext } = props;

  const [hasPasswordError, setHasPasswordError] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [inProgress, setInProgress] = React.useState(false);
  const [usernameTextFieldFocused, setUsernameTextFieldFocused] = React.useState(false);

  const errors: Errors = React.useMemo(
    () => ({
      username: !username.trim() || !REGEX_EMAIL.test(username),
      password: hasPasswordError,
    }), [username, hasPasswordError]
  );

  React.useEffect(() => {
    dispatch({ type: "EDIT_FORMVALUE", key: "accountPassword", value: password });
    dispatch({ type: "EDIT_FORMVALUE", key: "accountUsername", value: username });
  }, [dispatch, password, username]);

  const onNext = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!errors.username && !errors.password) {
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

  const onSuccess = (password: string) => {
    setHasPasswordError(false);
    setPassword(password);
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
      <PasswordConfirm
        onError={() => setHasPasswordError(true)}
        onSuccess={onSuccess}
      />
      <Box display="flex" m={0}>
        <InfoIcon color="primary" />
        <Typography
          id="signup-account-deletion-warning"
          variant="body2"
          style={{ textAlign: "left", marginLeft: "10px" }}
        >
          {t("signup-account-deletion-warning")}
        </Typography>
      </Box>

      <Box
        id="signup-accountform-button-group"
        display="flex"
        justifyContent="end"
        mx={0}
        mt={4}
      >
        <Button
          className={classes.backButton}
          id="button-signup-steppers-back"
          onClick={handleBack}
        >
          {t("signup-steppers-back")}
        </Button>
        <Button
          id="button-signup-steppers-create"
          variant="contained"
          color="primary"
          disabled={_.some(errors) || inProgress}
          onClick={onNext}
        >
          {t("signup-steppers-create-account")}
        </Button>
      </Box>
    </Box>
  );
}

export default SignUpAccountForm;
