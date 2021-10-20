/**
 * Copyright (c) 2021, Diabeloop
 * Patient list cards for HCPs (mobile display)
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

import _ from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, Theme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import AccessTimeIcon from "@material-ui/icons/AccessTime";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import FlagIcon from "@material-ui/icons/Flag";
import FlagOutlineIcon from "@material-ui/icons/FlagOutlined";

import { SortFields } from "../../../models/generic";
import { MedicalData } from "../../../models/device-data";
import { getUserFirstLastName } from "../../../lib/utils";
import metrics from "../../../lib/metrics";
import { useAuth } from "../../../lib/auth";
import { TeamUser, useTeam } from "../../../lib/team";
import { addPendingFetch, removePendingFetch } from "../../../lib/data";
import { PatientListProps, PatientElementCardProps } from "./models";
import { getMedicalValues, translateSortField } from "./utils";

const patientListStyle = makeStyles(
  (theme: Theme) => {
    return {
      patientPaperCard: {
        marginBottom: theme.spacing(1),
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        padding: theme.spacing(2),
      },
      patientDivPendingIcon: {
        display: "flex",
        height: "100%",
        marginRight: theme.spacing(2),
      },
      patientDivIndicators: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      patientDivIndicator: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      },
      flagButton: {
        color: theme.palette.primary.main,
      },
      showPatientButton: {
        marginLeft: "auto",
      },
    };
  },
  { name: "ylp-hcp-patients-cards" }
);

function PatientCard(props: PatientElementCardProps): JSX.Element {
  const { trNA, trTIR, trTBR, trUpload, patient, flagged, onFlagPatient, onClickPatient } = props;
  const { t } = useTranslation("yourloops");
  const classes = patientListStyle();
  const authHook = useAuth();
  const teamHook = useTeam();
  const [medicalData, setMedicalData] = React.useState<MedicalData | null | undefined>(patient.medicalData);
  const paperRef = React.createRef<HTMLDivElement>();

  const userId = patient.userid;
  const isFlagged = flagged.includes(userId);
  const { tir, tbr, lastUpload } = React.useMemo(() => getMedicalValues(medicalData, trNA), [medicalData, trNA]);

  const isPendingInvitation = teamHook.isOnlyPendingInvitation(patient);
  const fullName = t("user-name", getUserFirstLastName(patient));

  React.useEffect(() => {
    // Same code in table.tsx
    if (isPendingInvitation || !_.isNil(medicalData)) {
      // For pending invitations we can't fetch indicators information.
      return _.noop;
    }
    const session = authHook.session();
    const observedElement = paperRef.current;
    if (session === null || observedElement === null) {
      // First render or to make typescript happy
      return _.noop;
    }
    /** If unmounted, we want to discard the result, react don't like to update an unmounted component */
    let componentMounted = true;
    const observer = new IntersectionObserver((entries) => {
      const cardDisplayed = entries[0];
      if (cardDisplayed.intersectionRatio > 0) {
        // Displayed: queue the fetch
        addPendingFetch(session, patient)
          .then((md) => {
            if (typeof md !== "undefined") {
              teamHook.setPatientMedicalData(patient.userid, md);
              if (componentMounted) setMedicalData(md);
            }
          })
          .catch(() => {
            teamHook.setPatientMedicalData(patient.userid, null);
            if (componentMounted) setMedicalData(null);
          });
      } else {
        // No longer displayed, cancel the fetch
        removePendingFetch(patient);
      }
    });

    observer.observe(observedElement);

    return (): void => {
      // Effect callback -> cancel subscriptions to the observer
      // and the API fetch
      observer.disconnect();
      removePendingFetch(patient);
      componentMounted = false;
    };
  }, [paperRef, isPendingInvitation, authHook, medicalData, patient, teamHook]);

  if (isPendingInvitation) {
    const email = _.get(patient, "emails[0]", patient.username);
    return (
      <Paper id={`patients-list-card-${email}`} className={classes.patientPaperCard} data-userid={email}>
        <div className={classes.patientDivPendingIcon}>
          <AccessTimeIcon id={`patients-list-card-${email}-pendingicon`}/>
        </div>
        <Link
          color="textPrimary"
          id={`patients-list-card-${email}-email-link`}
          href={`mailto:${email}`}
          target="_blank"
          rel="noreferrer">
          {email}
        </Link>
      </Paper>
    );
  }

  const onClickFlag = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onFlagPatient(userId);
    metrics.send("patient_selection", "flag_patient", isFlagged ? "un-flagged" : "flagged");
  };
  const handleShowPatientData = (/* e: React.MouseEvent */): void => {
    onClickPatient(patient);
    metrics.send("patient_selection", "select_patient", isFlagged ? "flagged" : "un-flagged");
  };

  return (
    <Paper id={`patients-list-card-${userId}`} className={classes.patientPaperCard} ref={paperRef} data-userid={userId}>
      <IconButton
        id={`patients-list-card-${userId}-flag-btn`}
        className={classes.flagButton}
        aria-label={t("aria-flag-patient")}
        size="small"
        onClick={onClickFlag}>
        {isFlagged ? <FlagIcon id={`patients-list-card-${userId}-flagged-icon`} /> : <FlagOutlineIcon id={`patients-list-card-${userId}-un-flagged-icon`} />}
      </IconButton>
      <Typography id={`patients-list-card-${userId}-fullname`} component="span">
        {fullName}
      </Typography>
      <IconButton
        id={`patients-list-card-${userId}-show-btn`}
        className={classes.showPatientButton}
        size="small"
        onClick={handleShowPatientData}>
        {<ArrowForwardIcon />}
      </IconButton>

      <div id={`patients-list-card-${userId}-indicators`} className={classes.patientDivIndicators}>
        <div id={`patients-list-card-${userId}-indicator-tir`} className={classes.patientDivIndicator}>
          <Typography
            id={`patients-list-card-${userId}-indicator-tir-title`}
            variant="overline"
            component="span"
            style={{ fontWeight: "bold" }}>
            {trTIR}
          </Typography>
          <Typography id={`patients-list-card-${userId}-indicator-tir-value`} variant="body2" component="span">
            {tir}
          </Typography>
        </div>
        <div id={`patients-list-card-${userId}-indicator-tbr`} className={classes.patientDivIndicator}>
          <Typography
            id={`patients-list-card-${userId}-indicator-tbr-title`}
            variant="overline"
            component="span"
            style={{ fontWeight: "bold" }}>
            {trTBR}
          </Typography>
          <Typography id={`patients-list-card-${userId}-indicator-tbr-value`} variant="body2" component="span">
            {tbr}
          </Typography>
        </div>
        <div id={`patients-list-card-${userId}-indicator-upload`} className={classes.patientDivIndicator}>
          <Typography
            id={`patients-list-card-${userId}-indicator-upload-title`}
            variant="overline"
            component="span"
            style={{ fontWeight: "bold" }}>
            {trUpload}
          </Typography>
          <Typography
            id={`patients-list-card-${userId}-indicator-upload-value`}
            variant="body2"
            component="span"
            style={{ marginLeft: "auto" }}>
            {lastUpload}
          </Typography>
        </div>
      </div>
    </Paper>
  );
}

function PatientListCards(props: PatientListProps): JSX.Element {
  const { patients, flagged, onClickPatient, onFlagPatient } = props;
  const { t } = useTranslation("yourloops");
  // const [anchorMenuEl, setAnchorMenuEl] = React.useState<null | HTMLElement>(null);

  const trNA = t("N/A");
  const trTIR = translateSortField(t, SortFields.tir);
  const trTBR = translateSortField(t, SortFields.tbr);
  const trUpload = translateSortField(t, SortFields.upload);
  const cardsElements = patients.map((teamUser: TeamUser): JSX.Element => {
    return (
      <PatientCard
        key={teamUser.userid}
        patient={teamUser}
        flagged={flagged}
        onFlagPatient={onFlagPatient}
        onClickPatient={onClickPatient}
        trNA={trNA}
        trTIR={trTIR}
        trTBR={trTBR}
        trUpload={trUpload}
      />
    );
  });

  // TODO: Sort is disabled for now, we will see how to do the UI later:

  // const handleSortOrderChange = () => {
  //   onSortList(orderBy, order === SortDirection.asc ? SortDirection.desc : SortDirection.asc);
  // };
  // const handleClickMenuSortField = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorMenuEl(event.currentTarget);
  // };
  // const handleCloseMenu = () => {
  //   setAnchorMenuEl(null);
  // };
  // const handleSelectOrderBy = (fieldName: SortFields) => {
  //   handleCloseMenu();
  //   onSortList(fieldName, order);
  // };
  // const menuItems: JSX.Element[] = Object.values(SortFields).map((fieldName: SortFields) => (
  //   <MenuItem
  //     key={fieldName}
  //     selected={orderBy === fieldName}
  //     onClick={(/* event */) => handleSelectOrderBy(fieldName)}
  //   >
  //     {translateSortField(t, fieldName)}
  //   </MenuItem>
  // ));
  // const sortMenu = (
  //   <div>
  //     <IconButton size="small" onClick={handleSortOrderChange}>
  //       {order === SortDirection.asc ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
  //     </IconButton>
  //     <Button aria-haspopup="true" onClick={handleClickMenuSortField} color="secondary" size="small" startIcon={<MoreVertIcon />}>
  //       {translateSortField(orderBy)}
  //     </Button>
  //     <Menu
  //       id="patients-list-menu-sort-field"
  //       anchorEl={anchorMenuEl}
  //       keepMounted
  //       open={Boolean(anchorMenuEl)}
  //       onClose={handleCloseMenu}
  //     >
  //       {menuItems}
  //     </Menu>
  //   </div>
  // );

  return <React.Fragment>{cardsElements}</React.Fragment>;
}

export default PatientListCards;
