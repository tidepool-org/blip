import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';

import {
  borders,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

export const DatePicker = styled(Box)`
  font-family: ${fonts.default};

  .MuiSvgIcon-root {
    color: ${colors.text.primary};
  }

  .DateInput {
    input {
      font: ${fontWeights.regular} ${fontSizes[0]}px ${fonts.default};
      padding: 12px 0 12px 12px;
      border-bottom: 0;
      color: ${colors.text.primary};
    }

    input::placeholder {
      color: ${colors.text.primarySubdued};
    }
  }

  .DayPicker {
    border-radius: ${radii.input}px;
    box-shadow: ${shadows.large};
  }

  .DayPickerNavigation_button {
    position: absolute;
    top: ${space[1]}px;

    > span {
      font-size: ${fontSizes[3]}px;
    }

    &:first-child {
      left: ${space[2]}px;
    }

    &:last-child {
      right: ${space[2]}px;
    }
  }

  .CalendarMonth_caption {
    color: ${colors.text.primary};
    padding: ${space[1]}px;
    margin-bottom: ${space[4]}px;
    border-bottom: ${borders.default};

    strong {
      font-weight: ${fontWeights.regular};
      font-size: ${fontSizes[1]}px;
    }
  }

  .DayPicker_weekHeader {
    top: ${space[5]}px;
    color: ${colors.text.primary};
    font-weight: ${fontWeights.medium};

    small {
      font-size: ${fontSizes[0]}px;
    }
  }

  .CalendarDay {
    color: ${colors.text.primary};
    font-size: ${fontSizes[0]}px;
    border: 0;

    &.CalendarDay__outside {
      color: ${colors.text.primaryDisabled};
    }

    &.CalendarDay__default:hover {
      border-radius: ${radii.default}px;
    }

    &.CalendarDay__selected,
    &.CalendarDay__selected:active,
    &.CalendarDay__selected:hover {
      color: ${colors.white};
      border: 0;
      border-radius: ${radii.default}px;
      background: ${colors.purpleMedium};
    }
  }
`;
