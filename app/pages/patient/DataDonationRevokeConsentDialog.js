import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';

import Button from '../../components/elements/Button';
import { MediumTitle, Paragraph0, Paragraph1 } from '../../components/elements/FontStyles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

export const DataDonationRevokeConsentDialog = (props) => {
  const { t, onClose, onConfirm, open } = props;
  const title = t('Are you sure you want to opt out of sharing your anonymized diabetes device data?');
  const message = t('By clicking “Yes” below, you will stop sharing new data with the Tidepool Big Data Donation Project. Please note that previously donated anonymized data cannot be removed from the project.');

  return (
    <Dialog
      id="dataDonationRevokeConsentDialog"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Stop Sharing Data?')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Paragraph1 sx={{ fontWeight: 'medium'}}>
            <Text className='title' variant="bold">{title}</Text>
          </Paragraph1>

          <Paragraph0 sx={{ fontWeight: 'medium'}}>
            <Text className='message'>{message}</Text>
          </Paragraph0>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          className="revoke-data-donation-cancel"
          variant="secondary"
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>

        <Button
          className="revoke-data-donation-confirm"
          variant="primary"
          onClick={onConfirm}
        >
          {t('Yes, stop sharing')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DataDonationRevokeConsentDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(DataDonationRevokeConsentDialog);
