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
  const { t, onClose, onConfirm, open, processing } = props;
  const question = t('Are you sure you want to opt out of sharing your anonymized diabetes device data?');
  const description = t('By clicking “Yes” below, you will stop sharing new data with the Tidepool Big Data Donation Project. Please note that previously donated anonymized data cannot be removed from the project.');

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
          <Paragraph1 sx={{ fontWeight: 'medium'}} data-testid="revoke-consent-question">
            <Text className='question'>{question}</Text>
          </Paragraph1>

          <Paragraph0 sx={{ fontWeight: 'medium'}} data-testid="revoke-consent-description">
            <Text className='description'>{description}</Text>
          </Paragraph0>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          className="revokeConsentCancel"
          variant="secondary"
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>

        <Button
          className="revokeConsentConfirm"
          variant="primary"
          processing={processing}
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
  processing: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(DataDonationRevokeConsentDialog);
