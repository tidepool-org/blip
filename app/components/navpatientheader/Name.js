import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Text } from 'theme-ui';
import personUtils from '../../core/personutils';
import { selectPatient } from '../../core/selectors/selectPatient';

const Name = () => {
  const { patient } = useSelector(selectPatient);
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