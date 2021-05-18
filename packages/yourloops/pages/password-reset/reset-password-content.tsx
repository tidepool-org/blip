import _ from "lodash";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { errorTextFromException, REGEX_EMAIL } from "../../lib/utils";
import appConfig from "../../lib/config";
import { useAuth } from "../../lib/auth";
import { useAlert } from "../../components/utils/snackbar";
import RequestPassordMessage from "./request-password-message";

const formStyle = makeStyles((theme: Theme) => {
  return {
    CardContent: {
      textAlign: "start",
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
    },
    CardActions: {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      padding: theme.spacing(2),
      justifyContent: "flex-end",
    },
    TextField: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
  };
});

export default function ResetPasswordContent(): JSX.Element {
  const defaultErr = {
    username: false,
    newPassword: false,
    confirmNewPassword: false,
  };
  const { t } = useTranslation("yourloops");
  const classes = formStyle();
  const auth = useAuth();
  const history = useHistory();
  const alert = useAlert();
  const [username, setUserName] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [errors, setErrors] = React.useState(defaultErr);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(
    false
  );
  const [success, setSuccess] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const emptyUsername = _.isEmpty(username);
  const resetKey = React.useMemo(() => new URLSearchParams(location.search).get("resetKey"), []);

  const onBack = (): void => {
    history.push("/");
  };

  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<string>>
  ): void => {
    setState(event.target.value);
  };

  const onClick = (
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    showPassword: boolean,
    setState: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    setState(!showPassword);
  };

  const resetFormState = (): void => {
    setErrors(defaultErr);
  };

  const validateUserName = (): boolean => {
    const err = _.isEmpty(username.trim()) || !REGEX_EMAIL.test(username);
    setErrors({ ...errors, username: err });
    return !err;
  };

  const validatePassword = (): boolean => {
    const err =
      _.isEmpty(newPassword?.trim()) ||
      newPassword?.length < appConfig.PWD_MIN_LENGTH;
    setErrors({ ...errors, newPassword: err });
    return !err;
  };

  const validateConfirmNewPassword = (): boolean => {
    const err =
      _.isEmpty(confirmNewPassword.trim()) ||
      confirmNewPassword !== newPassword;
    setErrors({ ...errors, confirmNewPassword: err });
    return !err;
  };

  const validateForm = () => validateUserName() && validatePassword() && validateConfirmNewPassword();

  const onSendResetPassword = async (): Promise<void> => {
    resetFormState();
    if (validateForm() && resetKey !== null) {
      try {
        setInProgress(true);
        const success = await auth.resetPassword(
          resetKey,
          username,
          confirmNewPassword
        );
        setSuccess(success);
        setInProgress(false);
      } catch (reason: unknown) {
        const errorMessage = errorTextFromException(reason);
        alert.error(t(errorMessage));
      }
    }
  };

  return (
    <React.Fragment>
      {success ? (
        <RequestPassordMessage
          header="password-reset-success-title"
          body="password-reset-success"
        />
      ) : (
        <>
          <CardContent className={classes.CardContent}>
            <Typography variant="h6" gutterBottom>
              {t("password-reset-title")}
            </Typography>
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              noValidate
              autoComplete="off">
              {_.isEmpty(resetKey) ? <Typography>{t("reset-key-is-missing")}</Typography> : null}
              <TextField
                id="username"
                className={classes.TextField}
                margin="normal"
                label={t("email")}
                variant="outlined"
                value={username}
                required
                error={errors.username}
                onBlur={() => validateUserName()}
                onChange={(e) => onChange(e, setUserName)}
                helperText={errors.username && t("invalid-email")}
              />
              <TextField
                id="password"
                className={classes.TextField}
                margin="normal"
                label={t("new-password")}
                variant="outlined"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                required
                error={errors.newPassword}
                onBlur={() => validatePassword()}
                onChange={(e) => onChange(e, setNewPassword)}
                helperText={
                  errors.newPassword &&
                  t("password-too-weak", {
                    minLength: appConfig.PWD_MIN_LENGTH,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t("aria-toggle-password-visibility")}
                        onClick={(e) =>
                          onClick(e, showNewPassword, setShowNewPassword)
                        }>
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                id="confirm-password"
                className={classes.TextField}
                margin="normal"
                label={t("confirm-new-password")}
                variant="outlined"
                type={showConfirmNewPassword ? "text" : "password"}
                value={confirmNewPassword}
                required
                error={errors.confirmNewPassword}
                onBlur={() => validateConfirmNewPassword()}
                onChange={(e) => onChange(e, setConfirmNewPassword)}
                helperText={
                  errors.confirmNewPassword && t("password-dont-match")
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t("aria-toggle-password-visibility")}
                        onClick={(e) =>
                          onClick(
                            e,
                            showConfirmNewPassword,
                            setShowConfirmNewPassword
                          )
                        }>
                        {showConfirmNewPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </CardContent>
          <CardActions className={classes.CardActions}>
            <Button variant="contained" color="secondary" onClick={onBack}>
              {t("common-cancel")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSendResetPassword}
              disabled={emptyUsername || inProgress}>
              {inProgress ? t("saving") : t("save")}
            </Button>
          </CardActions>
        </>
      )}
    </React.Fragment>
  );
}
