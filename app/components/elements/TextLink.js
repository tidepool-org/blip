import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'rebass/styled-components';
import { TextLink as Text } from '../elements/FontStyles';

export const TextLink = props => {
  const { linkText, link, ...textLinkProps } = props;

  return (
    <div>
      <Box>
        <Text href={link} {...textLinkProps}>{linkText}</Text>
      </Box>
    </div>
  );
};

TextLink.propTypes = {
  label: PropTypes.string.isRequired,
  link: PropTypes.string,
};

export default TextLink;
