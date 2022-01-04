/**
 * Copyright (c) 2021, Diabeloop
 * Remove a patient for an HCP - Dialog
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
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import MedicalServiceIcon from "../../../components/icons/MedicalServiceIcon";

import { Team, TeamMember, TeamUser, useTeam } from "../../../lib/team";
import { compareValues, getUserFirstLastName } from "../../../lib/utils";
import { makeButtonsStyles } from "../../../components/theme";
import { useAlert } from "../../../components/utils/snackbar";
import { UserInvitationStatus } from "../../../models/generic";

interface RemoveDialogProps {
  isOpen: boolean;
  patient: TeamUser | null;
  onClose: () => void;
}

const makeButtonClasses = makeStyles(makeButtonsStyles, { name: "ylp-dialog-remove-patient-dialog-buttons" });
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      margin: theme.spacing(1),
      position: "relative",
    },
    progressButton: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  }),
);

function RemoveDialog(props: RemoveDialogProps): JSX.Element {
  const { isOpen, onClose, patient } = props;
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const teamHook = useTeam();
  const buttonClasses = makeButtonClasses();
  const classes = useStyles();

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [sortedTeams, setSortedTeams] = useState<Team[]>([]);

  const userName = patient ? getUserFirstLastName(patient) : { firstName: "", lastName: "" };
  const patientName = t("user-name", userName);
  const teamMembers = patient?.members;
  const member = teamMembers?.find(member => member.team.id === selectedTeamId) as TeamMember;

  const getSuccessAlertMessage = () => {
    if (member.status === UserInvitationStatus.pending) {
      return alert.success(t("alert-remove-patient-pending-invitation-success"));
    }
    const team = sortedTeams.find(team => team.id === selectedTeamId) as Team;
    if (team.code === "private") {
      return alert.success(t("alert-remove-private-practice-success", { patientName }));
    }
    return alert.success(t("alert-remove-patient-from-team-success", { teamName: team.name, patientName }));
  };


  const handleOnClose = (): void => {
    onClose();
    setSelectedTeamId("");
  };

  const handleOnClickRemove = async (): Promise<void> => {
    try {
      setProcessing(true);
      await teamHook.removePatient(patient as TeamUser, member, selectedTeamId);
      getSuccessAlertMessage();
      handleOnClose();
    } catch (err) {
      alert.error(t("alert-remove-patient-failure"));
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (teamMembers) {
      if (teamMembers?.length === 1) {
        setSelectedTeamId(teamMembers[0].team.id);
        setSortedTeams([teamMembers[0].team]);
        return;
      }

      // Sorting teams in alphabetical order if there are several
      if (teamMembers?.length > 1) {
        const teams = teamMembers?.map(teamMember => teamMember.team);

        setSortedTeams(teams.sort(compareValues("name")));

        teams.forEach((team, index) => {
          if (team.code === "private") {
            const privatePractice = teams.splice(index, 1)[0];
            teams.unshift(privatePractice);
          }
        });
      }
    }
  }, [teamMembers]);

  return (
    <Dialog
      id="remove-hcp-patient-dialog"
      open={isOpen}
      onClose={handleOnClose}
    >
      <DialogTitle>
        <strong>{t("remove-patient")}</strong>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {t("team-modal-remove-patient-choice", { patientName })}
        </DialogContentText>
      </DialogContent>

      <DialogContent>
        <FormControl
          fullWidth
          required
          variant="outlined"
        >
          <InputLabel>{t("team")}</InputLabel>
          <Select
            id="patient-team-selector"
            label={t("team")}
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value as string)}
          >
            {sortedTeams.map((team, index) => (
              <MenuItem value={team.id} key={index}>
                {team.code === "private" ?
                  <Box display="flex" alignItems="center">
                    <React.Fragment>
                      <Box display="flex" ml={0} mr={1}>
                        <MedicalServiceIcon color="primary" />
                      </Box>
                      {t("private-practice")}
                    </React.Fragment>
                  </Box>
                  : team.name
                }
              </MenuItem>
            ))
            }
          </Select>
        </FormControl>
      </DialogContent>

      {sortedTeams.length === 1 &&
        <DialogContent>
          <DialogContentText>
            {t("modal-remove-patient-info-2")}
          </DialogContentText>
        </DialogContent>
      }

      <DialogActions>
        <Button
          onClick={handleOnClose}
          color="secondary"
          variant="contained"
        >
          {t("button-cancel")}
        </Button>
        <div className={classes.wrapper}>
          <Button
            id="remove-patient-dialog-validate-button"
            onClick={handleOnClickRemove}
            className={buttonClasses.buttonRedAction}
            disabled={!selectedTeamId || processing}
            variant="contained"
          >
            {t("remove-patient")}
          </Button>
          {processing && <CircularProgress size={24} className={classes.progressButton} />}
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveDialog;
