import React from 'react';
import { useSelector } from 'react-redux';
import { TagList } from '../../../components/elements/Tag';

const MAX_TAGS = 2;

const TagListCell = ({ patient }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = clinic?.patientTags || [];

  const tagIds = patient?.tags || [];
  const tags = tagIds
    .map(tag => patientTags.find(ptTag => ptTag.id === tag)) // TODO: index
    .filter(Boolean);

  return <TagList tags={tags} maxTagsVisible={MAX_TAGS} />;
};

export default TagListCell;
