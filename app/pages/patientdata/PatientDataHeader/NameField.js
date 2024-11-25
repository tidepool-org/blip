import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

const NameField = ({ name }) => (
  <Box sx={{ flexShrink: 0, marginRight: 'auto' }}>
    <Text as="span" sx={{ color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>
      {name}
    </Text>
  </Box>
);

export default NameField;