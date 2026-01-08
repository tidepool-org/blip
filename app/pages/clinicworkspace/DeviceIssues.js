import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';

import { MediumTitle } from '../../components/elements/FontStyles';

export const DeviceIssues = (props) => {
  const { t } = props;

  return (
    <Box id="device-issues" p={4}>
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
        }}
      >
        <MediumTitle mb={3}>{t('Device Issues')}</MediumTitle>
        <Text sx={{ color: 'text.primary', fontSize: 1 }}>
          {t('This feature is coming soon. Stay tuned for updates.')}
        </Text>
      </Flex>
    </Box>
  );
};

DeviceIssues.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(DeviceIssues);
