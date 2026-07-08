import React from 'react';
import Pagination from '../../../components/elements/Pagination';

const PaginationControls = ({ total = 0, limit, offset, onOffsetChange }) => {
  const pageCount = Math.ceil(total / limit);
  const currentPageNumber = Math.floor(offset / limit) + 1; // 1-indexed

  const handlePageChange = (_event, newPageNumber) => {
    onOffsetChange((newPageNumber - 1) * limit);
  };

  const disabled = pageCount < 2;

  return (
    <Pagination
      px="5%"
      sx={{ width: '100%', mt: 3 }}
      id="clinic-workspace-pagination"
      count={pageCount}
      disabled={disabled}
      onChange={handlePageChange}
      page={currentPageNumber}
      showFirstButton={false}
      showLastButton={false}
      siblingCount={2}
    />
  );
};

export default PaginationControls;
