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
import { RouteComponentProps } from "react-router-dom";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import brandingLogo from "branding/logo.png";
import { useAuth } from "../../lib/auth/hook/use-auth";

/**
 * Login page
 */
function RequestPasswordResetPage(props: RouteComponentProps): JSX.Element {
  const { t } = useTranslation("yourloops");

  const [username, setUserName] = React.useState("");
  const [validateError, setValidateError] = React.useState(false);
  const [helperTextValue, setHelperTextValue] = React.useState("");
  //const loginFormStyles = useState(["stage-transition-container-variant"]);
  const auth = useAuth();
  const emptyUsername = _.isEmpty(username);

  const onUsernameChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setUserName(event.target.value);
  };

  const onBack = (): void => {
    console.log("on back", props.history);
    // requires two back for going to login page
    props.history.go(-2); // eslint-disable-line no-magic-numbers
  };

  const onSendResetLink = (): void => {
    if (_.isEmpty(username)) {
      setValidateError(true);
      return;
    }
    setValidateError(false);
    auth
      .sendPasswordResetEmail(username)
      .then(() => {
        props.history.push("/password-reset-confirmed");
      })
      .catch((reason: Error) => {
        setValidateError(true);
        setHelperTextValue(reason.message);
      });
  };

  return (
    <Container maxWidth="sm" style={{ margin: "auto" }}>
      <Grid container spacing={0} alignItems="center" justify="center" style={{ minHeight: "100vh" }}>
        <Grid item xs={12}>
          <Card>
            <CardMedia
              style={{
                display: "flex",
                paddingTop: "1em",
                paddingBottom: "1em",
              }}>
              <img
                src={brandingLogo}
                alt={t("Login Branding Logo")}
                style={{
                  height: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("Forgot your password?")}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t("Please enter your email address.")}
              </Typography>
              <form style={{ display: "flex", flexDirection: "column" }} noValidate autoComplete="off">
                <TextField
                  id="username"
                  label={t("email")}
                  value={username}
                  required
                  error={validateError || emptyUsername}
                  onChange={onUsernameChange}
                  helperText={helperTextValue}
                />
              </form>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="secondary" onClick={onBack}>
                {t("Cancel")}
              </Button>
              <Button variant="contained" color="primary" onClick={onSendResetLink} disabled={emptyUsername}>
                {t("Send reset link")}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RequestPasswordResetPage;
