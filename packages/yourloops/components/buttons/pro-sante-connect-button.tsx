/**
 * Copyright (c) 2022, Diabeloop
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
import proSanteLogo from "pro-sante-connect.svg";

import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

interface Props {
  onClick: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: "center",
    [theme.breakpoints.only("xs")]: {
      display: "flex",
      alignItems: "center",
    },
  },
  button: {
    "width": "90%",
    "&:hover": {
      backgroundColor: "transparent",
    },
    [theme.breakpoints.only("xs")]: {
      width: "70%",
    },
  },
  label: {
    [theme.breakpoints.only("xs")]: {
      fontWeight: 600,
      padding: 5,
    },
    [theme.breakpoints.up("sm")]: {
      position: "absolute",
      bottom: "-18px",
      left: "20px",
    },
  },
}));

function ProSanteConnectButton({ onClick }: Props): JSX.Element {
  const { button, label, container } = useStyles();
  const { t } = useTranslation("yourloops");

  return (
    <Box className={container}>
      <Button
        id="pro-sante-connect-button"
        href=""
        disableRipple
        disableElevation
        disableFocusRipple
        className={button}
        onClick={onClick}
      >
        <img src={proSanteLogo} alt={t("alt-img-pro-sante-logo")} />
      </Button>
      <span className={label}>{t("certify-professional-account")}</span>
    </Box>
  );
}

export default ProSanteConnectButton;
