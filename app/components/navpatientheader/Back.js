import React from 'react';
import { Box } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';

import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';

import Button from '../elements/Button';

const Back = ({ t, onClick }) => {
  return (
    <Box
      pr={3}
      mx={[0, '-16px', 0, '-8px']}
      sx={{ borderRight: `1px solid ${vizColors.gray10}` }}
    >
      <Button
        id="navPatientHeader_backButton"
        onClick={onClick}
        icon={ChevronLeftRoundedIcon}
        iconLabel="Back"
        variant='textSecondary'
        iconPosition='left'
        iconFontSize='1.25em'
        sx={{ fontSize: 1 }}
        pl={0}
      >
        {t('Back')}
      </Button>
    </Box>
  )
}

export default withTranslation()(Back);
