import React from 'react';
import { useSelector } from 'react-redux';
import { TagList } from '../../../components/elements/Tag';

const TagListCell = ({ patient }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = clinic?.patientTags || [];

  const tagIds = patient?.tags || [];
  const tags = tagIds.map(tag => patientTags.find(ptTag => ptTag.id === tag)); // TODO: index

  return <TagList tags={tags} />;
};

export default TagListCell;
