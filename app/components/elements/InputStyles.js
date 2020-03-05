import { Box } from 'rebass/styled-components';
import styled from 'styled-components';
import { default as IconButtonBase } from '@material-ui/core/IconButton';

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

export const IconButton = styled(IconButtonBase)`
  padding: 0;
`;

export const DatePicker = styled(Box)`
  font-family: ${fonts.default};

  .MuiSvgIcon-root {
    color: ${colors.text.primary};
  }

  .DateInput {
    input {
      font: ${fontWeights.regular} ${fontSizes[1]}px ${fonts.default};
      padding: ${space[3]}px;
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
    top: ${space[2]}px;

    .MuiSvgIcon-root {
      width: ${fontSizes[4]}px;
    }

    &:first-child {
      left: ${space[3]}px;
    }

    &:last-child {
      right: ${space[3]}px;
    }
  }

  .CalendarMonth_caption {
    color: ${colors.text.primary};
    padding: ${space[2]}px;
    margin-bottom: ${space[5]}px;
    border-bottom: ${borders.default};

    strong {
      font-weight: ${fontWeights.regular};
      font-size: ${fontSizes[2]}px;
    }
  }

  .DayPicker_weekHeader {
    top: ${space[6]}px;
    color: ${colors.text.primary};
    font-weight: ${fontWeights.medium};

    small {
      font-size: ${fontSizes[1]}px;
    }
  }

  .CalendarDay {
    color: ${colors.text.primary};
    font-size: ${fontSizes[1]}px;
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
