import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import * as yup from 'yup';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useFormik } from 'formik';
import { keys } from 'lodash';
import Markdown from 'react-markdown';

import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import { Body0, MediumTitle, Paragraph0, Paragraph1, Paragraph2, Subheading } from '../../components/elements/FontStyles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import i18next from '../../core/language';
import moment from 'moment';
import { colors } from '../../themes/baseTheme';

import consentDocument from './sampleConsentDocumentStringified';

const t = i18next.t.bind(i18next);
const today = moment().format('MMMM D, YYYY');

export const getConsentText = (accountType, patientAgeGroup, patientName, consentDate = today) => {
  const text = {
    personal: {
      adult: {
        consentSuccessMessage: t('You consented on {{consentDate}}.', { consentDate }),
        primaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
      },
      youth: {
        consentSuccessMessage: t('You assented and {{patientName}} consented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Next."'),
        secondaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        secondaryConsentDescription: t('My parent or guardian read The Tidepool Big Data Donation Project Informed Consent Form, explained this project to me, answered my questions about the project, and said that it was all right for me to donate my anonymized data if I wanted to. I understand that the project will get information from my Tidepool account and share it with researchers and others involved in helping to make care for diabetes better. I understand that my participation is voluntary, I don\'t have to do this, and I can opt out at any time. '),
        secondaryConsentInputLabel: t('Yes - By checking the box and clicking "Submit," I am saying that I want to donate my anonymized data.'),
      },
      child: {
        consentSuccessMessage: t('You assented and {{patientName}} consented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Next."'),
      },
    },
    caregiver: {
      adult: {
        consentSuccessMessage: t('{{patientName}} consented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
      },
      youth: {
        consentSuccessMessage: t('You consented and {{patientName}} assented on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('As their parent or guardian, I have read this form and I give my consent by checking this box and clicking "Next."'),
        secondaryConsentQuestion: t('{{patientName}}, do you want to donate your anonymized data?', { patientName }),
        secondaryConsentDescription: t('My parent or guardian read The Tidepool Big Data Donation Project Informed Consent Form, explained this project to me, answered my questions about the project, and said that it was all right for me to donate my anonymized data if I wanted to. I understand that the project will get information from my Tidepool account and share it with researchers and others involved in helping to make care for diabetes better. I understand that my participation is voluntary, I don\'t have to do this, and I can opt out at any time.'),
        secondaryConsentInputLabel: t('Yes - By checking the box and clicking "Submit," I am saying that I want to donate my anonymized data.'),
      },
      child: {
        consentSuccessMessage: t('You consented on behalf of {{patientName}} on {{consentDate}}.', { consentDate, patientName }),
        primaryConsentQuestion: t('Do you give your consent for {{patientName}} to donate their anonymized data?', { patientName }),
        primaryConsentInputLabel: t('Yes - As their parent or guardian, I have read this form and give my consent by checking this box and clicking submit.'),
      },
    },
  };

  return text[accountType]?.[patientAgeGroup] || {};
};

export const DataDonationConsentDialog = (props) => {
  const { t, onClose, onConfirm, open, accountType, patientAgeGroup, patientName, caregiverName, consentDate = today } = props;
  const patientAssentRequired = patientAgeGroup === 'youth';
  const formSteps = patientAssentRequired ? ['primary', 'secondary'] : ['primary'];
  const [currentConsentStep, setCurrentConsentStep] = React.useState(0);
  const [scrolledToBottom, setScrolledToBottom] = React.useState(false);

  const consentText = getConsentText(accountType, patientAgeGroup, patientName, consentDate);
  const consentQuestion = consentText[`${formSteps[currentConsentStep]}ConsentQuestion`];
  const consentDescription = consentText[`${formSteps[currentConsentStep]}ConsentDescription`];
  const consentInputLabel = consentText[`${formSteps[currentConsentStep]}ConsentInputLabel`];

  const nameSchema = yup.object().shape({
    name: yup.string().required(t('Parent or Legal Guardian Name is required')),
  });

  const primaryConsentSchema = yup.object().shape({
    primaryConsentRead: yup.boolean().oneOf([true], t('You must read the consent statement before proceeding')),
    primaryConsent: yup.boolean().oneOf([true], t('You must agree to consent before proceeding')),
  });

  const secondaryConsentSchema = yup.object().shape({
    secondaryConsentRead: yup.boolean().oneOf([true], t('You must read the consent statement before proceeding')),
    secondaryConsent: yup.boolean().oneOf([true], t('You must agree to consent before proceeding')),
  });

  const schemas = {
    primary: patientAssentRequired && accountType === 'caregiver' ? nameSchema.concat(primaryConsentSchema) : primaryConsentSchema,
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
        formikHelpers.resetForm();
        document.getElementById('consentDocumentText')?.scrollTo({ top: 0 });
        setScrolledToBottom(false);
      } else {
        onConfirm(values);
      }
    },
  });

  const handleConsentDocumentScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      setScrolledToBottom(true);
      formikContext.setFieldValue(`${formSteps[currentConsentStep]}ConsentRead`, true);
    }
  };

  return (
    <Dialog
      id="dataDonationConsentDialog"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Fuel the next generation of diabetes innovation')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Box id="consentDocument" variant="containers.infoWell">
          <Box
            id="consentDocumentText"
            onScroll={handleConsentDocumentScroll}
            sx={{
              height: '30vh',
              overflowY: 'auto',
              mb: 3,
            }}
          >
            <Markdown
              components={{
                h1: MediumTitle,
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
              {consentDocument}
            </Markdown>
          </Box>

          <Flex
            id="consentDocumentFooter"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              bg: 'background',
              py: 2,
              px: 3,
              boxShadow: `0 -2px 8px ${colors.lightestGrey}`,
              zIndex: 1,
            }}
          >
            <Body0 className="patientSignature">
              {t('Electronic signature: {{caregiverName}}', { caregiverName: caregiverName })}
            </Body0>
            <Body0 className="consentDate">
              {t('Date: {{consentDate}}', { consentDate })}
            </Body0>
          </Flex>
        </Box>

        <Box>
          <Paragraph2 sx={{ fontWeight: 'medium'}}>
            <Text className='consentQuestion'>{consentQuestion}</Text>
          </Paragraph2>

          {consentDescription && (
            <Paragraph1 sx={{ fontWeight: 'medium'}}>
              <Text className='consentDescription'>{consentDescription}</Text>
            </Paragraph1>
          )}

          <Flex mb={3} sx={{ textAlign: 'center'}}>
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
              themeProps={{ sx: { bg: 'transparent' } }}
              label={consentInputLabel}
              disabled={!formikContext.values[`${formSteps[currentConsentStep]}ConsentRead`]}
              sx={{
                boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
              }}
            />
          </Flex>
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
          disabled={!fieldsAreValid(
            keys(schemas[formSteps[currentConsentStep]].fields),
            schemas[formSteps[currentConsentStep]],
            formikContext.values
          )}
          onClick={() => formikContext.submitForm()}
        >
          {patientAssentRequired ? t('Next') : t('Submit')}
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
  t: PropTypes.func.isRequired,
  accountType: PropTypes.oneOf(['person</Button>al', 'caregiver']).isRequired,
  patientAgeGroup: PropTypes.oneOf(['child', 'youth', 'adult']).isRequired,
  patientName: PropTypes.string.isRequired,
  caregiverName: PropTypes.string.isRequired,
  consentDate: PropTypes.string,
};

export default withTranslation()(DataDonationConsentDialog);
