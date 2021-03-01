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

import * as React from "react";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import brandingLogo from "branding/logo.png";
import SignUpStepper from "./signup-stepper";
import { useTranslation } from "react-i18next";
import CardContent from "@material-ui/core/CardContent";
import { SignUpFormStateProvider } from "./signup-formstate-context";
import LoginFooterLink from "../login/login-footer-link";

const formStyle = makeStyles((theme: Theme) => {
  return {
    mainContainer: { margin: "auto" },
    Button: {
      marginLeft: "auto !important",
    },
    Typography: {
      alignItems: "center",
    },
    Card: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      // eslint-disable-next-line no-magic-numbers
      padding: theme.spacing(4),
    },
    CardContent: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  };
});

/**
 * Signup page
 */
function SignUpPage(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = formStyle();

  return (
    <Container maxWidth="sm" className={classes.mainContainer}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={12}>
          <SignUpFormStateProvider>
            <Card className={classes.Card}>
              <CardMedia
                style={{
                  display: "flex",
                  paddingTop: "1em",
                  paddingBottom: "1em",
                }}
              >
                <img
                  src={brandingLogo}
                  style={{
                    height: "60px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  alt={t("Login Branding Logo")}
                />
              </CardMedia>
              <CardContent className={classes.CardContent}>
                <SignUpStepper />
              </CardContent>
            </Card>
            <LoginFooterLink />
          </SignUpFormStateProvider>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SignUpPage;
