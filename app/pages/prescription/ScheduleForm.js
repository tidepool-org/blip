import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, Field } from 'formik';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
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
import { MS_IN_MIN, MS_IN_HOUR, MS_IN_DAY } from '../../core/constants';
import { inlineInputStyles } from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);

export const convertMsPer24ToTimeString = msPer24 => {
  const hours = `0${new Date(msPer24).getUTCHours()}`.slice(-2);
  const minutes = `0${new Date(msPer24).getUTCMinutes()}`.slice(-2);
  return `${hours}:${minutes}`;
};

export const convertTimeStringToMsPer24 = timeString => {
  const [hours, minutes] = map(timeString.split(':'), val => parseInt(val, 10));
  return (hours * MS_IN_HOUR) + (minutes * MS_IN_MIN);
}

const ScheduleForm = props => {
  const {
    addButtonText,
    fieldArrayName,
    fieldArrayMeta,
    fields,
    separator,
    t,
    ...boxProps
  } = props;

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

  return (
    <Box {...boxProps}>
      {map(schedules.value, (schedule, index) => (
        <Flex className='schedule-row' key={index} alignItems="flex-start" mb={3}>
          <Field
            as={TextInput}
            label={index === 0 && t('Start Time')}
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
            error={getFieldError(fieldArrayMeta, index, 'start')}
            {...inlineInputStyles}
          />
          {map(fields, (field, fieldIndex) => (
            <React.Fragment key={fieldIndex}>
              <FastField
                as={TextInput}
                label={index === 0 && field.label}
                min={field.min}
                max={field.max}
                step={field.step}
                type={field.type}
                id={`${fieldArrayName}.${index}.${field.name}`}
                name={`${fieldArrayName}.${index}.${field.name}`}
                suffix={field.suffix}
                error={getFieldError(fieldArrayMeta, index, field.name)}
                warning={getThresholdWarning(schedule[field.name], field.threshold)}
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
            sx={{
              visibility: index === 0 ? 'hidden' : 'visible',
            }}
          />
        </Flex>
      ))}
      <Button
        variant="secondary"
        className="add-schedule"
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
  fieldArrayMeta: PropTypes.object,
  fields: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    suffix: PropTypes.string,
    type: PropTypes.string,
  })),
  separator: PropTypes.string,
}

ScheduleForm.defaultProps = {
  addButtonText: t('Add another'),
  fields: [],
}

export default translate()(ScheduleForm);
