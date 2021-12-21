/**
 * Copyright (c) 2021, Diabeloop
 * Confirm Password Reset page
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
import { useTranslation } from "react-i18next";
import { makeStyles, Theme } from "@material-ui/core/styles";

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import brandingLogo from "branding/logo.png";
import LanguageSelector from "../../components/language-select";
import ResetPasswordContent from "./reset-password-content";

const formStyle = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      display: "flex",
      flexDirection: "column",
    },
    divLanguageSelector: {
      marginLeft: "auto",
      marginRight: "auto",
      padding: "16px",
    },
    Card: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
      },
    },
  };
});

/**
 * ConfirmPasswordReset page
 */
function ConfirmPasswordResetPage(): JSX.Element {
  const { t } = useTranslation("yourloops");
  const classes = formStyle();

  return (
    <Container maxWidth="sm" className={classes.mainContainer}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        justify="center">
        <Grid item xs={12}>
          <Card className={classes.Card}>
            <CardMedia
              style={{
                display: "flex",
                paddingTop: "1em",
                paddingBottom: "1em",
              }}>
              <img
                src={brandingLogo}
                alt={t("alt-img-logo")}
                style={{
                  height: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </CardMedia>
            <ResetPasswordContent />
          </Card>
        </Grid>
      </Grid>
      <div className={classes.divLanguageSelector}>
        <LanguageSelector />
      </div>
    </Container>
  );
}

export default ConfirmPasswordResetPage;
