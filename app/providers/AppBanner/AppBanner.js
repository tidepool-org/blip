import React, { useContext } from 'react';
import Banner from '../../components/elements/Banner';
import { useDispatch } from 'react-redux';
import { isFunction } from 'lodash';
import { AppBannerContext } from './AppBannerProvider';
import { sync } from '../../redux/actions';

const AppBanner = ({ trackMetric }) => {
  // Use the banner context
  const banner = useContext(AppBannerContext);
  const dispatch = useDispatch();

  // Render nothing if no banner is available
  if (!banner) {
    return null;
  }

  const handleClickMessageLink = () => {
    // onClickUploaderBanner(user.userid);
    isFunction(banner.messageLink?.onClick) && banner.messageLink.onClick();
    banner.messageLink?.metric && trackMetric(banner.messageLink.metric);
  };

  const handleClickAction = () => {
    // onClickUploaderBanner(user.userid);
    isFunction(banner.action?.onClick) && banner.action.onClick();
    banner.action?.metric && trackMetric(banner.action.metric);
    dispatch(sync.dismissBanner(banner.id));
  };

  const handleDismiss = () => {
    // onDismissUploaderBanner(user.userid);
    trackMetric(banner.dismiss.metric);
    dispatch(sync.dismissBanner(banner.id));
  };

  // Customize this component to display your banner as needed
  return (
    <Banner
      id={banner.id}
      label={banner.label}
      message={banner.message}
      title={banner.title}
      actionText={banner.action?.text}
      messageLinkText={banner.messageLink?.text}
      onAction={handleClickAction}
      onClickMessageLink={handleClickMessageLink}
      onDismiss={handleDismiss}
      variant={banner.variant}
    />
  );
};

export default AppBanner;
