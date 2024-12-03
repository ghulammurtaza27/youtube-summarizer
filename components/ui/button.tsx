import React from 'react';

const Button: React.FC<{ children: React.ReactNode; type?: 'button' | 'submit'; disabled?: boolean }> = ({ children, type, disabled }) => {
  return (
    <button type={type} disabled={disabled}>
      {children}
    </button>
  );
};

export { Button };