import React from 'react';
import { useSelector } from 'react-redux';
import { TagList } from '../../../components/elements/Tag';

const MAX_TAGS = 3;
const MAX_CHARS = 12;

const TagListCell = ({ patient }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = clinic?.patientTags || [];

  const tagIds = patient?.tags || [];
  const tags = tagIds
    .map(tag => patientTags.find(ptTag => ptTag.id === tag))
    .filter(Boolean);

  return <TagList tags={tags} maxTagsVisible={MAX_TAGS} maxCharactersVisible={MAX_CHARS} />;
};

export default TagListCell;
