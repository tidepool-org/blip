/**
 * Copyright (c) 2021, Diabeloop
 * Generic Secondary Header Bar
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

import { Theme, makeStyles } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

interface SecondaryHeaderBarProps {
  children?: React.ReactNode;
}

const pageBarStyles = makeStyles((theme: Theme) => {
  return {
    appBar: {
      boxShadow: "0px 1px 2px #00000029",
      borderWidth: "0px",
    },
    toolBar: {
      display: "grid",
      gridTemplateRows: "auto",
      gridTemplateColumns: "1fr 1fr 1fr",
      paddingLeft: theme.spacing(12), // eslint-disable-line no-magic-numbers
      paddingRight: theme.spacing(12), // eslint-disable-line no-magic-numbers
      [theme.breakpoints.down("lg")]: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
      },
      [theme.breakpoints.down("sm")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
      },
    },
  };
});

function SecondaryHeaderBar(props: SecondaryHeaderBarProps): JSX.Element {
  const classes = pageBarStyles();
  return (
    <AppBar id="secondary-header-bar" position="static" color="secondary" variant="outlined" className={classes.appBar}>
      <Toolbar id="secondary-toolbar" className={classes.toolBar}>
        {props.children}
      </Toolbar>
    </AppBar>
  );
}

export default SecondaryHeaderBar;
