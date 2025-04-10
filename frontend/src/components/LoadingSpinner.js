import React from 'react';
import { CSpinner } from '@coreui/react';

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center p-4">
    <CSpinner color="primary" />
  </div>
);

export default LoadingSpinner; 