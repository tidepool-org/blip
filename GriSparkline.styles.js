import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Animations
const tooltipFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

// GriCell Styles
export const StyledGriCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  border-radius: 4px;
  transition: background-color 0.15s ease;
  min-width: 140px;

  &:hover {
    background-color: ${props => props.clickable ? 'rgba(0, 0, 0, 0.03)' : 'transparent'};
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &.gri-cell--no-data {
    color: #9ca3af;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (prefers-contrast: high) {
    &:hover {
      background-color: ${props => props.clickable ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
    }

    &:focus {
      outline-width: 3px;
    }
  }
`;

export const GriCellValue = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  min-width: 32px;

  &.gri-cell__value--empty {
    color: #9ca3af;
    font-weight: 400;
  }
`;

export const GriCellSparklineContainer = styled.div`
  display: flex;
  align-items: center;
`;

// GriSparkline Styles
export const StyledGriSparkline = styled.div`
  position: relative;
  display: inline-block;
  line-height: 0;

  &.gri-sparkline--no-data {
    opacity: 0.5;
  }
`;

export const SparklineSvg = styled.svg`
  display: block;
`;

// Tooltip Styles
export const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  animation: ${tooltipFadeIn} 0.15s ease;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1f2937;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #d1d5db;
`;

export const TooltipCurrent = styled.div`
  margin-bottom: 6px;
`;

export const TooltipLabel = styled.div`
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
`;

export const TooltipTrend = styled.div`
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const TooltipTrendValue = styled.span`
  color: ${props => {
    if (props.trend === 'increasing') return '#fca5a5';
    if (props.trend === 'decreasing') return '#86efac';
    return '#fde68a';
  }};
`;

export const TooltipWarning = styled.div`
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  color: #fbbf24;
  font-style: italic;
`;
