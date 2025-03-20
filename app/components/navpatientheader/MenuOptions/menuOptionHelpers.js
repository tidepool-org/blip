import { vizColors } from '@tidepool/viz';

export const getButtonStyleProps = (isActive) => {
  const styleProps = {
    variant: 'textSecondary',
    iconPosition: 'left',
    iconFontSize: '1.25em',
    sx: { fontSize: 1, fontWeight: 'medium' },
    pl: 0
  };

  // if button represents the current page, it should be highlighted
  if (isActive) {
    styleProps.sx.color = vizColors.purple90;
    styleProps.sx.textDecoration = 'underline';
  }

  return styleProps;
};

export const isDataView = (finalSlug) => {
  return ['/data', '/basics', '/trends', '/bgLog', '/daily', '/settings'].includes(finalSlug);
};
