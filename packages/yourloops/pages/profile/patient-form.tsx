/**
 * Copyright (c) 2021, Diabeloop
 * Profile page - Patient part
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
import { tz } from "moment-timezone";
import { useTranslation } from "react-i18next";

import { ClassNameMap } from "@material-ui/styles/withStyles";
import TextField from "@material-ui/core/TextField";

import { User } from "../../lib/auth";
import { Errors } from "./models";

interface PatientProfileFormProps {
  user: User;
  classes: ClassNameMap<"formInput">;
  birthDate?: string;
  setBirthDate: React.Dispatch<string>;
  errors: Errors;
}

function PatientProfileForm(props: PatientProfileFormProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const { user, birthDate, setBirthDate, classes, errors } = props;

  const browserTimezone = React.useMemo(() => new Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const a1cDate = user.settings?.a1c?.date;
  const a1cValue = user.settings?.a1c?.value;

  return (
    <React.Fragment>
      <TextField
        id="profile-textfield-birthdate"
        label={t("patient-profile-birthdate")}
        value={birthDate}
        onChange={event => setBirthDate(event.target.value)}
        error={errors.birthDate}
        helperText={errors.birthDate && t("required-field")}
        className={classes.formInput}
      />
      {a1cValue && a1cDate &&
        <TextField
          id="hbA1c"
          label={t("patient-profile-hba1c", { hba1cMoment: tz(a1cDate, browserTimezone).format("L") })}
          disabled
          value={`${a1cValue}%`}
          className={classes.formInput}
        />
      }
    </React.Fragment>
  );
}

export default PatientProfileForm;
