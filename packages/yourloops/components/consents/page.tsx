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

import React from "react";
import _ from "lodash";
import bows from "bows";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";

import brandingLogo from "branding/logo.png";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { HistoryState } from "../../models/generic";
import { Profile, UserRoles } from "../../models/shoreline";
import { useAuth } from "../../lib/auth";
import ConsentForm from "./form";

interface ConsentProps {
  messageKey: string;
}

const style = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      margin: "auto",
      [theme.breakpoints.down("xs")]: {
        margin: 0,
        padding: 0,
      },
    },
    card: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      padding: theme.spacing(4),
    },
    cardContent: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(0),
      },
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(5), // eslint-disable-line no-magic-numbers
      marginLeft: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
        marginRight: 0,
        marginLeft: 0,
        justifyContent: "space-between",
      },
    },
    button: {
      marginLeft: "auto",
      [theme.breakpoints.down("sm")]: {
        marginRight: theme.spacing(1), // eslint-disable-line no-magic-numbers
        marginLeft: theme.spacing(1),
      },
    },
  };
}, { name: "ylp-component-consent" });

/**
 * Renew consents page
 */
function Page(props: ConsentProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const historyHook = useHistory<HistoryState>();
  const auth = useAuth();
  const classes = style();
  const [policyAccepted, setPolicyAccepted] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [feedbackAccepted, setFeedbackAccepted] = React.useState(Boolean(auth.user?.profile?.contactConsent?.isAccepted));
  const log = React.useMemo(() => bows("consent"), []);
  const fromPath = React.useMemo(() => historyHook.location.state?.from?.pathname, [historyHook]);

  const user = auth.user;
  if (user === null) {
    throw new Error("User must be logged-in");
  }

  const destinationPath = fromPath ?? user.getHomePage();
  const consentsChecked = policyAccepted && termsAccepted;
  // Ask for feedback only if the user is an HCP, and didn't have previously
  // see that option (e.g. Account created before it was implemented)
  const showFeedback = user.role === UserRoles.hcp && _.isNil(user.profile?.contactConsent);

  const onDecline = (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    auth.logout().catch((reason) => console.error("logout", reason));
  };

  const onConfirm = (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    // api call
    const now = new Date().toISOString();
    const updatedProfile = _.cloneDeep(user.profile ?? {}) as Profile;
    updatedProfile.termsOfUse = { acceptanceTimestamp: now, isAccepted: termsAccepted };
    updatedProfile.privacyPolicy = { acceptanceTimestamp: now, isAccepted: policyAccepted };
    if (showFeedback) {
      updatedProfile.contactConsent = { acceptanceTimestamp: now, isAccepted: feedbackAccepted };
    }
    auth.updateProfile(updatedProfile).catch((reason: unknown) => {
      log.error(reason);
    }).finally(() => {
      historyHook.push(destinationPath);
    });
  };

  return (
    <Container maxWidth="sm" className={classes.mainContainer}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardMedia
              style={{
                display: "flex",
                paddingTop: "1em",
                paddingBottom: "1em",
              }}>
              <img
                src={brandingLogo}
                style={{
                  height: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
                alt={t("alt-img-logo")}
              />
            </CardMedia>
            <CardContent className={classes.cardContent}>
              <Typography variant="body1" gutterBottom>
                {t(props.messageKey)}
              </Typography>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                noValidate
                autoComplete="off">
                <ConsentForm
                  id="login-renew-consents"
                  userRole={user.role}
                  policyAccepted={policyAccepted}
                  setPolicyAccepted={setPolicyAccepted}
                  termsAccepted={termsAccepted}
                  setTermsAccepted={setTermsAccepted}
                  feedbackAccepted={feedbackAccepted}
                  setFeedbackAccepted={showFeedback ? setFeedbackAccepted : undefined}
                />
                <div id="consent-button-group" className={classes.buttons}>
                  <Button
                    id="consent-button-decline"
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    onClick={onDecline}>
                    {t("button-decline")}
                  </Button>
                  <Button
                    id="consent-button-confirm"
                    variant="contained"
                    color="primary"
                    disabled={!consentsChecked}
                    className={classes.button}
                    onClick={onConfirm}>
                    {t("button-accept")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Page;
