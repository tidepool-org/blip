import React from 'react';
import { useTranslation } from 'react-i18next';
import { CategorySelector, CategoryTab } from '../components/CategoryTabs';

export const CATEGORY_TAB = {
  DEFAULT: 'DEFAULT',
  MISSING_DATA: 'MISSING_DATA',
  DISCONNECTED: 'DISCONNECTED',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INVITE_SENT: 'INVITE_SENT',
  HIDDEN: 'HIDDEN',
};

const { DEFAULT, MISSING_DATA, DISCONNECTED, INVITE_EXPIRED, INVITE_SENT, HIDDEN } = CATEGORY_TAB;

const FilterByCategory = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <CategorySelector>
      <CategoryTab selected={value === DEFAULT} onClick={() => onChange(DEFAULT)}>{t('All Issues')}</CategoryTab>
      <CategoryTab selected={value === MISSING_DATA} onClick={() => onChange(MISSING_DATA)}>{t('Missing Data')}</CategoryTab>
      <CategoryTab selected={value === DISCONNECTED} onClick={() => onChange(DISCONNECTED)}>{t('Disconnected or Error')}</CategoryTab>
      <CategoryTab selected={value === INVITE_EXPIRED} onClick={() => onChange(INVITE_EXPIRED)}>{t('Invite Expired')}</CategoryTab>
      <CategoryTab selected={value === INVITE_SENT} onClick={() => onChange(INVITE_SENT)}>{t('Invite Sent')}</CategoryTab>
      <CategoryTab selected={value === HIDDEN} onClick={() => onChange(HIDDEN)}>{t('Hidden Issues')}</CategoryTab>
    </CategorySelector>
  );
};

export default FilterByCategory;
