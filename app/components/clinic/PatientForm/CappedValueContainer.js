import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'theme-ui';
import { components } from 'react-select';

import { colors, fontWeights } from '../../../themes/baseTheme';

// Renders at most `maxVisibleValues` selected chips and collapses the remainder into a "+N" the
// user can click to reveal the rest. Every selected value is still submitted — the cap is
// presentational.
export const CappedValueContainer = ({ children, ...props }) => {
  const [expanded, setExpanded] = useState(false);
  const { maxVisibleValues } = props.selectProps;
  const [values, input] = children;

  const overflowCount = maxVisibleValues && Array.isArray(values)
    ? Math.max(values.length - maxVisibleValues, 0)
    : 0;

  const hiddenCount = expanded ? 0 : overflowCount;

  // react-select's Control opens the menu from its own onMouseDown / onTouchEnd, so the trigger
  // swallows exactly those two before they reach it.
  const swallow = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  // The Control listens for neither, so this only has to do the work. It also covers the Enter or
  // Space a keyboard user presses, which dispatch a click and no pointer event.
  const handleExpand = () => setExpanded(true);

  return (
    <components.ValueContainer {...props}>
      {hiddenCount ? values.slice(0, maxVisibleValues) : values}

      {!!hiddenCount && (
        <Text
          as="button"
          type="button"
          className="value-overflow-count"
          onMouseDown={swallow}
          onTouchEnd={swallow}
          onClick={handleExpand}
          sx={{
            border: 'none',
            background: 'none',
            padding: 1,
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: fontWeights.medium,
            color: colors.blue50,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          +{hiddenCount}
        </Text>
      )}

      {input}
    </components.ValueContainer>
  );
};

CappedValueContainer.propTypes = {
  // react-select renders this as [the selected values, the input]
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  selectProps: PropTypes.shape({
    maxVisibleValues: PropTypes.number,
  }).isRequired,
};

export default CappedValueContainer;
