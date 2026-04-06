import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  StyledGriSparkline,
  SparklineSvg,
  Tooltip,
  TooltipTitle,
  TooltipCurrent,
  TooltipLabel,
  TooltipTrend,
  TooltipTrendValue,
  TooltipWarning,
} from './GriSparkline.styles';

const DEFAULT_RISK_BANDS = {
  lowMax: 30,
  moderateMax: 50,
};

const RISK_COLORS = {
  low: '#10b981', // green
  moderate: '#f59e0b', // amber
  high: '#ef4444', // red
};

const RISK_STROKE_WIDTHS = {
  low: 1.5,
  moderate: 1.75,
  high: 2,
};

function getRiskLevel(gri, bands) {
  if (gri < bands.lowMax) return 'low';
  if (gri < bands.moderateMax) return 'moderate';
  return 'high';
}

function computeTrend(history) {
  if (history.length < 2) return 'stable';

  // Linear regression approach: calculate slope
  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  history.forEach((point, index) => {
    sumX += index;
    sumY += point.value;
    sumXY += index * point.value;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Threshold: use relative change per period
  const meanValue = sumY / n;
  const relativeSlope = (slope / meanValue) * 100;

  if (relativeSlope > 2) return 'increasing';
  if (relativeSlope < -2) return 'decreasing';
  return 'stable';
}

export const GriSparkline = ({ currentGri, history, riskBands, width, height }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const bands = riskBands || DEFAULT_RISK_BANDS;
  const sparklineWidth = width || 80;
  const sparklineHeight = height || 16;

  const { pathData, lastPointX, lastPointY, riskLevel, trend } = useMemo(() => {
    if (!history.length || currentGri === null) {
      return {
        pathData: '',
        lastPointX: 0,
        lastPointY: 0,
        riskLevel: 'low',
        trend: 'stable',
      };
    }

    const values = history.map((h) => h.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    const padding = 3;
    const innerWidth = sparklineWidth - padding * 2;
    const innerHeight = sparklineHeight - padding * 2;

    // Handle case where all values are identical
    const yScale =
      valueRange === 0
        ? () => innerHeight / 2 + padding
        : (value) => {
            const normalized = (value - minValue) / valueRange;
            return innerHeight - normalized * innerHeight + padding;
          };

    const xScale = (index) => {
      const step = history.length > 1 ? innerWidth / (history.length - 1) : innerWidth / 2;
      return index * step + padding;
    };

    const points = history.map((point, index) => ({
      x: xScale(index),
      y: yScale(point.value),
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const lastPoint = points[points.length - 1];
    const riskLevel = getRiskLevel(currentGri, bands);
    const trend = computeTrend(history);

    return {
      pathData,
      lastPointX: lastPoint.x,
      lastPointY: lastPoint.y,
      riskLevel,
      trend,
    };
  }, [history, currentGri, bands, sparklineWidth, sparklineHeight]);

  // Handle no data case
  if (!history.length || currentGri === null) {
    return (
      <StyledGriSparkline
        className="gri-sparkline--no-data"
        title="Not enough data to compute GRI"
      >
        <SparklineSvg width={sparklineWidth} height={sparklineHeight}>
          <text
            x={sparklineWidth / 2}
            y={sparklineHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            –
          </text>
        </SparklineSvg>
      </StyledGriSparkline>
    );
  }

  const color = RISK_COLORS[riskLevel];
  const strokeWidth = RISK_STROKE_WIDTHS[riskLevel];
  const lastPoint = history[history.length - 1];

  return (
    <StyledGriSparkline
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SparklineSvg width={sparklineWidth} height={sparklineHeight}>
        {/* Sparkline path */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />

        {/* Latest point highlight */}
        <circle
          cx={lastPointX}
          cy={lastPointY}
          r={2.5}
          fill={color}
          stroke="white"
          strokeWidth={1}
        />
      </SparklineSvg>

      {/* Tooltip */}
      {showTooltip && (
        <Tooltip>
          <TooltipTitle>
            GRI trend (last {history.length} period{history.length !== 1 ? 's' : ''})
          </TooltipTitle>
          <TooltipCurrent>
            <strong>Most recent:</strong> {currentGri}
            {lastPoint.label && (
              <TooltipLabel>{lastPoint.label}</TooltipLabel>
            )}
          </TooltipCurrent>
          <TooltipTrend>
            <strong>Trend:</strong>{' '}
            <TooltipTrendValue trend={trend}>
              {trend}
            </TooltipTrendValue>
          </TooltipTrend>
          {history.length <= 2 && (
            <TooltipWarning>
              Limited history available
            </TooltipWarning>
          )}
        </Tooltip>
      )}
    </StyledGriSparkline>
  );
};

GriSparkline.propTypes = {
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
  width: PropTypes.number,
  height: PropTypes.number,
};

GriSparkline.defaultProps = {
  currentGri: null,
  riskBands: DEFAULT_RISK_BANDS,
  width: 80,
  height: 16,
};
