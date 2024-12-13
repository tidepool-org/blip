import React from 'react';
import { Box, Text } from 'theme-ui';
import personUtils from '../../core/personutils';

const Name = ({ patient }) => {
  const renderedName = personUtils.patientFullName(patient);

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Text as="span" sx={{ color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>
        {renderedName}
      </Text>
    </Box>
  );
};

export default Name;