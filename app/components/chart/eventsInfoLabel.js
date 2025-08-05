import React from 'react';
import { components as vizComponents } from '@tidepool/viz';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { useTranslation } from 'react-i18next';

import { Box, Flex } from 'theme-ui';
import Icon from '../elements/Icon';
import { Body1 } from '../elements/FontStyles';

const { EventsInfoTooltip } = vizComponents;

const EventsInfoLabel = props => {
  const { hasAlarmEventsInView } = props;
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <Flex
      className="events-label-container"
      ml="44px"
      sx={{
        alignItems: 'center',
        backgroundColor: 'white',
        gap: 1,
        position: 'relative',
        top: '20px',
      }}
    >
      <Box>
        <Body1 sx={{ color: 'stat.text', fontWeight: 'bold' }}>{t('Events')}</Body1>
      </Box>

      {hasAlarmEventsInView && (
        <Flex sx={{ position: 'relative', alignItems: 'center' }}>
          <Icon
            icon={InfoOutlinedIcon}
            color="stat.text"
            sx={{ fontSize: 1 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <Box sx={{ zIndex: 1, position: 'relative' }}>
              <EventsInfoTooltip position={{ top: 0, left: 0 }} />
            </Box>
          )}
        </Flex>
      )}
    </Flex>
  );
};

EventsInfoLabel.displayName = 'EventsInfoLabel';

export default EventsInfoLabel;
