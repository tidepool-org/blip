import colorPalette from "../../../../themes/colorPalette"

export const getButtonStyleProps = (isActive) => {
  const styleProps = {
    variant: 'textSecondary',
    iconPosition: 'left',
    iconFontSize: '1.25em',
    sx: { fontSize: 1 },
    pl: 0
  }

  // Button represents the current page
  if (isActive) {
    styleProps.sx.color = colorPalette.primary.purpleDark;
    styleProps.sx.textDecoration = 'underline';
  }

  return styleProps;
}

export const getFinalSlug = (pathname) => {
  return pathname.slice(pathname.lastIndexOf("/"), pathname.length);
}