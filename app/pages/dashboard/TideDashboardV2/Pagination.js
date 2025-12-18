import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text } from 'theme-ui';

const Pagination = ({ limit, offset, count, onChange }) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(count / limit);

  const handlePageChange = (page) => {
    const newOffset = (page - 1) * limit;
    onChange(newOffset);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];

    // Always include first page
    pages.push(1);

    // Calculate range around current page (2 before and 2 after)
    const rangeStart = Math.max(2, currentPage - 2);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 2);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('ellipsis-start');
    }

    // Add pages in the range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always include last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        py: 3,
      }}
    >
      <Box
        as="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        sx={{
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
          bg: 'transparent',
          border: 'none',
          px: 2,
          py: 1,
          fontSize: 1,
          '&:hover:not(:disabled)': {
            color: 'primary',
          },
        }}
      >
        Previous
      </Box>

      {pageNumbers.map((page) => {
        if (typeof page === 'string') {
          return (
            <Text key={page} sx={{ px: 1 }}>
              ...
            </Text>
          );
        }

        const isCurrentPage = page === currentPage;

        return (
          <Box
            key={page}
            as="button"
            onClick={() => handlePageChange(page)}
            sx={{
              cursor: 'pointer',
              bg: isCurrentPage ? 'primary' : 'transparent',
              color: isCurrentPage ? 'white' : 'text',
              border: 'none',
              borderRadius: 'default',
              px: 2,
              py: 1,
              fontSize: 1,
              fontWeight: isCurrentPage ? 'bold' : 'normal',
              minWidth: '32px',
              '&:hover': {
                bg: isCurrentPage ? 'primary' : 'lightGrey',
              },
            }}
          >
            {page}
          </Box>
        );
      })}

      <Box
        as="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={{
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
          bg: 'transparent',
          border: 'none',
          px: 2,
          py: 1,
          fontSize: 1,
          '&:hover:not(:disabled)': {
            color: 'primary',
          },
        }}
      >
        Next
      </Box>
    </Flex>
  );
};

Pagination.propTypes = {
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Pagination;
