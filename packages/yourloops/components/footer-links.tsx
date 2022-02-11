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

import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import { Theme, makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import LanguageIcon from "@material-ui/icons/Language";

import LanguageSelector from "../components/language-select";
import diabeloopUrls from "../lib/diabeloop-url";
import { useAuth } from "../lib/auth";
import config from "../lib/config";
import metrics from "../lib/metrics";
import diabeloopLabel from "diabeloop-label.svg";
import diabeloopLogo from "diabeloop-logo.svg";

interface FooterLinksProps {
  atBottom?: boolean;
}

const footerStyle = makeStyles((theme: Theme) => {
  return {
    bySpan: {
      paddingLeft: "12px",
      paddingRight: "12px",
      [theme.breakpoints.down("xs")]: {
        paddingRight: "0",
      },
    },
    centerBox: {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      paddingLeft: "15px",
      paddingRight: "15px",
      [theme.breakpoints.up("sm")]: {
        flexWrap: "wrap",
      },
      [theme.breakpoints.down("sm")]: {
        flexWrap: "wrap",
        order: 1,
        textAlign: "center",
        width: "100%",
      },
      [theme.breakpoints.down("xs")]: {
        justifyContent: "space-around",
        marginLeft: "10px",
        marginRight: "10px",
      },
    },
    container: {
      alignItems: "center",
      boxShadow: "0px -1px 4px rgba(0, 0, 0, 0.25)",
      color: theme.palette.grey[700],
      display: "flex",
      fontSize: "12px",
      padding: "11px",
      [theme.breakpoints.down("sm")]: {
        flexWrap: "wrap",
      },
    },
    containerAbsolute: {
      ["@media (min-height:630px)"]: {
        bottom: "0",
        position: "absolute",
      },
      height: "68px",
      [theme.breakpoints.down("sm")]: {
        height: "149px",
      },
      [theme.breakpoints.down("xs")]: {
        height: "189px",
      },
    },
    containerAuto: {
      height: "68px",
      marginTop: "auto",
      paddingBottom: "11px",
      paddingTop: "11px",
    },
    cookiesManagement: {
      "&:hover": {
        cursor: "pointer",
      },
    },
    diabeloopLogo: {
      paddingRight: "3px",
    },
    diabeloopLink: {
      [theme.breakpoints.down("xs")]: {
        marginTop: "12px",
      },
    },
    languageBox: {
      display: "flex",
      height: "20px",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        display: "inline-block",
        marginTop: "10px",
        marginBottom: "17px",
      },
      [theme.breakpoints.down("xs")]: {
        marginBottom: "27px",
        marginTop: "6px",
      },
    },
    languageIcon: {
      width: "20px",
      marginRight: "18px",
      alignSelf: "center",
      [theme.breakpoints.down("sm")]: {
        marginTop: "3px",
      },
    },
    languageSeparator: {
      alignSelf: "center",
      [theme.breakpoints.down("sm")]: {
        display: "none",
        visibility: "hidden",
      },
    },
    leftBox: {
      width: "134px",
      [theme.breakpoints.down("sm")]: {
        order: 2,
      },
    },
    link: {
      color: theme.palette.grey[700],
      fontWeight: 400,
      [theme.breakpoints.down("xs")]: {
        marginBottom: "15px",
        marginLeft: "0.5rem",
        marginRight: "0.5rem",
        textAlign: "center",
      },
    },
    rightBox: {
      display: "flex",
      justifyContent: "right",
      [theme.breakpoints.down("sm")]: {
        order: 3,
      },
      [theme.breakpoints.down("xs")]: {
        display: "flex",
        flexDirection: "column",
        textAlign: "right",
      },
    },
    separator: {
      paddingLeft: "15px",
      paddingRight: "15px",
      [theme.breakpoints.down("xs")]: {
        display: "none",
        visibility: "hidden",
      },
    },
    sideBox: {
      flex: "1",
    },
    supportButton: {
      height: "46px",
      width: "134px",
      [theme.breakpoints.down("xs")]: {
        marginTop: "10px",
      },
    },
    svg: {
      height: "12px",
      verticalAlign: "middle",
      display: "inline-block",
    },
    versionSpan: {
      textDecoration: "underline",
    },
  };
}, { name: "footer-component-styles" });

function FooterLinks(props: FooterLinksProps): JSX.Element {
  const { t, i18n } = useTranslation("yourloops");
  const { user } = useAuth();
  const classes = footerStyle();
  const containerClassName = props.atBottom ? classes.containerAuto : classes.containerAbsolute;

  const handleShowCookieBanner = () => {
    if (typeof window.openAxeptioCookies === "function") {
      window.openAxeptioCookies();
    }
  };

  const metricsPdfDocument = (title: string) => {
    return () => metrics.send("pdf_document", "view_document", title);
  };

  return (
    <Container id="footer-links-container" className={`${classes.container} ${containerClassName}`} maxWidth={false}>
      <Box className={`${classes.sideBox} ${classes.leftBox}`}>
        <Box className={classes.supportButton}></Box>
      </Box>
      <Box className={classes.centerBox}>
        {!user &&
          <Box id="footer-language-box" className={classes.languageBox}>
            <LanguageIcon className={classes.languageIcon}></LanguageIcon>
            <LanguageSelector />
            <Box className={`${classes.separator} ${classes.languageSeparator}`}>|</Box>
          </Box>
        }
        <Link
          id="footer-link-url-privacy-policy"
          target="_blank"
          href={diabeloopUrls.getPrivacyPolicyUrL(i18n.language)}
          rel="nofollow"
          onClick={metricsPdfDocument("privacy_policy")}
          className={classes.link}
        >
          {t("privacy-policy")}
        </Link>
        <Box className={classes.separator}>|</Box>
        <Link
          id="footer-link-url-terms"
          target="_blank"
          href={diabeloopUrls.getTermsUrL(i18n.language)}
          rel="nofollow"
          onClick={metricsPdfDocument("terms")}
          className={classes.link}
        >
          {t("terms-of-use")}
        </Link>
        <Box className={classes.separator}>|</Box>
        <Link
          id="footer-link-url-intended-use"
          target="_blank"
          href={diabeloopUrls.getIntendedUseUrL(i18n.language)}
          rel="nofollow"
          onClick={metricsPdfDocument("intended_use")}
          className={classes.link}
        >
          {t("intended-use")}
        </Link>
        <Box className={classes.separator}>|</Box>
        <Link id="footer-link-cookies-management"
          className={`${classes.link} ${classes.cookiesManagement}`}
          onClick={handleShowCookieBanner}
        >
          {t("cookies-management")}
        </Link>
        <Box className={classes.separator}>|</Box>
        <Link
          id="footer-link-url-cookies-policy"
          target="_blank"
          href={diabeloopUrls.getCookiesPolicyUrl(i18n.language)}
          rel="nofollow"
          onClick={metricsPdfDocument("yourloops-cookiepolicy")}
          className={classes.link}
        >
          {t("cookies-policy")}
        </Link>
      </Box>
      <Box className={`${classes.sideBox} ${classes.rightBox}`}>
        <Box>
          {t("brand-name")}
          <Tooltip
            id="footer-link-tooltip-app-release-notes"
            title={t("tooltip-release-notes") as string}
            aria-label={t("tooltip-release-notes")}
            placement="right-start"
          >
            <Link
              id="footer-link-url-release-notes"
              target="_blank"
              href={diabeloopUrls.getReleaseNotesURL()}
              rel="nofollow"
              onClick={metricsPdfDocument("release_notes")}
              className={classes.link}
            >
              <span className={classes.versionSpan}>&nbsp;v{config.VERSION}</span>
            </Link>
          </Tooltip>
          <span className={classes.bySpan}>by </span>
        </Box>
        <Link id="footer-link-url-diabeloop" className={classes.diabeloopLink} target="_blank" href={diabeloopUrls.SupportUrl} rel="nofollow" >
          <img src={diabeloopLogo} alt={t("alt-img-logo")} className={`${classes.svg} ${classes.diabeloopLogo}`} />
          <img src={diabeloopLabel} alt={t("alt-img-logo")} className={classes.svg} />
        </Link>
      </Box>
    </Container >
  );
}

export default FooterLinks;
