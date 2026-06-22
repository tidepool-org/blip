import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import styled from '@emotion/styled';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { colors as vizColors } from '@tidepool/viz';

import map from 'lodash/map';
import noop from 'lodash/noop';

import Icon from '../../../components/elements/Icon';
import colorPalette from '../../../themes/colorPalette';

const ResetButton = styled.button`
  background: none;
  color: ${vizColors.indigo30};
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  text-underline-offset: 4px;
  text-decoration: underline;
`;

export const FILTER_TYPE = {
  TAG: 'TAG',
  SITE: 'SITE',
};

const FilterDisplayBar = ({ count = 0, tags = [], sites = [], onReset = noop, onRemove = noop }) => {
  const { t } = useTranslation();

  const filters = [
    ...map(tags, tag => ({ type: FILTER_TYPE.TAG, properties: tag })),
    ...map(sites, site => ({ type: FILTER_TYPE.SITE, properties: site })),
  ];

  if (!filters.length) return null;

  return (
    <Flex
      id="filter-display-bar"
      px={3}
      py={2}
      mb={3}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        fontSize: 0,
        color: vizColors.blueGray50,
        backgroundColor: colorPalette.primary.bluePrimary00,
        borderRadius: 'default',
      }}
    >
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <Icon
          id="filter-display-bar-icon"
          variant="static"
          icon={InfoOutlinedIcon}
          label={t('Active filters')}
          sx={{ fontSize: 1, color: vizColors.blueGray50, flexShrink: 0 }}
        />

        <Box>
          <Text as="span">{t('Showing {{ count }} patients with', { count })}{' '}</Text>

          {map(filters, (filter, index) => {
            const { type, properties } = filter;
            const { id, name } = properties;

            return (
              <Box
                as="span"
                key={`${type}-${id}`}
                className="filter-display-bar-item"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  '&:hover .filter-display-bar-remove': { display: 'inline-flex' },
                }}
              >
                <Text as="span" sx={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                  {name}
                </Text>

                <Box
                  as="span"
                  className="filter-display-bar-remove"
                  ml={1}
                  sx={{ display: 'none', alignItems: 'center' }}
                >
                  <Icon
                    variant="default"
                    icon={CloseRoundedIcon}
                    label={t('Remove {{ name }} filter', { name })}
                    onClick={() => onRemove(type, properties)}
                    sx={{ fontSize: 1, color: vizColors.blueGray50, '&:hover': { color: vizColors.indigo30 } }}
                  />
                </Box>

                {index < filters.length - 1 ? <Text as="span">,&nbsp;</Text> : null}
              </Box>
            );
          })}
        </Box>
      </Flex>

      <ResetButton id="filter-display-bar-reset" onClick={onReset}>
        {t('Reset All Filter(s)')}
      </ResetButton>
    </Flex>
  );
};

export default FilterDisplayBar;
