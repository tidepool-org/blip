/* eslint-disable no-unused-vars */
/**
 * Copyright (c) 2021, Diabeloop
 * RequestPasswordReset page
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

import _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
//import bows from "bows";

import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  TextField,
  Grid,
  Button,
  Typography,
} from "@material-ui/core";

import { t } from "../../lib/language";
import brandingLogo from "branding/logo.png";
import { useState } from "react";
import { useAuth } from "../../lib/auth/hook/use-auth";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RequestPasswordResetProps extends RouteComponentProps {
}

/**
 * Login page
 */
function RequestPasswordReset(props : RequestPasswordResetProps ) : JSX.Element {

  function onUsernameChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setUserName(event.target.value);
  }
  
  function onBack() {
    console.log("on back", props.history);
    // requires two back for going to login page
    props.history.go(-2);
  }

  function onSendResetLink() {
    if (_.isEmpty(username)) {
      setValidateError(true);
      return;
    }
    setValidateError(false);
    // eslint-disable-next-line no-use-before-define
    auth.sendPasswordResetEmail(username)
      .then(() => {
        props.history.push("/password-reset-confirmed");
      }).catch((reason: Error) => {
        setValidateError(true);
        setHelperTextValue(reason.message);
      });
  }

  const [username, setUserName] = useState("");
  const [validateError, setValidateError ] = useState(false);
  const [helperTextValue, setHelperTextValue ] = useState("");
  //const loginFormStyles = useState(["stage-transition-container-variant"]);
  const auth = useAuth();
  const emptyUsername = _.isEmpty(username);

  return (
    <Container maxWidth="sm" style={{ margin: "auto" }}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12}>
          <Card>
            <CardMedia style={{ display: "flex", paddingTop: "1em", paddingBottom: "1em" }}>
              <img src={brandingLogo} style={{ height: "60px", marginLeft: "auto", marginRight: "auto" }} />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Forgot your password?')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Please enter your email address.')}
              </Typography>
              <form style={{ display: "flex", flexDirection: "column" }} noValidate autoComplete="off">
                <TextField
                  id="username"
                  label={t("Email")}
                  value={username}
                  required
                  error={validateError || emptyUsername}
                  onChange={onUsernameChange}
                  helperText={helperTextValue}
                />
              </form>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                onClick={onBack}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onSendResetLink}
                disabled={emptyUsername}
              >
                {t('Send reset link')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  ); 
}

export default RequestPasswordReset;
