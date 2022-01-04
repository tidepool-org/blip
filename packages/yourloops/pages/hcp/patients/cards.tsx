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

import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import FlagIcon from "@material-ui/icons/Flag";
import FlagOutlineIcon from "@material-ui/icons/FlagOutlined";

import { SortFields } from "../../../models/generic";
import { MedicalData } from "../../../models/device-data";
import { getUserFirstLastName } from "../../../lib/utils";
import metrics from "../../../lib/metrics";
import { useAuth } from "../../../lib/auth";
import { TeamUser, useTeam } from "../../../lib/team";
import { addPendingFetch, removePendingFetch } from "../../../lib/data";
import { PatientElementCardProps, PatientListProps } from "./models";
import { getMedicalValues, translateSortField } from "./utils";

import PendingPatientCard from "./pending-patient-card";
import PersonRemoveIcon from "../../../components/icons/PersonRemoveIcon";
import IconActionButton from "../../../components/buttons/icon-action";

const patientListStyle = makeStyles(theme => ({
  patientPaperCard: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  patientDivIndicator: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flagButton: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  removePatientButton: {
    marginLeft: theme.spacing(0.5),
  },
  fullWidth: {
    width: "100%",
  },
}), { name: "ylp-hcp-patients-cards" });

function PatientCard(props: PatientElementCardProps): JSX.Element {
  const { patient, flagged, onFlagPatient, onClickPatient, onClickRemovePatient, trNA, trTIR, trTBR, trUpload } = props;
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

  const onClickFlag = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onFlagPatient(userId);
    metrics.send("patient_selection", "flag_patient", isFlagged ? "un-flagged" : "flagged");
  };

  const handleShowPatientData = (): void => {
    onClickPatient(patient);
    metrics.send("patient_selection", "select_patient", isFlagged ? "flagged" : "un-flagged");
  };

  const onClickRemoveIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickRemovePatient(patient);
  };

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

  return (
    <Paper
      id={`patients-list-card-${userId}`}
      className={classes.patientPaperCard}
      ref={paperRef}
      data-userid={userId}
      onClick={handleShowPatientData}
    >
      <Box display="flex" alignItems="center" px={1} width="100%">
        <IconButton
          id={`patients-list-card-${userId}-flag-btn`}
          className={classes.flagButton}
          aria-label={t("aria-flag-patient")}
          size="small"
          onClick={onClickFlag}>
          {isFlagged ?
            <FlagIcon id={`patients-list-card-${userId}-flagged-icon`} />
            : <FlagOutlineIcon id={`patients-list-card-${userId}-un-flagged-icon`} />
          }
        </IconButton>
        <Typography id={`patients-list-card-${userId}-fullname`} className={classes.fullWidth}>
          {fullName}
        </Typography>
        <IconActionButton
          icon={<PersonRemoveIcon />}
          className={classes.removePatientButton}
          id={`patients-list-card-${userId}-remove-btn`}
          onClick={onClickRemoveIcon}
        />
      </Box>

      <Box
        id={`patients-list-card-${userId}-indicators`}
        display="flex"
        flexDirection="column"
        width="100%"
        px={2}
      >
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
      </Box>
    </Paper>
  );
}

function Cards(props: PatientListProps): JSX.Element {
  const { patients, flagged, onClickPatient, onFlagPatient, onClickRemovePatient } = props;
  const { t } = useTranslation("yourloops");
  const teamHook = useTeam();

  const trNA = t("N/A");
  const trTIR = translateSortField(t, SortFields.tir);
  const trTBR = translateSortField(t, SortFields.tbr);
  const trUpload = translateSortField(t, SortFields.upload);

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

  return (
    <React.Fragment>
      {patients.map((teamUser: TeamUser, index): JSX.Element => (
        <React.Fragment key={index}>
          {teamHook.isOnlyPendingInvitation(teamUser) ?
            <PendingPatientCard patient={teamUser} onClickRemovePatient={() => onClickRemovePatient} />
            : <PatientCard
              key={index}
              trNA={trNA}
              trTIR={trTIR}
              trTBR={trTBR}
              trUpload={trUpload}
              patient={teamUser}
              flagged={flagged}
              onClickPatient={onClickPatient}
              onFlagPatient={onFlagPatient}
              onClickRemovePatient={onClickRemovePatient}
            />
          }
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

export default Cards;
