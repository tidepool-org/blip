import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps, Flex, Image } from 'theme-ui';
import map from 'lodash/map';
import { useTranslation } from 'react-i18next';
import { useSnapCarousel } from 'react-snap-carousel';

import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';

import Button from '../Button';
import Icon from '../Icon';
import { Body1, MediumTitle } from '../FontStyles';

export function SlideShow({ axis, items, renderItem, sx = {}, ...themeProps }) {
  const { t } = useTranslation();

  const {
    scrollRef,
    hasPrevPage,
    hasNextPage,
    next,
    prev,
    goTo,
    pages,
    snapPointIndexes,
    activePageIndex,
  } = useSnapCarousel();

  useEffect(() => {
    const handle = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          next();
          break;
        case 'ArrowRight':
          prev();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keypress', handle);
    return () => {
      window.removeEventListener('keypress', handle);
    };
  }, [next, prev]);

  return (
    <Box
      px={[2, 3, 4]}
      pt={[2, 3, 4]}
      pb={[6, 6, 6]}
      sx={{
        position: 'relative',
        backgroundColor: 'bluePrimary00',
        ...sx,
      }}
      className="slideShowWrapper"
      {...themeProps}
    >
      <Flex
        as="ul"
        className="slideShowItems"
        p={0}
        m={0}
        sx={{
          position: 'relative',
          overflow: 'auto',
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          boxSizing: 'border-box',
          overscrollBehavior: 'contain',
        }}
        ref={scrollRef}
      >
        {map(items, (item, index) =>
          renderItem({
            item,
            index,
            isSnapPoint: snapPointIndexes.has(index),
          })
        )}
      </Flex>

      <Flex
        className="slideShowControls"
        m={0}
        py={2}
        px={2}
        sx={{
          justifyContent: ['center', null, 'space-between'],
          alignItems: 'center',
          color: '#374151',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <Icon
          variant="button"
          disabled={!hasPrevPage}
          onClick={() => prev()}
          className="slideShowPrevButton"
          p={0}
          sx={{
            color: 'purpleMedium',
            fontSize: '36px',
            pointerEvents: 'auto',
            display: ['none !important', null, 'inline-flex !important'],
            '&:hover,&:active,&.active': {
              color: 'purpleMedium',
              backgroundColor: 'transparent',
            },
          }}
          icon={ChevronLeftRoundedIcon}
          label={t('Previous')}
        />

        <Flex
          as="ol"
          className="slideShowPagination"
          m={0}
          mb={3}
          p={0}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignSelf: 'flex-end',
            listStyle: 'none',
            gap: 3,
          }}
        >
          {map(pages, (_, i) => (
            <Box
              as="li"
              key={i}
              className="slideShowPaginationItem"
              sx={{ pointerEvents: 'auto' }}
            >
              <Button
                key={i}
                onClick={() => goTo(i)}
                selected={activePageIndex === i}
                variant="paginationDot"
              >
                {i + 1}
              </Button>
            </Box>
          ))}
        </Flex>

        <Icon
          variant="button"
          disabled={!hasNextPage}
          onClick={() => next()}
          className="slideShowNextButton"
          p={0}
          sx={{
            color: 'purpleMedium',
            fontSize: '36px',
            pointerEvents: 'auto',
            display: ['none !important', null, 'inline-flex !important'],
            '&:hover,&:active,&.active': {
              color: 'purpleMedium',
              backgroundColor: 'transparent',
            },
          }}
          icon={ChevronRightRoundedIcon}
          label={t('Next')}
        />
      </Flex>
    </Box>
  );
}

const ItemShape = {
  title: PropTypes.string,
  content: PropTypes.string,
  image: PropTypes.elementType,
};

SlideShow.propTypes = {
  ...BoxProps,
  axis: PropTypes.oneOf(['x', 'y']),
  renderItem: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape(ItemShape)).isRequired,
};

SlideShow.defaultProps = {
  axis: 'x',
};

export function SlideShowItem({ isSnapPoint, title, content, image }) {
  return (
    <Box
      as="li"
      className="slideShowItem"
      px={3}
      sx={{
        width: '100%',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        scrollSnapAlign: isSnapPoint ? 'start' : '',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          gap: 2,
          flexDirection: ['column', null, 'row'],
        }}
      >
        {image && (
          <Box className="carouselImage" sx={{ flexBasis: 1, flexGrow: 1, maxWidth: ['140px', null, '180px'], height: '100%' }}>
            <Image
              src={image}
              sx={{
                flexBasis: 1,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        )}

        <Box
          className="carouselContent"
          px={[0, null, 3]}
          sx={{ flexBasis: 3, flexGrow: 1, textAlign: ['center', null, 'left'] }}
        >
          {!!title && (
            <MediumTitle
              className="card-title"
              mb={!!content ? 3 : 0}
              sx={{
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: 2,
              }}
            >
              {title}
            </MediumTitle>
          )}

          {!!content && (
            <Body1
              className="item-content"
              pb={2}
              sx={{
                color: 'text.primary',
                fontWeight: 'medium',
              }}
            >
              {content}
            </Body1>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

SlideShowItem.propTypes = {
  isSnapPoint: PropTypes.bool,
  ...ItemShape,
};

export default SlideShow;
