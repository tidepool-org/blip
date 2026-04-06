import React from 'react';
import PropTypes from 'prop-types';
import { GriSparkline } from './GriSparkline';
import {
  StyledGriCell,
  GriCellValue,
  GriCellSparklineContainer,
} from './GriSparkline.styles';

export const GriCell = ({
  currentGri,
  history,
  riskBands,
  onClick,
  sparklineWidth,
  sparklineHeight,
  hypoComponent,
  hyperComponent,
  renderGriValue, // Optional custom renderer for GRI value (e.g., wrapped in PopoverElement)
}) => {
  // Handle null/no data case
  if (currentGri === null || history.length === 0) {
    return (
      <StyledGriCell
        className="gri-cell--no-data"
        clickable={!!onClick}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        title="Not enough data to compute GRI"
      >
        <GriCellValue className="gri-cell__value--empty">–</GriCellValue>
      </StyledGriCell>
    );
  }

  return (
    <StyledGriCell
      clickable={!!onClick}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {renderGriValue ? (
        renderGriValue(currentGri)
      ) : (
        <GriCellValue>{currentGri}</GriCellValue>
      )}
      <GriCellSparklineContainer>
        <GriSparkline
          currentGri={currentGri}
          history={history}
          riskBands={riskBands}
          width={sparklineWidth}
          height={sparklineHeight}
          hypoComponent={hypoComponent}
          hyperComponent={hyperComponent}
        />
      </GriCellSparklineContainer>
    </StyledGriCell>
  );
};

GriCell.propTypes = {
  currentGri: PropTypes.number,
  history: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string,
    })
  ).isRequired,
  riskBands: PropTypes.shape({
    lowMax: PropTypes.number,
    moderateMax: PropTypes.number,
  }),
  onClick: PropTypes.func,
  sparklineWidth: PropTypes.number,
  sparklineHeight: PropTypes.number,
  hypoComponent: PropTypes.number,
  hyperComponent: PropTypes.number,
  renderGriValue: PropTypes.func,
};

GriCell.defaultProps = {
  currentGri: null,
  riskBands: undefined,
  onClick: undefined,
  sparklineWidth: undefined,
  sparklineHeight: undefined,
  hypoComponent: undefined,
  hyperComponent: undefined,
  renderGriValue: undefined,
};
