import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import Skeleton from '@material-ui/lab/Skeleton';
import { colors as vizColors } from '@tidepool/viz';
import { Box, Flex, Link, Text } from 'theme-ui';

import { Dialog, DialogContent, DialogTitle } from '../elements/Dialog';
import { MediumTitle } from '../elements/FontStyles';
import { useGetProductInfoQuery } from '../../redux/features/productInfo/productInfoApi';
import tidepoolLogo from '../navbar/images/tidepoolLogo.svg';
import manufacturerSymbol from './images/iso7000-3082-manufacturer.svg';

// Loading, error and loaded states share this height so the dialog never resizes after opening
const CARD_MIN_HEIGHT = 200;

// Width and height of each placeholder bar, top to bottom; null is a gap
const SKELETON_BARS = [['62%', 28], ['44%', 14], null, ['88%', 16], ['36%', 16], ['58%', 14]];

const visuallyHiddenSx = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

// The X logo path is unfilled at its root, so the fill comes from the link colour.
const socialLinkSx = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: 'full',
  bg: 'bluePrimary00',
  color: 'blue80',
  transition: 'background-color .15s ease',
  svg: { fill: 'currentColor', display: 'block' },
  '&:hover': { bg: 'blue05', color: 'blue80' },
};

const strongTextSx = { color: 'blue80' };
const secondaryTextSx = { fontSize: 1, color: 'blueGreyLight' };

export const AboutDialog = ({ open, onClose, version, trackMetric, showLinks = true }) => {
  const { t } = useTranslation();
  const { data, isFetching, isError } = useGetProductInfoQuery(undefined, { skip: !open });

  // A response without a UDI counts as a failed lookup
  const hasError = isError || (!isFetching && data !== undefined && !data?.udi);
  // The hook keeps the previous response while refetching or after a failure
  const info = isFetching || hasError ? undefined : data;
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Unmounted while closed, so its link ids exist only while About is open
  return (
    <Dialog id="aboutDialog" aria-labelledby="about-dialog-title" maxWidth="md" open={open} onClose={onClose} keepMounted={false}>
      <DialogTitle onClose={onClose}>
        <MediumTitle id="about-dialog-title">{t('About Tidepool')}</MediumTitle>
      </DialogTitle>

      <DialogContent divider={false} minWidth={640} sx={{ maxWidth: '640px' }}>
        <Flex sx={{ flexDirection: 'column', gap: 4, color: 'text.primary' }}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 3, rowGap: 2 }}>
            <img src={tidepoolLogo} alt="Tidepool" width={168} />
            {version && (
              <Text as="p" sx={{ py: 1, px: 3, borderRadius: 'full', bg: 'bluePrimary00', fontSize: 0, fontWeight: 'medium', ...strongTextSx }}>
                {t('Version {{version}}', { version })}
              </Text>
            )}
          </Flex>

          <Flex sx={{ flexDirection: 'column', minHeight: `${CARD_MIN_HEIGHT}px`, border: 'card', borderRadius: 'large', overflow: 'hidden' }}>
            {info && (
              <>
                <Box sx={{ px: [3, null, 4], py: 3, bg: 'bluePrimary00', borderBottom: 'card' }}>
                  <Text as="p" sx={{ fontSize: 4, fontWeight: 'bold', lineHeight: 1, letterSpacing: '-0.015em', ...strongTextSx }}>
                    {info.productName}
                  </Text>
                  <Text as="p" mt={1} sx={secondaryTextSx}>
                    {t('Latest Software Release Date: {{date}}', { date: info.releaseDate })}
                  </Text>
                </Box>

                <Flex sx={{ flexDirection: 'column', gap: 3, px: [3, null, 4], py: 3 }}>
                  <Flex sx={{ alignItems: 'flex-start', gap: 2 }}>
                    {/* `UDI` is the ISO 15223-1 symbol, the same in every language; the aria-label carries the translation */}
                    <Box
                      role="img"
                      aria-label={t('Unique Device Identifier')}
                      sx={{ flexShrink: 0, border: '2px solid', borderColor: 'text.primary', px: '6px', fontSize: 0, fontWeight: 'bold', lineHeight: '18px', letterSpacing: '0.02em' }}
                    >
                      UDI
                    </Box>
                    <Text
                      data-testid="about-udi"
                      sx={{ fontFamily: 'monospace', fontSize: 1, lineHeight: '22px', overflowWrap: 'anywhere', userSelect: 'all', ...strongTextSx }}
                    >
                      {/* Narrow screens wrap at the start of each GS1 segment; copying yields the exact string */}
                      {info.udi.split(/(?=\()/).map((segment, i) => (
                        <React.Fragment key={i}>{i > 0 && <wbr />}{segment}</React.Fragment>
                      ))}
                    </Text>
                  </Flex>

                  <Flex sx={{ alignItems: 'baseline', gap: 2 }}>
                    <img src={manufacturerSymbol} alt={t('Manufacturer')} height={15} />
                    <Box>
                      <Text as="p" sx={{ fontSize: 2, fontWeight: 'medium', ...strongTextSx }}>{info.manufacturerName}</Text>
                      <Text as="p" sx={secondaryTextSx}>{info.manufacturerAddress}</Text>
                    </Box>
                  </Flex>
                </Flex>
              </>
            )}

            {isFetching && (
              <Flex aria-busy="true" sx={{ flexDirection: 'column', gap: 2, px: [3, null, 4], py: 3 }}>
                <Text aria-live="polite" sx={visuallyHiddenSx}>{t('Loading…')}</Text>
                {SKELETON_BARS.map((bar, i) => (bar ? (
                  <Skeleton
                    key={i}
                    variant="rect"
                    width={bar[0]}
                    height={bar[1]}
                    animation={reduceMotion ? false : 'pulse'}
                    style={{ backgroundColor: vizColors.blue05, borderRadius: 4 }}
                  />
                ) : <Box key={i} sx={{ height: '22px' }} />))}
              </Flex>
            )}

            {hasError && (
              <Flex role="alert" sx={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, p: 4, textAlign: 'center' }}>
                <Flex sx={{ alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: 'full', bg: 'red05', color: 'feedback.danger' }}>
                  <ErrorOutlineRoundedIcon aria-hidden="true" />
                </Flex>
                <Text as="p" sx={{ fontSize: 2, fontWeight: 'medium', ...strongTextSx }}>
                  {t('Unable to load release information.')}
                </Text>
              </Flex>
            )}
          </Flex>

          {showLinks && <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Link
              href="https://tidepool.org/legal/"
              id="legal"
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => trackMetric('Clicked Footer PP and TOU')}
              sx={{ fontSize: 1, fontWeight: 'medium', color: 'indigos.7', textDecoration: 'underline', textUnderlineOffset: '3px', '&:hover': { color: 'indigos.8' } }}
            >
              {t('Privacy and Terms of Use')}
            </Link>

            <Flex sx={{ gap: 2 }}>
              <Link
                href="https://x.com/tidepool_org"
                id="twitter"
                aria-label="X"
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => trackMetric('Clicked Footer Twitter')}
                sx={socialLinkSx}
              >
                <svg viewBox="0 0 1200 1227" width="18px" height="18px" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
                </svg>
              </Link>
              <Link
                href="https://www.facebook.com/TidepoolOrg"
                id="facebook"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => trackMetric('Clicked Footer Facebook')}
                sx={socialLinkSx}
              >
                <svg viewBox="0 0 32 32" width="18px" height="18px">
                  <path d="M18,32V18h6l1-6h-7V9c0-2,1.002-3,3-3h3V0c-1,0-3.24,0-5,0c-5,0-7,3-7,8v4H6v6h6v14H18z" />
                </svg>
              </Link>
            </Flex>
          </Flex>}
        </Flex>
      </DialogContent>
    </Dialog>
  );
};

AboutDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  version: PropTypes.string,
  trackMetric: PropTypes.func.isRequired,
  showLinks: PropTypes.bool,
};

export default AboutDialog;
