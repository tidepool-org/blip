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
      <GriCellValue>{currentGri}</GriCellValue>
      <GriCellSparklineContainer>
        <GriSparkline
          currentGri={currentGri}
          history={history}
          riskBands={riskBands}
          width={sparklineWidth}
          height={sparklineHeight}
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
};

GriCell.defaultProps = {
  currentGri: null,
  riskBands: undefined,
  onClick: undefined,
  sparklineWidth: undefined,
  sparklineHeight: undefined,
};
