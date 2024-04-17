import React from 'react';
import PropTypes from 'prop-types';
import { Box, Label, BoxProps } from 'theme-ui';
import ReactSelect from 'react-select';
import cx from 'classnames';
import intersectionBy from 'lodash/intersectionBy';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import noop from 'lodash/noop';

import { fontWeights, fontSizes, colors, radii } from '../../themes/baseTheme';
import { Caption } from './FontStyles';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

export function MultiSelect(props) {
  const {
    disabled,
    innerRef,
    name,
    label,
    value: valueProp,
    variant,
    onChange: onChangeProp,
    options,
    themeProps,
    width,
    required,
    setFieldValue,
    error,
    ...selectProps
  } = props;

  const classNames = cx({ disabled, error, empty: valueProp === '' });
  const inputClasses = cx({
    error,
    required,
  });

  return (
    <Box width={['100%', '75%', '50%']} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
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

      <Box alignItems="center" className={classNames} variant="inputs.select.multi" {...selectProps}>
        <ReactSelect
          {...selectProps}
          ref={innerRef}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          options={options}
          value={intersectionBy(
            options,
            map(valueProp.split(','), value => ({ value })),
            'value'
          )}
          onChange={selections => {
            const { value } = selections?.[0] || {};

            // Sort the values so that we can accurately check see if the form values have changed
            const sortedValue = map(selections, item => item.value).sort().join(',');
            setFieldValue(name, sortedValue);
            onChangeProp(value);
          }}
          styles={{
            control: (styles, { isFocused, isDisabled }) => ({
              ...styles,
              backgroundColor: isDisabled ? colors.lightestGrey : colors.white,
              color: isDisabled ? colors.primarySubdued : colors.text.primary,
              borderColor: isFocused // eslint-disable-line no-nested-ternary
                ? colors.border.focus
                : isDisabled
                  ? colors.lightestGrey
                  : colors.border.inputLight,
              boxShadow: isFocused ? `0 0 0 1px ${colors.border.focus}` : styles.boxShadow,
            }),
            clearIndicator: styles => ({
              ...styles,
              color: colors.blueGreyMedium,
              ':hover': {
                color: colors.blueGreyMedium,
              },
            }),
            dropdownIndicator: styles => ({
              ...styles,
              color: colors.blueGreyMedium,
              ':hover': {
                color: colors.blueGreyMedium,
              },
            }),
            indicatorSeparator: styles => ({
              ...styles,
              color: colors.blueGreyMedium,
              visibility: isEmpty(valueProp) ? 'hidden' : 'visible',
            }),
            placeholder: styles => ({
              ...styles,
              color: colors.text.primarySubdued,
              fontSize: `${fontSizes[1]}px`,
            }),
            option: (styles, { isFocused }) => ({
              ...styles,
              fontWeight: fontWeights.medium,
              fontSize: fontSizes[1],
              backgroundColor: isFocused ? colors.lightGrey : undefined,
              color: colors.text.primary,
            }),
            multiValue: (styles) => ({
              ...styles,
              fontWeight: fontWeights.medium,
              fontSize: fontSizes[1],
              backgroundColor: colors.purpleMedium,
              borderRadius: radii.input,
            }),
            multiValueLabel: styles => ({
              ...styles,
              color: colors.white,
            }),
            multiValueRemove: styles => ({
              ...styles,
              color: colors.white,
              ':hover': {
                backgroundColor: colors.purpleMedium,
                color: colors.white,
              },
            }),
          }}
        />
      </Box>

      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
}

MultiSelect.propTypes = {
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  isDisabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  themeProps: PropTypes.shape(BoxProps),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  placeholder: PropTypes.string.isRequired,
  required: PropTypes.bool,
  setFieldValue: PropTypes.func.isRequired,
  error: PropTypes.string,
};

MultiSelect.displayName = 'MultiSelect';

MultiSelect.defaultProps = {
  themeProps: {},
  placeholder: t('Select one or more'),
  onChange: noop,
};

export default MultiSelect;
