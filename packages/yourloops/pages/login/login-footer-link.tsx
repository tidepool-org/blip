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
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";

import LanguageSelect from "../../components/language-select";
import diabeloopUrls from "../../lib/diabeloop-url";
import config from "../../lib/config";

const loginStyle = makeStyles((theme: Theme) => {
  return {
    rightLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "start",
      fontSize: "small",
    },
    centeredLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "center",
      color: "#109182",
    },
    leftLink: {
      padding: theme.spacing(0.5), // eslint-disable-line no-magic-numbers
      textAlign: "end",
      fontSize: "small",
    },
    selection: {
      padding: theme.spacing(2),
      textAlign: "center",
      fontSize: "small",
    },
  };
});

function LoginFooterLink(): JSX.Element {
  const { t, i18n } = useTranslation();
  const classes = loginStyle();
  return (
    <Grid container>
      <Grid item xs={12} className={classes.selection}>
        <LanguageSelect />
      </Grid>
      <Grid item xs={4} className={classes.rightLink}>
        <Link href={diabeloopUrls.getPrivacyPolicyUrL(i18n.language)}>
          {t(diabeloopUrls.PrivacyPolicy)}
        </Link>
      </Grid>
      <Grid item xs={4} className={classes.centeredLink}>
        <Typography
          style={{
            fontSize: "small",
          }}
        >
          {`${t("Yourloops")} ${config.VERSION}`}
        </Typography>
      </Grid>
      <Grid item xs={4} className={classes.leftLink}>
        <Link href={diabeloopUrls.SupportUrl}>
          {t(diabeloopUrls.Support)}
        </Link>
      </Grid>
      <Grid item xs={6} className={classes.rightLink}>
        <Link href={diabeloopUrls.getTermsUrL(i18n.language)}>
          {t(diabeloopUrls.Terms)}
        </Link>
      </Grid>
      <Grid item xs={6} className={classes.leftLink}>
        <Link href={diabeloopUrls.getIntendedUseUrL(i18n.language)}>
          {t(diabeloopUrls.IntendedUse)}
        </Link>
      </Grid>
    </Grid>
  );
}

export default LoginFooterLink;
