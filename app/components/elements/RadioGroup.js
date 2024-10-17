import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text, Radio as Base, RadioProps, Label } from 'theme-ui';
import styled from '@emotion/styled';
import map from 'lodash/map';
import cx from 'classnames';

import { Caption } from './FontStyles';
import {
  default as baseTheme,
  colors,
  fontWeights,
  transitions,
} from '../../themes/baseTheme';

const StyledRadio = styled(Base)`
  color: ${colors.border.default};
  width: 2em;
  height: 2em;
  padding: .25em;
  margin-right: 0.5em;

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

  &.error {
    color: ${colors.feedback.danger};
  }
`;

const StyledRadioLabel = styled(Text)`
  display: inline-block;
  margin-right: 2em;
  margin-top: .3em;

  &.disabled {
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.feedback.danger};
  }
`;

function Radio(props) {
  const { error, label, innerRef, ...radioProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
    error,
  });

  return (
    <Label mb={2} sx={{ width: 'auto', '&:last-child': { mb: 0 }, alignItems: 'flex-start' }}>
      <Box sx={{ minWidth: 'auto' }}>
        <StyledRadio ref={innerRef} className={classNames} {...radioProps} />
      </Box>
      <StyledRadioLabel className={classNames} as="span">
        {label}
      </StyledRadioLabel>
    </Label>
  );
}

Radio.propTypes = {
  ...RadioProps,
  label: PropTypes.string.isRequired,
};

export function RadioGroup(props) {
  const {
    disabled,
    id,
    label,
    name,
    options,
    value,
    variant,
    required,
    onChange,
    error,
    sx = {},
    ...wrapperProps
  } = props;

  const labelId = `${id}-label`;
  const ariaLabelledBy = label ? labelId : undefined;
  const inputClasses = cx({
    required,
    error,
  });

  return (
    <Box
      role="radiogroup"
      id={id}
      aria-labelledby={ariaLabelledBy}
      sx={{ fontSize: 1, color: colors.text.default, ...sx }}
      {...wrapperProps}
    >
      {label && (
        <Label for={name} mb={2} id={labelId}>
          <Caption
            sx={{
              fontWeight: fontWeights.medium,
              fontSize: 1,
            }}
            className={inputClasses}
          >
            {label}
          </Caption>
        </Label>
      )}
      <Flex
        sx={{ justifyContent: 'flex-start' }}
        theme={baseTheme}
        variant={`inputs.radios.${variant}`}
      >
        {map(options, (option, i) => (
          <Radio
            disabled={disabled}
            id={`${name}-${i}`}
            key={option.value}
            name={name}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={onChange}
            label={option.label}
            error={error}
            innerRef={i === 0 ? props.innerRef : undefined}
          />
        ))}
      </Flex>
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
}

RadioGroup.propTypes = {
  id: PropTypes.string.isRequired,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['horizontal', 'vertical', 'verticalBordered']),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
};

RadioGroup.defaultProps = {
  variant: 'vertical',
};

export default RadioGroup;
