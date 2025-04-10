import React from 'react';
import { CAlert } from '@coreui/react';

const ErrorMessage = ({ message }) => (
  <CAlert color="danger" dismissible>
    {message}
  </CAlert>
);

export default ErrorMessage; 