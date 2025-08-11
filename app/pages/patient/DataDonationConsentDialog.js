import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import * as yup from 'yup';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useFormik } from 'formik';
import { keys, map } from 'lodash';

import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import { Body0, MediumTitle, Paragraph1, Paragraph2 } from '../../components/elements/FontStyles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import i18next from '../../core/language';
import moment from 'moment';
import { colors } from '../../themes/baseTheme';

const t = i18next.t.bind(i18next);
const today = moment().format('MMMM D, YYYY');


const consentDocument = `
The Tidepool Big Data Donation Project Informed Consent Form

Introduction
Thank you for considering participation in the Tidepool Big Data Donation Project. This initiative is designed to advance diabetes research and care by collecting, analyzing, and sharing anonymized data from diabetes devices. Your contribution will help researchers, clinicians, and technology developers better understand diabetes management and improve future treatments.

Purpose of the Project
The primary goal of this project is to gather large-scale, anonymized data from individuals living with diabetes. By donating your data, you are supporting efforts to identify trends, improve device functionality, and develop new approaches to diabetes care. The data collected may be used in academic research, product development, and public health initiatives.

What Data Will Be Collected
If you choose to participate, Tidepool will collect information from your connected diabetes devices, such as blood glucose readings, insulin dosing records, device settings, and usage patterns. No personally identifiable information (such as your name, address, or contact details) will be shared with researchers or third parties. All data will be anonymized before use.

How Your Data Will Be Used
Your anonymized data may be shared with researchers, healthcare organizations, and companies working to improve diabetes care. The data may be used in scientific studies, presentations, publications, and the development of new products or services. Tidepool will ensure that your privacy is protected and that your data is only used for legitimate research and development purposes.

Voluntary Participation
Participation in the Tidepool Big Data Donation Project is entirely voluntary. You may choose to opt out at any time without penalty or loss of benefits. If you decide to withdraw, your data will no longer be included in future research, although data already shared may not be retrievable.

Risks and Benefits
There are minimal risks associated with participation. While every effort will be made to protect your privacy, there is a small risk that anonymized data could be re-identified. The benefits of participation include contributing to advancements in diabetes care and helping others living with diabetes.

Confidentiality
Tidepool is committed to maintaining the confidentiality of your data. All information will be stored securely and only accessible to authorized personnel. Data will be anonymized before sharing, and no personal identifiers will be included in any research outputs.

Contact Information
If you have questions about the project, your rights as a participant, or wish to withdraw your consent, please contact Tidepool support at support@tidepool.org.

Consent Statement
By checking the box and clicking "Submit," you acknowledge that you have read and understood this consent form, and you agree to donate your anonymized diabetes device data to the Tidepool Big Data Donation Project. You understand that your participation is voluntary and that you may opt out at any time.

Thank you for your support in helping to improve diabetes care for everyone.
`;

const consentDocumentParts = consentDocument.split('\n').filter(part => part.trim() !== '');

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
        console.log('formikHelpers', formikHelpers);
        setCurrentConsentStep(nextStep);
        formikHelpers.resetForm();
      } else {
        onConfirm(values);
      }
    },
  });

  console.log('formikContext', formikContext);

  const [scrolledToBottom, setScrolledToBottom] = React.useState(false);

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
            {map(consentDocumentParts, (line, index) => (
              <Text key={index} sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {line}
                {index < consentDocumentParts.length - 1 && <><br /><br /></>}
              </Text>
            ))}
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
