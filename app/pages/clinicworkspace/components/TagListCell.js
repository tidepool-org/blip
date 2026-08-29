import React from 'react';
import { TagList } from '../../../components/elements/Tag';
import useClinic from '../useClinic';

const MAX_TAGS = 3;

const TagListCell = ({ patient }) => {
  const clinic = useClinic();
  const patientTags = clinic?.patientTags || [];

  const tagIds = patient?.tags || [];
  const tags = tagIds
    .map(tag => patientTags.find(ptTag => ptTag.id === tag))
    .filter(Boolean);

  return <TagList tags={tags} maxTagsVisible={MAX_TAGS} />;
};

export default TagListCell;
