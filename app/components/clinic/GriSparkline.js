import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
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
  ZoneBadge,
  PercentileSection,
} from './GriSparkline.styles';
import {
  getGriZone,
  getZoneConfig,
  getGriPercentile,
  formatPercentile,
  getPercentileDescription,
} from '../../core/data/griPercentiles';

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

export const GriSparkline = ({ currentGri, history, riskBands, width, height, hypoComponent, hyperComponent }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: 'top' });
  const sparklineRef = React.useRef(null);
  const bands = riskBands || DEFAULT_RISK_BANDS;
  const sparklineWidth = width || 80;
  const sparklineHeight = height || 16;

  // Calculate zone and percentile for overall GRI
  const zone = useMemo(() => getGriZone(currentGri), [currentGri]);
  const zoneConfig = useMemo(() => getZoneConfig(zone), [zone]);
  const percentile = useMemo(() => getGriPercentile(currentGri, 'overall'), [currentGri]);

  // Calculate percentiles for hypo/hyper components if provided
  const hypoPercentile = useMemo(() =>
    hypoComponent != null ? getGriPercentile(hypoComponent, 'hypo') : null,
    [hypoComponent]
  );
  const hyperPercentile = useMemo(() =>
    hyperComponent != null ? getGriPercentile(hyperComponent, 'hyper') : null,
    [hyperComponent]
  );

  // Calculate tooltip position in viewport coordinates
  const handleMouseEnter = (e) => {
    e.stopPropagation();

    if (sparklineRef.current) {
      const rect = sparklineRef.current.getBoundingClientRect();
      const tooltipHeight = 200; // Approximate tooltip height
      const gap = 12; // Space between sparkline and tooltip

      // Calculate center X position
      const centerX = rect.left + rect.width / 2;

      // Determine if tooltip should appear above or below
      const spaceAbove = rect.top;
      const placement = spaceAbove < tooltipHeight + gap ? 'bottom' : 'top';

      // Calculate Y position based on placement
      const y = placement === 'bottom'
        ? rect.bottom + gap
        : rect.top - gap;

      setTooltipPosition({ x: centerX, y, placement });
    }

    setShowTooltip(true);
  };

  const handleMouseLeave = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

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
      ref={sparklineRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

      {/* Tooltip rendered via portal to bypass table overflow */}
      {showTooltip && ReactDOM.createPortal(
        <Tooltip position={tooltipPosition}>
          <TooltipTitle>
            CURRENT GRI SCORE
          </TooltipTitle>

          <TooltipCurrent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <strong>GRI:</strong> {currentGri}
              </div>
              {zone && zoneConfig && (
                <ZoneBadge zoneColor={zoneConfig.color}>
                  {zone}
                </ZoneBadge>
              )}
            </div>
            {lastPoint.label && (
              <TooltipLabel>{lastPoint.label}</TooltipLabel>
            )}
          </TooltipCurrent>

          {percentile != null && (
            <PercentileSection>
              <div><strong>Population Rank:</strong> {formatPercentile(percentile)}</div>
              <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.9 }}>
                {getPercentileDescription(percentile)}
              </div>
            </PercentileSection>
          )}

          <TooltipTrend style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <strong>Trend:</strong>{' '}
            <TooltipTrendValue trend={trend}>
              {trend}
            </TooltipTrendValue>
            <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
              (over last {history.length} period{history.length !== 1 ? 's' : ''})
            </div>
          </TooltipTrend>

          {history.length <= 2 && (
            <TooltipWarning>
              Limited history available
            </TooltipWarning>
          )}
        </Tooltip>,
        document.body
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
  hypoComponent: PropTypes.number,
  hyperComponent: PropTypes.number,
};

GriSparkline.defaultProps = {
  currentGri: null,
  riskBands: DEFAULT_RISK_BANDS,
  width: 80,
  height: 16,
  hypoComponent: undefined,
  hyperComponent: undefined,
};
