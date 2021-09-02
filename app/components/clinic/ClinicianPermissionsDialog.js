import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import map from 'lodash/map';
import { Box, Flex, Text } from 'rebass/styled-components';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import {
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import { colors, fontWeights } from '../../themes/baseTheme';
import Icon from '../elements/Icon';

const ClinicianPermissionsDialog = props => {
  const { t, open, onClose } = props;

  const renderPermission = (permission, key) => (
    <Flex py={1} key={key} alignItems="center">
      <Icon color="blueGreyMedium" variant="static" icon={CheckRoundedIcon} label='checkmark icon' mr={2} />
      <Body1 color="blueGreyMedium">{permission}</Body1>
    </Flex>
  );

  const adminPermissions = [
    t('Edit clinic details'),
    t('Add and remove clinician users'),
    t('Change clinician permissions'),
    t('Add patient users'),
    t('Accept patient invites'),
    t('Remove patients from patient list'),
    t('View and upload patient data'),
  ];

  const memberPermissions = [
    t('Add patient users'),
    t('Accept patient invites'),
    t('View and upload patient data'),
    t('View clinic Members'),
  ];

  return (
    <Dialog
      id="permissionsDialog"
      aria-labelledBy="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Clinician Roles and Permissions')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <Flex flexDirection={['column', null, 'row']}>
          <Box px={4} mb={[3, null, 0]}>
            <Body1 py={1} sx={{ fontWeight: fontWeights.bold }}>{t('Clinic Admin can:')}</Body1>
            {map(adminPermissions, renderPermission)}
          </Box>

          <Box px={4}>
            <Body1 py={1} sx={{ fontWeight: fontWeights.bold }}>{t('Clinic Member can:')}</Body1>
            {map(memberPermissions, renderPermission)}
          </Box>
        </Flex>
      </DialogContent>

      <DialogActions>
        <Button
          id="confirmDialogCancel"
          variant="secondary"
          onClick={onClose}
        >
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ClinicianPermissionsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default translate()(ClinicianPermissionsDialog);
