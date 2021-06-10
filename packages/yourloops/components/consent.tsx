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
import _ from "lodash";
import bows from "bows";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";

import brandingLogo from "branding/logo.png";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

import DiabeloopUrl from "../lib/diabeloop-url";
import { useAuth } from "../lib/auth";
import { Profile } from "../models/shoreline";

interface ConsentProps {
  messageKey: string;
}

const style = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      margin: "auto",
      [theme.breakpoints.down('xs')]: {
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
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(0),
      },
    },
    formControl: {
      margin: theme.spacing(3),
      [theme.breakpoints.down('xs')]: {
        margin: 0,
      },
    },
    formHelperText: {
      textAlign: "center",
    },
    formControlLabel: {
      alignItems: "start",
      textAlign: "start",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
        marginRight: 0,
      },
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(5), // eslint-disable-line no-magic-numbers
      marginLeft: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        marginRight: 0,
        marginLeft: 0,
        justifyContent: "space-between",
      },
    },
    button: {
      marginLeft: "auto",
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(1), // eslint-disable-line no-magic-numbers
        marginLeft: theme.spacing(1),
      },
    },
  };
}, { name: "ylp-component-consent" });

/**
 * Patient Consent Page
 */
function Consent(props: ConsentProps): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const historyHook = useHistory<{ from?: { pathname?: string; }; }>();
  const auth = useAuth();
  const classes = style();
  const [terms, setTerms] = React.useState(false);
  const [privacyPolicy, setPrivacyPolicy] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");

  const log = React.useMemo(() => bows("consent"), []);
  const fromPath = React.useMemo(() => historyHook.location.state?.from?.pathname, [historyHook]);

  const linkTermsText = t("terms-and-conditions");
  const linkTerms = DiabeloopUrl.getTermsLink(i18n.language);
  const privacyPolicyText = t("footer-link-url-privacy-policy");
  const linkPrivacyPolicy = DiabeloopUrl.getPrivacyPolicyLink(i18n.language);

  const user = auth.user;
  if (user === null) {
    throw new Error("User must be logged-in");
  }

  const destinationPath = fromPath ?? user.getHomePage();

  const resetFormState = (): void => {
    setError(false);
    setHelperText("");
  };

  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    setState((event.target as HTMLInputElement).checked);
    resetFormState();
  };

  const valideForm = (): boolean => {
    if (terms && privacyPolicy) {
      return true;
    }

    setError(true);
    setHelperText("required");
    return false;
  };

  const onDecline = (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    auth.logout();
  };

  const onConfirm = (/* event: React.MouseEvent<HTMLButtonElement, MouseEvent> */) => {
    resetFormState();
    if (valideForm()) {
      // api call
      const now = new Date().toISOString();
      const updatedProfile = _.cloneDeep(user.profile ?? {}) as Profile;
      updatedProfile.termsOfUse = { acceptanceTimestamp: now, isAccepted: terms };
      updatedProfile.privacyPolicy = { acceptanceTimestamp: now, isAccepted: privacyPolicy };
      auth.updateProfile(updatedProfile).catch((reason: unknown) => {
        log.error(reason);
      }).finally(() => {
        historyHook.push(destinationPath);
      });
    }
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
                <FormControl
                  required
                  component="fieldset"
                  error={error}
                  className={classes.formControl}>
                  <FormHelperText className={classes.formHelperText}>
                    {t(helperText)}
                  </FormHelperText>
                  <FormControlLabel
                    className={classes.formControlLabel}
                    control={
                      <Checkbox
                        id="consent-checkbox-privacypolicy"
                        checked={privacyPolicy}
                        onChange={(e) => onChange(e, setPrivacyPolicy)}
                        color="primary"
                      />
                    }
                    label={
                      <Trans
                        t={t}
                        i18nKey={`signup-consent-${user.role}-privacy-policy`}
                        components={{ linkPrivacyPolicy }}
                        values={{ privacyPolicy: privacyPolicyText }}
                      />
                    }
                  />
                  <FormControlLabel
                    className={classes.formControlLabel}
                    control={
                      <Checkbox
                        id="consent-checkbox-terms"
                        checked={terms}
                        onChange={(e) => onChange(e, setTerms)}
                        color="primary"
                      />
                    }
                    label={
                      <Trans
                        t={t}
                        i18nKey={`signup-consent-${user.role}-terms-condition`}
                        components={{ linkTerms }}
                        values={{ terms: linkTermsText }}
                      />
                    }
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
                      className={classes.button}
                      onClick={onConfirm}>
                      {t("button-accept")}
                    </Button>
                  </div>
                </FormControl>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Consent;
