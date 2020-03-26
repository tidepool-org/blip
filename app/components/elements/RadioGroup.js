import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text } from 'rebass/styled-components';
import { Radio as Base, RadioProps, Label } from '@rebass/forms';
import styled from 'styled-components';
import map from 'lodash/map';
import cx from 'classnames';

import { Caption } from './FontStyles';
import { default as baseTheme, colors, transitions } from '../../themes/baseTheme';

const StyledRadio = styled(Base)`
  color: ${colors.border.default};
  width: 1.5em;
  height: 1.5em;
  margin-right: .5em;

  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;

  &.checked {
    color: ${colors.purpleMedium};
  }

  &.disabled {
    pointer-events: none;
    color: ${colors.text.primaryDisabled};
  }
`;

const StyledRadioLabel = styled(Text)`
  margin-right: 2em;

  &.disabled {
    color: ${colors.text.primaryDisabled};
  }
`;

const Radio = props => {
  const { label, ...radioProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
  });

  return (
    <Label width="auto" mb="0.5em" alignItems="center">
      <StyledRadio className={classNames} {...radioProps}/>
      <StyledRadioLabel className={classNames} as="span">{label}</StyledRadioLabel>
    </Label>
  )
};

Radio.propTypes = RadioProps;

export const RadioGroup = props => {
  const { disabled, id, label, name, options, value, variant, ...wrapperProps } = props;

  const labelId = `${id}-label`;
  const ariaLabelledBy = label ? labelId : undefined;

  return (
    <Box role="radiogroup" id={id} aria-labelledby={ariaLabelledBy} {...wrapperProps}>
      {label && (
        <Label mb="0.5em" className="label" id={labelId}>
          <Caption>{label}</Caption>
        </Label>
      )}
      <Flex
        className="options"
        justifyContent="flex-start"
        theme={baseTheme}
        variant={variant}
      >
        {map(options, (option, i) => (
          <Radio
            disabled={disabled}
            id={`${name}-${i}`}
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            label={option.label}
          />
        ))}
      </Flex>
    </Box>
  );
};

RadioGroup.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
};

RadioGroup.defaultProps = {
  variant: 'inputs.radios.vertical',
  color: colors.text.default,
};

export default RadioGroup;
