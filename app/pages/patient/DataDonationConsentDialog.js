import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Box, Flex, Text } from 'theme-ui';
import * as yup from 'yup';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useFormik } from 'formik';
import { isString, keys, memoize } from 'lodash';
import Markdown from 'react-markdown';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';

import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import { Body0, MediumTitle, Paragraph0, Paragraph1, Paragraph2, Subheading } from '../../components/elements/FontStyles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import i18next from '../../core/language';
import { colors, shadows } from '../../themes/baseTheme';
import personUtils from '../../core/personutils';
import Pill from '../../components/elements/Pill';

import { DATA_DONATION_CONSENT_TYPE } from '../../core/constants';

const t = i18next.t.bind(i18next);

export const getConsentText = memoize((accountType, patientAgeGroup, patientName, caregiverName, consentDate) => {
  const { firstName } = personUtils.splitNamesFromFullname(patientName);

  const text = {
    personal: {
      adult: {
        consentSuccessMessage: t('You consented on {{consentDate}}.', { consentDate }),
        primaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: patientName }),
      },
      youth: {
        consentSuccessMessage: t('You assented and {{caregiverName}} consented on {{consentDate}}.', { consentDate, caregiverName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentReviewMessage: t('Please ask your parent or guardian to review and consent on your behalf below.'),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Next."'),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: caregiverName }),
        primaryConsentNameInputLabel: t('Parent Or Legal Guardian Name'),
        secondaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        secondaryConsentDescription: t('My parent or guardian read The Tidepool Big Data Donation Project Informed Consent Form, explained this project to me, answered my questions about the project, and said that it was all right for me to donate my anonymized data if I wanted to. I understand that the project will get information from my Tidepool account and share it with researchers and others involved in helping to make care for diabetes better. I understand that my participation is voluntary, I don\'t have to do this, and I can opt out at any time. '),
        secondaryConsentInputLabel: t('Yes - By checking the box and clicking "Submit," I am saying that I want to donate my anonymized data.'),
        secondaryConsentSignature: t('Electronic signature: {{names}}', { names: [patientName, caregiverName].join(', ') }),
      },
      child: {
        consentSuccessMessage: t('You consented on behalf of {{patientName}} on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Submit."'),
        primaryConsentNameInputLabel: t('Parent Or Legal Guardian Name'),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: caregiverName }),
      },
    },
    caregiver: {
      adult: {
        consentSuccessMessage: t('{{patientName}} consented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
        primaryConsentReviewMessage: t('Please ask {{firstName}} to review and take the next step', { firstName }),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: patientName }),
      },
      youth: {
        consentSuccessMessage: t('You consented and {{patientName}} assented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Next."'),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: caregiverName }),
        secondaryConsentQuestion: t('{{patientName}}, do you give your assent to join The Tidepool Big Data Donation Project?', { patientName }),
        secondaryConsentDescription: t('My parent or guardian read The Tidepool Big Data Donation Project Informed Consent Form, explained this project to me, answered my questions about the project, and said that it was all right for me to donate my anonymized data if I wanted to. I understand that the project will get information from my Tidepool account and share it with researchers and others involved in helping to make care for diabetes better. I understand that my participation is voluntary, I don\'t have to do this, and I can opt out at any time.'),
        secondaryConsentInputLabel: t('Yes - By checking the box and clicking "Submit," I am saying that I want to donate my anonymized data.'),
        secondaryConsentReviewMessage: t('Please ask {{firstName}} to review and take the next step', { firstName }),
        secondaryConsentSignature: t('Electronic signature: {{names}}', { names: [patientName, caregiverName].join(', ') }),
      },
      child: {
        consentSuccessMessage: t('You consented on behalf of {{patientName}} on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - As their parent or guardian, I have read this form and give my consent by checking this box and clicking submit.'),
        primaryConsentSignature: t('Electronic signature: {{names}}', { names: caregiverName }),
      },
    },
  };

  return text[accountType]?.[patientAgeGroup] || {};
}, (accountType, patientAgeGroup, patientName, caregiverName, consentDate) =>
  `${accountType}-${patientAgeGroup}-${patientName}-${caregiverName}-${consentDate}`
);

export const DataDonationConsentDialog = (props) => {
  const { onClose, onConfirm, open, accountType, patientAgeGroup, patientName, caregiverName: caregiverNameProp, consentDate } = props;
  const patientAssentRequired = patientAgeGroup === 'youth';
  const formSteps = patientAssentRequired ? ['primary', 'secondary'] : ['primary'];
  const [currentConsentStep, setCurrentConsentStep] = React.useState(0);
  const [caregiverName, setCaregiverName] = React.useState(caregiverNameProp);
  const { [DATA_DONATION_CONSENT_TYPE]: consentDocument } = useSelector((state) => state.blip.consents);

  const nameSchema = yup.object().shape({
    name: yup.string().required(t('Parent or Legal Guardian Name is required')),
  });

  const createConsentSchema = prefix => yup.object().shape({
    [`${prefix}ConsentRead`]: yup.boolean().oneOf([true], t('You must read the consent statement before proceeding')),
    [`${prefix}Consent`]: yup.boolean().oneOf([true], t('You must agree to consent before proceeding')),
  });

  const primaryConsentSchema = createConsentSchema('primary');
  const secondaryConsentSchema = createConsentSchema('secondary');

  const schemas = {
    primary: patientAssentRequired && accountType === 'personal' ? nameSchema.concat(primaryConsentSchema) : primaryConsentSchema,
    secondary: secondaryConsentSchema,
  };

  const formikContext = useFormik({
    initialValues: {
      name: caregiverName,
      primaryConsentRead: false,
      primaryConsent: false,
      secondaryConsentRead: false,
      secondaryConsent: false,
    },
    validationSchema: schemas[formSteps[currentConsentStep]],
    onSubmit: (values, formikHelpers) => {
      const nextStep = currentConsentStep + 1;
      if (formSteps[nextStep]) {
        setCurrentConsentStep(nextStep);
        setCaregiverName(values.name);
        formikHelpers.resetForm();
        document.getElementById('consentDocumentText')?.scrollTo?.({ top: 0 });
      } else {
        onConfirm({ ...values, name: caregiverName });
      }
    },
  });

  const consentText = getConsentText(accountType, patientAgeGroup, patientName, caregiverName, consentDate);
  const consentQuestion = consentText[`${formSteps[currentConsentStep]}ConsentQuestion`];
  const consentDescription = consentText[`${formSteps[currentConsentStep]}ConsentDescription`];
  const consentInputLabel = consentText[`${formSteps[currentConsentStep]}ConsentInputLabel`];
  const consentReviewMessage = consentText[`${formSteps[currentConsentStep]}ConsentReviewMessage`];
  const consentSignature = consentText[`${formSteps[currentConsentStep]}ConsentSignature`];
  const consentNameInputLabel = consentText[`${formSteps[currentConsentStep]}ConsentNameInputLabel`];

  const handleConsentDocumentScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Use a small threshold (5px) to account for rendering differences
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      formikContext.setFieldValue(`${formSteps[currentConsentStep]}ConsentRead`, true);
    }
  };

  const handleCaregiverNameChange = (e) => {
    if (!e?.target) return;
    formikContext.handleChange(e);
    setCaregiverName(e.target.value);
  };

  const isConsentReadForCurrentStep = formikContext.values[`${formSteps[currentConsentStep]}ConsentRead`];

  return (
    <Dialog
      id="dataDonationConsentDialog"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
      maxWidth="md"
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Fuel the Next Generation of Diabetes Innovation')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Box id="consentDocument" variant="containers.wellBordered" p={0} mb={4}>
          <Box
            id="consentDocumentText"
            data-testid="consentDocumentText"
            onScroll={handleConsentDocumentScroll}
            p={3}
            sx={{
              height: ['40vh', null, '30vh'],
              overflowY: 'auto',
              overflowX: 'hidden',
              boxShadow: `${shadows.well} inset`,
            }}
          >
            <Markdown
              components={{
                h1(props) {
                  const {node, ...rest} = props
                  return <MediumTitle mb={3} {...rest} />
                },
                h2: Subheading,
                h3(props) {
                  const {node, ...rest} = props
                  return <Body0 sx={{fontWeight: 'black'}} {...rest} />
                },
                p(props) {
                  const {node, ...rest} = props
                  return <Paragraph0 sx={{fontWeight: 'medium'}} {...rest} />
                },
                li(props) {
                  const {node, ...rest} = props
                  return (
                    <li>
                      <Paragraph0 sx={{fontWeight: 'medium'}} {...rest} />
                    </li>
                  );
                },
                ul(props) {
                  const {node, ...rest} = props
                  return (
                    <Box sx={{ color: 'text.primary' }}>
                      <ul {...rest} />
                    </Box>
                  );
                },
              }}
            >
              {consentDocument?.content}
            </Markdown>
          </Box>

          <Flex
            id="consentDocumentFooter"
            p={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              bg: 'lightestGrey',
              borderTop: `1px solid ${colors.border.default}`,
              zIndex: 1,
            }}
          >
            <Body0 className="consentSignature" sx={{ fontWeight: 'medium' }}>
              {consentSignature}
            </Body0>
            <Body0 className="consentDate" sx={{ fontWeight: 'medium' }}>
              {t('Date: {{consentDate}}', { consentDate })}
            </Body0>
          </Flex>
        </Box>

        <Box>
          {consentReviewMessage && (
            <Box mb={3}>
              <Pill
                id="consentReviewMessage"
                mb={3}
                sx={{ fontSize: 1 }}
                text={consentReviewMessage}
                icon={InfoRoundedIcon}
                label={t('Consent review message')}
                colorPalette="info"
              />
            </Box>
          )}

          {consentNameInputLabel && (
            <Box mb={3}>
              <TextInput
                {...getCommonFormikFieldProps('name', formikContext)}
                onChange={handleCaregiverNameChange}
                label={consentNameInputLabel}
                placeholder={t('Name')}
                variant="condensed"
                width="100%"
              />
            </Box>
          )}

          {consentQuestion && (
            <Paragraph2 mb={2} sx={{ fontWeight: 'medium'}}>
              <Text className='consentQuestion'>{consentQuestion}</Text>
            </Paragraph2>
          )}

          {consentDescription && (
            <Paragraph1 sx={{ fontWeight: 'medium'}}>
              <Text className='consentDescription'>{consentDescription}</Text>
            </Paragraph1>
          )}

          <Box mb={3} sx={{ textAlign: 'center', '.caption.error': { textAlign: 'left', pl: 4 } }}>
            <Checkbox
              {...getCommonFormikFieldProps(`${formSteps[currentConsentStep]}ConsentRead`, formikContext, 'checked')}
              bg="white"
              themeProps={{ sx: { display: 'none' } }}
              label={t('I have read the consent statement')}
              sx={{
                boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
              }}
            />

            <Checkbox
              {...getCommonFormikFieldProps(`${formSteps[currentConsentStep]}Consent`, formikContext, 'checked')}
              bg="white"
              themeProps={{ sx: { bg: 'transparent', textAlign: 'left' } }}
              data-testid="consent-checkbox"
              label={consentInputLabel}
              disabled={!isConsentReadForCurrentStep}
              sx={{
                boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
              }}
            />
          </Box>

          <Box id="consentReviewRequiredMessageContainer" sx={{ minHeight: '32px' }}>
            {!isConsentReadForCurrentStep && (
              <Pill
                id="consentReviewRequiredMessage"
                sx={{ fontSize: 1 }}
                text={t('Please scroll to the bottom of the consent form to enable the agreement checkbox.')}
                icon={InfoRoundedIcon}
                label={t('Consent review required message')}
                colorPalette="info"
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          className="dataDonationConsentCancel"
          variant="secondary"
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>

        <Button
          className="dataDonationConsentSubmit"
          variant="primary"
          processing={formikContext.isSubmitting}
          disabled={!fieldsAreValid(
            keys(schemas[formSteps[currentConsentStep]].fields),
            schemas[formSteps[currentConsentStep]],
            formikContext.values
          )}
          onClick={() => formikContext.submitForm()}
        >
          {patientAssentRequired && currentConsentStep === 0 ? t('Next') : t('Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DataDonationConsentDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  disconnectInstructions: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
  }),
  accountType: PropTypes.oneOf(['personal', 'caregiver']).isRequired,
  patientAgeGroup: PropTypes.oneOf(['child', 'youth', 'adult']).isRequired,
  patientName: PropTypes.string.isRequired,
  caregiverName: PropTypes.string.isRequired,
  consentDate: PropTypes.string.isRequired,
};

export default DataDonationConsentDialog;
