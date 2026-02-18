import React from 'react';
import { Text, Box } from 'theme-ui';
import PopoverLabel from './elements/PopoverLabel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { colors as vizColors } from '@tidepool/viz';
import { useTranslation } from 'react-i18next';

const PartialDaysTooltip = () => {
  const { t } = useTranslation();

  return (
    <PopoverLabel
      id="chart-partial-date-info"
      icon={InfoOutlinedIcon}
      iconProps={{ sx: { fontSize: 2, color: vizColors.gray50 } }}
      popoverContent={
        <Box p={1} sx={{ maxWidth: '280px', textAlign: 'center', lineHeight: 0 }}>
          <Text sx={{ color: vizColors.gray50, fontSize: 0 }}>
            {t(`Date ranges ending on the most recent day of data use actual time boundaries (to the
                last data point) rather than midnight-to-midnight. This captures the maximum possible
                data for the period, providing more complete statistics without distortions from an
                empty partial day.`)}
          </Text>
        </Box>
      }
      popoverProps={{
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        transformOrigin: { vertical: 'top', horizontal: 'center' },
        sx: { width: 'auto' },
      }}
      triggerOnHover
    />
  );
};

export default PartialDaysTooltip;
