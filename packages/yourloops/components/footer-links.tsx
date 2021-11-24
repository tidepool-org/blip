/**
 * Copyright (c) 2021, Diabeloop
 * Generic footer links
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
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Tooltip from "@material-ui/core/Tooltip";

import diabeloopUrls from "../lib/diabeloop-url";
import config from "../lib/config";
import metrics from "../lib/metrics";

interface FooterLinksProps {
  atBottom?: boolean;
}

const footerStyle = makeStyles((theme: Theme) => {
  return {
    container: {
      display: "flex",
      fontSize: "small",
    },
    containerAtBottom: {
      marginTop: "auto",
      paddingBottom: "2em",
      paddingTop: "2em",
    },
    rightLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "start",
      marginBottom: "auto",
      marginTop: "auto",
    },
    centeredLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "center",
      marginBottom: "auto",
      marginTop: "auto",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    leftLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "end",
      marginBottom: "auto",
      marginTop: "auto",
    },
    selection: {
      padding: theme.spacing(2),
      textAlign: "center",
    },
    cookiesButton: {
      textTransform: "initial",
      fontSize: "small",
    },
  };
}, { name: "footer-component-styles" });

function FooterLinks(props: FooterLinksProps): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const classes = footerStyle();
  const containerClassName = props.atBottom ? `${classes.container} ${classes.containerAtBottom}` : classes.container;

  const handleShowCookieBanner = () => {
    if (typeof window.openAxeptioCookies === "function") {
      window.openAxeptioCookies();
    }
  };

  const metricsPdfDocument = (title: string) => {
    return () => metrics.send("pdf_document", "view_document", title);
  };

  return (
    <Container id="footer-links-container" className={containerClassName} maxWidth="sm">
      <Grid id="footer-links" container>
        <Grid item xs={4} className={classes.rightLink}>
          <Link id="footer-link-url-privacy-policy" target="_blank" href={diabeloopUrls.getPrivacyPolicyUrL(i18n.language)} rel="nofollow" onClick={metricsPdfDocument("privacy_policy")}>{t("privacy-policy")}</Link>
        </Grid>
        <Grid id="footer-link-app-name" item xs={4} className={classes.centeredLink}>
          <Tooltip id="footer-link-tooltip-app-release-notes" title={t("tooltip-release-notes") as string} aria-label={t("tooltip-release-notes")} placement="right-start">
            <Link id="footer-link-url-release-notes" target="_blank" href={diabeloopUrls.getReleaseNotesURL()} rel="nofollow" onClick={metricsPdfDocument("release_notes")}>
              {`${t("brand-name")} ${config.VERSION}`}
            </Link>
          </Tooltip>
        </Grid>
        <Grid item xs={4} className={classes.leftLink}>
          <Link id="footer-link-url-support" target="_blank" href={diabeloopUrls.SupportUrl} rel="nofollow" onClick={() => metrics.send("support", "click_url_support")}>{t("footer-link-url-support")}</Link>
        </Grid>
        <Grid item xs={4} className={classes.rightLink}>
          <Link id="footer-link-url-terms" target="_blank" href={diabeloopUrls.getTermsUrL(i18n.language)} rel="nofollow" onClick={metricsPdfDocument("terms")}>{t("terms-of-use")}</Link>
        </Grid>
        <Grid item xs={4} className={classes.centeredLink}>
          {/* TODO: Add tooltip + aria label */}
          <Button id="footer-link-cookies" color="primary" variant="text" className={classes.cookiesButton} onClick={handleShowCookieBanner}>{t("cookies")}</Button>
        </Grid>
        <Grid item xs={4} className={classes.leftLink}>
          <Link id="footer-link-url-intended-use" target="_blank" href={diabeloopUrls.getIntendedUseUrL(i18n.language)} rel="nofollow" onClick={metricsPdfDocument("intended_use")}>{t("intended-use")}</Link>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FooterLinks;