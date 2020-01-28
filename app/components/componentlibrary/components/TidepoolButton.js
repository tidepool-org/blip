import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #6583ff;
  color: white;
  font: Arial;
  border: 1px solid #6583ff;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: white;
    color: #6583ff;
  }
`;

const tidepoolbutton = props => {
  return (
    <StyledButton onClick={props.onClick}>
        Tidepool Button
    </StyledButton>
  );
};

export default tidepoolbutton;