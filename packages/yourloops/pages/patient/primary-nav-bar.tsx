/**
 * Copyright (c) 2021, Diabeloop
 * Patient nav bar
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
import { useHistory } from "react-router-dom";

import MenuItem from "@material-ui/core/MenuItem";
import HeaderBar, { HeaderActions } from "../../components/header-bars/primary";

interface PrimaryNavBarProps {
  prefixURL: string;
}

function PatientNavBar(props: PrimaryNavBarProps): JSX.Element {
  const { t } = useTranslation("yourloops");
  const history = useHistory();
  const refHeaderBar = React.useRef<HeaderActions>(null);

  const caregiversURL = `${props.prefixURL}/caregivers`;
  const teamURL = `${props.prefixURL}/teams`;

  const handleOpenCaregiversPage = () => {
    if (refHeaderBar.current) {
      refHeaderBar.current.closeMenu();
    }
    history.push(caregiversURL);
  };

  const handleOpenMedicalTeamsPage = () => {
    if (refHeaderBar.current) {
      refHeaderBar.current.closeMenu();
    }
    history.push(teamURL);
  };

  const menuCaregiverDisabled = history.location.pathname === caregiversURL;
  const menuTeamsDisabled = history.location.pathname === teamURL;

  const menuItems = [
    <MenuItem id="menu-caregivers" key="menu-caregivers" disabled={menuCaregiverDisabled} onClick={handleOpenCaregiversPage}>
      {t("menu-caregivers")}
    </MenuItem>,
    <MenuItem id="menu-medical-teams" key="menu-medical-teams" disabled={menuTeamsDisabled} onClick={handleOpenMedicalTeamsPage}>
      {t("menu-medical-teams")}
    </MenuItem>,
  ];

  return <HeaderBar menuItems={menuItems} actions={refHeaderBar} />;
}

export default PatientNavBar;
