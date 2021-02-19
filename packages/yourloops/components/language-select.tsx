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

import React, { useState } from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useTranslation } from "react-i18next";

function LanguageSelect(): JSX.Element {
  const { i18n } = useTranslation();
  const [val, setVal] = useState(i18n.language);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const lang = event.target.value as string;
    i18n.changeLanguage(lang);
    setVal(lang);
  };

  const iconComponent = () => {
    return <ArrowDropDownIcon />;
  };

  const langs = [];
  for (const lang in i18n.options.resources) {
    if (Object.prototype.hasOwnProperty.call(i18n.options.resources, lang)) {
      const language = i18n.options.resources[lang].name;
      langs.push(
        <MenuItem key={lang} value={lang}>
          {language}
        </MenuItem>
      );
    }
  }

  return (
    <FormControl>
      <Select
        disableUnderline
        IconComponent={iconComponent}
        value={val}
        onChange={handleChange}
      >
        {langs}
      </Select>
    </FormControl>
  );
}

export default LanguageSelect;
