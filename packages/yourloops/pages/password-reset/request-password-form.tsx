/**
 * Copyright (c) 2021, Diabeloop
 * Request password reset page
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
import { useTranslation } from "react-i18next";

import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";

const requestStyle = makeStyles((theme: Theme) => {
  return {
    mainContainer: { margin: "auto" },
    root: { minHeight: "100vh" },
    Card: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      padding: theme.spacing(4),
    },
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

interface RequestPasswordFormProps {
  username: string;
  error: boolean;
  inProgress: boolean;
  onUsernameChange(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void;
  validateUserName(): void;
  onSendResetLink(): void;
  onBack(): void;
}

export default function RequestPasswordForm(props: RequestPasswordFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = requestStyle();
  const emptyUsername = _.isEmpty(props.username);
  return (
    <React.Fragment>
      <CardContent className={classes.CardContent}>
        <Typography variant="h6" gutterBottom>
          {t("Forgot your password?")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t("Please enter your email address.")}
        </Typography>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          noValidate
          autoComplete="off">
          <TextField
            id="username"
            className={classes.TextField}
            margin="normal"
            label={t("email")}
            variant="outlined"
            value={props.username}
            required
            error={props.error}
            onBlur={() => props.validateUserName()}
            onChange={props.onUsernameChange}
            helperText={props.error && t("invalid-email")}
          />
        </form>
      </CardContent>
      <CardActions className={classes.CardActions}>
        <Button variant="contained" color="secondary" onClick={props.onBack}>
          {t("common-cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={props.onSendResetLink}
          disabled={emptyUsername || props.inProgress}>
          {props.inProgress ? t("Sending reset link") : t("Send reset link")}
        </Button>
      </CardActions>
    </React.Fragment>
  );
}
