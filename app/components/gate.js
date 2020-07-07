import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from 'react-loading';
import { useDispatch } from 'react-redux';

export const Gate = (props) => {
  const { onEnter, children } = props;
  const [ hasRun, setRun ] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onEnter((run = true) => setRun(run)));
  }, []);

  return hasRun ? <>{children}</> : <Loading type="bubbles" />;
};

Gate.propTypes = {
  onEnter: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Gate;
