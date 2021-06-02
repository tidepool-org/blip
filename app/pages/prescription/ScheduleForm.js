import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
import get from 'lodash/get';
import map from 'lodash/map';
import isInteger from 'lodash/isInteger';
import sortedLastIndexBy from 'lodash/sortedLastIndexBy';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';

import { getFieldError, getThresholdWarning } from '../../core/forms';
import { useFieldArray } from '../../core/hooks';
import i18next from '../../core/language';
import TextInput from '../../components/elements/TextInput';
import Icon from '../../components/elements/Icon';
import Button from '../../components/elements/Button';
import { MS_IN_MIN, MS_IN_DAY } from '../../core/constants';
import { convertMsPer24ToTimeString, convertTimeStringToMsPer24 } from '../../core/datetime';
import { inlineInputStyles } from './prescriptionFormStyles';
import { roundValueToIncrement } from './prescriptionFormConstants';

const t = i18next.t.bind(i18next);

const ScheduleForm = props => {
  const {
    addButtonText,
    fieldArrayName,
    fields,
    separator,
    t,
    useFastField,
    ...boxProps
  } = props;

  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const [refs, setRefs] = React.useState([]);
  const [focusedId, setFocusedId] = React.useState();

  const [schedules, , { move, remove, replace, push }] = useFieldArray({ name: fieldArrayName });
  const schedulesLength = schedules.value.length;

  React.useEffect(() => {
    // add or remove refs as the schedule length changes
    setRefs(refs => (
      Array(schedulesLength).fill().map((_, i) => refs[i] || React.createRef())
    ));
  }, [schedulesLength]);

  React.useEffect(() => {
    isInteger(focusedId) && refs[focusedId].current.focus();
  }, [focusedId]);

  const FieldElement = useFastField ? FastField : Field;

  return (
    <Box {...boxProps}>
      {map(schedules.value, (schedule, index) => (
        <Flex className='schedule-row' key={index} alignItems="flex-start" mb={3}>
          <Field
            as={TextInput}
            label={index === 0 ? t('Start Time') : null}
            type="time"
            readOnly={index === 0}
            step={MS_IN_MIN * 30 / 1000}
            value={convertMsPer24ToTimeString(schedule.start, 'hh:mm')}
            onChange={e => {
              const start = convertTimeStringToMsPer24(e.target.value);
              const newValue = {...schedules.value[index], start};
              const valuesCopy = [...schedules.value];
              valuesCopy.splice(index, 1);
              const newPos = sortedLastIndexBy(valuesCopy, newValue, function(o) { return o.start; });
              replace(index, newValue);
              move(index, newPos);
              setFocusedId(newPos);
            }}
            onFocus={() => setFocusedId(index)}
            onBlur={() => setFocusedId(undefined)}
            innerRef={refs[index]}
            id={`${fieldArrayName}.${index}.start`}
            name={`${fieldArrayName}.${index}.start`}
            error={getFieldError(`${fieldArrayName}.${index}.start`, formikContext)}
            {...inlineInputStyles}
          />
          {map(fields, (field, fieldIndex) => (
            <React.Fragment key={fieldIndex}>
              <FieldElement
                as={TextInput}
                label={index === 0 ? field.label : null}
                min={field.min}
                max={field.max}
                step={get(field, 'inputStep', field.increment)}
                type={field.type}
                id={`${fieldArrayName}.${index}.${field.name}`}
                name={`${fieldArrayName}.${index}.${field.name}`}
                suffix={field.suffix}
                error={getFieldError(`${fieldArrayName}.${index}.${field.name}`, formikContext)}
                warning={getThresholdWarning(get(values,`${fieldArrayName}.${index}.${field.name}`), field.threshold)}
                onBlur={e => {
                  setFieldTouched(`${fieldArrayName}.${index}.${field.name}`);
                  setFieldValue(`${fieldArrayName}.${index}.${field.name}`, roundValueToIncrement(e.target.value, field.increment))
                }}
                {...inlineInputStyles}
              />
              {(fieldIndex < fields.length - 1 ) && separator && (
                <Text ml={3} mr={1} mt={index === 0 ? '33px' : '12px'}>{separator}</Text>
              )}
            </React.Fragment>
          ))}
          <Icon
            mx={2}
            mt={2}
            variant="button"
            label="Delete"
            icon={DeleteOutlineRoundedIcon}
            onClick={() => remove(index)}
            disabled={index === 0}
            tabIndex={index === 0 ? -1 : 0}
            sx={{
              top: index === 0 ? '1em' : 0,
            }}
          />
        </Flex>
      ))}
      <Button
        variant="tertiary"
        className="add-schedule"
        width="100%"
        sx={{
          '> div': {
            width: '100%',
            textAlign: 'center',
          },
        }}
        disabled={(() => {
          const lastSchedule = schedules.value[schedules.value.length - 1];
          return lastSchedule.start >= (MS_IN_DAY - (MS_IN_MIN * 30));
        })()}
        onClick={() => {
          const lastSchedule = schedules.value[schedules.value.length - 1];
          return push({
            ...lastSchedule,
            start: lastSchedule.start + (MS_IN_MIN * 30),
          });
        }}
      >
        {addButtonText}
      </Button>
    </Box>
  );
};

ScheduleForm.propTypes = {
  ...BoxProps,
  addButtonText: PropTypes.string,
  fieldArrayName: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    increment: PropTypes.number,
    inputStep: PropTypes.number,
    suffix: PropTypes.string,
    type: PropTypes.string,
  })),
  separator: PropTypes.string,
  useFastField: PropTypes.bool,
};

ScheduleForm.defaultProps = {
  addButtonText: t('Add another'),
  fields: [],
  useFastField: false,
};

export default translate()(ScheduleForm);
